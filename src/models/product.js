import mongoose from "mongoose";

// Reply Schema
const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  userProfile: String,
  replyText: String,
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  userProfile: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema]
});

// Product Schema
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    details: String,
    brand: String,
    images: [String],
    price: { type: Number, required: true },
    discountPrice: Number,
    offer: { type: Number, default: 0 },
    category: String,
    stock: { type: Number, default: 0 },
    reviews: [reviewSchema],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    attributes: {
      sizes: [String],
      color: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);