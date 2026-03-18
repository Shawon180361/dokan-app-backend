import User from "../models/User.js";
import Product from "../models/Product.js";

// GET CART
export const getCart = async (req,res) => {
  const user = await User.findById(req.user._id)
    .populate("cart.product");

  res.json(user.cart);
};

// ADD TO CART
export const addToCart = async (req,res) => {
  const { productId, size, quantity } = req.body;

  const user = await User.findById(req.user._id);
  const product = await Product.findById(productId);

  if(!product) return res.status(404).json({message:"Product not found"});

  const existing = user.cart.find(
    item =>
      item.product.toString() === productId &&
      item.size === size
  );

  if(existing){
    existing.quantity += quantity;
  } else {
    user.cart.push({
      product: productId,
      size,
      quantity,
      price: product.price
    });
  }

  await user.save();
  res.json(user.cart);
};

// REMOVE
export const removeFromCart = async (req,res)=>{
  const user = await User.findById(req.user._id);

  user.cart = user.cart.filter(
    item => item._id.toString() !== req.params.id
  );

  await user.save();
  res.json(user.cart);
};

// CLEAR
export const clearCart = async (req,res)=>{
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  res.json({message:"Cart cleared"});
};