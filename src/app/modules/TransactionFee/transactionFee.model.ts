import { model, Schema } from "mongoose";
import type { ITransactionFeeSetting } from "./transactionFee.interface.js";

const TransactionFeeSettingSchema = new Schema<ITransactionFeeSetting>(
     {
          key: { type: String, enum: ["global"], default: "global", unique: true, immutable: true },
          percentage: { type: Number, default: 0, min: 0 },
     },
     { timestamps: true }
);

export const TransactionFeeSettingModel = model<ITransactionFeeSetting>(
     "TransactionFeeSetting",
     TransactionFeeSettingSchema
);
