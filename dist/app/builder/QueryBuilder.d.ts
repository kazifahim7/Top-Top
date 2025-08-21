import { Query } from 'mongoose';
declare class QueryBuilder<T> {
    modelQuery: Query<T[], T>;
    query: Record<string, unknown>;
    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>);
    search(searchableFields: string[]): this;
    filter(): this;
    sort(): this;
    paginate(): this;
    fields(): this;
    countTotal(): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    }>;
}
export default QueryBuilder;
//# sourceMappingURL=QueryBuilder.d.ts.map