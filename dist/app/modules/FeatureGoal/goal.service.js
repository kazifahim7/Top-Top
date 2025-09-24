var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GoalModel } from "./goal.model.js";
const createGoal = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalTitle, isScheduled, scheduledDate, goalLink } = payload;
    const newGoal = new GoalModel({
        goalTitle,
        goalLink,
        isScheduled,
        scheduledDate: isScheduled ? scheduledDate : null,
        status: isScheduled ? "pending" : "active",
    });
    const result = yield newGoal.save();
    return result;
});
const allGoal = () => __awaiter(void 0, void 0, void 0, function* () {
    const goalsData = yield GoalModel.find();
    return goalsData;
});
export const goalServices = {
    createGoal,
    allGoal
};
//# sourceMappingURL=goal.service.js.map