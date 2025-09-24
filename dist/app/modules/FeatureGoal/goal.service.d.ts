import type { IGoal } from "./goal.interface.js";
export declare const goalServices: {
    createGoal: (payload: IGoal) => Promise<import("mongoose").Document<unknown, {}, IGoal, {}, {}> & IGoal & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    allGoal: () => Promise<(import("mongoose").Document<unknown, {}, IGoal, {}, {}> & IGoal & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
};
//# sourceMappingURL=goal.service.d.ts.map