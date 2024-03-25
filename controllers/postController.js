const Post = require("../models/post");
const User = require("../models/user");

const savePost = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }

            //const post = new Post(req.body.Post);
            user.savedPosts.push(req.body.Post);

            user.save()
                .then(() => {
                    res.status(200).json({ message: "Post saved successfully" });
                })
                .catch((error) => {
                    console.error("Error saving post:", error);
                    res.status(500).json({ message: "Error saving post" });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            res.status(500).json({ message: "Error finding user" });
        });
};


const unsavePost = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }

            const unsave = user.savedPosts.find((savedPosts) => savedPosts._id.equals(post_ID));
            if (!unsave) {
                console.error("This post is not saved in your profile:", req.body.Post);
                return res.status(404).json({ message: "This post is not saved in your profile" });
            }
            user.savedPosts.pull(req.body.Post);

            user.save()
                .then(() => {
                    res.status(200).json({ message: "Post saved successfully" });
                })
                .catch((error) => {
                    console.error("Error unsaving post:", error);
                    res.status(500).json({ message: "Error unsaving post" });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            res.status(500).json({ message: "Error finding user" });
        });
};

const hidePost = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }

            user.hidePosts.push(req.body.Post);

            user.save()
                .then(() => {
                    res.status(200).json({ message: "Post hidden successfully" });
                })
                .catch((error) => {
                    console.error("Error hidding post:", error);
                    res.status(500).json({ message: "Error hidding post" });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            res.status(500).json({ message: "Error finding user" });
        });
};

const unhidePost = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }

            const unhide = user.hidePosts.find((hidePost) => hidePost._id.equals(post_ID));
            if (!unsave) {
                console.error("This post is not hidden in your profile:", req.body.Post);
                return res.status(404).json({ message: "This post is not hidden in your profile" });
            }
            user.hidePosts.pull(req.body.Post);

            user.save()
                .then(() => {
                    res.status(200).json({ message: "Post hidden successfully" });
                })
                .catch((error) => {
                    console.error("Error unhidding post:", error);
                    res.status(500).json({ message: "Error unhidding post" });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            res.status(500).json({ message: "Error finding user" });
        });
};

module.exports = {
    savePost,
    unsavePost,
    hidePost,
    unhidePost,
};
