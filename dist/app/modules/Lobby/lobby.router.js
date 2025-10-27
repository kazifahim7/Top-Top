import express from 'express';
import auth from '../../middleware/auth.js';
import { lobbyController } from './lobby.controller.js';
import { upload } from '../../utils/multer.js';
const router = express.Router();
router.post("/create-match", auth("organizer"), lobbyController.createMatch);
router.get("/all-match", lobbyController.allMatch);
router.put("/:lobbyId/player", auth("organizer"), lobbyController.updatePlayerState);
router.put("/lobby/:lobbyId/lobby-info", upload.fields([
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
export const lobbyRouter = router;
//# sourceMappingURL=lobby.router.js.map