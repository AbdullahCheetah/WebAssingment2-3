const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/follow/:userId', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const userToFollow = await User.findById(userId);  
      if (!userToFollow) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user.following.push(userId);
      await req.user.save();  
      res.status(200).json({ message: 'Successfully followed user' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.get('/feed', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).populate('following');
      const posts = await Post.find({ author: { $in: user.following } });  
      res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }); 

module.exports = router;
