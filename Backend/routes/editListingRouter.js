import express from 'express';
import {DeleteHolidayPackage, editHolidayPackage, editPackageGetData,editHotel,deleteHotel,editHotelGetData} from '../Controllers/editListingController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/EditListing/editHolidayPackage:
 *   put:
 *     summary: Edit an existing holiday package
 *     description: Update details of an existing holiday package.
 *     tags:
 *       - Holiday Packages
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: listingId
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
 *               city:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               description:
 *                 type: string
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Holiday Package updated successfully
 *       404:
 *         description: Vendor, Listing, or Package not found
 *       500:
 *         description: Server error
 */
router.put("/editHolidayPackage",verifyToken,editHolidayPackage);

/**
 * @swagger
 * /api/EditListing/DeleteHolidayPackage:
 *   delete:
 *     summary: Delete a holiday package
 *     description: Remove a holiday package by city and package name.
 *     tags:
 *       - Holiday Packages
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *               HolidayPackageName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Holiday Package deleted successfully
 *       404:
 *         description: Vendor, Listing, or Package not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/DeleteHolidayPackage",verifyToken,DeleteHolidayPackage);

/**
 * @swagger
 * /api/EditListing/editPackageGetData:
 *   get:
 *     summary: Get holiday package details for editing
 *     description: Fetch holiday package details by package ID and listing ID.
 *     tags:
 *       - Holiday Packages
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package data retrieved successfully
 *       404:
 *         description: Vendor, Listing, or Package not found
 *       500:
 *         description: Server error
 */
router.get("/editPackageGetData",verifyToken,editPackageGetData);

router.put("/editHotel",verifyToken,editHotel);

router.delete("/DeleteHotel",verifyToken,deleteHotel);

router.get("/editHotelGetData",verifyToken,editHotelGetData);

export default router;