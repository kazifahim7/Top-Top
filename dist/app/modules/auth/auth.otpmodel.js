import { model, Schema } from "mongoose";
const otpSchema = new Schema({
    role: { type: String, required: true },
    email: { type: String, required: true },
    otp: { type: Number, required: true },
    otpExpiry: { type: Date, required: true },
}, { timestamps: true });
// Model
const OtpModel = model("Otp", otpSchema);
export default OtpModel;
//# sourceMappingURL=auth.otpmodel.js.map