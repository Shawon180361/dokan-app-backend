// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/userOrderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import addressRoutes from './routes/addressRoutes.js';
import { errorHandler } from "./middleware/errorHandler.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import wishlistRoutes from './routes/wishlistRoutes.js';
import { protect, admin } from './middleware/authMiddleware.js';  // ✅ এই লাইন যোগ করুন
import notificationRoutes from './routes/notificationRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminBannerRoutes from './routes/adminBannerRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import userOrderRoutes from './routes/userOrderRoutes.js';


import { validate, validateRegister, validateLogin } from './middleware/validation.js';

import path from "path";
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
// Routes
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api", bannerRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin/banners', adminBannerRoutes);
app.use('/api/admin/users', adminUserRoutes);  // URL হবে: /api/admin/users
app.use('/api/admin/orders', protect, admin, adminOrderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user/orders', userOrderRoutes);

// Error middleware
app.use(errorHandler);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
