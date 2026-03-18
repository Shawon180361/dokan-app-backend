import Banner from "../models/banner.js";

// Upload banner
// Upload banner
export const uploadBanner = async (req, res) => {
  try {
    const file = req.file;
    const { start_date, end_date } = req.body;

    if (!file) 
      return res.status(400).json({ message: "Image is required" });

    // product-upload style
    const image_url = `/uploads/${req.file.filename}`;

    const banner = await Banner.create({
      image_url,      // Model field name অনুযায়ী
      start_date,
      end_date,
      active: true,
    });

    res.status(201).json({ message: "Banner uploaded successfully", banner });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all active banners
export const getActiveBanners = async (req, res) => {
  try {
    const today = new Date();
    const banners = await Banner.find({
      active: true,
      start_date: { $lte: today },
      end_date: { $gte: today },
    }).sort({ createdAt: -1 });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Clear all banners
export const clearBanners = async (req, res) => {
  try {
    await Banner.deleteMany({});
    res.json({ message: "All banners cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};