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
import { goalServices } from "./goal.service.js";
const createGoal = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield goalServices.createGoal(req.body);
    res.status(201).json({
        success: true,
        message: "Goal created successfully",
        data: result,
    });
}));
const allGoal = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield goalServices.allGoal();
    res.status(201).json({
        success: true,
        message: "All Goals are retrieved successfully",
        data: result,
    });
}));
export const goalController = {
    createGoal,
    allGoal
};
//# sourceMappingURL=goal.controller.js.map