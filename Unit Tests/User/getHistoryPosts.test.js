const User = require("../../models/user");
const Post = require("../../models/post");
const userController = require("../../controllers/userController");

jest.mock("../../models/user");
jest.mock("../../models/post");

describe('getHistoryPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user history posts', async () => {
    const userId = 'user123';
    const user = {
      historyPosts: ['post1', 'post2', 'post3'],
    };
    const posts = [
      { id: 'post1', title: 'Post 1' },
      { id: 'post2', title: 'Post 2' },
      { id: 'post3', title: 'Post 3' },
    ];
    User.findById.mockResolvedValueOnce(user);
    Post.find.mockResolvedValueOnce(posts);

    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getHistoryPosts(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(Post.find).toHaveBeenCalledWith({ _id: { $in: user.historyPosts } });
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved User's History Posts",
      historyPosts: posts,
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    User.findById.mockResolvedValueOnce(null);

    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getHistoryPosts(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const errorMessage = 'Some error message';
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getHistoryPosts(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Getting Posts in User History', error: errorMessage });
  });
});