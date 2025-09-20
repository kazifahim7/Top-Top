import { Types } from "mongoose";
import type { LobbyDocument } from "./lobby.interface.js";
interface UpdatePlayerStatsDTO {
    lobbyId: string;
    playerId: string;
    redCard?: number;
    yellowCard?: number;
    goal?: number;
    assist?: number;
    contribution?: number;
    save?: number;
}
interface UpdatePlayerStatsDTO {
    lobbyId: string;
    playerId: string;
    redCard?: number;
    yellowCard?: number;
    goal?: number;
    assist?: number;
    contribution?: number;
    save?: number;
}
export declare const updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
    lobbyPlayer: any;
}>;
export declare const lobbyService: {
    createMatch: (payload: LobbyDocument, id: string) => Promise<import("mongoose").Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    allMatch: (query: Record<string, unknown>) => Promise<any[]>;
    updatePlayerStats: (data: UpdatePlayerStatsDTO) => Promise<{
        lobbyPlayer: any;
    }>;
    updateLobbyInfo: (id: string, payload: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, import("../auth/auth.interface.js").TCreateProfile, {}, {}> & import("../auth/auth.interface.js").TCreateProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};
export {};
//# sourceMappingURL=lobby.services.d.ts.map