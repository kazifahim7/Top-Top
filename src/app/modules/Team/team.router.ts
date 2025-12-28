import express from 'express'
import auth from '../../middleware/auth.js';
import { TeamController } from './team.controller.js';
import { upload } from '../../utils/multer.js';

const router = express.Router()

router.post("/create-team", auth("player"),upload.fields([
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
},TeamController.createTeam)

router.put("/update-team/:id", auth("player"),upload.fields([
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
},TeamController.updateTeam)

router.put("/update-team/:id",TeamController.updateTeam)

router.get("/all-teams",TeamController.allTeams)
router.get("/my-team",auth("player"),TeamController.myTeam)
router.delete("/delete-team/:id",TeamController.DeleteTeam)

// assign captain in a team

router.put("/:teamId/assign-captain",auth("player"),TeamController.assignCaptain)

router.put("/:teamId/remove-player", auth("player"), TeamController.removePlayer)


// ! notification api is below ->

router.post("/:teamId/invite",auth("player"),TeamController.invitePlayer)
router.post("/accept-invite/:inviteId",TeamController.acceptInvite)
router.put("/reject-invite/:inviteId", TeamController.rejectInvite)
router.get("/my-request", auth("player"), TeamController.myRequest)








export const teamsRouter = router ;
