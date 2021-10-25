const { model, Schema } = require("mongoose");

const postSchema = new Schema({
  body: {
    type: String,
    required: true,
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
  image: {
    type: String,
  },
});

module.exports = model("Post", postSchema);
