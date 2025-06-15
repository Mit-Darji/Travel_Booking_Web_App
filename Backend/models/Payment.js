import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';
import HolidayPackage from './holidayPackage.js';
import HomestayVilla from './homestayAndVillas.js';
import Hotel from './Hotel.js';

const Payment = sequelize.define('Payment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
  },
  listingType: {
    type: DataTypes.ENUM('Hotel', 'HolidayPackage', 'HomestayVilla'),
    allowNull: false,
  },
  razorpay_order_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  razorpay_payment_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  razorpay_signature: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});


User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

HolidayPackage.hasMany(Payment, { foreignKey: 'itemId', constraints: false });
Payment.belongsTo(HolidayPackage, { foreignKey: 'itemId', constraints: false });

HomestayVilla.hasMany(Payment, { foreignKey: 'itemId', constraints: false });
Payment.belongsTo(HomestayVilla, { foreignKey: 'itemId', constraints: false });

Hotel.hasMany(Payment, { foreignKey: 'itemId', constraints: false });
Payment.belongsTo(Hotel, { foreignKey: 'itemId', constraints: false });

export default Payment;