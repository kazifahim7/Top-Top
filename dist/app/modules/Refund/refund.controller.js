import catchAsync from "../../utils/catcgAsync.js";
import { refundService } from "./refund.service.js";
const sendRefundRequest = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const data = req.body;
    data.playerId = userId;
    const result = await refundService.sendRefundRequest(data);
    res.status(200).json({
        success: true,
        message: "Refund Request send successfully ",
        data: result
    });
});
const allRefundRequest = catchAsync(async (req, res) => {
    const result = await refundService.allRefundRequest();
    res.status(200).json({
        success: true,
        message: " All Refund Request retrieved successfully ",
        data: result
    });
});
const acceptRefundRequest = catchAsync(async (req, res) => {
    const result = await refundService.acceptRefundRequest(req.body);
    res.status(200).json({
        success: true,
        message: " Refund Request accept successfully ",
        data: result
    });
});
export const refundController = {
    sendRefundRequest,
    allRefundRequest,
    acceptRefundRequest
};
//# sourceMappingURL=refund.controller.js.map