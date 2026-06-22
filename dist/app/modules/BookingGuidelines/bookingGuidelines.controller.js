import catchAsync from "../../utils/catcgAsync.js";
import { BookingGuidelinesService } from "./bookingGuidelines.service.js";
const getGlobalGuidelines = catchAsync(async (_req, res) => {
    const result = await BookingGuidelinesService.getGlobalGuidelines();
    res.status(200).json({
        success: true,
        message: "Booking guidelines retrieved successfully",
        data: result,
    });
});
const createGlobalGuidelines = catchAsync(async (req, res) => {
    const result = await BookingGuidelinesService.createGlobalGuidelines(req.body);
    res.status(201).json({
        success: true,
        message: "Booking guidelines created successfully",
        data: result,
    });
});
const updateGlobalGuidelines = catchAsync(async (req, res) => {
    const result = await BookingGuidelinesService.updateGlobalGuidelines(req.body);
    res.status(200).json({
        success: true,
        message: "Booking guidelines updated successfully",
        data: result,
    });
});
export const BookingGuidelinesController = {
    getGlobalGuidelines,
    createGlobalGuidelines,
    updateGlobalGuidelines,
};
//# sourceMappingURL=bookingGuidelines.controller.js.map