import express from "express";
import { joinLobby, paymentSuccess, paymentCancel, allPaymentHistory, allPaymentHistoryOrganizer, makePaid } from "../Payment/payment.controller.js";
import auth from "../../middleware/auth.js";
import { stripeWebhook, verifyPayment } from "./webhook.controller.js";

const router = express.Router();

router.post("/join-lobby", auth("player","organizer","admin"), joinLobby);
router.get("/payment-success", auth("organizer", "admin","player"),paymentSuccess);
router.get("/payment-cancel", auth("organizer", "admin"), paymentCancel);
router.get("/all-payment" ,auth("admin"), allPaymentHistory)
router.get("/organizer-payment", auth("organizer"), allPaymentHistoryOrganizer)

router.patch("/payment-paid", auth("organizer", "admin"),makePaid)







// GET /payment/verify?paymentId=<id>

router.get(
     "/payment/verify",
     auth("organizer", "admin", "player"),
     verifyPayment
);

export const paymentRouter = router;
