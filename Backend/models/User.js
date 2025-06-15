import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  mobile: { type: DataTypes.STRING, allowNull: true},
  password: { type: DataTypes.STRING, allowNull: false }, 
  // googleId: { type: DataTypes.STRING, unique: true, allowNull: true },  
  // otp: { type: DataTypes.STRING, allowNull: true },  
},{ timestamps: true });

export default User;
