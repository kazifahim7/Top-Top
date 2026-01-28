import express from 'express';
import auth from '../../middleware/auth.js';
import { lobbyController } from './lobby.controller.js';
import { upload } from '../../utils/multer.js';
const router = express.Router();
router.get("/my-upcoming-match", auth("player"), lobbyController.myUpcomingLobby);
router.post("/create-match", auth("organizer", "admin"), lobbyController.createMatch);
router.get("/all-match", lobbyController.allMatch);
router.get("/:id", lobbyController.singlelobby);
router.post("/all-organizer-match", auth("organizer"), lobbyController.organizerMatch);
router.put("/:lobbyId/player", auth("organizer", "admin"), lobbyController.updatePlayerState);
router.put("/:lobbyId/lobby-info", upload.fields([
    { name: "images", maxCount: 6 }
]), (req, _res, next) => {
    if (req.body.data) {
        try {
            req.body = { ...JSON.parse(req.body.data) };
        }
        catch (err) {
            return next(new Error("Invalid JSON in 'data' field"));
        }
    }
    next();
}, lobbyController.lobbyInFo);
router.delete("/delete/:id", auth("admin"), lobbyController.deleteLobby);
router.get("/organizer-lobby/:id", auth("admin"), lobbyController.organizerLobby);
router.put("/assign-lobby/:id", auth("admin"), lobbyController.assignLobby);
router.put("/assign-tournament/:id", auth("admin"), lobbyController.assigntournament);
export const lobbyRouter = router;
//# sourceMappingURL=lobby.router.js.map