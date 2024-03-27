const User = require("../../models/user");
const userController = require("../../controllers/userController");
const { before, beforeEach } = require("node:test");
// Mocking request and response objects
const req = {
  userId: 'user123',
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
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

// Mocking User.findById and user.save functions
jest.mock('../../models/user', () => ({
  findById: jest.fn(),
  JSON: jest.fn(),
}));

describe('editFeedSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should update user feed settings and return success message', async () => {
    const user = {
      feedSettings: new Map(),
    };
    User.findById.mockResolvedValueOnce(user);
    user.save = jest.fn().mockResolvedValue(user);
    await userController.editFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(user.feedSettings.get('showNSFW')).toBe(true);
    expect(user.feedSettings.get('blurNSFW')).toBe(false);
    expect(user.feedSettings.get('enableHomeFeedRecommendations')).toBe(true);
    expect(user.feedSettings.get('autoplayMedia')).toBe(false);
    expect(user.feedSettings.get('reduceAnimations')).toBe(true);
    expect(user.feedSettings.get('communityThemes')).toBe(false);
    expect(user.feedSettings.get('communityContentSort')).toBe('latest');
    expect(user.feedSettings.get('rememberPerCommunity')).toBe(true);
    expect(user.feedSettings.get('globalContentView')).toBe(true);
    expect(user.feedSettings.get('openPostsInNewTab')).toBe(false);
    expect(user.feedSettings.get('defaultToMarkdown')).toBe(false);
    expect(user.save).toHaveBeenCalled();

  });

  it('should handle error if user is not found', async () => {
    User.findById.mockResolvedValueOnce(null);

    await userController.editFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  // it('should handle error if user feed settings update fails', async () => {
  //   const user = {
  //     feedSettings: {
  //       set: jest.fn(),
  //     },
  //     save: jest.fn().mockRejectedValue(new Error('Server error')),
  //   };
  //   User.findById = jest.fn().mockResolvedValue(user);
  
  //   await userController.editFeedSettings(req, res);
  
  //   expect(User.findById).toHaveBeenCalledWith('user123');
  //   expect(user.save).toHaveBeenCalled();
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  // });

  it('should handle error if user retrieval fails', async () => {
    User.findById.mockRejectedValue(new Error('Server error'));

    await userController.editFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});