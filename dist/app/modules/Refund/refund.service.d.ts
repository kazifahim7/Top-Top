import mongoose, { Types } from "mongoose";
import type { TRefund } from "./refund.interface.js";
export declare const sendRefundRequest: (payload: TRefund) => Promise<mongoose.Document<unknown, {}, TRefund, {}, {}> & TRefund & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const refundService: {
    sendRefundRequest: (payload: TRefund) => Promise<mongoose.Document<unknown, {}, TRefund, {}, {}> & TRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    allRefundRequest: () => Promise<(mongoose.Document<unknown, {}, TRefund, {}, {}> & TRefund & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    acceptRefundRequest: (payload: {
        lobbyId: string | Types.ObjectId;
        playerId: string | Types.ObjectId;
        teamId?: string | Types.ObjectId;
    }) => Promise<{
        success: boolean;
        message: string;
        lobbyUpdate: mongoose.UpdateWriteOpResult;
        paymentUpdate: mongoose.UpdateWriteOpResult;
        refundUpdate: mongoose.UpdateWriteOpResult;
    }>;
    exit_lobby: (payload: {
        lobbyId: string | Types.ObjectId;
        currentUserId: string | Types.ObjectId;
    }, playerId: string | Types.ObjectId) => Promise<mongoose.UpdateWriteOpResult>;
};
//# sourceMappingURL=refund.service.d.ts.map