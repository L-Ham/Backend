const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");

const hideComment = (req, res, next) => {
    const { commentId } = req.body;
    console.log("Hiding comment with ID:", commentId);
    Comment.findById(commentId)
        .then(comment => {
            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return null;
            }
            if (comment.isHidden) {
                res.status(200).json({ message: "Comment is already hidden" });
                return null;
            }
            comment.isHidden = true;
            return comment.save();
        })
        .then((result) => {
            if(result) {
                res.status(200).json({ message: "Comment hidden successfully" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ message: "Could not hide comment" });
        });
};
const unhideComment = (req, res, next) => {
    const { commentId } = req.body;
    console.log("Unhiding comment with ID:", commentId);
    Comment.findById(commentId)
        .then(comment => {
            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return null;
            }
            if (!comment.isHidden) {
                res.status(200).json({ message: "Comment is already visible" });
                return null;
            }
            comment.isHidden = false;
            return comment.save();
        })
        .then((result) => {
            if(result) {
                res.status(200).json({ message: "Comment unhidden successfully" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ message: "Could not unhide comment" });
        });
};

const createComment = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }
            Post.findById(req.body.postId).then((post) => {
                if (!post) {
                    console.error("Post not found for post ID:", req.body.postId);
                    return res.status(404).json({ message: "Post not found" });
                }
                const comment = new Comment({
                    postId: req.body.postId,
                    userId: userId,
                    text: req.body.text,
                    parentCommentId: req.body.parentCommentId,
                    replies: [],
                    votes: 0,
                    isHidden: req.body.isHidden,
                });
                comment.save()
                    .then((savedComment) => {
                        if (req.body.parentCommentId != null) {
                            Comment.findById(req.body.parentCommentId).then((parentComment) => {
                                if (!parentComment) {
                                    console.error("Parent Comment not found for comment ID:", req.body.parentCommentId);
                                    return res.status(404).json({ message: "Parent Comment not found" });
                                }
                                parentComment.replies.push(savedComment);
                                parentComment.save().then((savedParentComment) => {
                                    console.log("Comment attached to parent comment: ", savedParentComment);
                                    post.replies.push(savedComment._id);
                                    post.save().then((savedPost) => {
                                        console.log("Comment attached to post: ", savedPost);
                                        user.comments.push(savedComment._id);
                                        user.save().then((savedUser) => {
                                            console.log("Comment attached to user: ", savedUser);
                                            res.json({
                                                message: "Comment Created successfully",
                                                savedComment,
                                            });
                                        }).catch(err => {
                                            console.error(err);
                                            res.status(400).send("Could not attach comment to the user");
                                        });
                                    }).catch((err) => {
                                        console.error(err);
                                        res.status(400).send("Could not attach comment to the post");
                                    });
                                }).catch((err) => {
                                    console.error(err);
                                    res.status(400).send("Could not attach comment to the parent comment");
                                });
                            }).catch((err) => {
                                console.error("Error retrieving parent comment:", err);
                                res.status(500).json({ message: "Error Retrieving Parent Comment", error: err });
                            });
                        } else {
                            post.replies.push(savedComment._id);
                            post.save().then((savedPost) => {
                                console.log("Comment attached to post: ", savedPost);
                                user.comments.push(savedComment._id);
                                user.save().then((savedUser) => {
                                    console.log("Comment attached to user: ", savedUser);
                                    res.json({
                                        message: "Comment Created successfully",
                                        savedComment,
                                    });
                                }).catch(err => {
                                    console.error(err);
                                    res.status(400).send("Could not attach comment to the user");
                                });
                            }).catch((err) => {
                                console.error(err);
                                res.status(400).send("Could not attach comment to the post");
                            });
                        }
                    })
                    .catch((err) => {
                        console.error("Error Creating Comment:", err);
                        res.status(500).json({ message: "Error Creating Comment", error: err });
                    });
            }).catch((err) => {
                console.error("Error retrieving post:", err);
                res.status(500).json({ message: "Error Retrieving Post", error: err });
            });
        })
        .catch((err) => {
            console.error("Error retrieving user:", err);
            res.status(500).json({ message: "Error Retrieving User", error: err });
        });
};


module.exports = {
    hideComment,
    unhideComment,
    createComment,
};
