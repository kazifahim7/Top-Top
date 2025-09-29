import { Schema, Types } from "mongoose";
export declare const StandingModel: import("mongoose").Model<{
    win: number;
    draw: number;
    loss: number;
    team: {
        prototype?: Types.ObjectId | null;
        cacheHexString?: unknown;
        generate?: {} | null;
        createFromTime?: {} | null;
        createFromHexString?: {} | null;
        createFromBase64?: {} | null;
        isValid?: {} | null;
    };
    tournament: {
        prototype?: Types.ObjectId | null;
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
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    win: number;
    draw: number;
    loss: number;
    team: {
        prototype?: Types.ObjectId | null;
        cacheHexString?: unknown;
        generate?: {} | null;
        createFromTime?: {} | null;
        createFromHexString?: {} | null;
        createFromBase64?: {} | null;
        isValid?: {} | null;
    };
    tournament: {
        prototype?: Types.ObjectId | null;
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
        prototype?: Types.ObjectId | null;
        cacheHexString?: unknown;
        generate?: {} | null;
        createFromTime?: {} | null;
        createFromHexString?: {} | null;
        createFromBase64?: {} | null;
        isValid?: {} | null;
    };
    tournament: {
        prototype?: Types.ObjectId | null;
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
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    win: number;
    draw: number;
    loss: number;
    team: {
        prototype?: Types.ObjectId | null;
        cacheHexString?: unknown;
        generate?: {} | null;
        createFromTime?: {} | null;
        createFromHexString?: {} | null;
        createFromBase64?: {} | null;
        isValid?: {} | null;
    };
    tournament: {
        prototype?: Types.ObjectId | null;
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
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    win: number;
    draw: number;
    loss: number;
    team: {
        prototype?: Types.ObjectId | null;
        cacheHexString?: unknown;
        generate?: {} | null;
        createFromTime?: {} | null;
        createFromHexString?: {} | null;
        createFromBase64?: {} | null;
        isValid?: {} | null;
    };
    tournament: {
        prototype?: Types.ObjectId | null;
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
}>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
    win: number;
    draw: number;
    loss: number;
    team: {
        prototype?: Types.ObjectId | null;
        cacheHexString?: unknown;
        generate?: {} | null;
        createFromTime?: {} | null;
        createFromHexString?: {} | null;
        createFromBase64?: {} | null;
        isValid?: {} | null;
    };
    tournament: {
        prototype?: Types.ObjectId | null;
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
}> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=pointtable.model.d.ts.map