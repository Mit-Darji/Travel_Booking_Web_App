import express from 'express';
import { searchLocation } from '../Controllers/searchController.js';
import { body, validationResult } from 'express-validator';
const router = express.Router();

/**
 * @swagger
 * /api/search/search-location:
 *   post:
 *     summary: Search locations by city name
 *     tags:
 *       - Search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *             properties:
 *               city:
 *                 type: string
 *                 example: "Ahmedabad"
 *     responses:
 *       200:
 *         description: Successfully retrieved matching cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Ahmedabad", "Ahmednagar"]
 *       201:
 *         description: No results found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Result is not Found"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "City is required"
 */
// Route to search location
router.post('/search-location', [
  body('city').notEmpty().withMessage('Location is required'),
],searchLocation);

export default router;