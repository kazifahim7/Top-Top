import express from 'express'
import { tournamentMatchController } from './match.controller.js'

const router = express.Router()

router.post('/create-tournamentMatch',tournamentMatchController.createMatch)
router.get('/all-tournamentMatch/:id',tournamentMatchController.allMatch)
router.get('/all-tournamentMatch/:id',tournamentMatchController.singleMatch)
router.delete('/delete-tournamentMatch/:id',tournamentMatchController.deleteMatch)
// match id dite hbe
router.patch('/update-tournamentMatch/:id',tournamentMatchController.updateMatch)






export const tournamentMatch = router