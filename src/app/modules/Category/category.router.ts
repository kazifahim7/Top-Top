import express from 'express'
import auth from '../../middleware/auth.js';
import validateRequest from '../../middleware/validatonRequest.js';
import { categoryValidation } from './category.zod.js';
import { categoryController } from './category.controller.js';

const router = express.Router()


router.post("/create-category",auth("admin"),validateRequest(categoryValidation),categoryController.createCategory)
router.get("/all-category",categoryController.getAllCategory)
router.get("/single-category/:id", categoryController.getSingleCategory)

router.delete("/delete-category/:id", auth("admin"), categoryController.deleteCategory)
router.patch("/update-category/:id", auth("admin"), categoryController.updateCategory)







export const categoryRouter = router ;