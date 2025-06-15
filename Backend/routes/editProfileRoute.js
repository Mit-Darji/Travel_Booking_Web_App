import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { updateVendorProfile } from "../Controllers/editProfileController.js";

const router = express.Router();

/**
 * @swagger
 * /api/Edit/vendorProfile:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendor]
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
 *               name: { type: string, example: "Mit" }
 *               email: { type: string, example: "mitdarji542@gmail.com" }
 *               mobile: { type: string, example: "9876543210" }
 *               businessType: { type: array, items: { type: string }, example: ["Hotel", "Holiday Package"] }
 *               address: { type: string, example: "New Address" }
 *               city: { type: string, example: "New City" }
 *               country: { type: string, example: "New Country" }
 *     responses:
 *       200: { description: "Profile updated successfully" }
 *       404: { description: "Vendor not found" }
 *       500: { description: "Server error" }
 */
// Update Vendor Profile
router.put("/vendorProfile", verifyToken, updateVendorProfile);

export default router;