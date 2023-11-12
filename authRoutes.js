const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.use(express.json());
router.use('/auth', authController);
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Access granted to protected route', user: req.user });
});
module.exports = router;
