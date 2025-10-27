import { StandingModel } from "./pointtable.model.js";
const getPointTable = async (id) => {
    const result = await StandingModel.find({ tournament: id }).populate("team tournament");
    return result;
};
export const pointTableService = {
    getPointTable
};
//# sourceMappingURL=pointable.service.js.map