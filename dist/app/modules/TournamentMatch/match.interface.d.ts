import { Types } from "mongoose";
export type MatchStage = "League" | "Knockout";
export type MatchGroup = "GroupMatch" | "QuarterFinal1" | "QuarterFinal2" | "QuarterFinal3" | "QuarterFinal4" | "SemiFinal1" | "SemiFinal2" | "Final";
export interface IMatch {
    tournament: Types.ObjectId;
    stage: MatchStage;
    group: MatchGroup;
    teamA: Types.ObjectId;
    teamB: Types.ObjectId;
    scoreA: number;
    scoreB: number;
    status: "Pending" | "Completed";
    time: string;
    date: Date;
    winner?: Types.ObjectId | null;
}
//# sourceMappingURL=match.interface.d.ts.map