import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Admin Dashboard Summary
export const getDashboardStats = async (req,res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalRevenueData = await Order.aggregate([
    { $match: { orderStatus:"delivered" } },
    { $group: { _id:null, revenue: { $sum:"$total" } } }
  ]);
  const totalRevenue = totalRevenueData[0]?.revenue || 0;

  const pendingOrders = await Order.countDocuments({ orderStatus:"pending" });
  const lowStockProducts = await Product.countDocuments({ stock: { $lte:5 }, isActive:true });

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts
  });
};
