const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      const newUser = new User({ username, email, password });
      await newUser.save();
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      res.status(200).json({ username: user.username, email: user.email, role: user.role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.patch('/profile', authMiddleware, async (req, res) => {
    try {
      const { username, email } = req.body;
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (req.user.role === 'admin') {
        user.role = req.body.role || user.role;
      } 
      user.username = username || user.username;
      user.email = email || user.email; 
      await user.save(); 
      res.status(200).json({ message: 'Profile updated successfully', user: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/all-users', authMiddleware, async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.patch('/block-user/:userId', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      } 
      user.blocked = true;
      await user.save(); 
      res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
