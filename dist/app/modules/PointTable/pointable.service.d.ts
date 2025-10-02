export declare const pointTableService: {
    getPointTable: (id: string) => Promise<(import("mongoose").Document<unknown, {}, {
        win: number;
        draw: number;
        loss: number;
        team: {
            prototype?: import("mongoose").Types.ObjectId | null;
            cacheHexString?: unknown;
            generate?: {} | null;
            createFromTime?: {} | null;
            createFromHexString?: {} | null;
            createFromBase64?: {} | null;
            isValid?: {} | null;
        };
        tournament: {
            prototype?: import("mongoose").Types.ObjectId | null;
            cacheHexString?: unknown;
            generate?: {} | null;
            createFromTime?: {} | null;
            createFromHexString?: {} | null;
            createFromBase64?: {} | null;
            isValid?: {} | null;
        };
        played: number;
        goalsFor: number;
        goalsAgainst: number;
        points: number;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
        win: number;
        draw: number;
        loss: number;
        team: {
            prototype?: import("mongoose").Types.ObjectId | null;
            cacheHexString?: unknown;
            generate?: {} | null;
            createFromTime?: {} | null;
            createFromHexString?: {} | null;
            createFromBase64?: {} | null;
            isValid?: {} | null;
        };
        tournament: {
            prototype?: import("mongoose").Types.ObjectId | null;
            cacheHexString?: unknown;
            generate?: {} | null;
            createFromTime?: {} | null;
            createFromHexString?: {} | null;
            createFromBase64?: {} | null;
            isValid?: {} | null;
        };
        played: number;
        goalsFor: number;
        goalsAgainst: number;
        points: number;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
};
//# sourceMappingURL=pointable.service.d.ts.map