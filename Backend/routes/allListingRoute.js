import express from 'express';
import { allHolidayPackages, searchHolidayPackages, searchHotels } from '../Controllers/listringController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/allListing/allHolidayPackages:
 *   get:
 *     summary: Get all holiday packages
 *     tags: [Listing]
 *     responses:
 *       200:
 *         description: Successfully retrieved all holiday packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 1 }
 *                   city: { type: string, example: "Mumbai" }
 *                   country: { type: string, example: "India" }
 *                   images: { type: array, items: { type: string }, example: ["image1.jpg", "image2.jpg"] }
 *                   HolidayPackages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 10 }
 *                         name: { type: string, example: "Luxury Holiday" }
 *                         price: { type: number, example: 5000 }
 *                         discount: { type: number, example: 500 }
 *                         isdiscount: { type: boolean, example: true }
 *                         percentageDiscount: { type: number, example: 10 }
 *                         location: { type: string, example: "Goa" }
 *                         itinerary: { type: string, example: "Day 1: Beach, Day 2: City Tour" }
 *                         description: { type: string, example: "A luxurious stay with sightseeing." }
 *                         visitors: { type: integer, example: 200 }
 *                         startTime: { type: string, format: date-time, example: "2025-06-01T10:00:00Z" }
 *                         leavingTime: { type: string, format: date-time, example: "2025-06-05T12:00:00Z" }
 *                         duration: { type: integer, example: 5 }
 *                         images: { type: array, items: { type: string }, example: ["hotel.jpg"] }
 *                         packageImages: { type: array, items: { type: string }, example: ["package.jpg"] }
 *       500:
 *         description: Server error
 */
router.get("/allHolidayPackages",allHolidayPackages);

/**
 * @swagger
 * /api/allListing/searchHolidayPackages:
 *   post:
 *     summary: Search for holiday packages
 *     tags: [Listing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cityOrCountry: { type: string, example: "Mumbai" }
 *               departureDate: { type: string, format: date, example: "2025-06-10" }
 *     responses:
 *       200:
 *         description: Successfully retrieved matching holiday packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holidayPackages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 10 }
 *                       name: { type: string, example: "Luxury Holiday" }
 *                       price: { type: number, example: 5000 }
 *                       location: { type: string, example: "Goa" }
 *                       visitors: { type: integer, example: 200 }
 *                       startTime: { type: string, format: date-time, example: "2025-06-01T10:00:00Z" }
 *                       leavingTime: { type: string, format: date-time, example: "2025-06-05T12:00:00Z" }
 *       400:
 *         description: City or country is required
 *       404:
 *         description: No holiday packages found for the given criteria
 *       500:
 *         description: Server error
 */
router.get("/searchHolidayPackages",searchHolidayPackages);

router.get("/searchHotels",searchHotels);


export default router;