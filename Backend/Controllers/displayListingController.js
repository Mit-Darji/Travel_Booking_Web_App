import express from 'express';
import Vendor from '../models/Vendor.js';
import Listing from '../models/Listing.js';
import HolidayPackage from '../models/holidayPackage.js';
import Hotel from '../models/Hotel.js'
import { Sequelize, fn, col } from 'sequelize';
import Review from '../models/ReviewAndRating.js';

export const display_HolidayPackages = async (req, res) => {
  try {
    const id = req.id;

    const vendor = await Vendor.findOne({ where: { id } });

    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    // Fetch Holiday
    const holidayPackages = await HolidayPackage.findAll({
      include: [
        {
          model: Listing,
          where: { vendorId: id, type: 'HolidayPackage' },
          attributes: ['city']
        },
        {
          model: Review,
          attributes: []
        }
      ],
      attributes: [
        'id',
        'listingId',
        'name',
        'activeStatus',
        [Sequelize.fn('AVG', Sequelize.col('Reviews.rating')), 'averageRating']
      ],
      group: ['HolidayPackage.id', 'Listing.id']
    });

    if (!holidayPackages.length) {
      return res.status(200).json({ message: "No Holiday Packages found" });
    }

    // Format response
    const formattedResponse = holidayPackages.map(pkg => ({
      id: pkg.id,
      listingId: pkg.listingId,
      city: pkg.Listing?.city,
      holidayPackageName: pkg.name,
      rating: pkg.dataValues.averageRating ? parseFloat(pkg.dataValues.averageRating.toFixed(1)) : 0, 
      status: pkg.activeStatus
    }));

    return res.status(200).json({ holidayPackages: formattedResponse });

  } catch (error) {
    console.error("Error fetching holiday packages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const display_Hotels = async (req, res) => {
  try {
    const id = req.id;

    const vendor = await Vendor.findOne({ where: { id } });

    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    // Fetch Holiday
    const hotels = await Hotel.findAll({
      include: [
        {
          model: Listing,
          where: { vendorId: id, type: 'Hotel' },
          attributes: ['city']
        },
        {
          model: Review,
          attributes: []
        }
      ],
      attributes: [
        'id',
        'listingId',
        'name',
        'activeStatus',
        'availableRooms',
        [Sequelize.fn('AVG', Sequelize.col('Reviews.rating')), 'averageRating']
      ],
      group: ['Hotel.id', 'Listing.id']
    });


    if (!hotels.length) {
      return res.status(200).json({ message: "Not found Hotels" });
    }

    // Format response
    const formattedResponse = hotels.map(pkg => ({
      id: pkg.id,
      listingId: pkg.listingId,
      city: pkg.Listing.city,
      hotelName: pkg.name,
      rating: pkg.dataValues.averageRating ? parseFloat(pkg.dataValues.averageRating.toFixed(1)) : 0,
      activeStatus: pkg.activeStatus,
      availableRooms: pkg.availableRooms
    }));

    return res.status(200).json({ Hotels: formattedResponse });

  } catch (error) {
    console.error("Error fetching Hotels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};