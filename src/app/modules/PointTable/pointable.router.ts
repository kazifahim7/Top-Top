import express from 'express'
import { pointTableController } from './pointable.controller.js'

const router = express.Router()

router.get("/tournament-pointTable/:id",pointTableController.getPointTable)


export const pointTableRouter = router