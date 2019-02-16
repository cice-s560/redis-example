const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: String,
  title: String,
  body: String
});

module.exports = new mongoose.model("Post", PostSchema);
