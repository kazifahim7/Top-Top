import { Types } from "mongoose";
export type TTeam = {
    image: string;
    teamName: string;
    userName: string;
    totalMatch: number;
    win: number;
    draw: number;
    loss: number;
    players: Types.ObjectId[];
    teamOwner: Types.ObjectId;
    teamCaptain: Types.ObjectId[];
    goal: number;
    carryGoal: number;
};
//# sourceMappingURL=team.interface.d.ts.map