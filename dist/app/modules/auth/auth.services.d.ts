import type { TCreateUser } from './auth.interface.js';
export declare const authService: {
    createUserIntoDB: (payload: TCreateUser) => Promise<import("mongoose").Document<unknown, {}, TCreateUser, {}, {}> & TCreateUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    loginUser: (payload: Pick<TCreateUser, "email" | "password">) => Promise<{
        token: string;
    }>;
    updateStatusInDB: (id: string, payload: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, TCreateUser, {}, {}> & TCreateUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateProfileInDB: (email: string, payload: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, TCreateUser, {}, {}> & TCreateUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    allStudentFromDB: () => Promise<(import("mongoose").Document<unknown, {}, TCreateUser, {}, {}> & TCreateUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getSingleUser: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCreateUser, {}, {}> & TCreateUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=auth.services.d.ts.map