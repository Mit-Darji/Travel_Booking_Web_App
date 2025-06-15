import { UpdateProfileEmail } from '../utility/Email_Sending.js';
import Vendor from '../models/Vendor.js';
import HolidayPackage from '../models/holidayPackage.js';
import Listing from '../models/Listing.js';
import Hotel from '../models/Hotel.js';
import Review from '../models/ReviewAndRating.js';
import User from '../models/User.js';

export const packageViewDetails = async (req, res) => {
  try {
    const { holidayPackageId }  = req.query;

    if (!holidayPackageId) {
      return res.status(400).json({ error: "holidayPackageId is required" });
    }

    const packageDetails = await HolidayPackage.findOne({
      where: { id: holidayPackageId },
      include: [
        {
          model: Listing,
          attributes: ["id","city","country"], // Fetch Listing ID
          include: {
            model: Vendor,
            attributes: ["name", "email"], // Fetch Vendor details
          }
        },
        {
          model: Review,
          attributes: ["rating", "comment", "reviewType"], // Fetch reviews
          include: {
            model: User,
            attributes: ["name"], // Fetch user name
          },
        },
      ],
    });

    if (!packageDetails) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Count reviews by type
    const reviewSummary = {
      Total: packageDetails.Reviews.length,
      Excellent: packageDetails.Reviews.filter((r) => r.reviewType === "Excellent").length,
      Very_Good: packageDetails.Reviews.filter((r) => r.reviewType === "Very Good").length,
      Good: packageDetails.Reviews.filter((r) => r.reviewType === "Good").length,
      Poor: packageDetails.Reviews.filter((r) => r.reviewType === "Poor").length,
    };

    return res.json({ packageDetails, reviewSummary });
  } catch (error) {
    console.error("Error fetching package details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const hotelViewDetails = async (req, res) => {
  try {
    const { hotelId } = req.query;

    if (!hotelId) {
      return res.status(400).json({ error: "hotelId is required" });
    }

    const hotelDetails = await Hotel.findOne({
      where: { id: hotelId },
      include: [
        {
          model: Listing,
          attributes: ["id","city","country"], // Fetch Listing ID
          include: {
            model: Vendor,
            attributes: ["name", "email"], // Fetch Vendor details
          },
        },
        {
          model: Review,
          attributes: ["rating", "comment", "reviewType"], // Fetch reviews
          include: {
            model: User,
            attributes: ["name"], // Fetch user name
          },
        },
      ],
    });

    if (!hotelDetails) {
      return res.status(404).json({ message: "Hotel is not found" });
    }

    // Count reviews by type
    const reviewSummary = {
      Total: hotelDetails.Reviews.length,
      Excellent: hotelDetails.Reviews.filter((r) => r.reviewType === "Excellent").length,
      Very_Good: hotelDetails.Reviews.filter((r) => r.reviewType === "Very Good").length,
      Good: hotelDetails.Reviews.filter((r) => r.reviewType === "Good").length,
      Poor: hotelDetails.Reviews.filter((r) => r.reviewType === "Poor").length,
    };

    return res.json({ hotelDetails, reviewSummary });
  } catch (error) {
    console.error("Error fetching Hotel details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}