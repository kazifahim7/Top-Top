import express from 'express'
import auth from '../../middleware/auth.js';
import { upload } from '../../utils/multer.js';
import { productController } from './post.controller.js';
import validateRequest from '../../middleware/validatonRequest.js';
import { productSchema } from './post.validation.js';

const router = express.Router()

router.post("/create-product", auth("admin"), upload.fields([
     { name: "images", maxCount: 6 },
     { name: "video", maxCount: 1 }
]), (req, _res, next) => {
     if (req.body.data) {
          try {
               req.body = { ...JSON.parse(req.body.data) }; 
          } catch (err) {
               return next(new Error("Invalid JSON in 'data' field"));
          }
     }
     next();
},  productController.createProduct)

router.get("/all-product",productController.getAllProduct)

router.get("/single-product/:id",productController.getSingleProduct)


router.patch("/update-product/:id", auth("admin"), upload.fields([
     { name: "images", maxCount: 6 },
     { name: "video", maxCount: 1 }
]),  (req, _res, next) => {
     if (req.body.data) {
          try {
               req.body = { ...JSON.parse(req.body.data) }; 
          } catch (err) {
               return next(new Error("Invalid JSON in 'data' field"));
          }
     }
     next();
},  productController.updateSingleProduct)



router.delete("/delete-product/:id", auth("admin"), productController.deleteProduct)



export const ProductRouter = router ;