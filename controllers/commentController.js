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

module.exports = {
    hideComment,
    unhideComment
};
