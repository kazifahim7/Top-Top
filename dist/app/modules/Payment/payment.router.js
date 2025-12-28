import express from "express";
import { joinLobby, paymentSuccess, paymentCancel, allPaymentHistory, allPaymentHistoryOrganizer } from "../Payment/payment.controller.js";
import auth from "../../middleware/auth.js";
const router = express.Router();
router.post("/join-lobby", auth("player", "organizer"), joinLobby);
router.get("/payment-success", paymentSuccess);
router.get("/payment-cancel", paymentCancel);
router.get("/all-payment", auth("admin"), allPaymentHistory);
router.get("/organizer-payment", auth("organizer"), allPaymentHistoryOrganizer);
export const paymentRouter = router;
//# sourceMappingURL=payment.router.js.map