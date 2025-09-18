import express from 'express';
import { authRouter } from '../modules/auth/auth.router.js';
import { teamsRouter } from '../modules/Team/team.router.js';
import { lobbyRouter } from '../modules/Lobby/lobby.router.js';
import { paymentRouter } from '../modules/Payment/payment.router.js';
const router = express.Router();
const moduleRouter = [
    {
        path: "/auth",
        route: authRouter
    },
    {
        path: "/team",
        route: teamsRouter
    },
    {
        path: "/lobby",
        route: lobbyRouter
    },
    {
        path: "/payment",
        route: paymentRouter
    },
];
moduleRouter.forEach((route) => router.use(route.path, route.route));
export default router;
//# sourceMappingURL=index.js.map