import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRATE_KEY,
});

// Create an order
export const create_OrderId = async (req, res) => {
  try {
    const id = req.id;
    const { amount, receipt } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: receipt,
      payment_capture: amount ? 1 : 0,
    };
    const order = await instance.orders.create(options);
    res.status(200).send({ message: "Order ID created", order });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({ error: "Error creating order" });
  }
};

// Verify Payment
export const verify_Payment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemId,
      listingType,
    } = req.body;
    console.log(req.body);
    const userId = req.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.SECRATE_KEY)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    const payment = await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      itemId,
      listingType,
      paymentStatus: isAuthentic ? 'completed' : 'failed',
    });

    if (!payment) {
      return res.status(500).json({ message: "Payment not recorded" });
    }

    if (isAuthentic) {
      return res.status(200).json({
        success: "Payment Successful",
        paymentStatus: payment.paymentStatus,
      });
    } else {
      return res.status(400).json({
        message: "Invalid payment signature",
        paymentStatus: payment.paymentStatus,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Webhook Route with Correct Raw Middleware
export const webhook = (req, res) => { // Use * to handle varied content-types
  console.log("Webhook called");

  try {
    const webhookData = req.body;

    // Verify the webhook signature to ensure it's from Razorpay
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const webhookSecret = '7654321'; // This secrete key need to add on razorpay webhook also

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(JSON.stringify(webhookData));
    const calculatedSignature = hmac.digest('hex');

    // const { entity, event, payload, created_at } = webhookData;
    // const requestUrl = req.url;
    // const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // const userAgent = req.headers['user-agent'];
    // const payloadString = JSON.stringify(payload);


    if (razorpaySignature === calculatedSignature) {
      // Signature is valid, process the webhook data
      console.log('Webhook received signature matched:', webhookData);

      res.status(200).send('Webhook received successfully.');
    } else {
      // Signature is invalid, ignore the webhook request store in logs
      console.error('Invalid webhook signature');
      res.status(400).send('Invalid webhook signature');
    }
  } catch (error) {
    console.log("Error while webhook", error)
  }
};
