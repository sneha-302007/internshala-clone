import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";

/* ---------------- TYPES ---------------- */

type BackendUser = {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  friends: string[];
};

type Comment = {
  user: string;
  text: string;
};

type Post = {
  _id: string;
  caption?: string;
  postImage?: string;
  likes: string[];
  comments: Comment[];
  shares: number;
};

/* ---------------- COMPONENT ---------------- */

const OtherUserProfile = () => {
  const router = useRouter();
  const reduxUser = useSelector(selectuser);

  const { uid } = router.query;

  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFriend, setIsFriend] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ---------------- HELPERS ---------------- */

  const getProfileUid = () =>
    Array.isArray(uid) ? uid[0] : uid;

  /* ---------------- FETCH USER PROFILE ---------------- */

  useEffect(() => {
    if (!router.isReady || !reduxUser?.uid) return;

    const profileUid = getProfileUid();
    if (!profileUid) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
console.log("PROFILE UID SENT TO API:", profileUid);

        const res = await axios.get<BackendUser>(
          `https://internshala-clone-xhqv.onrender.com/api/users/uid/${profileUid}`
        );

        setProfile(res.data);
        setFriendCount(res.data.friends.length);
        setIsFriend(res.data.friends.includes(reduxUser.uid));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router.isReady, uid, reduxUser]);

  /* ---------------- FETCH USER POSTS ---------------- */

  useEffect(() => {
    if (!router.isReady) return;

    const profileUid = getProfileUid();
    if (!profileUid) return;

    const fetchUserPosts = async () => {
      try {
        const res = await axios.get<Post[]>(
          `https://internshala-clone-xhqv.onrender.com/api/posts/user/${profileUid}`
        );
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }
    };

    fetchUserPosts();
  }, [router.isReady, uid]);

  /* ---------------- FRIEND ACTIONS ---------------- */

  const addFriend = async () => {
    const profileUid = getProfileUid();
    if (!profileUid) return;

    try {
      await axios.put(
        `https://internshala-clone-xhqv.onrender.com/api/users/add-friend/${reduxUser.uid}`,
        { friendUid: profileUid }
      );

      setIsFriend(true);
      setFriendCount(prev => prev + 1);
    } catch (err) {
      console.error("Add friend failed", err);
    }
  };

  const removeFriend = async () => {
    const profileUid = getProfileUid();
    if (!profileUid) return;

    try {
      await axios.put(
        `https://internshala-clone-xhqv.onrender.com/api/users/remove-friend/${reduxUser.uid}`,
        { friendUid: profileUid }
      );

      setIsFriend(false);
      setFriendCount(prev => prev - 1);
    } catch (err) {
      console.error("Remove friend failed", err);
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-center mt-10">User not found</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={profile.profilePhoto || "/default-avatar.png"}
          className="w-16 h-16 rounded-full object-cover"
          alt="Profile"
        />

        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-gray-500">{profile.email}</p>

          <div className="flex gap-4 text-sm mt-1 text-gray-600">
            <span>👥 Friends: {friendCount}</span>
            <span>📝 Posts: {posts.length}</span>
          </div>

          {!isFriend ? (
            <button
              onClick={addFriend}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add Friend
            </button>
          ) : (
            <button
              onClick={removeFriend}
              className="mt-2 bg-gray-300 text-gray-800 px-3 py-1 rounded"
            >
              Remove Friend
            </button>
          )}
        </div>
      </div>

      {/* POSTS */}
      {posts.map(post => (
        <div key={post._id} className="border rounded p-4 mb-4">
          {post.caption && <p>{post.caption}</p>}
          {post.postImage && (
            <img
              src={post.postImage}
              className="rounded mt-2"
              alt="Post"
            />
          )}
          <div className="text-sm text-gray-500 mt-2">
            ❤️ {post.likes.length} · 💬 {post.comments.length} · 🔄 {post.shares}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OtherUserProfile;
