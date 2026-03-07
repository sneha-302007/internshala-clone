const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true }, // username of commenter
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // changed from ObjectId to string
  name: { type: String, required: true },
  profilePhoto: { type: String },
  postImage: { type: String,default:"" },
  caption: { type: String, trim: true},
 likes: [{ type: String }], 
  comments: [CommentSchema],
  shares: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);