import express from "express";
import { joinLobby, paymentSuccess, paymentCancel } from "../Payment/payment.controller.js";

const router = express.Router();

router.post("/join-lobby", joinLobby);
router.get("/payment-success", paymentSuccess);
router.get("/payment-cancel", paymentCancel);

export const paymentRouter = router;
