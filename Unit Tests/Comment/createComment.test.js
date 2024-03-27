const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require("mongoose");
const Comment = require("../../models/comment");
const commentController = require("../../controllers/commentController");
const { ObjectId } = mongoose.Types;
User.findById = jest.fn();
Comment.findById = jest.fn();
Post.findById = jest.fn();
SubReddit.findById = jest.fn();


describe('createComment', () => {


  // Create a comment with an invalid postId
  it('should return an error message when creating a comment with an invalid postId', async () => {
    const req = {
      userId: 'validUserId',
      body: {
        postId: 'invalidPostId',
        text: 'validText'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue({ _id: 'validUserId' });
    Post.findById = jest.fn().mockResolvedValue(null);

    await commentController.createComment(req, res);

    expect(User.findById).toHaveBeenCalledWith('validUserId');
    expect(Post.findById).toHaveBeenCalledWith('invalidPostId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  // Create a comment with a locked post and non-moderator user
  it('should return an error message when creating a comment with a locked post and non-moderator user', async () => {
    const req = {
      userId: 'nonModeratorUserId',
      body: {
        postId: 'validPostId',
        text: 'validText'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };


    User.findById = jest.fn().mockResolvedValue({ _id: 'nonModeratorUserId' });
    Post.findById = jest.fn().mockResolvedValue({ _id: 'validPostId', subReddit: 'validSubRedditId', isLocked: true });
    SubReddit.findById = jest.fn().mockResolvedValue({ moderators: ['moderatorUserId'] });

    await commentController.createComment(req, res);

    expect(User.findById).toHaveBeenCalledWith('nonModeratorUserId');
    expect(Post.findById).toHaveBeenCalledWith('validPostId');
    expect(SubReddit.findById).toHaveBeenCalledWith('validSubRedditId');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Post is locked" });
  });

  // // Create a comment with valid postId, userId, text, and parentCommentId
  // it('should create a comment with valid postId, userId, text, and parentCommentId', async () => {
  //   const req = {
  //     userId: 'validUserId',
  //     body: {
  //       postId: 'validPostId',
  //       text: 'validText',
  //       parentCommentId: null,
  //       isHidden: false
  //     }
  //   };

  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn()
  //   };

  //   const comm = new Comment(
  //     {
  //       postId: 'validPostId',
  //       userId: 'validUserId',
  //       text: 'validText',
  //       parentCommentId: null,
  //       replies: [],
  //       votes: 0,
  //       isHidden: false
  //     }
  //   );

  //   await commentController.createComment(req, res);

  //   // expect(Comment).toHaveBeenCalledWith(comm);
  //   // expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({ message: "Comment created successfully" });
    
    
  // });


    
});