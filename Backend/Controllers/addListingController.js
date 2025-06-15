import Vendor from '../models/Vendor.js';
import Listing from '../models/Listing.js';
import HolidayPackage from '../models/holidayPackage.js';
import { addFirstListingEmail } from '../utility/Email_Sending.js';
import cloudinary from 'cloudinary';
import moment from 'moment/moment.js';
import Hotel from '../models/Hotel.js';
import { uploadImages } from '../utility/cloudinaryHelper.js';

cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
})

export const addHolidayPackage = async (req, res) => {
  try {
    const id = req.id;
    const { city, country, name, price, discount, location, description, itinerary, startTime, leavingTime, activeStatus } = req.body;

    // Step 1: Check if Vendor Exists
    const vendor = await Vendor.findByPk(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const listingCount = await Listing.count({ where: { vendorId: id } });
    let listing = null;
    console.log("Listing Count:", listingCount);

    // Step 2: Check if Listing Exists for the City
    if (listingCount !== 0) {
      listing = await Listing.findOne({ where: { vendorId: id, city } });
    }

    if (!listing) {
      listing = await Listing.create({
        vendorId: id,
        type: 'HolidayPackage',
        city,
        country
      });
    }

    // Step 3: Prevent Duplicate Packages
    const existingPackage = await HolidayPackage.findOne({
      where: { listingId: listing.id, name }
    });

    if (existingPackage) {
      return res.status(400).json({ message: "A package with the same name and location already exists." });
    }

    // Step 4: Upload Images to Cloudinary and Create HolidayPackage
    const Packageimages = req.files && req.files.Packageimages; // this is for thumbnil
    const Images = req.files && req.files.Packagephotos;        // this is for inside package photos
    let thumbnailUrls = [];
    let Photos = [];

    if (Packageimages) {
      const files = Array.isArray(Packageimages) ? Packageimages : [Packageimages];
      for (const file of files) {
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: 'holiday_packages' // Optional folder in Cloudinary
        });
        console.log(result.secure_url);
        Photos.push(result.secure_url);
      }
    }
    if (Images) {
      const files = Array.isArray(Images) ? Images : [Images];
      for (const file of files) {
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: 'holiday_packages' // Optional folder in Cloudinary
        });
        console.log(result.secure_url);
        thumbnailUrls.push(result.secure_url);
      }
    }


    const holidayPackage = await HolidayPackage.create({
      listingId: listing.id,
      name,
      price,
      discount: discount || 0,
      isdiscount: discount > 0 ? true : false,
      percentageDiscount: discount ? parseFloat((parseFloat(discount) / parseFloat(price)) * 100) : 0,
      location,
      itinerary: itinerary || '',
      description: description || '',
      visitors: Math.max(1, Math.floor(price / 1000)),
      startTime: startTime || null,
      leavingTime: leavingTime || null,
      duration: startTime && leavingTime
        ? moment(leavingTime).diff(moment(startTime), 'days') + ' days'
        : '',
      images: thumbnailUrls, // Store Cloudinary URLs
      packageImages: Photos,
      activeStatus: activeStatus
    });

    // Step 5: Update Vendor activePackages and packagesUploaded
    if (holidayPackage.activeStatus) {
      vendor.activePackages += 1;
    }
    vendor.packagesUploaded += 1;
    await vendor.save();

    // Step 6: Send Email if this is the first listing created by the vendor
    if (listingCount === 0) {
      const listingname = "HolidayPackage"
      addFirstListingEmail(vendor.email, vendor.name, holidayPackage.name, listingname);
    }

    return res.status(201).json({ message: "Holiday Package added successfully", holidayPackagename: holidayPackage.name, city: listing.city });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addHotel = async (req, res) => {

  try {
    const id = req.id;
    const { city, country, name,pricePerNight, availableRooms, discountPerNight, location, description, amenities,activeStatus,checkInTime,checkOutTime} = req.body;

    // Step 1: Check if Vendor Exists
    const vendor = await Vendor.findByPk(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });


    const listingCount = await Listing.count({ where: { vendorId: id } });
    let listing = null;
    console.log("Listing Count:", listingCount);

    // Step 2: Check if Listing Exists for the City
    if (listingCount !== 0) {
      listing = await Listing.findOne({ where: { vendorId: id, city } });
    }

    if (!listing) {
      listing = await Listing.create({
        vendorId: id,
        type: 'Hotel',
        city,
        country
      });
    }

    // Step 3: Prevent Duplicate Packages
    const existingHotel = await Hotel.findOne({
      where: { listingId: listing.id, location, name }
    });

    if (existingHotel) {
      return res.status(400).json({ message: "A Hotel with the smme name & same location already exists." });
    }

   // Step 4: Upload Images to Cloudinary and Create HolidayPackage
   const Packageimages = req.files && req.files.Packageimages; // this is for thumbnil
   const Images = req.files && req.files.Packagephotos;        // this is for inside package photos
   let thumbnailUrls = [];
   let Photos = [];

   if (Packageimages) {
     const files = Array.isArray(Packageimages) ? Packageimages : [Packageimages];
     for (const file of files) {
       const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
         folder: 'Hotels' // Optional folder in Cloudinary
       });
       console.log(result.secure_url);
       Photos.push(result.secure_url);
     }
   }
   if (Images) {
     const files = Array.isArray(Images) ? Images : [Images];
     for (const file of files) {
       const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
         folder: 'Hotels' // Optional folder in Cloudinary
       });
       console.log(result.secure_url);
       thumbnailUrls.push(result.secure_url);
     }
   }

    const hotel = await Hotel.create({
      listingId: listing.id,
      name,
      pricePerNight : pricePerNight > 0 ? pricePerNight : 0,
      discountPerNight: discountPerNight || 0,
      isdiscount: discountPerNight > 0 ? true : false,
      percentageDiscountPerNight: (discountPerNight > 0 && pricePerNight > 0) 
      ? parseFloat((parseFloat(discountPerNight) / parseFloat(pricePerNight)) * 100).toFixed(2) 
      : 0,
      location,
      amenities,
      description: description || '',
      visitors: Math.max(1, Math.floor(pricePerNight / 1000)),
      checkInTime,
      checkOutTime,
      image: thumbnailUrls, // Store Cloudinary URLs
      packageImages: Photos,
      availableRooms,
      activeStatus: activeStatus,
      roomsAvailable: availableRooms > 0 ? true : false
    });

    if (listingCount === 0) {
      const listingname = "Hotel"
      addFirstListingEmail(vendor.email, vendor.name, hotel.name, listingname);
    }

    return res.status(201).json({ message: "Hotel added successfully", Hotelname: hotel.name, city: listing.city });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

}