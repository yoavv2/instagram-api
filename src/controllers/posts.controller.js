const Post = require("../models/post.js");
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const mongoose = require("mongoose");
// const { ObjectId } = require("mongoose");

async function create(req, res) {
  const { body } = req.body;
  console.log("what", req);
  const arrayOfPaths = [];
  req.files.map((file) => {
    arrayOfPaths.push(file.filename);
  });
  const tempPost = {
    body,
    images: arrayOfPaths,
    author: req.userId,
  };
  const post = new Post(tempPost);
  try {
    const savedPost = await post.save();
    res.status(201).send(savedPost);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Could not save post" });
  }
}

async function getAll(req, res) {
  const allPosts = await Post.find({}).populate("author");
  res.json(allPosts);
}
async function getOnePost(req, res) {
  const { id } = req.params;

  const post = await Post.findById(id).populate("author");

  return res.json(post);
}

async function getPosts(req, res) {
  const { username } = req.params;
  const user = await User.findOne({ username });
  const posts = await Post.find({ author: user._id }).populate("author");
  res.send(posts);
}

async function like(req, res) {
  await Post.findByIdAndUpdate(req.params.id, {
    $addToSet: { likes: mongoose.Types.ObjectId(req.userId) },
  });
  res.sendStatus(200);
}

async function unlike(req, res) {
  await Post.findByIdAndUpdate(req.params.id, {
    $pull: { likes: mongoose.Types.ObjectId(req.userId) },
  });
  res.sendStatus(200);
}

async function createComment(req, res) {
  const comment = new Comment({
    author: req.userId,
    post: req.params.id,
    content: req.body.content,
  });

  try {
    console.log("comment", comment);
    let createdComment = await comment.save();
    createdComment = await Comment.findById(createdComment._id).populate(
      "author"
    );
    console.log(createdComment);

    res.json(createdComment);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
}

async function getComments(req, res) {
  const { id } = req.params;
  try {
    const comments = await Comment.find({ post: id }).populate("author");
    res.json(comments);
  } catch (e) {
    res.sendStatus(500);
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
