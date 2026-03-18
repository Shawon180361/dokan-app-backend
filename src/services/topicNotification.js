// backend/services/topicNotification.js
import admin from '../config/firebase.js';

class TopicNotification {
 static async sendToTopic(topic, title, body, data = {}) {
    console.log('\n📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤');
    console.log('🟦 SEND TO TOPIC CALLED');
    console.log('📤 Topic:', topic);
    console.log('📤 Title:', title);
    console.log('📤 Body:', body);
    console.log('📤 Data:', data);

    try {
      const message = {
        notification: { title, body },
        data: { 
          ...data, 
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          timestamp: Date.now().toString()
        },
        topic: topic,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } }
      };

      console.log('📤 Message prepared');
      
      const response = await admin.messaging().send(message);
      
      console.log('📤 FCM Response:', response);
      console.log('✅✅✅ PUSH SENT ✅✅✅\n');
      
      return { success: true, messageId: response };
      
    } catch (error) {
      console.log('\n❌❌❌❌ FCM ERROR ❌❌❌❌');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      return { success: false, error: error.message };
    }
  }

  // নির্দিষ্ট ইউজারকে পাঠান
  static async sendToUser(userId, title, body, data = {}) {
    console.log('👤 sendToUser called with userId:', userId);
    return this.sendToTopic(`user_${userId}`, title, body, data);
  }


  // সব ইউজারকে পাঠান
  static async sendToAllUsers(title, body, data = {}) {
    return this.sendToTopic('all_users', title, body, data);
  }

  // অ্যাডমিনদের পাঠান
  static async sendToAdmins(title, body, data = {}) {
    return this.sendToTopic('admin_alerts', title, body, data);
  }
}

export default TopicNotification;