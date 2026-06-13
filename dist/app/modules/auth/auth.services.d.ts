import type { TCreateProfile } from './auth.interface.js';
import mongoose from 'mongoose';
export declare const resetPassword: (payload: {
    password: string;
    otp?: number;
}) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const changePassword: (payload: {
    oldPassword: string;
    newPassword: string;
}, userId: string) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const authService: {
    createUserIntoDB: (payload: TCreateProfile) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    createOrganizerIntoDB: (payload: TCreateProfile) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    deleteAccount: (id: string) => Promise<(mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    loginUser: (payload: Pick<TCreateProfile, "email" | "password">) => Promise<{
        accessToken: string;
        refreshToken: string;
        role: "admin" | "player" | "organizer";
        userid: mongoose.Types.ObjectId;
        mobile: string | undefined;
        countryCode: string;
        isMobileVerified: boolean;
        mobileVerifiedAt: Date | null;
    }>;
    updateStatusInDB: (id: string, payload: Record<string, unknown>) => Promise<(mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateProfileInDB: (email: string, payload: Record<string, unknown>) => Promise<{
        isMobileVerified: boolean;
        mobileVerifiedAt: Date | null;
        FullName: string;
        email: string;
        password: string;
        role: "admin" | "player" | "organizer";
        isBlocked: "active" | "block";
        mobile?: string;
        socialProfile: string[];
        imageUrl: string;
        nationality: string;
        countryCode?: string;
        dominantFoot: string;
        playingDays: string[];
        gameMode: string;
        preferredAreas: string[];
        age: string;
        position: string[];
        userName: string;
        matchPosition?: string;
        redCard: number;
        yellowCard: number;
        contribution: number;
        assists: number;
        goal: number;
        tackle: number;
        save: number;
        rating: number;
        match: number;
        motm?: number;
        cleanSheet: number;
        _id: mongoose.Types.ObjectId;
        __v: number;
    } | null>;
    allStudentFromDB: (query: Record<string, unknown>) => Promise<(mongoose.Document<unknown, {}, {
        FullName?: any;
        email?: any;
        password?: any;
        role?: any;
        isBlocked?: any;
        mobile?: any;
        isMobileVerified?: any;
        mobileVerifiedAt?: any;
        socialProfile?: any;
        imageUrl?: any;
        nationality?: any;
        countryCode?: any;
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
        motm?: any;
        cleanSheet?: any;
    }, {}, {}> & {
        FullName?: any;
        email?: any;
        password?: any;
        role?: any;
        isBlocked?: any;
        mobile?: any;
        isMobileVerified?: any;
        mobileVerifiedAt?: any;
        socialProfile?: any;
        imageUrl?: any;
        nationality?: any;
        countryCode?: any;
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
        motm?: any;
        cleanSheet?: any;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    myCountryPlayers: (userId: string, query: Record<string, unknown>) => Promise<(mongoose.Document<unknown, {}, {
        FullName?: any;
        email?: any;
        password?: any;
        role?: any;
        isBlocked?: any;
        mobile?: any;
        isMobileVerified?: any;
        mobileVerifiedAt?: any;
        socialProfile?: any;
        imageUrl?: any;
        nationality?: any;
        countryCode?: any;
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
        motm?: any;
        cleanSheet?: any;
    }, {}, {}> & {
        FullName?: any;
        email?: any;
        password?: any;
        role?: any;
        isBlocked?: any;
        mobile?: any;
        isMobileVerified?: any;
        mobileVerifiedAt?: any;
        socialProfile?: any;
        imageUrl?: any;
        nationality?: any;
        countryCode?: any;
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
        motm?: any;
        cleanSheet?: any;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    myCountryPlayerProfile: (userId: string, profileUserId: string) => Promise<{
        result: (mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        stats: {
            matchesPlayed: number;
            goalsPerGame: number;
            assistsPerGame: number;
            savesPerGame: number;
            cleanSheets: number;
            winRatio: number;
            motm: number | undefined;
            contributionpergame: number;
        };
        media: string[];
        allLobbies: (mongoose.Document<unknown, {}, import("../Lobby/lobby.interface.js").LobbyDocument, {}, {}> & import("../Lobby/lobby.interface.js").LobbyDocument & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        tournamentMatches: (mongoose.Document<unknown, {}, import("../TournamentMatch/match.interface.js").IMatch, {}, mongoose.DefaultSchemaOptions> & import("../TournamentMatch/match.interface.js").IMatch & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        })[];
        playerTeam: (mongoose.Document<unknown, {}, import("../Team/team.interface.js").TTeam, {}, {}> & import("../Team/team.interface.js").TTeam & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        myJoinedTeam: (mongoose.Document<unknown, {}, import("../Team/team.interface.js").TTeam, {}, {}> & import("../Team/team.interface.js").TTeam & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    updateOwnCountry: (userId: string, countryCode: unknown) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateUserCountryByAdmin: (userId: string, countryCode: unknown) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    getSingleUser: (email: string) => Promise<{
        isMobileVerified: boolean;
        mobileVerifiedAt: Date | null;
        myJoinedTeam: (mongoose.Document<unknown, {}, import("../Team/team.interface.js").TTeam, {}, {}> & import("../Team/team.interface.js").TTeam & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        })[];
        hasOwnTeam: (mongoose.Document<unknown, {}, import("../Team/team.interface.js").TTeam, {}, {}> & import("../Team/team.interface.js").TTeam & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        FullName: string;
        email: string;
        password: string;
        role: "admin" | "player" | "organizer";
        isBlocked: "active" | "block";
        mobile?: string;
        socialProfile: string[];
        imageUrl: string;
        nationality: string;
        countryCode?: string;
        dominantFoot: string;
        playingDays: string[];
        gameMode: string;
        preferredAreas: string[];
        age: string;
        position: string[];
        userName: string;
        matchPosition?: string;
        redCard: number;
        yellowCard: number;
        contribution: number;
        assists: number;
        goal: number;
        tackle: number;
        save: number;
        rating: number;
        match: number;
        motm?: number;
        cleanSheet: number;
        _id: mongoose.Types.ObjectId;
        __v: number;
    } | null>;
    resetRequest: (payload: Record<string, unknown>) => Promise<void>;
    resetPassword: (payload: {
        password: string;
        otp?: number;
    }) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    sendPhoneOtp: (userId: string) => Promise<{
        status: string;
        channel: string | undefined;
        to: string | undefined;
        isMobileVerified: boolean;
    }>;
    verifyPhoneOtp: (userId: string, payload: {
        code?: string | number;
    }) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    googleLogin: (payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">) => Promise<{
        user: {
            id: mongoose.Types.ObjectId;
            role: "admin" | "player" | "organizer";
            email: string;
            countryCode: string;
            isMobileVerified: boolean;
            mobileVerifiedAt: Date | null;
        };
        result: (mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        accessToken: string;
        refreshToken: string;
    }>;
    appleLogin: (payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">) => Promise<{
        user: {
            id: mongoose.Types.ObjectId;
            role: "admin" | "player" | "organizer";
            email: string;
            countryCode: string;
            isMobileVerified: boolean;
            mobileVerifiedAt: Date | null;
        };
        result: (mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword: (payload: {
        oldPassword: string;
        newPassword: string;
    }, userId: string) => Promise<mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }>;
    playerProfile: (id: string) => Promise<{
        result: (mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        stats: {
            matchesPlayed: number;
            goalsPerGame: number;
            assistsPerGame: number;
            savesPerGame: number;
            cleanSheets: number;
            winRatio: number;
            motm: number | undefined;
            contributionpergame: number;
        };
        media: string[];
        allLobbies: (mongoose.Document<unknown, {}, import("../Lobby/lobby.interface.js").LobbyDocument, {}, {}> & import("../Lobby/lobby.interface.js").LobbyDocument & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        tournamentMatches: (mongoose.Document<unknown, {}, import("../TournamentMatch/match.interface.js").IMatch, {}, mongoose.DefaultSchemaOptions> & import("../TournamentMatch/match.interface.js").IMatch & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        })[];
        playerTeam: (mongoose.Document<unknown, {}, import("../Team/team.interface.js").TTeam, {}, {}> & import("../Team/team.interface.js").TTeam & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null;
        myJoinedTeam: (mongoose.Document<unknown, {}, import("../Team/team.interface.js").TTeam, {}, {}> & import("../Team/team.interface.js").TTeam & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    deletePlayerFromDB: (id: string) => Promise<(mongoose.Document<unknown, {}, TCreateProfile, {}, {}> & TCreateProfile & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=auth.services.d.ts.map