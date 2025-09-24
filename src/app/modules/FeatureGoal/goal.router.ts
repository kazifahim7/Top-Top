import express from 'express'
import { goalController } from './goal.controller.js';

const router = express.Router()

router.post("/create-goal",goalController.createGoal)

router.get("/all-goal",goalController.allGoal)


export const goalRouter = router;