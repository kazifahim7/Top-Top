var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express, {} from 'express';
import cors from 'cors';
import cron from "node-cron";
import notFound from './app/middleware/notFound.js';
import globalErrorHandler from './app/middleware/globalErrorHandler.js';
import router from './app/router/index.js';
import path from "path";
import { GoalModel } from './app/modules/FeatureGoal/goal.model.js';
const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// parser 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    credentials: true
}));
cron.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    console.log("hi");
    const goals = yield GoalModel.find({
        isScheduled: true,
        status: "pending",
        scheduledDate: { $lte: now },
    });
    if (goals.length > 0) {
        for (const goal of goals) {
            goal.status = "active";
            yield goal.save();
            console.log(`✅ Goal Activated: ${goal.goalTitle}`);
        }
    }
}));
// api 
app.use("/api/v1", router);
app.get('/', (req, res) => {
    res.send('Welcome  Dear...');
});
app.use(notFound);
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map