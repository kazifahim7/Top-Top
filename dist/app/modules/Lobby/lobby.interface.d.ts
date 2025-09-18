import { Document, Types } from "mongoose";
export interface PlayerStats {
    playerId: Types.ObjectId;
    matchPosition?: string;
    redCard: number;
    yellowCard: number;
    substitution: number;
    assists: number;
    goal: number;
    tackle: number;
    save: number;
    rating: number;
}
export interface Team {
    teamId: Types.ObjectId;
    players: PlayerStats[];
    matchFormat?: string;
}
export interface DefaultTeam {
    teamName: string;
    players: PlayerStats[];
    matchFormat?: string;
}
export interface GeoLocation {
    lat: number;
    lng: number;
}
export interface LobbyDocument extends Document {
    title: string;
    team1?: Team;
    team2?: Team;
    defaultTeam1?: DefaultTeam;
    defaultTeam2?: DefaultTeam;
    matchTime: string;
    location: GeoLocation;
    price: number;
    teamSize: number;
    goalkeeper: boolean;
    referee: boolean;
    camera: boolean;
    date: Date;
    time: string;
    maxSlot: number;
    positionRequired: string[];
    media: string[];
    motm: Types.ObjectId;
    note: string;
    lobbyStatus: string;
    matchType: string;
    matchPrivacy: string;
    privateKey?: string;
    goalTeam1: number;
    goalTeam2: number;
    organizer: Types.ObjectId;
}
//# sourceMappingURL=lobby.interface.d.ts.map