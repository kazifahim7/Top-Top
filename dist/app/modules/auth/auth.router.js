import express from 'express';
import validateRequest from '../../middleware/validatonRequest.js';
import { createUserValidation, loginUserValidation } from './auth.zod.js';
import { authController } from './auth.controller.js';
import auth from '../../middleware/auth.js';
const router = express.Router();
router.post("/create-user", validateRequest(createUserValidation), authController.createUser);
router.post("/login", validateRequest(loginUserValidation), authController.logInUser);
router.post("/reset-request", authController.resetRequest);
router.post("/reset-password", authController.resetPassword);
router.get("/all-users", auth("admin"), authController.allUsers);
// below api are not useful in future you can use it 
router.patch("/update-status/:id", auth("admin"), authController.updateStatus);
router.put("/update-profile/:email", authController.updateProfile);
router.get("/user/:email", authController.singleUser);
export const authRouter = router;
//# sourceMappingURL=auth.router.js.map