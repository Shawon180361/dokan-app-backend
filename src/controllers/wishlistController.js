// backend/controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'title price discountPrice images stock'
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user._id,
        items: []
      });
    }

    // Format response
    const formattedItems = wishlist.items.map(item => ({
      _id: item._id,
      productId: item.productId._id,
      productName: item.productId.title,
      price: item.productId.price,
      discountPrice: item.productId.discountPrice,
      productImage: item.productId.images?.[0],
      stock: item.productId.stock,
      addedAt: item.addedAt
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        items: []
      });
    }

    // Check if already in wishlist
    const exists = wishlist.items.some(
      item => item.productId.toString() === productId
    );

    if (exists) {
      return res.status(400).json({ message: 'Already in wishlist' });
    }

    // Add to wishlist
    wishlist.items.push({
      productId,
      addedAt: new Date()
    });

    await wishlist.save();

    // Populate and return
    await wishlist.populate({
      path: 'items.productId',
      select: 'title price discountPrice images stock'
    });

    const newItem = wishlist.items[wishlist.items.length - 1];
    
    res.status(201).json({
      _id: newItem._id,
      productId: newItem.productId._id,
      productName: newItem.productId.title,
      price: newItem.productId.price,
      discountPrice: newItem.productId.discountPrice,
      productImage: newItem.productId.images?.[0],
      stock: newItem.productId.stock,
      addedAt: newItem.addedAt
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/remove/:itemId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove item
    wishlist.items = wishlist.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await wishlist.save();
    res.json({ message: 'Removed from wishlist' });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.json({ isInWishlist: false });
    }

    const exists = wishlist.items.some(
      item => item.productId.toString() === req.params.productId
    );

    res.json({ isInWishlist: exists });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();
    
    res.json({ message: 'Wishlist cleared' });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};