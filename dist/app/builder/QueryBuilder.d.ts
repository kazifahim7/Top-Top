import { Query } from 'mongoose';
export type AllowedFilterFields = ReadonlyArray<string>;
declare class QueryBuilder<T> {
    modelQuery: Query<T[], T>;
    query: Record<string, unknown>;
    private readonly allowedFilterFields;
    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>, allowedFilterFields?: AllowedFilterFields);
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