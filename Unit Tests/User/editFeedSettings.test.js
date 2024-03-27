const User = require("../../models/user");
const userController = require("../../controllers/userController");

// Mocking User.findById and user.save functions
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('editFeedSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user feed settings and return success message', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
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
    };
    const user = {
      feedSettings: new Map(),
      save: jest.fn().mockResolvedValueOnce({}),
    };
    User.findById.mockResolvedValueOnce(user);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.feedSettings.get("showNSFW")).toBe(true);
    expect(user.feedSettings.get("blurNSFW")).toBe(false);
    expect(user.feedSettings.get("enableHomeFeedRecommendations")).toBe(true);
    expect(user.feedSettings.get("autoplayMedia")).toBe(false);
    expect(user.feedSettings.get("reduceAnimations")).toBe(true);
    expect(user.feedSettings.get("communityThemes")).toBe(false);
    expect(user.feedSettings.get("communityContentSort")).toBe('latest');
    expect(user.feedSettings.get("rememberPerCommunity")).toBe(true);
    expect(user.feedSettings.get("globalContentView")).toBe(true);
    expect(user.feedSettings.get("openPostsInNewTab")).toBe(false);
    expect(user.feedSettings.get("defaultToMarkdown")).toBe(false);
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "User Feed settings updated successfully",
      user: {},
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
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
    };
    User.findById.mockResolvedValueOnce(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
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
    };
    const errorMessage = 'Some error message';
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});