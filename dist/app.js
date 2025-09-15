import express, {} from 'express';
import cors from 'cors';
import notFound from './app/middleware/notFound.js';
import globalErrorHandler from './app/middleware/globalErrorHandler.js';
import router from './app/router/index.js';
import path from "path";
const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// parser 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    credentials: true
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