const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    req.user = { userId: user._id, role: user.role };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

module.exports = authMiddleware;
