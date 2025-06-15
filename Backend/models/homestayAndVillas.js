import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Listing from './Listing.js';

const HomestayVilla = sequelize.define('Homestay&Villa', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.INTEGER, allowNull: false },
  pricePerNight: { type: DataTypes.FLOAT, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  discountPerNight: { type: DataTypes.FLOAT, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: false },
  checkavaliable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  amenities: { type: DataTypes.STRING, allowNull: true },
  checkInTime: { type: DataTypes.TIME, allowNull: true },
  checkOutTime: { type: DataTypes.TIME, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

// 🔹 Listing-HomestayVilla Relationship
Listing.hasOne(HomestayVilla, { foreignKey: 'listingId', onDelete: 'CASCADE' });
HomestayVilla.belongsTo(Listing, { foreignKey: 'listingId' });

export default HomestayVilla;
