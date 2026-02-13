import type { IGoal } from "./goal.interface.js";
import { GoalModel } from "./goal.model.js";

const createGoal = async (payload: IGoal) => {
     const { goalTitle, isScheduled, scheduledDate, goalLink,goalBy } = payload;

     const newGoal = new GoalModel({
          goalTitle,
          goalLink,
          isScheduled,
          goalBy,
          scheduledDate: isScheduled ? scheduledDate : null,
          status: isScheduled ? "pending" : "active",
     });

     const result = await newGoal.save();
     return result;
}



const allGoal = async () => {
     const goalsData = await GoalModel.find().populate("goalBy")
     return goalsData
}
const deleteGoal = async (id: string) => {
     const goalsData = await GoalModel.findByIdAndDelete(id, { new: true })
     return goalsData
}








export const goalServices = {
     createGoal,
     allGoal,
     deleteGoal
}