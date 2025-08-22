import express from 'express'
import auth from '../../middleware/auth.js';
import validateRequest from '../../middleware/validatonRequest.js';
import { categoryValidation } from './category.zod.js';

const router = express.Router()


router.post("/create-category",auth("admin"),validateRequest(categoryValidation))





export const categoryRouter = router ;