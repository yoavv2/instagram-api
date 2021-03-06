const { model, Schema } = require("mongoose");

const postSchema = new Schema({
  body: {
    type: String,
  },
  likes: {
    type: Array,
    default: () => [],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  comments: {
    type: Array,
    default: () => [],
  },
  images: {
    type: Array,
    default: () => [],
    required: true,
  },
});

module.exports = model("Post", postSchema);
