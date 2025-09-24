import express, { type Application, type Request, type Response } from 'express'
import cors from 'cors'

import cron from "node-cron";
import notFound from './app/middleware/notFound.js'
import globalErrorHandler from './app/middleware/globalErrorHandler.js'
import router from './app/router/index.js'
import path from "path";
import { GoalModel } from './app/modules/FeatureGoal/goal.model.js';


const app: Application = express()
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// parser 
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({
     origin: '*',
     credentials: true
}));


cron.schedule("* * * * *", async () => {
     const now = new Date();
     console.log("hi")
     const goals = await GoalModel.find({
          isScheduled: true,
          status: "pending",
          scheduledDate: { $lte: now },
     });

     if (goals.length > 0) {
          for (const goal of goals) {
               goal.status = "active";
               await goal.save();
               console.log(`✅ Goal Activated: ${goal.goalTitle}`);
          }
     }
});

   

// api 

app.use("/api/v1", router)


app.get('/', (req: Request, res: Response) => {
     res.send('Welcome  Dear...')
})



app.use(notFound)

app.use(globalErrorHandler)

export default app