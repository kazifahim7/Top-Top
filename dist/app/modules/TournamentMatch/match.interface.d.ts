import { Types } from "mongoose";
import type { PlayerStats } from "../Lobby/lobby.interface.js";
export type MatchStage = "League" | "Knockout" | "Both";
export type MatchGroup = "LeagueMatch" | "GroupStage" | "RoundOf32" | "RoundOf16" | "QuarterFinal" | "SemiFinal" | "Final";
export interface IMatch {
    tournament: Types.ObjectId;
    stage: MatchStage;
    group: MatchGroup;
    teamA: Types.ObjectId;
    teamB: Types.ObjectId;
    scoreA: number;
    scoreB: number;
    status: "Pending" | "Completed" | "start";
    time: string;
    date: Date;
    winner?: Types.ObjectId | null;
    teamBPlayers: PlayerStats[];
    teamAPlayers: PlayerStats[];
    media: string[];
    organizer: Types.ObjectId;
    countryCode?: string;
    currencyCode?: string;
    motm: Types.ObjectId;
    team1AvgMatchRatingBefore: number;
    team2AvgMatchRatingBefore: number;
    team1MatchFormat: string;
    team2MatchFormat: string;
}
//# sourceMappingURL=match.interface.d.ts.map