import express from 'express'
import { goalController } from './goal.controller.js';
import auth from '../../middleware/auth.js';

const router = express.Router()

router.post("/create-goal", auth("admin", "organizer"), goalController.createGoal)

router.get("/all-goal", goalController.allGoal)
router.delete("/delete-goal/:id", goalController.deleteGoal)


export const goalRouter = router;