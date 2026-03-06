import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "@/feature/Userslice";
import axios from "axios";
import { toast } from "react-toastify";
import { Heart, MessageCircle, Share2 } from "lucide-react";

type Comment = {
    user: string;
    text: string;
};

type Post = {
    commentInput: string;
    _id: string;      // add this
    uid: string;
    //userId: string;
    name: string;
    profilePhoto?: string;
    postImage?: string;
    caption?: string;
    likes: string[];
    comments: Comment[];
    shares: number;
    showComments?: boolean; // for toggling comments
};

type User = {
    name: string;
    email: string;
    profilePhoto?: string;
};


const CommunityProfile = () => {
    const reduxUser = useSelector(selectuser);

    const [user, setUser] = useState<User | null>(null);
    const [profilePhoto, setProfilePhoto] = useState("/avatar.png");
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState<string | null>(null);
    const [friendCount, setFriendCount] = useState(0);


    useEffect(() => {
        if (!reduxUser) return;

        setUser({
            name: reduxUser.name,
            email: reduxUser.email,
            profilePhoto: reduxUser.photo,
        });

        setProfilePhoto(reduxUser.photo || "/avatar.png");
    }, [reduxUser]);

    useEffect(() => {
        if (!reduxUser?.uid) return;

        const fetchUserPosts = async () => {
            try {
                const res = await axios.get<Post[]>(`https://internshala-clone-xhqv.onrender.com/api/posts/user/${reduxUser.uid}`);
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };


        fetchUserPosts();
    }, [reduxUser]);

    useEffect(() => {
        if (!reduxUser?.uid) return;

        axios
            .get(`https://internshala-clone-xhqv.onrender.com/api/users/uid/${reduxUser.uid}`)
            .then((res: any)=> setFriendCount(res.data.friends.length))
            .catch(err => console.error(err));
    }, [reduxUser]);

    const handleNewPostImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPostImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const addNewPost = async () => {
        console.log("Redux user:", reduxUser); // Add this line

        if (!reduxUser?.uid) {
            alert("User not found. Please login again.");
            return;
        }
        if (!newPostContent && !newPostImage) return;

        try {
            // Ensure userId is valid ObjectId string
            const payload = {
                uid: reduxUser.uid,
                name: reduxUser.name || reduxUser.email,
                profilePhoto: reduxUser.photo || "/avatar.png",
                postImage: newPostImage || "",
                caption: newPostContent || "",
            };

            // POST request with proper typing
            const res = await axios.post<Post>("https://internshala-clone-xhqv.onrender.com/api/posts", payload);

            // Update UI immediately
            setPosts(prev => [res.data, ...prev]);

            // Reset inputs
            setNewPostContent("");
            setNewPostImage(null);
            toast.success("Post created successfully 🎉");

        } catch (err: any) {
            toast.error(
                err.response?.data?.error || "Post limit reached for today"
            );
            console.error("Post failed:", err.response?.data || err.message);
        }
    };


    const deletePost = async (_id: string) => {
        if (!confirm("Delete post?")) return;

        try {
            await axios.delete(`https://internshala-clone-xhqv.onrender.com/api/posts/${_id}`);
            setPosts(posts.filter(p => p._id !== _id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const toggleComments = (_id: string) => {
        setPosts(
            posts.map(post =>
                post._id === _id ? { ...post, showComments: !post.showComments } : post
            )
        );
    };

    if (!user) {
        return <p className="text-center mt-10">Please login first</p>;
    }

   const handleLike = async (_id: string) => {
  if (!reduxUser?.uid) return;

  try {
    const res : any = await axios.put(
      `https://internshala-clone-xhqv.onrender.com/api/posts/like/${_id}`,
      { userId: reduxUser.uid }
    );

    setPosts(posts.map(post =>
      post._id === _id
        ? { ...post, likes: res.data.likes }
        : post
    ));
  } catch (err) {
    console.error("Like failed", err);
  }
};


    const handleShare = async (_id: string) => {
        await axios.put(`https://internshala-clone-xhqv.onrender.com/api/posts/share/${_id}`);
        setPosts(posts.map(p =>
            p._id === _id ? { ...p, shares: p.shares + 1 } : p
        ));
    };

    const handleComment = async (_id: string, text: string) => {
        if (!text.trim()) return;

        const res = await axios.post<{ comments: Comment[] }>(
            `https://internshala-clone-xhqv.onrender.com/api/posts/comment/${_id}`,
            { user: reduxUser.name, text }
        );

        setPosts(posts.map(p =>
            p._id === _id
                ? { ...p, comments: res.data.comments, commentInput: "" }
                : p
        ));
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* PROFILE HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/avatar.png";
                    }}
                />
                <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="flex gap-4 text-sm mt-1 text-gray-600">
                        <span>👥 Friends: {friendCount}</span>
                        <span>📝 Posts: {posts.length}</span>
                    </div>
                </div>
            </div>

            {/* CREATE POST */}
            <div className="border p-4 rounded mb-6">
                <textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full border rounded p-2 mb-2"
                />
                {newPostImage && (
                    <img
                        src={newPostImage}
                        alt="Preview"
                        className="w-full max-h-60 object-cover rounded mb-2"
                    />
                )}
                <div className="flex items-center justify-between">
                    <label className="cursor-pointer text-blue-600">
                        Add image
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleNewPostImage}
                        />
                    </label>
                    <button
                        onClick={addNewPost}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                        Post
                    </button>
                </div>
            </div>

            {/* POSTS */}
            {posts.map(post => (
                <div key={post._id} className="border rounded p-4 mb-4">
                    {post.caption && <p className="mb-2">{post.caption}</p>}
                    {post.postImage && (
                        <img
                            src={post.postImage}
                            alt="Post"
                            className="w-full max-h-80 object-cover rounded mb-2"
                        />
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center gap-1 ${post.likes ? "text-red-500" : "text-gray-600"
                                }`}
                        >
                            <Heart size={18} fill={post.likes ? "red" : "none"} />
                            {post.likes.length}
                        </button>

                        <button
                            onClick={() => toggleComments(post._id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-blue-500"
                        >
                            <MessageCircle size={18} />
                            {post.comments.length}
                        </button>

                        <button
                            onClick={() => handleShare(post._id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-green-500"
                        >
                            <Share2 size={18} />
                            {post.shares}
                        </button>
                        <button
                            onClick={() => deletePost(post._id)}
                            className="text-red-500 hover:underline"
                        >
                            Delete
                        </button>
                    </div>



                    {/* COMMENTS */}
                    {post.showComments && (
                        <div className="mt-3">
                            {post.comments.map((c, i) => (
                                <p key={i} className="text-sm">
                                    <b>{c.user}:</b> {c.text}
                                </p>
                            ))}

                            <div className="flex gap-2 mt-2">
                                <input
                                    className="border rounded w-full px-2 py-1"
                                    placeholder="Write a comment..."
                                    value={post.commentInput || ""}
                                    onChange={e =>
                                        setPosts(posts.map(p =>
                                            p._id === post._id
                                                ? { ...p, commentInput: e.target.value }
                                                : p
                                        ))
                                    }
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleComment(post._id, post.commentInput || "");
                                        }
                                    }}
                                />
                                <button
                                    onClick={() =>
                                        handleComment(post._id, post.commentInput || "")
                                    }
                                    className="bg-blue-600 text-white px-4 rounded"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommunityProfile;