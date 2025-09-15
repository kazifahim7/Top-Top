import express from 'express';
import { authController } from './auth.controller.js';
import auth from '../../middleware/auth.js';
import { upload } from '../../utils/multer.js';
const router = express.Router();
router.post("/create-player", upload.fields([
    { name: "images", maxCount: 6 }
]), (req, _res, next) => {
    if (req.body.data) {
        try {
            req.body = Object.assign({}, JSON.parse(req.body.data));
        }
        catch (err) {
            return next(new Error("Invalid JSON in 'data' field"));
        }
    }
    next();
}, authController.createUser);
//custom login 
router.post("/login", authController.logInUser);
router.post("/google-login", authController.googleLogin);
router.post("/apple-login", authController.appleLogin);
router.post("/reset-request", authController.resetRequest);
router.post("/reset-password", authController.resetPassword);
router.get("/all-player", authController.allUsers);
router.patch("/update-status/:id", auth("admin"), authController.updateStatus);
router.put("/update-profile/:email", upload.fields([
    { name: "images", maxCount: 6 }
]), (req, _res, next) => {
    if (req.body.data) {
        try {
            req.body = Object.assign({}, JSON.parse(req.body.data));
        }
        catch (err) {
            return next(new Error("Invalid JSON in 'data' field"));
        }
    }
    next();
}, authController.updateProfile);
router.get("/user/:email", authController.singleUser);
export const authRouter = router;
//# sourceMappingURL=auth.router.js.map