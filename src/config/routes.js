const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const usersController = require("../controllers/users.controller");
const postsController = require("../controllers/posts.controller");

//? multipart-data
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dazmhcufp",
  api_key: "485835333861858",
  api_secret: "jcDuAVJjEG5k0rFZOnKwzUWgOM0",
});

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  next();
};

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "fill" }]
  },
});

// Configure multer with error handling
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Custom error handling middleware for multer
const handleUpload = (req, res, next) => {
  upload.single("avatar")(req, res, function(err) {
    console.log('Multer middleware processing...');
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Unknown upload error:', err);
      return res.status(500).json({ message: 'Unknown upload error occurred' });
    }
    console.log('Upload successful, file:', req.file);
    next();
  });
};

// Auth middleware
const auth = (req, res, next) => {
  console.log('\nAuth middleware called');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Bearer token provided');
    console.log('Request rejected due to missing Bearer token');
    return res.status(401).json({ message: 'No Bearer token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  try {
    console.log('Attempting to verify token');
    const decoded = jwt.verify(token, 'shahar');
    console.log('Token verified successfully');
    console.log('Decoded token:', decoded);
    
    req.userId = decoded.id;
    console.log('Set req.userId:', req.userId);
    console.log('Authentication successful, proceeding with request');
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    console.log('Request rejected due to invalid or expired token');
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Apply debug middleware to all routes
router.use(debugMiddleware);

// User routes
router.get("/user/me", auth, usersController.me);
router.post("/user", usersController.create);
router.get("/user/:username", auth, usersController.getUser);
router.post("/user/available", usersController.isAvailable);
router.get("/search/user/:username", usersController.search);
router.post("/user/:username/follow", auth, usersController.follow);
router.post("/user/:username/unfollow", auth, usersController.unfollow);

// Avatar route - with custom error handling
router.post("/user/avatar", auth, handleUpload, usersController.updateAvatar);

// Post routes
router.post("/post/:id/like", auth, postsController.like);
router.post("/post/:id/unlike", auth, postsController.unlike);
router.post("/post/:id/comment", auth, postsController.createComment);
router.get("/post/:id/comment", auth, postsController.getComments);
router.get("/post/:id", auth, postsController.getOnePost);
router.post("/post", auth, upload.array("images", 5), postsController.create);
router.get("/post", postsController.getAll);
router.get("/user/:username/post", auth, postsController.getPosts);

// Auth routes
router.post("/user/login", usersController.login);
router.get("/health", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
