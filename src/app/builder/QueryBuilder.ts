import { type FilterQuery, Query } from 'mongoose';
import { z } from 'zod';


function isSafeKey(key: string): boolean {
     return !key.includes('$') && !key.includes('.');
}

function isSafeValue(value: unknown): boolean {
     if (typeof value === 'string') return isSafeKey(value); // reject "$gt" as a value too
     if (typeof value === 'object' && value !== null) return false; // reject plain objects from qs
     return true;
}


function sanitiseQueryParams(raw: Record<string, unknown>): Record<string, unknown> {
     const clean: Record<string, unknown> = {};
     for (const [key, value] of Object.entries(raw)) {
          if (!isSafeKey(key)) {
               throw new Error(`Illegal query parameter key: "${key}"`);
          }
          if (!isSafeValue(value)) {
               throw new Error(`Illegal query parameter value for key "${key}"`);
          }
          clean[key] = value;
     }
     return clean;
}


export type AllowedFilterFields = ReadonlyArray<string>;

const META_PARAMS = new Set([
     'searchTerm',
     'sort',
     'limit',
     'page',
     'fields',
     'minPrice',
     'maxPrice',
  
     'playerId',
     'organizer',
     'teamId',
     'playingDays',
     'position',
]);



const PriceRangeSchema = z.object({
     minPrice: z.coerce.number().finite().optional(),
     maxPrice: z.coerce.number().finite().optional(),
});

const CommaSeparatedSchema = z
     .string()
     .regex(/^[a-zA-Z0-9_,\- ]+$/, 'Invalid characters in comma-separated list')
     .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean));

const MongoIdSchema = z
     .string()
     .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const PaginationSchema = z.object({
     page: z.coerce.number().int().positive().default(1),
     limit: z.coerce.number().int().positive().max(100).default(10),
});



class QueryBuilder<T> {
     public modelQuery: Query<T[], T>;
     public query: Record<string, unknown>;

    
     private readonly allowedFilterFields: AllowedFilterFields;

     constructor(
          modelQuery: Query<T[], T>,
          query: Record<string, unknown>,
          allowedFilterFields: AllowedFilterFields = [],
     ) {
      
          this.modelQuery = modelQuery;
          this.query = sanitiseQueryParams(query); 
          this.allowedFilterFields = allowedFilterFields;
     }

     search(searchableFields: string[]) {
          if (!searchableFields.every(isSafeKey)) {
               throw new Error('searchableFields contains unsafe field names');
          }

          const rawTerm = this.query.searchTerm;
          if (rawTerm === undefined || rawTerm === null || rawTerm === '') {
               return this;
          }


          const parsed = z.string().min(1).max(200).safeParse(rawTerm);
          if (!parsed.success) {
           
               return this;
          }

          this.modelQuery = this.modelQuery.find({
               $or: searchableFields.map(
                    (field) =>
                         ({
                              [field]: { $regex: parsed.data, $options: 'i' },
                         }) as FilterQuery<T>,
               ),
          });

          return this;
     }

    
     filter() {
          const filterConditions: Record<string, unknown> = {};

          
          for (const key of this.allowedFilterFields) {
               if (META_PARAMS.has(key)) continue; // never treat meta-params as filters
               if (!isSafeKey(key)) continue;      // defensive: allowlist itself must be safe

               const value = this.query[key];
               if (value === undefined || value === null) continue;

            
               if (!isSafeValue(value)) {
                    throw new Error(`Non-primitive value supplied for filter field "${key}"`);
               }

               filterConditions[key] = value;
          }

     
          if (this.query.playerId !== undefined) {
               const parsed = MongoIdSchema.safeParse(this.query.playerId);
               if (!parsed.success) throw new Error('Invalid playerId format');

               filterConditions.$or = [
                    { 'team1.players.playerId': parsed.data },
                    { 'team2.players.playerId': parsed.data },
               ];
          }

    
          if (this.query.organizer !== undefined) {
               const parsed = MongoIdSchema.safeParse(this.query.organizer);
               if (!parsed.success) throw new Error('Invalid organizer format');

               filterConditions['organizer'] = parsed.data;
          }

    
          if (this.query.teamId !== undefined) {
               const parsed = MongoIdSchema.safeParse(this.query.teamId);
               if (!parsed.success) throw new Error('Invalid teamId format');

            
               filterConditions.$or = [
                    { 'team1.teamId': parsed.data },
                    { 'team2.teamId': parsed.data },
               ];
          }

        
          const priceResult = PriceRangeSchema.safeParse(this.query);
          if (!priceResult.success) throw new Error('Invalid price range parameters');

          const { minPrice, maxPrice } = priceResult.data;
          if (minPrice !== undefined || maxPrice !== undefined) {
               const priceFilter: Record<string, number> = {};
               if (minPrice !== undefined) priceFilter['$gte'] = minPrice;
               if (maxPrice !== undefined) priceFilter['$lte'] = maxPrice;
               filterConditions['salesPrice'] = priceFilter;
          }

  
          if (this.query.playingDays !== undefined) {
               const parsed = CommaSeparatedSchema.safeParse(this.query.playingDays);
               if (!parsed.success) throw new Error('Invalid playingDays format');
               filterConditions['playingDays'] = { $in: parsed.data };
          }

        
          if (this.query.position !== undefined) {
               const parsed = CommaSeparatedSchema.safeParse(this.query.position);
               if (!parsed.success) throw new Error('Invalid position format');
               filterConditions['position'] = { $in: parsed.data };
          }

          this.modelQuery = this.modelQuery.find(filterConditions as FilterQuery<T>);
          return this;
     }



     sort() {
          const rawSort = this.query.sort;
          if (rawSort === undefined || rawSort === null) {
               this.modelQuery = this.modelQuery.sort('-createdAt');
               return this;
          }

          const parsed = z
               .string()
               .regex(/^-?[a-zA-Z_]+(,-?[a-zA-Z_]+)*$/, 'Invalid sort format')
               .safeParse(rawSort);

          if (!parsed.success) throw new Error('Invalid sort parameter');

          const sortString = parsed.data.split(',').join(' ');
          this.modelQuery = this.modelQuery.sort(sortString);
          return this;
     }

    

     paginate() {
          const parsed = PaginationSchema.safeParse(this.query);
          if (!parsed.success) throw new Error('Invalid pagination parameters');

          const { page, limit } = parsed.data;
          const skip = (page - 1) * limit;

          this.modelQuery = this.modelQuery.skip(skip).limit(limit);
          return this;
     }

     

     fields() {
          const rawFields = this.query.fields;
          if (rawFields === undefined || rawFields === null) {
               this.modelQuery = this.modelQuery.select('-__v');
               return this;
          }

          const parsed = z
               .string()
               .regex(/^-?[a-zA-Z_]+(,-?[a-zA-Z_]+)*$/, 'Invalid fields format')
               .safeParse(rawFields);

          if (!parsed.success) throw new Error('Invalid fields parameter');

          const projection = parsed.data.split(',').join(' ');
          this.modelQuery = this.modelQuery.select(projection);
          return this;
     }

    

     async countTotal() {
          const totalQueries = this.modelQuery.getFilter();
          const total = await this.modelQuery.model.countDocuments(totalQueries);

          const parsed = PaginationSchema.safeParse(this.query);
          const { page, limit } = parsed.success
               ? parsed.data
               : { page: 1, limit: 10 };

          return {
               page,
               limit,
               total,
               totalPage: Math.ceil(total / limit),
          };
     }
}

export default QueryBuilder;