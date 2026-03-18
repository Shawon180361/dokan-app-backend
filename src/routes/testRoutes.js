// routes/testRoutes.js
router.post('/test-notify/:userId', async (req, res) => {
  try {
    await TopicNotification.sendToUser(
      req.params.userId,
      '🧪 টেস্ট নোটিফিকেশন',
      'এটি একটি টেস্ট মেসেজ',
      { type: 'test' }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});