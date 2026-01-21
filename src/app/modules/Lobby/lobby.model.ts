import { model, Schema } from "mongoose";
import type { DefaultTeam, GeoLocation, LobbyDocument, PlayerStats, Team } from "./lobby.interface.js";
import { boolean } from "zod";

const PlayerStatsSchema = new Schema<PlayerStats>({
     playerId: { type: Schema.Types.ObjectId, ref: "players", required: true },
     redCard: { type: Number, default: 0 },
     yellowCard: { type: Number, default: 0 },
     contribution: { type: Number, default: 0 },
     assists: { type: Number, default: 0 },
     goal: { type: Number, default: 0 },
     tackle: { type: Number, default: 0 },
     save: { type: Number, default: 0 },
     goodMoment: { type: Number, default: 0 },
     veryGoodMoment: { type: Number, default: 0 },
     rating: { type: Number, default: 6.5 },
     matchPosition: { type: String },
     guest_player:{type:Boolean,default:false}
});

const TeamSchema = new Schema<Team>({
     teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
     players: { type: [PlayerStatsSchema], default: [] },
     matchFormat: { type: String }
     

});

const DefaultTeamSchema = new Schema<DefaultTeam>({
     teamName: { type: String },
     players: { type: [PlayerStatsSchema], default: [] },
     matchFormat: { type: String },
});

const LocationSchema = new Schema<GeoLocation>({
     lat: { type: Number, required: true },
     lng: { type: Number, required: true },
     address: { type: String, required: true }
});

const LobbySchema = new Schema<LobbyDocument>(
     {
          title: { type: String, required: true },
          team1: { type: TeamSchema },
          team2: { type: TeamSchema },
          defaultTeam1: { type: DefaultTeamSchema },
          defaultTeam2: { type: DefaultTeamSchema },
          matchTime: { type: String, required: true },
          location: { type: LocationSchema, required: true },
          price: { type: Number, default: 0 },
          teamSize: { type: Number, required: true },
          goalkeeper: { type: Boolean, default: false },
          referee: { type: Boolean, default: false },
          camera: { type: Boolean, default: false },
          date: { type: Date, required: true },
          time: { type: String, required: true },
          maxSlot: { type: Number, required: true },
          positionRequired: { type: [String], default: [] },
          media: { type: [String] },
          motm: { type: Schema.Types.ObjectId, ref: "players" },
          note: { type: String },
          lobbyStatus: { type: String, enum: ["ongoing", "completed", "block"], default: "ongoing" },
          matchType: { type: String, enum: ["solo", "teams"], default: "solo" },
          matchPrivacy: { type: String, enum: ["public", "private"], default: "public" },
          privateKey: { type: String },
          goalTeam1: { type: Number, default: 0 },
          goalTeam2: { type: Number, default: 0 },
          organizer: { type: Schema.Types.ObjectId, ref: "players" },
          matchPublished: { type: boolean, default: false }
     },
     { timestamps: true }
);

export const LobbyModel = model<LobbyDocument>("Lobby", LobbySchema);