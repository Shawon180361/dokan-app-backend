import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image_url: { type: String, required: true },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;