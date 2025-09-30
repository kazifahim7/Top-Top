import express from 'express';
import { tournamentMatchController } from './match.controller.js';
const router = express.Router();
router.post('/create-tournamentMatch', tournamentMatchController.createMatch);
router.get('/all-tournamentMatch', tournamentMatchController.allMatch);
router.get('/all-tournamentMatch/:id', tournamentMatchController.singleMatch);
router.delete('/delete-tournamentMatch/:id', tournamentMatchController.deleteMatch);
export const tournamentMatch = router;
//# sourceMappingURL=match.router.js.map