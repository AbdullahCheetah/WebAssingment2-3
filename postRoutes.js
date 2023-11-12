const express = require('express');
const postController = require('../controllers/postController');
const router = express.Router();
router.use(express.json());
router.use('/posts', postController);
router.use('/posts', require('./deletePostRoutes'));
router.get('/all-posts', postController);
router.patch('/disable-post/:postId', postController);
module.exports = router;
