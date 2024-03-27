const Comment = require("../../models/comment");
const hideCommentController = require("../../controllers/commentController");

describe('hideComment', () => {
  it('should hide the comment when it exists and is not hidden', async(done) => {
    const req = {
      body: {
        commentId: 'comment123'
      }
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    const next = jest.fn();
    const comment = {
      _id: 'comment123',
      isHidden: false,
      save: jest.fn().mockResolvedValue(true)
    };
    Comment.findById = jest.fn().mockResolvedValue(comment);
  
    await hideCommentController.hideComment(req, res, next)
      .then(() => {
        expect(Comment.findById).toHaveBeenCalledWith('comment123');
        expect(comment.isHidden).toBe(true);
        expect(comment.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Comment hidden successfully" });
        done();
      });
  });
});