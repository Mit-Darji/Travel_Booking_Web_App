import express from 'express';
import {addHolidayPackage,addHotel} from '../Controllers/addListingController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/addListing/addHolidayPackage:
 *   post:
 *     summary: Add a holiday package
 *     tags: [Listing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city: { type: string, example: "Ahmedabad" }
 *               country: { type: string, example: "India" }
 *               name: { type: string, example: "Holiday Package" }
 *               price: { type: number, example: 5000 }
 *               discount: { type: number, example: 500 }
 *               location: { type: string, example: "Prahlad nagar, Ahmedabad" }
 *               description: { type: string, example: "Luxury package with premium amenities." }
 *               itinerary: { type: string, example: "Day 1: Sightseeing, Day 2: Adventure" }
 *               startTime: { type: string, format: date-time, example: "2025-04-01T10:00:00Z" }
 *               leavingTime: { type: string, format: date-time, example: "2025-04-05T12:00:00Z" }
 *               activeStatus: { type: boolean, example: true }
 *     responses:
 *       201: { description: "Holiday Package added successfully" }
 *       400: { description: "Duplicate package exists" }
 *       404: { description: "Vendor not found" }
 *       500: { description: "Server error" }
 */
router.post("/addHolidayPackage",verifyToken,addHolidayPackage);

/**
 * @swagger
 * /api/addListing/addHotels:
 *   post:
 *     summary: Add a hotel listing
 *     tags: [Listing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city: { type: string, example: "Ahmedabad" }
 *               country: { type: string, example: "India" }
 *               name: { type: string, example: "Grand Hotel" }
 *               price: { type: number, example: 5000 }
 *               availableRooms: { type: number, example: 10 }
 *               discount: { type: number, example: 500 }
 *               location: { type: string, example: "Prahlad nagar, Ahmedabad" }
 *               description: { type: string, example: "Luxury 5-star hotel with premium amenities." }
 *               amenities: { type: string, example: "Free WiFi, Swimming Pool, Gym, Spa, Restaurant, Parking" }
 *               checkInTime: { type: string, example: "14:00:00" }
 *               checkOutTime: { type: string, example: "12:00:00" }
 *               image: { type: array, items: { type: string }, example: ["https://res.cloudinary.com/example/image/upload/hotel1.jpg"] }
 *               packageImages: { type: array, items: { type: string }, example: ["https://res.cloudinary.com/example/image/upload/package1.jpg"] }
 *     responses:
 *       201: { description: "Hotel added successfully" }
 *       400: { description: "Duplicate hotel exists" }
 *       404: { description: "Vendor not found" }
 *       500: { description: "Server error" }
 */
router.post("/addHotels",verifyToken,addHotel);

export default router;