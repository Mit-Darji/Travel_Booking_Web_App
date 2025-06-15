import express from 'express';
import {User_emailAuth, Vendor_emailAuth,vendorSetup } from '../Controllers/authController.js';
import { body, validationResult } from 'express-validator';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// // Route to send OTP
// router.post('/send-otp', sendOTP);

// // Route to verify OTP
// router.post('/verify-otp', verifyOTP);

// // Route to authenticate via Google (Google OAuth2)
// router.post('/google-auth', googleAuth);

// Route to authenticate via Email/Password

/**
 * @swagger
 * /api/auth/user-email-auth:
 *   post:
 *     summary: User Email Authentication
 *     description: Authenticate a user using email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rudrakumar Patel"
 *               email:
 *                 type: string
 *                 example: "rudrapatel2992003@gmail.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       400:
 *         description: Bad Request (Invalid input)
 *       401:
 *         description: Unauthorized (Invalid credentials)
 *       500:
 *         description: Internal Server Error
 */
router.post('/user-email-auth', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').notEmpty().withMessage('Name is required')], User_emailAuth);

/**
 * @swagger
 * /api/auth/vendor-emailauth:
 *   post:
 *     summary: Vendor Email Authentication
 *     description: Authenticate a vendor using email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mit Darji"
 *               email:
 *                 type: string
 *                 example: "mitdarji542@gmail.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *               mobile:
 *                 type: string
 *                 example: "7265057985"
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       400:
 *         description: Bad Request (Invalid input)
 *       401:
 *         description: Unauthorized (Invalid credentials)
 *       500:
 *         description: Internal Server Error
 */
router.post('/vendor-emailauth',[ body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').notEmpty().withMessage('Name is required'),body("mobile").notEmpty().isMobilePhone('any')], Vendor_emailAuth);

/**
 * @swagger
 * /api/auth/vendor-setup:
 *   post:
 *     summary: Vendor Setup
 *     description: Setup a vendor's business profile.
 *     tags:
 *       - Vendor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_ACCESS_TOKEN"
 *         required: true
 *         description: JWT token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "best HolidayPackages"
 *               businessType:
 *                 type: string
 *                 example: "HolidayPackage"
 *               country:
 *                 type: string
 *                 example: "India"
 *               address:
 *                 type: string
 *                 example: "Prahlad Nagar"
 *               city:
 *                 type: string
 *                 example: "Ahmedabad"
 *               
 *     responses:
 *       200:
 *         description: Vendor setup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vendor setup successful"
 *                 vendorId:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Bad Request (Invalid input)
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 *       500:
 *         description: Internal Server Error
 */
router.post('/vendor-setup', verifyToken, vendorSetup);

export default router;
