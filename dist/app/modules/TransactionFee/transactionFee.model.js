import { model, Schema } from "mongoose";
const TransactionFeeSettingSchema = new Schema({
    key: { type: String, enum: ["global"], default: "global", unique: true, immutable: true },
    percentage: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
export const TransactionFeeSettingModel = model("TransactionFeeSetting", TransactionFeeSettingSchema);
//# sourceMappingURL=transactionFee.model.js.map