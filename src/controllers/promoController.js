// backend/controllers/promoController.js
import TopicNotification from '../services/topicNotification.js';

export const sendPromoToAll = async (req, res) => {
  try {
    const { title, body } = req.body;
    
    await TopicNotification.sendToAllUsers(
      title,
      body,
      { type: 'promotion' }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};