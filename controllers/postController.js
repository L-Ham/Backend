const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");

const createPost = (req, res, next) => {
    const userId = req.userId;
    const subRedditId = req.body.subreddit;
    console.log("subRedditId", subRedditId);

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }
            if (!subRedditId) {
                return createPostUnderUser(user);
            } else {
                return SubReddit.findById(subRedditId)
                    .then(subReddit => {
                        if (!subReddit) {
                            console.error("Subreddit not found for subreddit ID:", subRedditId);
                            return createPostUnderUser(user);
                        } else {
                            return createPostUnderSubReddit(subReddit);
                        }
                    });
            }
        })
        .then(() => {
            res.status(200).json({ message: "Post created successfully" });
        })
        .catch((error) => {
            console.error("Error creating post:", error);
            res.status(500).json({ message: "Error creating post" });
        });

    function createPostUnderUser(user) {
        const newPost = new Post({
            user: userId,
            title: req.body.title,
            content: req.body.content,
            type: req.body.type,
            isNSFW: req.body.isNSFW || false,
            isSpoiler: req.body.isSpoiler || false,
            isLocked: req.body.isLocked || false,
            isOc: req.body.isOc || false,
            votes: 0,
            views: 0,
            commentCount: 0,
            spamCount: 0,
            poll: req.body.poll ? {
                options: req.body.poll.options || [],
                votingLength: req.body.poll.votingLength || 0,
                voters: [],
                startTime: req.body.poll.startTime || null,
                endTime: req.body.poll.endTime || null,
            } : {}
        });
        user.posts.push(newPost);
        console.log("user posts", user.posts)
        return Promise.all([newPost.save(), user.save()]);
    }

    function createPostUnderSubReddit(subReddit) {
        const newPost = new Post({
            user: userId,
            subReddit: subRedditId,
            title: req.body.title,
            content: req.body.content,
            type: req.body.type,
            isNSFW: req.body.isNSFW || false,
            isSpoiler: req.body.isSpoiler || false,
            isLocked: req.body.isLocked || false,
            isOc: req.body.isOc || false,
            votes: 0,
            views: 0,
            commentCount: 0,
            spamCount: 0,
            poll: req.body.poll ? {
                options: req.body.poll.options || [],
                votingLength: req.body.poll.votingLength || 0,
                voters: [],
                startTime: req.body.poll.startTime || null,
                endTime: req.body.poll.endTime || null,
            } : {}
        });
        subReddit.posts.push(newPost);
        console.log("subreddit posts", subReddit.posts)
        return Promise.all([newPost.save(), subReddit.save()]);
    }
}
const editPost = (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.userId;

    Post.findById(postId)
        .then((post) => {
            if (!post) {
                console.error("Post not found for post ID:", postId);
                return res.status(404).json({ message: "Post not found" });
            }

            if (post.user.toString() !== userId) {
                console.error("User not authorized to edit post");
                return res.status(401).json({ message: "User not authorized to edit post" });
            }

            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;
            post.type = req.body.type || post.type;
            post.isNSFW = req.body.isNSFW || post.isNSFW;
            post.isSpoiler = req.body.isSpoiler || post.isSpoiler;
            post.isLocked = req.body.isLocked || post.isLocked;
            post.isOc = req.body.isOc || post.isOc;
            post.poll = req.body.poll || post.poll;

            post.save()
                .then(() => {
                    res.status(200).json({ message: "Post updated successfully" });
                })
                .catch((error) => {
                    console.error("Error updating post:", error);
                    res.status(500).json({ message: "Error updating post" });
                });
        })
        .catch((error) => {
            console.error("Error finding post:", error);
            res.status(500).json({ message: "Error finding post" });
        });
};

const savePost = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }

            //const post = new Post(req.body.Post);
            user.savedPost.push(req.body.Post);

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

module.exports = {
    savePost,
    createPost,
    editPost
};
