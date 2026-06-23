export declare const formationPositions: Record<string, string[]>;
export declare const isKnownFormation: (formation: unknown) => boolean;
export declare const normalizeMatchPosition: (position: unknown) => string;
export declare const getFormationPositionNames: (formation: unknown) => string[];
export declare const getAllowedPositionCount: (formation: unknown, position: unknown) => number;
export declare const countPlayersInPosition: (players: any[] | undefined, position: unknown) => number;
export declare const hasPositionCapacity: (players: any[] | undefined, formation: unknown, position: unknown, extraCount?: number) => boolean;
export declare const remapPlayersToFormation: (players: any[] | undefined, formation: unknown) => any[];
export declare const calculateAverageMainRating: (players?: any[]) => number;
//# sourceMappingURL=lobbyFormation.d.ts.map