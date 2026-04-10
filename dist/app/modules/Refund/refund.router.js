import express from 'express';
import auth from '../../middleware/auth.js';
import { refundController } from './refund.controller.js';
const router = express.Router();
router.post('/send-refund-request', auth("player", "admin", "organizer"), refundController.sendRefundRequest);
router.get('/all-refund-request', auth("admin"), refundController.allRefundRequest);
router.post("/accept-refund-request", auth("admin"), refundController.acceptRefundRequest);
router.put("/exit-lobby", auth("player", "admin", "organizer"), refundController.exit_lobby);
router.put("/exit-lobby-organizer", auth("organizer"), refundController.exit_lobby_organizer);
export const refundRouter = router;
//# sourceMappingURL=refund.router.js.map