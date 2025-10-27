import catchAsync from "../../utils/catcgAsync.js";
import { pointTableService } from "./pointable.service.js";
const getPointTable = catchAsync(async (req, res) => {
    const result = await pointTableService.getPointTable(req.params.id);
    res.status(200).json({
        success: true,
        message: "Point Table retrieved successfully",
        data: result
    });
});
export const pointTableController = {
    getPointTable
};
//# sourceMappingURL=pointable.controller.js.map