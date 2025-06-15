import Listing from '../models/Listing.js';
import HolidayPackage from '../models/holidayPackage.js';
import { Op } from 'sequelize';

export const percentageOffers = async (req, res) => {
  try {
    const { percentageDiscount } = req.query;

    const listings = await Listing.findAll({
      where: { type: 'HolidayPackage' },
      attributes: ['id', 'city', 'country','images'],
      include: [
        {
          model: HolidayPackage,
          as: "HolidayPackages",
          required: true,
          where: {
            percentageDiscount: { [Op.gt]:0,[Op.lte]: percentageDiscount }
          },
          attributes: [
            'percentageDiscount',
          ]
        }
      ]
    });

    if (!listings.length) {
      return res.status(200).json({
        success: true,
        message: `No holiday packages found with percentage discount up to ${percentageDiscount}%`,
        data: []
      });
    }

    res.status(200).json({ success: true, data: listings });

  } catch (error) {
    console.error("Error fetching percentage offers:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Fetch international offers (outside India)
export const internationalOffers = async (req, res) => {
  try {
    const offers = await fetchHolidayPackages({ country: { [Op.ne]: 'India' }, isdiscount: true });
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch international offers' });
  }
};

// Fetch domestic offers (only in India)
export const domesticOffers = async (req, res) => {
  try {
    const offers = await fetchHolidayPackages({ country: 'India', isdiscount: true });
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch domestic offers' });
  }
};

// Fetch all offers (both international & domestic) with discounts
export const allOffers = async (req, res) => {
  try {
    const offers = await fetchHolidayPackages({ isdiscount: true });
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all offers' });
  }
};

// Fetch all holiday packages (both discounted & non-discounted)
export const allHolidayPackages = async (req, res) => {
  try {
    const offers = await fetchHolidayPackages({});
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch holiday packages' });
  }
};

// Helper function to fetch holiday packages from the database
const fetchHolidayPackages = async (filter) => {
  const whereCondition = { type: 'HolidayPackage' };

  // Apply country filter if provided
  if (filter.country) {
    whereCondition.country = filter.country;
  }

  const listings = await Listing.findAll({
    where: whereCondition,
    attributes: ['id','city', 'country', 'images'], // Added 'image' attribute
    include: [{
      model: HolidayPackage,
      where: { isdiscount: true,activeStatus:true},
      attributes: ['percentageDiscount'],
    }]
  });

  return listings;
};

// Helper function to group listings by city
const groupByCity = (listings) => {
  return listings.reduce((acc, listing) => {
    const city = listing.city;
    if (!acc[city]) {
      acc[city] = [];
    }
    
    acc[city].push({
      id: listing.id,
      city: listing.city,
      country: listing.country,
      packageImage: listing.images, // Listing images (package image)
      image: listing.image, // ✅ Added Listing's image
      holidayPackages: listing.HolidayPackages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        discount: pkg.discount,
        percentageDiscount: pkg.percentageDiscount,
        image: pkg.image, // HolidayPackage image
        location: pkg.location,
        duration: pkg.duration,
      }))
    });

    return acc;
  }, {});
};
