import express from 'express';
import verifyToken from '../middlewares/authMiddleware.js';
import { display_HolidayPackages, display_Hotels } from '../Controllers/displayListingController.js';

const router = express.Router();

/**
 * @swagger
 * /api/Dashboard/Vendor_Dashboard/Display_HolidayPackage:
 *   get:
 *     summary: Display holiday packages for a vendor
 *     tags:
 *       - Vendor Dashboard
 *     responses:
 *       200:
 *         description: Successfully fetched holiday packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   listingId:
 *                     type: integer
 *                   city:
 *                     type: string
 *                   holidayPackageName:
 *                     type: string
 *                   status:
 *                     type: boolean
 *       400:
 *         description: Vendor not found
 */
router.get("/Vendor_Dashboard/Display_HolidayPackage",verifyToken,display_HolidayPackages);

router.get("/Vendor_Dashboard/Display_Hotels",verifyToken,display_Hotels);

export default router;