const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const postController = require("../../controllers/postController");
const mongoose = require('mongoose');

describe('removePost', () => {


    it('should return a 404 status code if post is not found', async () => {
      const req = {
        body: { postId: 'nonexistentPostId', type: 'reported' },
        userId: 'validUserId'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Post.findById = jest.fn().mockResolvedValue(null);

      await postController.removePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    });

    it('should return a 404 status code if user is not found', async () => {
      const post = { _id: 'postId', disapproved: false, save: jest.fn() };

      const req = {
        body: { postId: post._id, type: 'reported' },
        userId: 'nonexistentUserId'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Post.findById = jest.fn().mockResolvedValue(post);
      User.findById = jest.fn().mockResolvedValue(null);

      await postController.removePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it('should return a 401 status code if user is not authorized to remove post', async () => {
      const post = { _id: 'postId', disapproved: false, save: jest.fn() };
      const user = { _id: 'userId' };
      const subReddit = { moderators: [], posts: ['postId'], removedPosts: [], save: jest.fn() };

      const req = {
        body: { postId: post._id, type: 'reported' },
        userId: user._id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Post.findById = jest.fn().mockResolvedValue(post);
      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findById = jest.fn().mockResolvedValue(subReddit);

      await postController.removePost(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "User not authorized to remove post" });
    });

    it('should return a 400 status code if post is already removed', async () => {
      const post = { _id: 'postId', disapproved: true, save: jest.fn() };
      const user = { _id: 'userId' };
      const subReddit = { moderators: ['userId'], posts: ['postId'], removedPosts: [], save: jest.fn() };

      const req = {
        body: { postId: post._id, type: 'reported' },
        userId: user._id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Post.findById = jest.fn().mockResolvedValue(post);
      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findById = jest.fn().mockResolvedValue(subReddit);

      await postController.removePost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Post already removed" });
    });

    it('should return a 500 status code if an error occurs', async () => {
      const req = {
        body: { postId: 'postId', type: 'reported' },
        userId: 'validUserId'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Post.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await postController.removePost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error removing post", error: 'Database error' });
    });
  });
