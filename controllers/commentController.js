const Comment = require("../models/comment");

const hideComment = (req, res, next) => {
    const { commentId } = req.params;
    Comment.findById(commentId)
        .then(comment => {
            if (!comment) {
                return res.status(404).send("Comment not found");
            }
            if (comment.isHidden) {
                return res.status(200).send("Comment is already hidden");
            }
            comment.isHidden = true;
            return comment.save();
        })
        .then(() => {
            res.status(200).send("Comment hidden successfully");
        })
        .catch(err => {
            console.error(err);
            res.status(400).send("Could not hide comment");
        });
};

const unhideComment = (req, res, next) => {
    const { commentId } = req.params;
    Comment.findById(commentId)
        .then(comment => {
            if (!comment) {
                return res.status(404).send("Comment not found");
            }
            if (!comment.isHidden) {
                return res.status(200).send("Comment is already unhidden");
            }
            comment.isHidden = false;
            return comment.save();
        })
        .then(() => {
            res.status(200).send("Comment unhidden successfully");
        })
        .catch(err => {
            console.error(err);
            res.status(400).send("Could not unhide comment");
        });
}

const createComment = (req, res) => {
    const userId = req.body.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }
            const comment = new Comment({
                text: req.body.text,
                parentCommentId: req.body.parentCommentId,
                votes: 0,
                isHidden: req.body.isHidden,
            });
            comment.save()
                .then((savedComment) => {
                    user.comments.push(savedComment._id);
                    user
                        .save()
                        .then((savedUser) => {
                            console.log("Comment attached to user: ", savedUser);
                            res.json({
                                message: "Comment Created successfully",
                                savedComment,
                            });
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(400).send("Could not attach comment to the user");
                        });
                })
                .catch((err) => {
                    console.error("Error Creating Comment:", err);
                    res.status(500).json({ message: "Error Creating Comment", error: err });
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
