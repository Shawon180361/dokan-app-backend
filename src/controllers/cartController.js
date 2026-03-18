// controllers/cartController.js
import User from "../models/User.js";
import Product from "../models/Product.js";

// backend/controllers/cartController.js

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product'
    });
    
    const cartItems = user.cart.map(item => {
      const product = item.product;
      
      // ✅ ডিসকাউন্ট প্রাইস আছে কিনা চেক করুন
      const discountPrice = product.discountPrice || product.price;
      
      return {
        _id: item._id,
        product: product,
        quantity: item.quantity,
        size: item.size,
        price: discountPrice, // ✅ ডিসকাউন্ট প্রাইস পাঠান
        originalPrice: product.price // ✅ অরিজিনাল প্রাইস পাঠান (অপশনাল)
      };
    });
    
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // ✅ ডিসকাউন্ট প্রাইস ব্যবহার করুন
    const price = product.discountPrice || product.price;
    
    const user = await User.findById(req.user._id);
    
    // Check if product already in cart
    const existingItem = user.cart.find(
      item => item.product.toString() === productId && item.size === size
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        size,
        price // ✅ ডিসকাউন্ট প্রাইস সংরক্ষণ করুন
      });
    }
    
    await user.save();
    
    res.status(200).json({ message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemId = req.params.id;
    
    // চেক করুন আইটেম আছে কিনা
    if (!user.cart || user.cart.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    const itemExists = user.cart.some(item => item._id.toString() === itemId);
    
    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    user.cart = user.cart.filter(item => item._id.toString() !== itemId);
    await user.save();
    
    // আপডেটেড কার্ট পাঠান
    const updatedUser = await User.findById(req.user._id)
      .populate('cart.product');

    const formattedCart = updatedUser.cart?.map(item => ({
      _id: item._id,
      product: item.product,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      totalPrice: (item.price || 0) * (item.quantity || 0)
    })) || [];

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();
    
    res.status(200).json({ message: "Cart cleared successfully", cart: [] });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};