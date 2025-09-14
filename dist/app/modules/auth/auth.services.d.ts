import type { TCreateProfile } from './auth.interface.js';
export declare const resetPassword: (payload: {
    email: string;
    password: string;
}) => Promise<import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const authService: {
    createUserIntoDB: (payload: TCreateProfile) => Promise<import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    loginUser: (payload: Pick<TCreateProfile, "email" | "password">) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    updateStatusInDB: (id: string, payload: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateProfileInDB: (email: string, payload: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    allStudentFromDB: () => Promise<(import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getSingleUser: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    resetRequest: (payload: Record<string, unknown>) => Promise<{}>;
    resetPassword: (payload: {
        email: string;
        password: string;
    }) => Promise<import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    googleLogin: (payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">) => Promise<{
        result: import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    appleLogin: (payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">) => Promise<{
        result: import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
        accessToken: string;
        refreshToken: string;
    }>;
};
//# sourceMappingURL=auth.services.d.ts.map