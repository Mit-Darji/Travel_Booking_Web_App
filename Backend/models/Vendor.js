import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  mobile: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },

  // Optional Fields (Not required at login)
  // googleId: { type: DataTypes.STRING, unique: true, allowNull: true },
  // otp: { type: DataTypes.STRING, allowNull: true },

  // Updated to properly handle array of business types
  businessName: { type: DataTypes.STRING, allowNull: true },
  businessType: { type: DataTypes.JSON, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },

  // Package Details (Optional)
  packagesUploaded: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  activePackages: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
},{ timestamps: true });

export default Vendor;