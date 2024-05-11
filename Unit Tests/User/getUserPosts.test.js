const User = require("../../models/user");
const Post = require("../../models/post");
const SubReddit = require("../../models/subReddit");
const UserServices = require("../../services/userServices");
const PostServices = require("../../services/postServices");
const userController = require("../../controllers/userController");

jest.mock("../../models/user");
jest.mock("../../models/post");
jest.mock("../../models/subReddit");
jest.mock("../../services/userServices");
jest.mock("../../services/postServices");

describe('getUserPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    const req = { query: { username: 'user123', page: 1, limit: 10 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUserPosts(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: req.query.username });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 if no posts are found', async () => {
    const user = { _id: 'user123', savedPosts: [] };
    User.findOne.mockResolvedValueOnce(user);
    UserServices.paginateResults.mockResolvedValueOnce({ slicedArray: [] });

    const req = { query: { username: 'user123', page: 1, limit: 10 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUserPosts(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: req.query.username });
    expect(UserServices.paginateResults).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'The retrieved array is empty' });
  });

  it('should return user posts if found', async () => {
    const user = { _id: 'user123', savedPosts: [] };
    const post = { _doc: {}, upvotedUsers: [], downvotedUsers: [], images: [], videos: [] };
    const subreddit = { name: 'subreddit1' };
    User.findOne.mockResolvedValueOnce(user);
    UserServices.paginateResults.mockResolvedValueOnce({ slicedArray: [post] });
    SubReddit.findById.mockResolvedValueOnce(subreddit);
    PostServices.getImagesUrls.mockResolvedValueOnce([]);
    PostServices.getVideosUrls.mockResolvedValueOnce([]);

    const req = { query: { username: 'user123', page: 1, limit: 10 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUserPosts(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: req.query.username });
    expect(UserServices.paginateResults).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should handle server error', async () => {
    const errorMessage = 'Some error message';
    User.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const req = { query: { username: 'user123', page: 1, limit: 10 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUserPosts(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: req.query.username });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Getting User\'s Posts', error: errorMessage });
});

});