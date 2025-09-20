import express from "express";
import { joinLobby, paymentSuccess, paymentCancel, allPaymentHistory } from "../Payment/payment.controller.js";
import auth from "../../middleware/auth.js";
const router = express.Router();
router.post("/join-lobby", auth("player", "organizer"), joinLobby);
router.post("/payment-success", paymentSuccess);
router.post("/payment-cancel", paymentCancel);
router.get("/all-payment", allPaymentHistory);
export const paymentRouter = router;
//# sourceMappingURL=payment.router.js.map