import { Query } from 'mongoose';
class QueryBuilder {
    modelQuery;
    query;
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchableFields) {
        const searchTerm = this?.query?.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }
    filter() {
        const queryObj = { ...this.query };
        // Exclude non-filter fields
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'minPrice', 'maxPrice'];
        excludeFields.forEach((el) => delete queryObj[el]);
        const filterConditions = {};
        Object.keys(queryObj).forEach((key) => {
            filterConditions[key] = queryObj[key];
        });
        if (this.query.playerId) {
            filterConditions.$or = [
                { 'team1.players.playerId': this.query.playerId },
                { 'team2.players.playerId': this.query.playerId }
            ];
        }
        if (this.query.organizer) {
            filterConditions['organizer'] = this.query.organizer;
        }
        if (this.query.teamId) {
            filterConditions.$or = [
                { 'team1.teamId': this.query.teamId },
                { 'team2.teamId': this.query.teamId }
            ];
        }
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
            const playingDaysArray = this.query.playingDays.split(',');
            filterConditions['playingDays'] = { $in: playingDaysArray };
        }
        if (this.query.position) {
            const positionArray = this.query.position.split(',');
            filterConditions['position'] = { $in: positionArray };
        }
        this.modelQuery = this.modelQuery.find(filterConditions);
        return this;
    }
    sort() {
        const sort = this?.query?.sort?.split(',')?.join(' ') || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);
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
        const fields = this?.query?.fields?.split(',')?.join(' ') || '-__v';
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
//# sourceMappingURL=QueryBuilder.js.map