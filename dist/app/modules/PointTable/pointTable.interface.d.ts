import { Types } from "mongoose";
export interface IStanding {
    tournament: Types.ObjectId;
    team: Types.ObjectId;
    played?: number;
    win?: number;
    draw?: number;
    loss?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    points?: number;
}
//# sourceMappingURL=pointTable.interface.d.ts.map