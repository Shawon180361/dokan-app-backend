// backend/controllers/notificationController.js
import Notification from '../models/Notification.js';
import TopicNotification from '../services/topicNotification.js';

export const createAndSendNotification = async ({
  userId,
  type,
  title,
  body,
  data = {}
}) => {
  console.log('\n🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔');
  console.log('🟨 CREATE AND SEND NOTIFICATION CALLED');
  console.log('🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔🔔\n');

  console.log('1️⃣ Input userId:', userId);
  console.log('2️⃣ Input userId type:', typeof userId);
  console.log('3️⃣ Input type:', type);
  console.log('4️⃣ Input title:', title);
  console.log('5️⃣ Input body:', body);
  console.log('6️⃣ Input data:', data);

  // userId ভ্যালিড কিনা চেক করুন
  if (!userId) {
    console.log('❌ userId is null or undefined');
    throw new Error('userId is required');
  }

  try {
    // ডাটাবেজে নোটিফিকেশন সেভ করুন
    console.log('7️⃣ Attempting to save to database...');
    
    const notificationData = {
      userId,
      type,
      title,
      body,
      data,
      isRead: false
    };
    
    console.log('8️⃣ Notification data:', notificationData);
    
    const notification = await Notification.create(notificationData);
    
    console.log('9️⃣ Saved to DB. Notification ID:', notification._id);
    console.log('🔟 Saved notification userId:', notification.userId);

    // Push Notification পাঠান
    console.log('11️⃣ Sending push notification...');
    console.log('12️⃣ Push userId:', userId.toString());
    
    const pushResult = await TopicNotification.sendToUser(
      userId.toString(),
      title,
      body,
      { ...data, notificationId: notification._id.toString() }
    );
    
    console.log('13️⃣ Push result:', pushResult);
    
    console.log('\n✅✅✅ NOTIFICATION COMPLETE ✅✅✅\n');
    return notification;
    
  } catch (error) {
    console.log('\n❌❌❌❌ NOTIFICATION ERROR ❌❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// ================= GET USER NOTIFICATIONS =================
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MARK AS READ =================
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MARK ALL AS READ =================
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE NOTIFICATION =================
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET UNREAD COUNT =================
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};