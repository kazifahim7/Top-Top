import { GoalModel } from "./goal.model.js";
const createGoal = async (payload) => {
    const { goalTitle, isScheduled, scheduledDate, goalLink } = payload;
    const newGoal = new GoalModel({
        goalTitle,
        goalLink,
        isScheduled,
        scheduledDate: isScheduled ? scheduledDate : null,
        status: isScheduled ? "pending" : "active",
    });
    const result = await newGoal.save();
    return result;
};
const allGoal = async () => {
    const goalsData = await GoalModel.find().populate("goalBy");
    return goalsData;
};
const deleteGoal = async (id) => {
    const goalsData = await GoalModel.findByIdAndDelete(id, { new: true });
    return goalsData;
};
export const goalServices = {
    createGoal,
    allGoal,
    deleteGoal
};
//# sourceMappingURL=goal.service.js.map