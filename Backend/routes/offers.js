import express from 'express';
import { allOffers, domesticOffers, internationalOffers, percentageOffers } from "../Controllers/offersController.js";

const router = express.Router();

/**
 * @swagger
 * /api/Offers/percentageOffers:
 *   post:
 *     summary: Get holiday packages with percentage discounts
 *     tags:
 *       - Offers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               percentageDiscount:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: List of holiday packages
 *       500:
 *         description: Server error
 */
router.get('/percentageOffers',percentageOffers);

/**
 * @swagger
 * /api/Offers/internationalOffers:
 *   get:
 *     summary: Get international holiday offers (outside India)
 *     tags:
 *       - Offers
 *     responses:
 *       200:
 *         description: List of international offers
 *       500:
 *         description: Server error
 */
router.get('/internationalOffers',internationalOffers);

/**
 * @swagger
 * /api/Offers/domesticOffers:
 *   get:
 *     summary: Get domestic holiday offers (India)
 *     tags:
 *       - Offers
 *     responses:
 *       200:
 *         description: List of domestic offers
 *       500:
 *         description: Server error
 */
router.get('/domesticOffers',domesticOffers);

/**
 * @swagger
 * /api/Offers/allOffers:
 *   get:
 *     summary: Get all holiday offers (domestic & international)
 *     tags:
 *       - Offers
 *     responses:
 *       200:
 *         description: List of all offers
 *       500:
 *         description: Server error
 */
router.get('/allOffers',allOffers);


export default router;