import express from 'express';
import verifyToken from '../middlewares/authMiddleware.js';
import { create_OrderId,verify_Payment } from '../Controllers/paymentController.js';

const router = express.Router();

router.post("/create_OrderId",verifyToken,create_OrderId);

router.post("/verify_Payment",verifyToken,verify_Payment);

export default router;
