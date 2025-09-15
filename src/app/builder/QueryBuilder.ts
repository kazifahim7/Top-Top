import { type FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
     public modelQuery: Query<T[], T>;
     public query: Record<string, unknown>;

     constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
          this.modelQuery = modelQuery;
          this.query = query;
     }

     search(searchableFields: string[]) {
          const searchTerm = this?.query?.searchTerm;
          if (searchTerm) {
               this.modelQuery = this.modelQuery.find({
                    $or: searchableFields.map((field) => ({
                         [field]: { $regex: searchTerm, $options: 'i' },
                    }) as FilterQuery<T>,
                    ),
               });
          }

          return this;
     }

     filter() {
          const queryObj = { ...this.query }; 

          // Exclude non-filter fields
          const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'minPrice', 'maxPrice'];
          excludeFields.forEach((el) => delete queryObj[el]);

          const filterConditions: Record<string, any> = {};

         
          Object.keys(queryObj).forEach((key) => {
               filterConditions[key] = queryObj[key];
          });

          // ✅ Price Range Filter
          const minPrice = Number(this.query.minPrice);
          const maxPrice = Number(this.query.maxPrice);
          if (!isNaN(minPrice) || !isNaN(maxPrice)) {
               filterConditions['salesPrice'] = {};
               if (!isNaN(minPrice)) {
                    filterConditions['salesPrice']['$gte'] = minPrice;
               }
               if (!isNaN(maxPrice)) {
                    filterConditions['salesPrice']['$lte'] = maxPrice;
               }
          }

          
          if (this.query.playingDays) {
               const playingDaysArray = (this.query.playingDays as string).split(',');
               filterConditions['playingDays'] = { $in: playingDaysArray };
          }

        
          if (this.query.position) {
               const positionArray = (this.query.position as string).split(',');
               filterConditions['position'] = { $in: positionArray };
          }

          this.modelQuery = this.modelQuery.find(filterConditions as FilterQuery<T>);
          return this;
     }
      
      
     sort() {
          const sort =
               (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
          this.modelQuery = this.modelQuery.sort(sort as string);

          return this;
     }

     paginate() {
          const page = Number(this?.query?.page) || 1;
          const limit = Number(this?.query?.limit) || 10;
          const skip = (page - 1) * limit;

          this.modelQuery = this.modelQuery.skip(skip).limit(limit).sort("id");

          return this;
     }

     fields() {
          const fields =
               (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

          this.modelQuery = this.modelQuery.select(fields);
          return this;
     }
     async countTotal() {
          const totalQueries = this.modelQuery.getFilter();
          const total = await this.modelQuery.model.countDocuments(totalQueries);
          const page = Number(this?.query?.page) || 1;
          const limit = Number(this?.query?.limit) || 10;
          const totalPage = Math.ceil(total / limit);

          return {
               page,
               limit,
               total,
               totalPage,
          };
     }
}

export default QueryBuilder;