import express from 'express'
import { playerRankingController } from './ranking.controller.js';

const router = express.Router()

router.get('/player-ranking', playerRankingController.playerRanking)
router.get('/team-ranking', playerRankingController.teamRanking)

export const rankingRouter = router;