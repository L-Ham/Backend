const User = require("../../models/user");
const userController = require("../../controllers/userController");

// Mocking User.findById function
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('viewFeedSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user feed settings', async () => {
    const userId = 'user123';
    const user = {
      feedSettings: new Map([
        ['showNSFW', true],
        ['blurNSFW', false],
        ['enableHomeFeedRecommendations', true],
        ['autoplayMedia', false],
        ['reduceAnimations', true],
        ['communityThemes', false],
        ['communityContentSort', 'latest'],
        ['rememberPerCommunity', true],
        ['globalContentView', true],
        ['openPostsInNewTab', false],
        ['defaultToMarkdown', false],
      ]),
    };
    User.findById.mockResolvedValueOnce(user);

    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.viewFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({
      feedSettings: {
        showNSFW: true,
        blurNSFW: false,
        enableHomeFeedRecommendations: true,
        autoplayMedia: false,
        reduceAnimations: true,
        communityThemes: false,
        communityContentSort: 'latest',
        rememberPerCommunity: true,
        globalContentView: true,
        openPostsInNewTab: false,
        defaultToMarkdown: false,
      },
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

    await userController.viewFeedSettings(req, res);

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

    await userController.viewFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});