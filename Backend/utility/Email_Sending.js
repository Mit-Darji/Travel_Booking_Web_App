import nodemailer from 'nodemailer';
import dotenv from  'dotenv';

dotenv.config();

// Function to send email
export const LoginEmail = async (email, name, role) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Define email content based on role
    const text =
      role === 'Vendor'
        ? `Hello ${name},

Welcome to Travel Online Booking as a valued Vendor! Your login was successful, and you can now manage your listings, track bookings, and provide amazing travel experiences to our users.

We are excited to have you onboard and look forward to a great partnership.

Best Regards,  
Travel Online Booking Team`

        : `Hello ${name}, 

We are thrilled to have you onboard! Your login was successful, and you can now explore the best travel deals and holiday packages.

Enjoy your journey with us!

Best Regards,  
Travel Online Booking Team`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Travel Online Booking!',
      text: text
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const UpdateProfileEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Define email content based on role
    const text = `Hello ${name},Your profile has been successfully updated. If you did not make this change, please contact support.
    
    Thank you for using our platform!

    Best Regards,
    Travel Online Booking App
    info@sciecore.com | http://www.sciecore.com`


    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Profile Update Confirmation',
      text: text
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export const addFirstListingEmail = async (email,name,Listingname,listingname)=>{
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Define email content based on role
    const text = `Dear ${name},

    Congratulations! Your first ${listingname}, ${Listingname}, has been successfully added to our platform. 🎊

    We're excited to have you onboard and look forward to helping you connect with more customers and grow your business. You can manage your listing and update details anytime in your vendor dashboard.

    If you have any questions, feel free to reach out to our support team.

    Happy Hosting!
    info@sciecore.com | http://www.sciecore.com`

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome! Your First Listing is Live on Our Platform 🎉',
      text: text
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
