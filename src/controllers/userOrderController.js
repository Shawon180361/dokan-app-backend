// backend/controllers/userOrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { createAndSendNotification } from './notificationController.js';

// ================= CREATE ORDER =================
// backend/controllers/userOrderController.js - আপডেটেড ভার্সন

export const createUserOrder = async (req, res) => {
  try {
    const { items, subtotal, shipping, tax, discount, total, couponCode, paymentMethod, shippingAddress } = req.body;

    console.log('📦 Creating order for user:', req.user._id);
    console.log('📍 Shipping Address received:', shippingAddress); // ✅ পুরো object দেখুন

    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        console.log('❌ Product not found for ID:', item.productId);
        return res.status(404).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }

      console.log('✅ Product found:', product.title);

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${product.title}. Only ${product.stock} available.` 
        });
      }

      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        productName: product.title,
        productImage: product.images && product.images.length > 0 ? product.images[0] : null,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      });
    }

    // ✅ ঠিক করা অংশ - পুরো shippingAddress object সংরক্ষণ করুন
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      couponCode,
      paymentMethod,
      shippingAddress: shippingAddress || { // ✅ পুরো object সংরক্ষণ
        address: 'Dhaka, Bangladesh',
        recipientName: 'Customer',
        phoneNumber: 'N/A',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'N/A',
        area: 'N/A'
      },
      orderStatus: 'pending'
    });

    const createdOrder = await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cart: [] } }
    );

    const orderNumber = createdOrder.orderNumber || 
                        createdOrder._id.toString().slice(-8).toUpperCase();

    console.log('✅ Order created successfully. Number:', orderNumber);
    console.log('✅ Saved shippingAddress:', createdOrder.shippingAddress); // ✅ দেখুন সেভ হচ্ছে কিনা

    // ===== NOTIFICATIONS =====
    
    // 1️⃣ ইউজারকে নোটিফিকেশন
    try {
      await createAndSendNotification({
        userId: req.user._id,
        type: 'newOrder',
        title: '✅ অর্ডার কনফার্ম!',
        body: `অর্ডার #${orderNumber} সফল হয়েছে`,
        data: {
          orderId: createdOrder._id.toString(),
          type: 'order_confirmation'
        }
      });
      console.log('✅ User notification saved');
    } catch (notifError) {
      console.error('❌ User notification error:', notifError.message);
    }

    // 2️⃣ অ্যাডমিনদের নোটিফিকেশন
    try {
      const user = await User.findById(req.user._id);
      const admins = await User.find({ role: 'admin' });
      
      for (const admin of admins) {
        await createAndSendNotification({
          userId: admin._id,
          type: 'adminNotification',
          title: '🛍️ নতুন অর্ডার',
          body: `${user?.name || 'ইউজার'} অর্ডার করেছেন ৳${total}`,
          data: {
            orderId: createdOrder._id.toString(),
            type: 'admin_notification',
            userId: req.user._id.toString()
          }
        });
      }
      console.log('✅ Admin notifications sent');
    } catch (notifError) {
      console.error('❌ Admin notification error:', notifError.message);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET MY ORDERS =================
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "title images price");

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ORDER BY ID (USER) =================
export const getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "title images price");
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= CANCEL ORDER (USER) =================
export const cancelUserOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that is not pending' 
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.orderStatus = 'cancelled';
    const updatedOrder = await order.save();

    // ক্যান্সেল নোটিফিকেশন
    try {
      await createAndSendNotification({
        userId: order.userId.toString(),
        type: 'orderUpdate',
        title: '❌ অর্ডার ক্যান্সেল',
        body: `অর্ডার #${order.orderNumber} ক্যান্সেল করা হয়েছে`,
        data: {
          orderId: order._id.toString(),
          type: 'order_cancelled'
        }
      });
      console.log('✅ Cancel notification sent');
    } catch (notifError) {
      console.error('❌ Cancel notification error:', notifError.message);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
};