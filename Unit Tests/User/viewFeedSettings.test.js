const User = require("../../models/user");
const userController = require("../../controllers/userController");

// Mocking request and response objects
const req = {
  userId: 'user123',
};
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

// Mocking User.findById function
jest.mock('../../models/user', () => ({
  findById: jest.fn(),
}));

describe('viewFeedSettings', () => {
  it('should return user feed settings', async () => {
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

    await userController.viewFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
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
    User.findById.mockResolvedValueOnce(null);

    await userController.viewFeedSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });


});