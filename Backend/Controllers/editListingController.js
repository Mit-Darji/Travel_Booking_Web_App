import HolidayPackage from "../models/holidayPackage.js";
import Vendor from "../models/Vendor.js";
import Listing from "../models/Listing.js";
import homestayAndVilla from "../models/homestayAndVillas.js";
import Hotel from "../models/Hotel.js"
import cloudinary from 'cloudinary';
import Review from "../models/ReviewAndRating.js";


cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
})

export const editHolidayPackage = async (req, res) => {
  try {
    const packageId = req.header("id");
    const listingId = req.header("listingId");
    const updateData = req.body;
    const id = req.id;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const listing = await Listing.findOne({ where: { vendorId: id, id: listingId } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const holidayPackage = await HolidayPackage.findOne({ where: { listingId: listing.id, id: packageId } });
    if (!holidayPackage) return res.status(404).json({ message: "Holiday Package not found" });


    // Extract city and country update for Listing
    const { city, country, ...holidayPackageUpdates } = updateData;
    if (city !== undefined || country !== undefined) {
      await listing.update({ city, country });
    }


    // Image Handling
    const packageImages1 = req.files?.Packageimages; // Many images (inside package)
    const thumbnailImages = req.files?.Packagephotos; // Thumbnail image

    // Function to delete images from Cloudinary
    const deleteFromCloudinary = async (imageUrls) => {
      if (!imageUrls) return;

      const urlsArray = Array.isArray(imageUrls) ? imageUrls : [imageUrls]; // Ensure it's an array

      for (const url of urlsArray) {
        if (typeof url === 'string') {
          const publicId = url.split('/').pop().split('.')[0]; // Extract publicId from URL
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    };

    // Handle package images (inside package)
    if (packageImages1) {
      const files = Array.isArray(packageImages1) ? packageImages1 : [packageImages1];

      if (holidayPackage.packageImages) {
        await deleteFromCloudinary(holidayPackage.packageImages); // Delete old images
      }

      const uploadedImages = await Promise.all(
        files.map(file => cloudinary.v2.uploader.upload(file.tempFilePath, { folder: 'holiday_packages' }))
      );

      updateData.packageImages = uploadedImages.map(img => img.secure_url); // Save new images
    }

    // Handle thumbnail images
    if (thumbnailImages) {
      const files = Array.isArray(thumbnailImages) ? thumbnailImages : [thumbnailImages];

      if (holidayPackage.images) {
        await deleteFromCloudinary([holidayPackage.images]); // Delete old thumbnail
      }

      const uploadedThumbnail = await cloudinary.v2.uploader.upload(files[0].tempFilePath, { folder: 'holiday_packages' });
      updateData.images = uploadedThumbnail.secure_url; // Save new thumbnail
    }

    //update vandor activePackages
    if (updateData.activeStatus) {
      vendor.activePackages += 1;
    }
    else if (updateData.activeStatus === false) {
      vendor.activePackages -= 1;
    }
    await vendor.save();


    // Update price, discount, and duration calculations
    if (updateData.price && updateData.discount) {
      updateData.isdiscount = updateData.discount > 0;
      updateData.percentageDiscount = parseFloat((updateData.discount / updateData.price) * 100);
    }

    if (updateData.discount !== undefined && updateData.price === undefined) {
      updateData.isdiscount = updateData.discount > 0;
      if (holidayPackage.price) {
        updateData.percentageDiscount = parseFloat((updateData.discount / holidayPackage.price) * 100);
      }
    }

    if (updateData.price !== undefined && updateData.discount === undefined) {
      if (holidayPackage.discount)
        updateData.percentageDiscount = parseFloat((holidayPackage.discount / updateData.price) * 100);
    }

    if (updateData.startTime || updateData.leavingTime) {
      const start = new Date(updateData.startTime || holidayPackage.startTime);
      const leaving = new Date(updateData.leavingTime || holidayPackage.leavingTime);
      updateData.duration = `${Math.ceil((leaving - start) / (1000 * 60 * 60 * 24))} Days`;
    }

    // Update the holiday package
    await holidayPackage.update(updateData);

    res.status(200).json({ message: "Holiday Package updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const editPackageGetData = async (req, res) => {
  try {
    const packageId = req.header('id');
    const listingId = req.header("listingId");
    const id = req.id;
    // Validate required headers
    if (!packageId || !listingId) {
      return res.status(400).json({
        message: "Missing required headers: 'id' and 'listingId'"
      });
    }

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const Listing1 = await Listing.findOne({ where: { vendorId: id, id: listingId } });

    if (!Listing1) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const holidayPackage = await HolidayPackage.findOne({
      where: { listingId, id: packageId },
      raw: true
    });

    if (!holidayPackage) {
      return res.status(404).json({ message: "Holiday Package not found" });
    }

    // Combine the data
    const responseData = {
      ...holidayPackage,
      city: Listing1.city,
      country: Listing1.country
    };

    return res.status(200).json({ message: "Package Data", holidayPackage: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const DeleteHolidayPackage = async (req, res) => {
  try {
    const id = req.id;
    const { city, HolidayPackageName } = req.body;

    const vendor = await Vendor.findOne({ where: { id } });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const listing = await Listing.findOne({ where: { vendorId: id, city } });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const status = await HolidayPackage.findOne({
      where: { listingId: listing.id, name: HolidayPackageName },
      attributes: ['activeStatus']
    })

    const isActive = status?.dataValues?.activeStatus ?? false;

    // Delete the Holiday Package
    const deletedHolidayPackage = await HolidayPackage.destroy({
      where: { listingId: listing.id, name: HolidayPackageName }
    });

    //update vandor activePackages
    if (isActive) {
      vendor.activePackages -= 1;
    }
    vendor.packagesUploaded -= 1;
    await vendor.save();

    if (!deletedHolidayPackage) {
      return res.status(404).json({ message: "No holiday package found with given details" });
    }

    // Count remaining Holiday Packages, Hotels, and Villas for this Listing
    const remainingPackages = await HolidayPackage.count({ where: { listingId: listing.id } });
    const remainingHotels = await Hotel.count({ where: { listingId: listing.id } });
    const remainingVillas = await homestayAndVilla.count({ where: { listingId: listing.id } });

    // If all are 0, delete the Listing
    if (remainingPackages === 0 && remainingHotels === 0 && remainingVillas === 0) {
      await listing.destroy();
      return res.status(200).json({ message: "Holiday Package and Listing deleted successfully" });
    }

    const review = await Review.destroy({
      where: { listingId: listing.id, holidayPackageId: deletedHolidayPackage.id }
    });

    if(!review)
    {
      return res.status(200).json({ message: "Holiday Package & Reviews deleted successfully" });
    }

    return res.status(200).json({ message: "Holiday Package deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editHotel = async (req, res) => {
  try {
    const HotelId = req.header("id");
    const listingId = req.header("listingId");
    const updateData = req.body;
    const id = req.id;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const listing = await Listing.findOne({ where: { vendorId: id, id: listingId } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const Hotels = await Hotel.findOne({ where: { listingId: listing.id, id: HotelId } });
    if (!Hotels) return res.status(404).json({ message: "Hotel not found" });


    // Extract city and country update for Listing
    const { city, country, ...hotelsUpdates } = updateData;
    if (city !== undefined || country !== undefined) {
      await listing.update({ city, country });
    }


    // Image Handling
    const packageImages1 = req.files && req.files?.Packageimages; // Many images (inside package)
    const thumbnailImages = req.files && req.files?.Packagephotos; // Thumbnail image

    // Function to delete images from Cloudinary
    const deleteFromCloudinary = async (imageUrls) => {
      console.log(imageUrls);
      if (!imageUrls) return;

      const urlsArray = Array.isArray(imageUrls) ? imageUrls : [imageUrls]; // Ensure it's an array

      for (const url of urlsArray) {
        if (typeof url === 'string') {
          const publicId = url.split('/').pop().split('.')[0]; // Extract publicId from URL
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    };

    // Handle package images (inside package)
    if (packageImages1) {
      const files = Array.isArray(packageImages1) ? packageImages1 : [packageImages1];

      if (Hotels.packageImages) {
        await deleteFromCloudinary(Hotels.packageImages); // Delete old images
      }

      const uploadedImages = await Promise.all(
        files.map(file => cloudinary.v2.uploader.upload(file.tempFilePath, { folder: 'Hotels' }))
      );

      updateData.packageImages = uploadedImages.map(img => img.secure_url); // Save new images
    }

    // Handle thumbnail images
    if (thumbnailImages) {
      const files = Array.isArray(thumbnailImages) ? thumbnailImages : [thumbnailImages];

      if (Hotels.image) {
        await deleteFromCloudinary([Hotels.image]); // Delete old thumbnail
      }

      const uploadedThumbnail = await cloudinary.v2.uploader.upload(files[0].tempFilePath, { folder: 'Hotels' });
      updateData.image = uploadedThumbnail.secure_url; // Save new thumbnail
    }

    //update vandor activePackages
    if (updateData.activeStatus) {
      vendor.activePackages += 1;
    }
    else if (updateData.activeStatus === false) {
      vendor.activePackages -= 1;
    }
    await vendor.save();

    // Update price, discount, and duration calculations
    if (updateData.pricePerNight && updateData.discountPerNight) {
      updateData.isdiscount = updateData.discountPerNight > 0;
      updateData.percentageDiscountPerNight = parseFloat((updateData.discountPerNight / updateData.pricePerNight) * 100);
    }

    if (updateData.discountPerNight !== undefined && updateData.pricePerNight === undefined) {
      updateData.isdiscount = updateData.discountPerNight > 0;
      if (Hotels.pricePerNight) {
        updateData.percentageDiscountPerNight = parseFloat((updateData.discountPerNight / Hotels.pricePerNight) * 100);
      }
    }

    if (updateData.pricePerNight !== undefined && updateData.discountPerNight === undefined) {
      if (Hotels.discountPerNight)
        updateData.percentageDiscountPerNight = parseFloat((Hotels.discountPerNight / updateData.pricePerNight) * 100);
    }

    // Update the holiday package
    await Hotels.update(updateData);

    res.status(200).json({ message: "Hotel updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const editHotelGetData = async (req, res) => {
  try {
    const HotelId = req.header('id');
    const listingId = req.header("listingId");
    const id = req.id;
    // Validate required headers
    if (!HotelId || !listingId) {
      return res.status(400).json({
        message: "Missing required headers: 'id' and 'listingId'"
      });
    }

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const Listing1 = await Listing.findOne({ where: { vendorId: id, id: listingId } });

    if (!Listing1) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const Hotels = await Hotel.findOne({
      where: { listingId, id: HotelId },
      raw: true
    });

    if (!Hotels) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Combine the data
    const responseData = {
      ...Hotels,
      city: Listing1.city,
      country: Listing1.country
    };

    return res.status(200).json({ message: "Hotel Data Successful", Hotel: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const id = req.id;
    const listingId = req.header("listingId");
    const HotelId = req.header("id");
    const { city, hotelName } = req.body;

    const vendor = await Vendor.findOne({ where: { id } });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const listing = await Listing.findOne({ where: { vendorId: id, id: listingId } });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const status = await Hotel.findOne({
      where: { listingId: listing.id, id: HotelId },
      attributes: ['activeStatus']
    })

    const isActive = status?.dataValues?.activeStatus ?? false;

     //update vandor activePackages
     if (isActive) {
      vendor.activePackages -= 1;
    }
    vendor.packagesUploaded -= 1;
    await vendor.save();

    // Delete the Holiday Package
    const deletedHotel = await Hotel.destroy({
      where: { listingId: listing.id, id: HotelId }
    });


    if (!deletedHotel) {
      return res.status(404).json({ message: "No Hotel is found with given details" });
    }

    // Count remaining Holiday Packages, Hotels, and Villas for this Listing
    const remainingHotels = await Hotel.count({ where: { listingId: listing.id } });
    const remainingPackages = await HolidayPackage.count({ where: { listingId: listing.id } });
    const remainingVillas = await homestayAndVilla.count({ where: { listingId: listing.id } });

    // If all are 0, delete the Listing
    if (remainingPackages === 0 && remainingHotels === 0 && remainingVillas === 0) {
      await listing.destroy();
      return res.status(200).json({ message: "Hotel and Listing deleted successfully" });
    }

    const review = await Review.destroy({
      where: { listingId: listing.id, hotelId: deletedHotel.id }
    });

    if(!review)
    {
      return res.status(200).json({ message: "Hotel & Reviews deleted successfully" });
    }

    return res.status(200).json({ message: "Hotel deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};