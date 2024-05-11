const Comment = require("../../models/comment");
const Post = require("../../models/post");
const User = require("../../models/user");
const Report = require("../../models/report");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/comment");
jest.mock("../../models/post");
jest.mock("../../models/user");
jest.mock("../../models/report");

describe('reportComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValueOnce(null);
    const req = { userId: 'user123', body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await commentController.reportComment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });


  it('should return 200 if report is successfully created', async () => {
    User.findById.mockResolvedValueOnce({ blockUsers: [] }); 
    Comment.findById.mockResolvedValueOnce({ userId: 'user123', postId: 'post123' }); 
    User.findById.mockResolvedValueOnce({ _id: 'user123' }); 
    Post.findById.mockResolvedValueOnce({ subReddit: 'subReddit123' }); 
    Report.mockImplementation(() => ({ save: jest.fn() }));
    const req = { userId: 'user123', body: { commentId: 'comment123', title: 'title', description: 'description' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await commentController.reportComment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment reported successfully" });
  });
  it('should return 400 if title is empty', async () => {
    User.findById.mockResolvedValueOnce({ blockUsers: [] });
    Comment.findById.mockResolvedValueOnce({ userId: 'user123', postId: 'post123' });
    User.findById.mockResolvedValueOnce({ _id: 'user123' });
    Post.findById.mockResolvedValueOnce({ subReddit: 'subReddit123' });
    const req = { userId: 'user123', body: { commentId: 'comment123', title: '', description: 'description' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await commentController.reportComment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Title is required" });
  });
  
  it('should return 400 if description is empty', async () => {
    User.findById.mockResolvedValueOnce({ blockUsers: [] });
    Comment.findById.mockResolvedValueOnce({ userId: 'user123', postId: 'post123' });
    User.findById.mockResolvedValueOnce({ _id: 'user123' });
    Post.findById.mockResolvedValueOnce({ subReddit: 'subReddit123' });
    const req = { userId: 'user123', body: { commentId: 'comment123', title: 'title', description: '' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await commentController.reportComment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Description is required" });
  });
});