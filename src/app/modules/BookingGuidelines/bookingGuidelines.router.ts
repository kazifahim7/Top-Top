import express from "express";
import auth from "../../middleware/auth.js";
import { BookingGuidelinesController } from "./bookingGuidelines.controller.js";

const router = express.Router();

router.get("/global", auth("player", "organizer", "admin"), BookingGuidelinesController.getGlobalGuidelines);
router.post("/global", auth("admin"), BookingGuidelinesController.createGlobalGuidelines);
router.patch("/global", auth("admin"), BookingGuidelinesController.updateGlobalGuidelines);

export const bookingGuidelinesRouter = router;
