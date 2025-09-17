import type { LobbyDocument } from "./lobby.interface.js";
export declare const lobbyService: {
    createMatch: (payload: LobbyDocument, id: string) => Promise<import("mongoose").Document<unknown, {}, LobbyDocument, {}, {}> & LobbyDocument & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    allMatch: (query: Record<string, unknown>) => Promise<any[]>;
};
//# sourceMappingURL=lobby.services.d.ts.map