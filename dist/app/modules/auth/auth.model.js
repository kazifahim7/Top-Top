import { model, Schema } from "mongoose";
const ProfileSchema = new Schema({
    FullName: { type: String, required: true },
    userName: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'player', 'organizer'], required: true, default: "player" },
    isBlocked: { type: String, enum: ['active', 'block'], default: 'active' },
    mobile: { type: String, trim: true, default: "" },
    isMobileVerified: { type: Boolean, default: false },
    mobileVerifiedAt: { type: Date, default: null },
    nationality: { type: String, default: "" },
    dominantFoot: { type: String, default: "" },
    gameMode: { type: String, default: "" },
    preferredAreas: { type: [String], default: [] },
    socialProfile: { type: [String], default: [] },
    playingDays: { type: [String], default: [] },
    position: { type: [String], default: [] },
    imageUrl: { type: String, required: true },
    age: { type: String, default: "18" },
    //future update is below
    redCard: { type: Number, default: 0 },
    yellowCard: { type: Number, default: 0 },
    contribution: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    goal: { type: Number, default: 0 },
    tackle: { type: Number, default: 0 },
    save: { type: Number, default: 0 },
    match: { type: Number, default: 0 },
    rating: { type: Number, default: 6.5 },
    motm: { type: Number, default: 0 },
    cleanSheet: { type: Number, default: 0 },
    matchPosition: { type: String },
}, {
    timestamps: true,
});
ProfileSchema.index({ mobile: 1, isMobileVerified: 1 });
export const userModel = model('Players', ProfileSchema);
//# sourceMappingURL=auth.model.js.map