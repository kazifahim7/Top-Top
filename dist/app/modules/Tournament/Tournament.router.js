import express from 'express';
import { upload } from '../../utils/multer.js';
import { TournamentController } from './Tournament.controller.js';
import auth from '../../middleware/auth.js';
const router = express.Router();
router.post("/create-tournament", upload.fields([{ name: "images", maxCount: 6 }]), auth("organizer", "admin"), (req, _res, next) => {
    if (req.body.data) {
        let parsedData;
        try {
            parsedData = JSON.parse(req.body.data);
        }
        catch (err) {
            return next(new Error("Invalid JSON in 'data' field"));
        }
        parsedData.organizer = req.user.id;
        req.body = parsedData;
    }
    next();
}, TournamentController.createTournament);
router.post("/create-tournament-v2", upload.fields([{ name: "images", maxCount: 6 }]), auth("organizer", "admin"), (req, _res, next) => {
    if (req.body.data) {
        let parsedData;
        try {
            parsedData = JSON.parse(req.body.data);
        }
        catch (err) {
            return next(new Error("Invalid JSON in 'data' field"));
        }
        parsedData.organizer = req.user.id;
        req.body = parsedData;
    }
    next();
}, TournamentController.createTournament);
router.get('/single-tournament/:id', TournamentController.singleTournament);
router.get('/all-tournament', TournamentController.allTournament);
router.get('/my-country-tournament', auth("player", "admin", "organizer"), TournamentController.myCountryTournament);
router.get('/my-country-tournament/:id', auth("player", "admin", "organizer"), TournamentController.myCountrySingleTournament);
router.get('/country/:countryCode', TournamentController.countryTournament);
router.get('/:tournamentId/top-players', TournamentController.getTopPlayers);
router.get('/all-tournament-organizer', auth("organizer"), TournamentController.organizerTournament);
// F-05 FIX: organizer ও admin 
router.patch('/update-tournament/:id', auth("organizer", "admin"), upload.fields([{ name: "images", maxCount: 6 }]), (req, _res, next) => {
    if (req.body.data) {
        try {
            req.body = { ...JSON.parse(req.body.data) };
        }
        catch (err) {
            return next(new Error("Invalid JSON in 'data' field"));
        }
    }
    next();
}, TournamentController.updateTournament);
// F-05 FIX: organizer ও admin 
router.delete('/delete-tournament/:id', auth("organizer", "admin"), TournamentController.deleteTournament);
// F-05 FIX: organizer ও admin 
router.post("/:tournamentId/qualify", auth("organizer", "admin"), TournamentController.qualifyTeamsController);
export const tournamentRouter = router;
//# sourceMappingURL=Tournament.router.js.map