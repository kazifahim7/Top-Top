import { model, Schema } from "mongoose";
import { boolean } from "zod";
const PlayerStatsSchema = new Schema({
<<<<<<< HEAD
    playerId: { type: Schema.Types.ObjectId, ref: "Players", required: true },
=======
    playerId: { type: Schema.Types.ObjectId, ref: "players", required: true },
>>>>>>> b8fb58bb1cd248c11ae87b374230ff7dc6122728
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
});
const TeamSchema = new Schema({
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    players: { type: [PlayerStatsSchema], default: [] },
    matchFormat: { type: String },
});
const DefaultTeamSchema = new Schema({
    teamName: { type: String },
    players: { type: [PlayerStatsSchema], default: [] },
    matchFormat: { type: String },
});
const LocationSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
});
const LobbySchema = new Schema({
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
<<<<<<< HEAD
    motm: { type: Schema.Types.ObjectId, ref: "Players" },
=======
    motm: { type: Schema.Types.ObjectId, ref: "players" },
>>>>>>> b8fb58bb1cd248c11ae87b374230ff7dc6122728
    note: { type: String },
    lobbyStatus: { type: String, enum: ["ongoing", "completed", "block"], default: "ongoing" },
    matchType: { type: String, enum: ["solo", "teams"], default: "solo" },
    matchPrivacy: { type: String, enum: ["public", "private"], default: "public" },
    privateKey: { type: String },
    goalTeam1: { type: Number, default: 0 },
    goalTeam2: { type: Number, default: 0 },
<<<<<<< HEAD
    organizer: { type: Schema.Types.ObjectId, ref: "Players" },
=======
    organizer: { type: Schema.Types.ObjectId, ref: "players" },
    matchPublished: { type: boolean, default: false }
>>>>>>> b8fb58bb1cd248c11ae87b374230ff7dc6122728
}, { timestamps: true });
export const LobbyModel = model("Lobby", LobbySchema);
//# sourceMappingURL=lobby.model.js.map