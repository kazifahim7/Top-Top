import type { Types } from "mongoose";
export interface ITournament {
    name: string;
    type: "League" | "Knockout" | "Both";
    price: number;
    location: {
        lat: number;
        lng: number;
    };
    startDate: Date;
    duration: number;
    fieldSize: 5 | 7 | 11 | 8 | 9 | 10;
    teams: Types.ObjectId[];
    qualifiedTeams: Types.ObjectId[];
    winner?: Types.ObjectId | null;
    maxTeam: number;
    imageUrl: string;
    status: string;
    organizer: Types.ObjectId;
}
//# sourceMappingURL=Tournament.interface.d.ts.map