import express from 'express'
import { authController } from './auth.controller.js'
import auth from '../../middleware/auth.js'
import { upload } from '../../utils/multer.js'
import otpLimiter from '../../RateLimiting/index.js'

const router = express.Router()

router.post("/create-player",  upload.fields([
     { name: "images", maxCount: 6 }
]), (req, _res, next) => {
     if (req.body.data) {
          try {
               req.body = { ...JSON.parse(req.body.data) }; 
          } catch (err) {
               return next(new Error("Invalid JSON in 'data' field"));
          }
     }
     next();
},  authController.createUser)

router.post("/create-organizer", auth("admin"), upload.fields([
     { name: "images", maxCount: 6 }
]), (req, _res, next) => {
     if (req.body.data) {
          try {
               req.body = { ...JSON.parse(req.body.data) };
          } catch (err) {
               return next(new Error("Invalid JSON in 'data' field"));
          }
     }
     next();
}, authController.createOrganizer)

//custom login 
router.post("/login",  authController.logInUser)
router.post("/google-login",authController.googleLogin)
router.post("/apple-login",authController.appleLogin)
router.post("/send-otp",otpLimiter, authController.resetRequest)
router.post("/reset-password",otpLimiter,authController.resetPassword)
router.post("/phone/send-otp", auth("player","admin","organizer"), otpLimiter, authController.sendPhoneOtp)
router.post("/phone/verify-otp", auth("player","admin","organizer"), otpLimiter, authController.verifyPhoneOtp)
router.get("/my-country-players", auth("player","admin","organizer"), authController.myCountryPlayers)
router.get("/all-player", authController.allUsers)

router.patch("/update-status/:id", auth("admin"), authController.updateStatus)
router.delete("/delete-player/:id", auth("admin"), authController.deletePlayer)

router.post('/change-password', auth("player","admin","organizer"),authController.changePassword)

router.put("/update-profile", upload.fields([
     { name: "images", maxCount: 6 }
]), (req, _res, next) => {
     if (req.body.data) {
          try {
               req.body = { ...JSON.parse(req.body.data) };
          } catch (err) {
               return next(new Error("Invalid JSON in 'data' field"));
          }
     }
     next();
}, auth("player","admin","organizer"), authController.updateProfile)

router.put("/update-country", auth("player","admin","organizer"), authController.updateOwnCountry)
router.put("/users/:id/country", auth("admin"), authController.updateUserCountryByAdmin)

router.get("/user", auth("player","admin","organizer"), authController.singleUser)

// single player 

router.get('/my-country-player-profile/:id', auth("player","admin","organizer"), authController.myCountryPlayerProfile)
router.get('/player-profile/:id',authController.playerProfile)


router.delete('/delete-account',auth("player"),authController.deleteAccount)





export const authRouter = router
