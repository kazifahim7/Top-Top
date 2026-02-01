import express from 'express'
import { tournamentMatchController } from './match.controller.js'
import auth from '../../middleware/auth.js'

const router = express.Router()

router.post('/create-tournamentMatch', auth("organizer"),tournamentMatchController.createMatch)
router.get('/all-tournamentMatch/:id',tournamentMatchController.allMatch)
router.get('/single-tournamentMatchDetails/:id',tournamentMatchController.singleMatch)
router.delete('/delete-tournamentMatch/:id',tournamentMatchController.deleteMatch)
// match id dite hbe
router.patch('/update-tournamentMatch/:id',tournamentMatchController.updateMatch)



//
router.post('/:matchId/add-player', auth("players"),tournamentMatchController.addPlayers)
router.delete('/:matchId/remove-player', auth("players"), tournamentMatchController.removePlayerFromMatch)






export const tournamentMatch = router