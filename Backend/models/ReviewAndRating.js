import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Listing from './Listing.js';
import User from './User.js';
import Hotel from './Hotel.js';
import HolidayPackage from './holidayPackage.js';
import Villa from './homestayAndVillas.js';

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
  holidayPackageId: { type: DataTypes.INTEGER, allowNull: true },
  villaId: { type: DataTypes.INTEGER, allowNull: true },
  rating: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0, max: 5 }, defaultValue: 0 },
  reviewType: {
    type: DataTypes.ENUM("Excellent", "Very Good", "Good", "Poor"),
    allowNull: false
  },
  comment: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

Review.addHook("beforeValidate", (review) => {
  const count = [review.hotelId, review.holidayPackageId, review.villaId].filter(id => id !== null).length;
  if (count !== 1) {
    throw new Error("A review must belong to exactly one entity (Hotel, HolidayPackage, or Villa).");
  }

  // Set reviewType based on rating
  if (Review.rating >= 4.5) {
    Review.reviewType = "Excellent";
  } else if (Review.rating >= 3.5) {
    Review.reviewType = "Very Good";
  } else if (Review.rating >= 2.5) {
    Review.reviewType = "Good";
  } else {
    Review.reviewType = "Poor";
  }

});

Listing.hasMany(Review, { foreignKey: 'listingId', onDelete: 'CASCADE' });
Review.belongsTo(Listing, { foreignKey: 'listingId' });

User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });

Hotel.hasMany(Review, { foreignKey: 'hotelId', onDelete: 'CASCADE' });
Review.belongsTo(Hotel, { foreignKey: 'hotelId' });

HolidayPackage.hasMany(Review, { foreignKey: 'holidayPackageId', onDelete: 'CASCADE' });
Review.belongsTo(HolidayPackage, { foreignKey: 'holidayPackageId' });

Villa.hasMany(Review, { foreignKey: 'villaId', onDelete: 'CASCADE' });
Review.belongsTo(Villa, { foreignKey: 'villaId' });

export default Review;
