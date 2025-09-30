import express from 'express';
import { authRouter } from '../modules/auth/auth.router.js';
import { teamsRouter } from '../modules/Team/team.router.js';
import { lobbyRouter } from '../modules/Lobby/lobby.router.js';
import { paymentRouter } from '../modules/Payment/payment.router.js';
import { rankingRouter } from '../modules/Ranking/ranking.router.js';
import { refundRouter } from '../modules/Refund/refund.router.js';
import { adminRouter } from '../modules/Admin/admin.router.js';
import { goalRouter } from '../modules/FeatureGoal/goal.router.js';
import { tournamentRouter } from '../modules/Tournament/Tournament.router.js';
import { pointTableRouter } from '../modules/PointTable/pointable.router.js';
import { tournamentMatch } from '../modules/TournamentMatch/match.router.js';
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
    {
        path: "/ranking",
        route: rankingRouter
    },
    {
        path: "/refund",
        route: refundRouter
    },
    {
        path: "/admin",
        route: adminRouter
    },
    {
        path: "/goal",
        route: goalRouter
    },
    {
        path: "/tournament",
        route: tournamentRouter
    },
    {
        path: "/pointTable",
        route: pointTableRouter
    },
    {
        path: "/match",
        route: tournamentMatch
    },
];
moduleRouter.forEach((route) => router.use(route.path, route.route));
export default router;
//# sourceMappingURL=index.js.map