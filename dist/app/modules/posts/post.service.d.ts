import type { Request } from "express";
import type { TProduct } from "./post.interface.js";
export declare const updateSingleProduct: (req: Request) => Promise<(import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}) | null>;
export declare const ProductServices: {
    createProduct: (payload: TProduct) => Promise<import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getAllProduct: (query: Record<string, unknown>) => Promise<{
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPage: number;
        };
        result: (import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getSingleProduct: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateSingleProduct: (req: Request) => Promise<(import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    deleteProduct: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=post.service.d.ts.map