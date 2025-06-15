import { readFileSync } from 'fs';
import fs from 'fs';
import { readFile } from 'fs/promises';
import Listing from '../models/Listing.js';
import HolidayPackage from '../models/holidayPackage.js';
import { Op, Sequelize } from 'sequelize';
import Review from '../models/ReviewAndRating.js';
import Hotel from '../models/Hotel.js';

// Fetch all holiday packages
export const allHolidayPackages = async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { type: 'HolidayPackage' },
      attributes: ['id', 'city', 'country', 'images'],
      include: [{
        model: HolidayPackage,
        attributes: [
          'id', 'name', 'price', 'discount', 'isdiscount',
          'percentageDiscount', 'location', 'itinerary',
          'description',
          'visitors', 'startTime', 'leavingTime', 'duration',
          'activeStatus', 'images', 'packageImages',
        ]
      },
      {
        model: Review,
        attributes: [],
      }
      ],
      attributes: {
        include: [
          [Sequelize.fn("COALESCE", Sequelize.fn("AVG", Sequelize.col("Reviews.rating")), 0), "rating"],
        ],
      },
      group: ['Listing.id', 'HolidayPackages.id']
    });

const formattedListings = listings.map(listing => ({
  id: listing.id,
  city: listing.city,
  country: listing.country,
  images: listing.images,
  HolidayPackages: listing.HolidayPackages?.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    discount: pkg.discount,
    isdiscount: pkg.isdiscount,
    percentageDiscount: pkg.percentageDiscount,
    location: pkg.location,
    itinerary: pkg.itinerary,
    description: pkg.description,
    visitors: pkg.visitors,
    startTime: pkg.startTime,
    leavingTime: pkg.leavingTime,
    duration: pkg.duration,
    rating: pkg.dataValues.rating ? parseFloat(pkg.dataValues.rating.toFixed(1)) : 0,
    images: pkg.images,
    packageImages: pkg.packageImages,
  }))
}));

return res.json(formattedListings);
  } catch (error) {
  console.error('Error fetching holiday packages:', error);
  return res.status(500).json({ error: 'Failed to fetch holiday packages' });
}
};


export const searchHolidayPackages = async (req, res) => {
  try {
    const { cityOrCountry, departureDate } = req.query;

    if (!cityOrCountry) {
      return res.status(400).json({ message: "City or Country is required." });
    }

    // Prepare filters
    let whereCondition = { activeStatus: true };

    if (departureDate) {
      whereCondition.startTime = { [Op.eq]: new Date(departureDate) };
    }

    const holidayPackages = await HolidayPackage.findAll({
      include: [
        {
          model: Listing,
          where: {
            [Op.or]: [{ city: cityOrCountry }, { country: cityOrCountry }],
          },
          attributes: ["city", "country"],
        },
        {
          model: Review,
          attributes: [],
        },
      ],
      attributes: {
        exclude: ["packageImages", "itinerary", "description","location","activeStatus","updatedAt","createdAt"],
        include: [
          [Sequelize.fn("COALESCE", Sequelize.fn("AVG", Sequelize.col("Reviews.rating")), 0), "rating"],
        ],
      },
      where: whereCondition,
      order: [["visitors", "DESC"]],
      group: ["HolidayPackage.id", "Listing.id"],
    });

    const formattedHotels = holidayPackages.map(holidayPackage => ({
      ...holidayPackage.toJSON(),
      rating: holidayPackage.dataValues.rating ? parseFloat(holidayPackage.dataValues.rating.toFixed(1)) : 0,
    }));

    if (formattedHotels.length === 0) {
      return res.status(404).json({ message: "No holiday packages found for the given criteria." });
    }

    return res.status(200).json({ holidayPackages : formattedHotels });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const searchHotels = async (req, res) => {
  try {
    const { cityOrCountry, checkIn, checkOut,rooms} = req.query;

    if (!cityOrCountry) {
      return res.status(400).json({ message: "City or Country is required." });
    }

     // Prepare filters
     let whereCondition = { activeStatus: true,roomsAvailable: true,availableRooms: {
      [Op.gte]: rooms,
    },};

    const Hotels = await Hotel.findAll({
      include: [
        {
          model: Listing,
          where: {
            [Op.or]: [{ city: cityOrCountry }, { country: cityOrCountry }],
          },
          attributes: ["city", "country"],
        },
        {
          model: Review,
          attributes: [],
        },
      ],
      attributes: {
        exclude: ["packageImages", "amenities", "description","location","activeStatus","roomsAvailable","createdAt","updatedAt"],
        include: [
          [Sequelize.fn("COALESCE", Sequelize.fn("AVG", Sequelize.col("Reviews.rating")), 0), "rating"],
        ],
      },
      where: whereCondition,
      group: ["Hotel.id", "Listing.id"],
      order: [["visitors", "DESC"]],
    });

    const formattedHotels = Hotels.map(hotel => ({
      ...hotel.toJSON(),
      rating: hotel.dataValues.rating ? parseFloat(hotel.dataValues.rating.toFixed(1)) : 0,
      checkIn: checkIn,
      checkOut: checkOut,
    }));

    if (Hotels.length === 0) {
      return res.status(404).json({ message: "No hotels found for the given criteria." });
    }

    return res.status(200).json({ Hotels: formattedHotels });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};