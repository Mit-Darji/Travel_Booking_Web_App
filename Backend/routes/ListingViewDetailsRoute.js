import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { packageViewDetails,hotelViewDetails } from "../Controllers/listingViewDetailsController.js";

const router = express.Router();

router.get("/packageViewDetails",packageViewDetails);

router.get("/hotelViewDetails",hotelViewDetails);

export default router; 