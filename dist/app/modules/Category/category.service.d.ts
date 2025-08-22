import type { TCategory } from "./category.interface.js";
export declare const categoryService: {
    createCategory: (payload: TCategory) => Promise<import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getAllCategory: (query: Record<string, unknown>) => Promise<{
        meta: {
            totalData: () => Promise<{
                page: number;
                limit: number;
                total: number;
                totalPage: number;
            }>;
            limit: number;
        };
        result: (import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getSingleCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    deleteCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateCategory: (id: string, payload: Partial<TCategory>) => Promise<(import("mongoose").Document<unknown, {}, TCategory, {}, {}> & TCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=category.service.d.ts.map