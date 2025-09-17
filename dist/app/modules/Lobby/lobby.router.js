import express from 'express';
import auth from '../../middleware/auth.js';
import { lobbyController } from './lobby.controller.js';
const router = express.Router();
router.post("/create-match", auth("organizer"), lobbyController.createMatch);
router.get("/all-match", lobbyController.allMatch);
export const lobbyRouter = router;
//# sourceMappingURL=lobby.router.js.map