const User = require("../models/user.js");
const Post = require("../models/post.js");
const Comment = require("../models/comment.js");
const mongoose = require("mongoose");
const { getImageUrl } = require("../config/cloudinary");
const sanitize = require('mongo-sanitize');

async function create(req, res) {
  try {
    const { body } = req.body;
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // Log incoming files for debugging
    console.log('Incoming files:', req.files.map(f => ({ 
      filename: f.filename,
      path: f.path,
      size: f.size 
    })));

    const arrayOfPaths = req.files.map(file => {
      if (!file.filename) {
        throw new Error('Invalid file upload');
      }
      const url = getImageUrl(file.filename);
      console.log('Generated image URL:', url); // Debug log
      return url;
    });

    const post = await Post.create({
      body,
      images: arrayOfPaths,
      author: req.userId
    });

    // Log created post
    console.log('Created post:', {
      id: post._id,
      images: post.images,
      author: post.author
    });

    const savedPost = await Post.findById(post._id).populate('author');
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Post creation failed:', err);
    res.status(400).json({ 
      message: 'Could not create post',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({})
        .populate('author')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({})
    ]);

    // Log the first post for debugging
    if (posts.length > 0) {
      console.log('First post:', {
        id: posts[0]._id,
        author: posts[0].author,
        images: posts[0].images
      });
    }

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getOnePost(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(sanitize(id)).populate('author');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.json(post);
  } catch (err) {
    console.error('Failed to fetch post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getPosts(req, res) {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username: sanitize(username) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ author: user._id })
        .populate('author')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ author: user._id })
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Failed to fetch user posts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function like(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    await Post.findByIdAndUpdate(sanitize(id), {
      $addToSet: { likes: mongoose.Types.ObjectId(req.userId) },
    });
    res.sendStatus(200);
  } catch (err) {
    console.error('Failed to like post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function unlike(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    await Post.findByIdAndUpdate(sanitize(id), {
      $pull: { likes: mongoose.Types.ObjectId(req.userId) },
    });
    res.sendStatus(200);
  } catch (err) {
    console.error('Failed to unlike post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function createComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const comment = new Comment({
      author: req.userId,
      post: sanitize(id),
      content: sanitize(content.trim()),
    });

    let createdComment = await comment.save();
    createdComment = await Comment.findById(createdComment._id).populate('author');

    res.json(createdComment);
  } catch (err) {
    console.error('Failed to create comment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getComments(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: sanitize(id) })
        .populate('author')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ post: sanitize(id) })
    ]);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  create,
  getAll,
  getPosts,
  getOnePost,
  like,
  unlike,
  createComment,
  getComments,
};
