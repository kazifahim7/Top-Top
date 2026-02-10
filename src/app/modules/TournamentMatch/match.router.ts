import express from 'express'
import { tournamentMatchController } from './match.controller.js'
import auth from '../../middleware/auth.js'
import { upload } from '../../utils/multer.js'

const router = express.Router()

router.post('/create-tournamentMatch', auth("organizer"),tournamentMatchController.createMatch)
router.get('/all-tournamentMatch/:id',tournamentMatchController.allMatch)
router.get('/single-tournamentMatchDetails/:id',tournamentMatchController.singleMatch)
router.delete('/delete-tournamentMatch/:id',tournamentMatchController.deleteMatch)
// match id dite hbe


router.patch('/update-tournamentMatch/:id',upload.fields([
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
},tournamentMatchController.updateMatch)



//

router.post('/:matchId/add-player', auth("player"),tournamentMatchController.addPlayers)
router.delete('/:matchId/remove-player', auth("player"), tournamentMatchController.removePlayerFromMatch)
router.put("/:matchId/player", auth("organizer", "admin"), tournamentMatchController.updatePlayerState);







export const tournamentMatch = router