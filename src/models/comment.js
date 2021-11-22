const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentScheme = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

const Comment = mongoose.model("comment", commentScheme);

module.exports = Comment;
