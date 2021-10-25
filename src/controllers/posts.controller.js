const Post = require("../models/post.js");

async function create(req, res) {
  const { body } = req.body;
  console.log(`postcontroller`);
  const tempPost = {
    body,
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

module.exports = {
  create,
  getAll,
};
