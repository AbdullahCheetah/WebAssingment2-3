const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
router.use(express.json());
router.use('/users', userController);
router.get('/feed', userController);
router.post('/follow/:userId', userController);
module.exports = router;
