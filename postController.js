const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({
      title,
      content,
      author: req.user.userId,
    });
    await newPost.save();
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/rate-post/:postId', authMiddleware, async (req, res) => {
    try {
      const { postId } = req.params;
      const { rating } = req.body;  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }  
      post.ratings.push({ userId: req.user.userId, rating });
      await post.save();  
      res.status(200).json({ message: 'Rating added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.get('/all-posts', async (req, res) => {
    try {
      const posts = await Post.find();
      res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.get('/post/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId);  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }  
      res.status(200).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.patch('/disable-post/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Only the post owner or admin can disable the post' });
    }
    post.disabled = true;
    await post.save();
    res.status(200).json({ message: 'Post disabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/delete-post/:postId', authMiddleware, async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId);  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }  
      if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Only the post owner or admin can delete the post' });
      }  
      await post.remove();  
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/search', async (req, res) => {
    try {
      const { keyword, category, author } = req.query;
      const filter = {};  
      if (keyword) {
        filter.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { content: { $regex: keyword, $options: 'i' } },
        ];
      }  
      if (category) {
        filter.category = category;
      }  
      if (author) {
        const authorUser = await User.findOne({ username: author });  
        if (authorUser) {
          filter.author = authorUser._id;
        }
      }  
      const searchResults = await Post.find(filter);  
      res.status(200).json(searchResults);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
