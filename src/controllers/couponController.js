// backend/controllers/couponController.js
import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.json(coupons);
  } catch (error) {
    console.error('❌ Get coupons error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(coupon);
  } catch (error) {
    console.error('❌ Create coupon error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    console.error('❌ Get coupon error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      Object.assign(coupon, req.body);
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    console.error('❌ Update coupon error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    console.error('❌ Delete coupon error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check coupon validity
// @route   POST /api/coupons/check
// @access  Private
export const checkCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon expired or inactive' });
    }
    
    // Check user usage
    const canUse = await coupon.canUserUse(req.user._id);
    if (!canUse) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }
    
    // Check minimum order
    if (subtotal < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount must be ${coupon.minimumOrderAmount}` 
      });
    }
    
    // Calculate discount
    const discount = coupon.calculateDiscount(subtotal);
    
    res.json({
      message: 'Coupon is valid',
      couponCode: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    console.error('❌ Check coupon error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply coupon
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon expired or inactive' });
    }
    
    // Check user usage
    const canUse = await coupon.canUserUse(req.user._id);
    if (!canUse) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }
    
    // Check minimum order
    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount must be ${coupon.minimumOrderAmount}` 
      });
    }
    
    // Calculate discount
    const discount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discount;
    
    // Increment used count
    coupon.usedCount += 1;
    await coupon.save();
    
    res.json({
      message: 'Coupon applied successfully',
      couponCode: coupon.code,
      discount,
      finalAmount
    });
  } catch (error) {
    console.error('❌ Apply coupon error:', error);
    res.status(500).json({ message: error.message });
  }
};

// backend/controllers/couponController.js

// @desc    Get available coupons for users
// @route   GET /api/coupons/available
// @access  Private
export const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    
    // শুধু active, valid, এবং limit না থাকা কুপন
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $expr: { $or: [
        { usageLimit: null },
        { $lt: ['$usedCount', '$usageLimit'] }
      ]}
    }).sort('-createdAt');
    
    console.log(`✅ Found ${coupons.length} available coupons for user ${req.user._id}`);
    res.json(coupons);
  } catch (error) {
    console.error('❌ Get available coupons error:', error);
    res.status(500).json({ message: error.message });
  }
};