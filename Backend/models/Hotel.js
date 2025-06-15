import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Listing from './Listing.js';

const Hotel = sequelize.define('Hotel', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  pricePerNight: { type: DataTypes.FLOAT, allowNull: false },
  discountPerNight: { type: DataTypes.FLOAT, allowNull: true },
  percentageDiscountPerNight: { type: DataTypes.FLOAT, allowNull: true },
  isdiscount: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  availableRooms: { type: DataTypes.INTEGER, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  roomsAvailable: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
  amenities: { type: DataTypes.STRING, allowNull: true },
  checkInTime: { type: DataTypes.TIME, allowNull: false },
  checkOutTime: { type: DataTypes.TIME, allowNull: false },
  visitors: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  activeStatus: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
  image: { type: DataTypes.JSON, allowNull: false },
  packageImages: { type: DataTypes.JSON, allowNull: true, defaultValue: [] }
}, { timestamps: true });

// 🔹 Listing-Hotel Relationship
Listing.hasMany(Hotel, { foreignKey: 'listingId', onDelete: 'CASCADE' });
Hotel.belongsTo(Listing, { foreignKey: 'listingId' });

export default Hotel;
