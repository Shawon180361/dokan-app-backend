// backend/controllers/adminOrderController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { createAndSendNotification } from './notificationController.js';

// ================= GET ALL ORDERS (ADMIN) =================
export const getAllAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ORDER BY ID (ADMIN) =================
export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE ORDER STATUS (ADMIN) =================
export const updateOrderStatusByAdmin = async (req, res) => {
  console.log('\n🔴🔴🔴🔴 ADMIN UPDATE ORDER STATUS CALLED 🔴🔴🔴🔴');
  console.log('Order ID:', req.params.id);
  console.log('New status:', req.body.status);
  
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Missing id or status" });
    }

    // অর্ডার খুঁজুন এবং user populate করুন
    const order = await Order.findById(id).populate('userId', 'name email _id');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found. User ID:', order.userId?._id);
    console.log('Current status:', order.orderStatus);

    order.orderStatus = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    await order.save();
    console.log('Status updated to:', status);

    // স্ট্যাটাস অনুযায়ী মেসেজ
    const statusMessages = {
      'processing': '📦 আপনার অর্ডার প্রসেসিং শুরু হয়েছে',
      'shipped': '🚚 আপনার অর্ডার পাঠানো হয়েছে',
      'delivered': '🏠 আপনার অর্ডার ডেলিভারি হয়েছে!',
      'cancelled': '❌ আপনার অর্ডার ক্যান্সেল হয়েছে'
    };

    const messageBody = statusMessages[status] || `অর্ডারের স্ট্যাটাস পরিবর্তন হয়েছে: ${status}`;

    console.log('Sending notification to user:', order.userId?._id);

    // ইউজারকে নোটিফিকেশন পাঠান
    try {
      const notification = await createAndSendNotification({
        userId: order.userId._id,
        type: 'orderUpdate',
        title: 'অর্ডার আপডেট',
        body: messageBody,
        data: {
          orderId: order._id.toString(),
          status: status,
          type: 'order_update'
        }
      });
      
      console.log('Notification sent. ID:', notification?._id);
      
    } catch (notifError) {
      console.error('Notification error:', notifError.message);
    }

    res.json(order);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE ORDER (ADMIN) =================
export const deleteOrderByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // অর্ডার ডিলিট করুন
    await Order.findByIdAndDelete(id);

    // প্রোডাক্টের স্টক আবার বাড়িয়ে দিন (ঐচ্ছিক)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    console.log('✅ Order deleted successfully:', id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server error" });
  }
};