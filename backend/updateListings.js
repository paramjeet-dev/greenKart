import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

async function updateListingsStatus() {
  mongoose.connect(process.env.MONGO)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

  try {
    const currentDate = new Date();
    const next24Hours = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    // Fetch all listings
    const listingsData = await listings.find({}).toArray();

    for (const listing of listingsData) {
      const expiryDate = new Date(listing.expiryDate);

      // Check if the listing is expired
      if (expiryDate < currentDate) {
        await collection.updateOne(
          { _id: listing._id },
          { $set: { status: 'expired' } }
        );
      }

      // Check if the listing is active and expires within the next 24 hours
      if (listing.status === 'active' && expiryDate <= next24Hours && expiryDate > currentDate) {
        await sendExpiryNotification(listing.userEmail, listing.title, expiryDate);
      }
    }

    console.log('Listings status updated successfully.');
  } catch (error) {
    console.error('Error updating listings status:', error);
  }
}

async function sendExpiryNotification(userEmail, listingTitle, expiryDate) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your listing will expire soon!',
    text: `Hello,\n\nYour listing "${listingTitle}" will expire on ${expiryDate.toDateString()}. Please take necessary actions if required.\n\nThank you.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Expiry notification sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
  }
}

// Schedule the script to run every day at 7:00 AM
cron.schedule('0 7 * * *', () => {
  console.log('Running updateListingsStatus job...');
  updateListingsStatus();
});

// module.exports = updateListingsStatus;
