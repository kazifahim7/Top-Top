import express from 'express'
import { playerRankingController } from './ranking.controller.js';

const router = express.Router()



router.get('/team-ranking', playerRankingController.teamRanking)

router.get("/player-ranking", playerRankingController.playerRanking);

export const rankingRouter = router;