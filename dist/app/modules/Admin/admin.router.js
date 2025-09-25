import express from 'express';
import { adminController } from './admin.controller.js';
import auth from '../../middleware/auth.js';
const router = express.Router();
router.get("/admin-data", auth("admin"), adminController.adminData);
export const adminRouter = router;
//# sourceMappingURL=admin.router.js.map