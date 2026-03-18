// backend/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'newOrder',           // নতুন অর্ডার (ইউজার)
      'orderUpdate',        // অর্ডার আপডেট (ইউজার)
      'lowStock',           // লো স্টক (অ্যাডমিন)
      'userRegistered',     // নতুন ইউজার (অ্যাডমিন)
      'paymentReceived',    // পেমেন্ট রিসিভড (অ্যাডমিন)
      'adminNotification',   // নতুন অর্ডার (অ্যাডমিন) - ✅ এইটা যোগ করুন
      'systemAlert'         // সিস্টেম এলার্ট
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;