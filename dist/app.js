import express, {} from 'express';
import cors from 'cors';
import cron from "node-cron";
import notFound from './app/middleware/notFound.js';
import globalErrorHandler from './app/middleware/globalErrorHandler.js';
import router from './app/router/index.js';
import path from "path";
import fs from "fs";
import { GoalModel } from './app/modules/FeatureGoal/goal.model.js';
import axios from 'axios';
import config from './app/config/index.js';
import helmet from 'helmet';
const app = express();
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("📁 'uploads' folder created successfully!");
}
else {
    console.log("✅ 'uploads' folder already exists.");
}
// Serve static uploads folder
app.use("/uploads", express.static(uploadsPath));
// Parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
// Cron job
cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log("⏰ Cron running...");
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
// location 
app.get("/api/autocomplete", async (req, res) => {
    try {
        const { input } = req.query;
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
            params: { input, key: config.google_api_key },
        });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});
app.get("/api/place-details", async (req, res) => {
    try {
        const { place_id } = req.query;
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id,
                key: config.google_api_key,
                fields: "formatted_address,geometry",
            },
        });
        const result = response.data.result;
        res.json({
            address: result.formatted_address,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
});
// API routes
app.use("/api/v1", router);
app.get('/', (req, res) => {
    res.send('Welcome to top_top updated...');
});
// Error handling
app.use(notFound);
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map