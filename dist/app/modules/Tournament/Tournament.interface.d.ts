import type { Types } from "mongoose";
export interface ITournament {
    name: string;
    type: "Standing" | "Knockout";
    price: number;
    location: {
        lat: number;
        lng: number;
    };
    startDate: Date;
    duration: number;
    fieldSize: 5 | 7 | 11;
    teams: Types.ObjectId[];
    qualifiedTeams: Types.ObjectId[];
    winner?: Types.ObjectId | null;
    maxTeam: number;
    imageUrl: string;
}
//# sourceMappingURL=Tournament.interface.d.ts.map