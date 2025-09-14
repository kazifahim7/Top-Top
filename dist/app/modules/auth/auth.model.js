import { model, Schema } from "mongoose";
const ProfileSchema = new Schema({
    FullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'player', 'organizer'], required: true, default: "player" },
    isBlocked: { type: String, enum: ['active', 'block'], default: 'active' },
    mobile: { type: String, default: "N/A" },
    nationality: { type: String, default: "N/A" },
    dominantFoot: { type: String, default: "N/A" },
    gameMode: { type: String, default: "N/A" },
    preferredAreas: { type: String, default: "N/A" },
    socialProfile: { type: [String], default: [] },
    playingDays: { type: [String], default: [] },
    imageUrl: { type: String, required: true },
}, {
    timestamps: true,
});
export const userModel = model('Players', ProfileSchema);
//# sourceMappingURL=auth.model.js.map