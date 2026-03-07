const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");
const User = require("../Model/User");


// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // newest first
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post("/", async (req, res) => {
  try {
    const { uid, name, profilePhoto, postImage, caption } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "uid is required" });
    }

    // 1️⃣ Get user & friend count
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

   const friendCount = user.friends ? user.friends.length : 0;
console.log("FRIEND COUNT:", friendCount); // DEBUG

    // 2️⃣ Decide daily post limit
    let dailyLimit = 1; // default

    if (friendCount >= 2 && friendCount < 10) {
      dailyLimit = 2;
    } else if (friendCount >= 10) {
      dailyLimit = Infinity; // unlimited
    }

    // 3️⃣ Check today's posts (only if limited)
    if (dailyLimit !== Infinity) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayPostCount = await Post.countDocuments({
        uid,
        createdAt: { $gte: startOfDay }
      });

      if (todayPostCount >= dailyLimit) {
        return res.status(403).json({
          error: `Daily post limit reached (${dailyLimit}/day). Add more friends to post more!`
        });
      }
    }

    // 4️⃣ Create post
    const newPost = new Post({
      uid,
      name,
      profilePhoto,
      postImage,
      caption
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a post (increment likes)
router.put("/like/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let liked;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
      liked = false;
    } else {
      post.likes.push(userId);
      liked = true;
    }

    await post.save();

    res.json({
      liked,
      likes: post.likes,
    });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Like failed" });
  }
});



// Share a post (increment shares)
router.put("/share/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.shares += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment
router.post("/comment/:id", async (req, res) => {
  try {
    const { user, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ user, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get posts by a specific user (for profile page)
router.get("/user/:uid", async (req, res) => {
  try {
    const posts = await Post.find({ uid: req.params.uid })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});


module.exports = router;