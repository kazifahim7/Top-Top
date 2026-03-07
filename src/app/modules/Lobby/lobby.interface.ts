import { Schema, model, Document, Types } from "mongoose";

export interface PlayerStats {
     playerId: Types.ObjectId;
     matchPosition?: string
     redCard: number;
     yellowCard: number;
     contribution: number;
     assists: number;
     goal: number;
     tackle: number;
     save: number;
     rating: number;
     rawRating?:number;
     goodMoment:number,
     veryGoodMoment:number,
     guest_player?:boolean,
     mainRating?:number
     cleanSheet?:number,
}

export interface Team {
     teamId: Types.ObjectId;
     players: PlayerStats[];
     matchFormat?: string,
     guest_players?:  PlayerStats[];
}

export interface DefaultTeam {
     teamId: any;
     teamName: string;
     players: PlayerStats[];
     matchFormat?: string
}


export interface GeoLocation {
     lat: number;
     lng: number;
     address:string
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
     matchPublished?:boolean,
     team1AvgMatchRatingBefore?:number
     team2AvgMatchRatingBefore?:number
}
