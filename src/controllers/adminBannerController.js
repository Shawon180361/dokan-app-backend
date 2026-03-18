// backend/src/controllers/adminBannerController.js
import Banner from "../models/banner.js";

// @desc    Get all banners (admin)
// @route   GET /api/admin/banners
// @access  Private/Admin
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get banner by ID
// @route   GET /api/admin/banners/:id
// @access  Private/Admin
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Upload banner (admin)
// @route   POST /api/admin/banners
// @access  Private/Admin
export const uploadBanner = async (req, res) => {
  try {
    const file = req.file;
    const { start_date, end_date } = req.body;

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image_url = `/uploads/${req.file.filename}`;

    const banner = await Banner.create({
      image_url,
      start_date: start_date || new Date(),
      end_date: end_date || null,
      active: true,
    });

    res.status(201).json({ 
      message: "Banner uploaded successfully", 
      banner 
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, active } = req.body;
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Update fields
    if (start_date) banner.start_date = start_date;
    if (end_date) banner.end_date = end_date;
    if (active !== undefined) banner.active = active;
    
    // Update image if new file uploaded
    if (req.file) {
      banner.image_url = `/uploads/${req.file.filename}`;
    }

    await banner.save();

    res.json({ 
      message: "Banner updated successfully", 
      banner 
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Clear all banners
// @route   DELETE /api/admin/banners/clear/all
// @access  Private/Admin
export const clearBanners = async (req, res) => {
  try {
    await Banner.deleteMany({});
    res.json({ message: "All banners cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};