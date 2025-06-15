import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, sequelize } from './config/db.js';
import authRoutes from './routes/authRoute.js';
import search_Location from './routes/search_Location.js';
import offers from './routes/offers.js';
import allListing from './routes/allListingRoute.js';
import editProfile from './routes/editProfileRoute.js'
import addListing from './routes/addListingRoute.js'
import editListing from './routes/editListingRouter.js'
import fileUpload from 'express-fileupload';
import Dashboard from './routes/Dashboard.js';
import ListingViewDetailsRoute from './routes/ListingViewDetailsRoute.js';
import paymentRoute from './routes/PaymentRoute.js';
import { swaggerUi, swaggerDocs } from "./swagger.js";

dotenv.config();
const app = express();

app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
// Middleware
app.use(cors());
app.use(express.json());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MySQL first
connectDB().then(() => {
  // Sync models after a successful DB connection
  sequelize.sync({ alter: true })
    .then(() => console.log("✅ Database synced successfully"))
    .catch(err => console.error("❌ Sync failed: ", err));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', search_Location);
app.use("/api/Offers", offers);
app.use("/api/Edit", editProfile);
app.use("/api/allListing", allListing);
app.use("/api/addListing", addListing);
app.use("/api/EditListing", editListing);
app.use("/api/Dashboard", Dashboard);
app.use("/api/SearchListing",ListingViewDetailsRoute);
app.use("/api/paymentGatway",paymentRoute)

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log("Swagger docs available at http://localhost:5000/api-docs");
});
