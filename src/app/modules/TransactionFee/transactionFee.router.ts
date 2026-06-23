import express from "express";
import auth from "../../middleware/auth.js";
import { TransactionFeeController } from "./transactionFee.controller.js";

const router = express.Router();

router.get("/global", auth("admin"), TransactionFeeController.getGlobalSetting);
router.post("/global", auth("admin"), TransactionFeeController.createGlobalSetting);
router.patch("/global", auth("admin"), TransactionFeeController.updateGlobalSetting);
router.get("/countries", auth("admin"), TransactionFeeController.getCountryFees);
router.patch("/countries/:countryCode", auth("admin"), TransactionFeeController.updateCountryFixedFee);
router.get("/quote", auth("player", "organizer", "admin"), TransactionFeeController.getQuote);

export const transactionFeeRouter = router;
