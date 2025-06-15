import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import Vendor from '../models/Vendor.js';
import {LoginEmail} from '../utility/Email_Sending.js';

// Initialize Twilio client with credentials
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP to User's Mobile
// export const sendOTP = async (req, res) => {
//   const { mobile } = req.body;  // User's mobile number from frontend

//   try {
//     // Generate OTP (random 6-digit number)
//     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();  // 6-digit OTP

//     // Send OTP via Twilio
//     await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verifications
//       .create({ to: `+${mobile}`, channel: 'sms' });  // Send OTP to the mobile number

//     // Check if user exists with the mobile number
//     let user = await User.findOne({ where: { mobile } });

//     if (!user) {
//       // If the user doesn't exist, create a new user
//       user = await User.create({ mobile, otp: generatedOtp });
//     } else {
//       // If user exists, update OTP for that user
//       user.otp = generatedOtp;
//       await user.save();
//     }

//     res.json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Error sending OTP' });
//   }
// };

// // Verify OTP entered by User
// export const verifyOTP = async (req, res) => {
//   const { mobile, otp } = req.body;  // User's mobile number and OTP entered by user

//   try {
//     const user = await User.findOne({ where: { mobile } });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Check if OTP entered by user matches the stored OTP
//     if (user.otp !== otp) {
//       return res.status(400).json({ message: 'Invalid OTP' });
//     }

//     // Clear OTP after successful verification
//     user.otp = null;
//     await user.save();

//     // Generate a JWT token for the user
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({ message: 'OTP verified successfully', token });
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     res.status(500).json({ message: 'Error verifying OTP' });
//   }
// };

// // Google Authentication (Sign Up or Log In)
// export const googleAuth = async (req, res) => {
//   const { tokenId } = req.body;  // Google ID token passed from frontend

//   try {
//     const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//     const ticket = await client.verifyIdToken({
//       idToken: tokenId,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const { name, email, sub: googleId } = ticket.getPayload();  // Extract user data from Google

//     let user = await User.findOne({ where: { googleId } });

//     if (!user) {
//       // Create new user if not found
//       user = await User.create({ name, email, googleId });
//     }

//     // Generate JWT for authenticated access
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({ message: 'Google login successful', token });
//   } catch (error) {
//     console.error('Error during Google authentication:', error);
//     res.status(500).json({ message: 'Google authentication failed' });
//   }
// };

// Email/Password Authentication (Sign Up or Log In)
export const User_emailAuth = async (req, res) => {

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name,email, password,mobile} = req.body; 

  try {
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user if email doesn't exist
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await User.create({name,email, password: hashedPassword, mobile });
      await LoginEmail(email,name,"User");  // Send email to user after successful login
    } else {
      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '5d' });
    res.json({ message: 'Email login successful', token , Username:name,email:user.email,mobile:user.mobile}); // Send user details in response
  } catch (error) {
    console.error('Error during email authentication:', error);
    res.status(500).json({ message: 'Email authentication failed' });
  }
};

export const Vendor_emailAuth = async (req, res) => {
  // Validate request input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, mobile } = req.body;

  try {
    let vendor = await Vendor.findOne({ where: { email } });

    if (!vendor) {
      // Create a new vendor if not found
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      vendor = await Vendor.create({ name, email, mobile, password: hashedPassword });
      await LoginEmail(email, name, "Vendor");  // Send email notification
    } else {
      // If vendor exists, check password
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Check if vendor profile is complete
    const isProfileComplete = !!(
      vendor.businessName &&
      vendor.address &&
      vendor.city &&
      vendor.country
    );

    // Generate a JWT token for authentication
    const token = jwt.sign(
      { vendorId: vendor.id },
      process.env.JWT_SECRET,
      { expiresIn: '5d' }
    );

    res.status(200).json({
      message: 'Vendor email login successful',
      token,
      vendorId: vendor.id, // Send vendorId explicitly
      Username: vendor.name,
      isProfileComplete, // Profile status
    });
  } catch (error) {
    console.error('Error during vendor email authentication:', error);
    res.status(500).json({ message: 'Vendor email authentication failed' });
  }
};

export const vendorSetup = async (req, res) => {
  

  const { businessName, businessType, country, address, city } = req.body;


  const vendorId = req.id;


  if (!vendorId) {
    return res.status(401).json({ message: "Unauthorized: No vendor ID provided" });
  }

  try {
    const vendor = await Vendor.findByPk(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.businessName = businessName;
    vendor.businessType = businessType;
    vendor.country = country;
    vendor.address = address;
    vendor.city = city;
    vendor.profileCompleted = true;

    await vendor.save();

    res.status(200).json({ message: "Profile setup completed" });
  } catch (error) {
    console.error("Profile setup error:", error);
    res.status(500).json({ message: "Profile setup error" });
  }
};