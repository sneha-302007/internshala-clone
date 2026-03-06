import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Search as SearchIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";

type Comment = {
  user: string;
  text: string;
};

type PostFromBackend = {
  _id: string; // MongoDB ID
  uid: string;
  name: string;
  profilePhoto: string;
  postImage?: string;
  caption?: string;
  likes: string[];
  shares: number;
  comments: Comment[];
};

type Post = PostFromBackend & {
  postId: string; // frontend ID mapped from _id
  liked: boolean; // frontend-only
  newComment: string; // frontend-only
  showCommentInput: boolean; // frontend-only
};

const Feed: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const reduxUser = useSelector(selectuser);
  const userId = reduxUser?.uid;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get<PostFromBackend[]>(
          "https://internshala-clone-xhqv.onrender.com/api/posts",
        );
        const backendPosts: Post[] = res.data.map((p) => ({
          ...p,
          postId: p._id,
          liked: userId ? p.likes.includes(userId) : false,
          newComment: "",
          showCommentInput: false,
        }));
        setPosts(backendPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  // Handlers
  const handleLike = async (id: string) => {
    if (!userId) return;

    const res: any = await axios.put(
      `https://internshala-clone-xhqv.onrender.com/api/posts/like/${id}`,
      { userId },
    );

    setPosts(
      posts.map((post) =>
        post.postId === id
          ? {
              ...post,
              liked: res.data.liked,
              likes: res.data.likes,
            }
          : post,
      ),
    );
  };

  const handleShare = async (id: string) => {
    try {
      await axios.put<{ message: string }>(
        `https://internshala-clone-xhqv.onrender.com/api/posts/share/${id}`,
      );
      setPosts(
        posts.map((post) =>
          post.postId === id ? { ...post, shares: post.shares + 1 } : post,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentPost = async (id: string) => {
    const post = posts.find((p) => p.postId === id);
    if (!post || post.newComment.trim() === "") return;

    try {
      const res = await axios.post<{ comments: Comment[] }>(
        `https://internshala-clone-xhqv.onrender.com/api/posts/comment/${id}`,
        {
          user: "You",
          text: post.newComment,
        },
      );

      setPosts(
        posts.map((p) =>
          p.postId === id
            ? { ...p, comments: res.data.comments, newComment: "" }
            : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openProfile = (uid: string) => {
    router.push(`/community/profile/${uid}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Left: Feed */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Community Feed</h2>
          </div>

          {posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white rounded-xl shadow-md p-4"
            >
              {/* User Info */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (!post.uid) {
                    console.error("Post UID missing", post);
                    return;
                  }
                  openProfile(post.uid);
                }}
              >
                <img
                  src={post.profilePhoto}
                  alt="profile"
                  className="w-10 h-10 rounded-full border"
                />
                <p className="font-semibold">{post.name}</p>
              </div>

              {/* Post Image */}
              {post.postImage && (
                <img
                  src={post.postImage}
                  alt="post"
                  className="w-full rounded-lg mt-4"
                />
              )}

              {/* Caption */}
              <p className="mt-3 text-gray-700">{post.caption}</p>

              {/* Actions */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleLike(post.postId)}
                  className={`flex items-center gap-1 transition ${
                    post.liked ? "text-red-500" : "text-gray-600"
                  }`}
                >
                  <Heart size={18} fill={post.liked ? "red" : "none"} />
                  <span>{post.likes.length}</span>
                </button>

                <button
                  onClick={() =>
                    setPosts(
                      posts.map((p) =>
                        p.postId === post.postId
                          ? { ...p, showCommentInput: !p.showCommentInput }
                          : p,
                      ),
                    )
                  }
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-500"
                >
                  <MessageCircle size={18} />
                  {post.comments.length}
                </button>

                <button
                  onClick={() => handleShare(post.postId)}
                  className="flex items-center gap-1 text-gray-600 hover:text-green-500"
                >
                  <Share2 size={18} />
                  {post.shares}
                </button>
              </div>

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {post.comments.map((c, index) => (
                    <p key={index} className="text-sm text-gray-700">
                      <span className="font-semibold">{c.user}:</span> {c.text}
                    </p>
                  ))}
                </div>
              )}

              {/* Inline Comment Input */}
              {post.showCommentInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={post.newComment}
                    onChange={(e) =>
                      setPosts(
                        posts.map((p) =>
                          p.postId === post.postId
                            ? { ...p, newComment: e.target.value }
                            : p,
                        ),
                      )
                    }
                    placeholder="Write a comment..."
                    className="flex-1 border rounded px-3 py-1 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCommentPost(post.postId)}
                    className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Sticky Profile & Search */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-2">
              <SearchIcon size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Find a friend"
                className="w-full border-none focus:ring-0 outline-none text-gray-700"
              />
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center">
              <img
                src="/user-you.jpg"
                alt="profile"
                className="w-16 h-16 rounded-full border mb-2"
              />
              <p className="font-semibold">Your Profile</p>
              <button
                onClick={() => router.push("/community/profile")}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
