import type { TCreateProfile } from './auth.interface.js';
export declare const resetPassword: (payload: {
    email: string;
    password: string;
    otp?: number;
}) => Promise<import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const changePassword: (payload: {
    oldPassword: string;
    newPassword: string;
}, userId: string) => Promise<import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
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
    allStudentFromDB: (query: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, {
        FullName?: any;
        email?: any;
        password?: any;
        role?: any;
        isBlocked?: any;
        mobile?: any;
        socialProfile?: any;
        imageUrl?: any;
        nationality?: any;
        dominantFoot?: any;
        playingDays?: any;
        gameMode?: any;
        preferredAreas?: any;
        age?: any;
        position?: any;
        userName?: any;
        matchPosition?: any;
        redCard?: any;
        yellowCard?: any;
        contribution?: any;
        assists?: any;
        goal?: any;
        tackle?: any;
        save?: any;
        rating?: any;
        match?: any;
    }, {}, {}> & {
        FullName?: any;
        email?: any;
        password?: any;
        role?: any;
        isBlocked?: any;
        mobile?: any;
        socialProfile?: any;
        imageUrl?: any;
        nationality?: any;
        dominantFoot?: any;
        playingDays?: any;
        gameMode?: any;
        preferredAreas?: any;
        age?: any;
        position?: any;
        userName?: any;
        matchPosition?: any;
        redCard?: any;
        yellowCard?: any;
        contribution?: any;
        assists?: any;
        goal?: any;
        tackle?: any;
        save?: any;
        rating?: any;
        match?: any;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getSingleUser: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    resetRequest: (payload: Record<string, unknown>) => Promise<void>;
    resetPassword: (payload: {
        email: string;
        password: string;
        otp?: number;
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
    changePassword: (payload: {
        oldPassword: string;
        newPassword: string;
    }, userId: string) => Promise<import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    playerProfile: (id: string) => Promise<{
        result: (import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        allLobbies: (import("mongoose").Document<unknown, {}, import("../Lobby/lobby.interface.js").LobbyDocument, {}, {}> & import("../Lobby/lobby.interface.js").LobbyDocument & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
    }>;
    deletePlayerFromDB: (id: string) => Promise<(import("mongoose").Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=auth.services.d.ts.map