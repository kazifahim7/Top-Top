import express from 'express'
import { upload } from '../../utils/multer.js';
import { TournamentController } from './Tournament.controller.js';
import auth from '../../middleware/auth.js';

const router = express.Router()

router.post(
     "/create-tournament",
     upload.fields([{ name: "images", maxCount: 6 }]),
     auth("organizer"),
     (req, _res, next) => {
          if (req.body.data) {
               let parsedData;

               try {
                    parsedData = JSON.parse(req.body.data);
               } catch (err) {
                    return next(new Error("Invalid JSON in 'data' field"));
               }

               parsedData.organizer = req.user.id;
               req.body = parsedData;
          }

          next();
     },
     TournamentController.createTournament
);


router.get('/single-tournament/:id', TournamentController.singleTournament)
router.get('/all-tournament', TournamentController.allTournament)
router.patch('/update-tournament/:id', upload.fields([
     { name: "images", maxCount: 6 }
]), (req, _res, next) => {
     if (req.body.data) {
          try {
               req.body = { ...JSON.parse(req.body.data) };
          } catch (err) {
               return next(new Error("Invalid JSON in 'data' field"));
          }
     }
     next();
}, TournamentController.updateTournament)

router.delete('/delete-tournament/:id', TournamentController.deleteTournament)

router.post("/:tournamentId/qualify", TournamentController.qualifyTeamsController);


router.get("/:tournamentId/top-players", TournamentController.getTopPlayers);

export const tournamentRouter = router