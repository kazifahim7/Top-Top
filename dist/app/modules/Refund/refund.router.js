import express from 'express';
import auth from '../../middleware/auth.js';
import { refundController } from './refund.controller.js';
const router = express.Router();
router.post('/send-refund-request', auth("player"), refundController.sendRefundRequest);
router.get('/all-refund-request', refundController.allRefundRequest);
router.post("/accept-refund-request", refundController.acceptRefundRequest);
export const refundRouter = router;
//# sourceMappingURL=refund.router.js.map