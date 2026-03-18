// backend/src/models/Order.js
import mongoose from 'mongoose';
// backend/src/models/Order.js

const orderItemSchema = new mongoose.Schema({
  product: {  // ✅ এই field টি 'product' হওয়া উচিত, 'productId' না
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  productImage: String,
  size: String,
  quantity: Number,
  price: Number
});

// সংক্ষেপে - Flutter থেকে 'productId' পাঠালে, সেটা 'product' field এ map করতে হবে
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: Number,
  discount: Number,
  total: Number,
  couponCode: String,
  paymentMethod: String,
  shippingAddress: {
    address: String,
    recipientName: String,
    phoneNumber: String,
    division: String,
    district: String,
    upazila: String,
    area: String,
    landmark: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
export default Order; // ✅ এই লাইনটি থাকতে হবে