import express from 'express'
import { upload } from '../../utils/multer.js';
import { TournamentController } from './Tournament.controller.js';

const router = express.Router()

router.post("/create-tournament", upload.fields([
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
}, TournamentController.createTournament)

router.get('/single-tournament/:id',TournamentController.singleTournament)
router.get('/all-tournament',TournamentController.allTournament)
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
},TournamentController.updateTournament)

router.delete('/delete-tournament/:id',TournamentController.deleteTournament)

router.post("/:tournamentId/qualify", TournamentController.qualifyTeamsController);




export const tournamentRouter = router