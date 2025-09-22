var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import catchAsync from "../../utils/catcgAsync.js";
import { refundService } from "./refund.service.js";
const sendRefundRequest = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const data = req.body;
    data.playerId = userId;
    const result = yield refundService.sendRefundRequest(data);
    res.status(200).json({
        success: true,
        message: "Refund Request send successfully ",
        data: result
    });
}));
const allRefundRequest = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield refundService.allRefundRequest();
    res.status(200).json({
        success: true,
        message: " All Refund Request retrieved successfully ",
        data: result
    });
}));
const acceptRefundRequest = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield refundService.acceptRefundRequest(req.body);
    res.status(200).json({
        success: true,
        message: " Refund Request accept successfully ",
        data: result
    });
}));
export const refundController = {
    sendRefundRequest,
    allRefundRequest,
    acceptRefundRequest
};
//# sourceMappingURL=refund.controller.js.map