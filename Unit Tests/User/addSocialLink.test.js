const User = require("../../models/user");
const userController = require("../../controllers/userController");

// Mocking User.findById function
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('addSocialLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a social link to the user and return the updated user', async () => {
    const req = {
      userId: 'user123',
      body: {
        linkOrUsername: 'https://example.com',
        appName: 'Example App',
        logo: 'example.png',
        displayText: 'Visit Example App'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      _id: 'user123',
      socialLinks: []
    };

    User.findById.mockResolvedValueOnce(user);
    user.save = jest.fn().mockResolvedValueOnce(user);

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(user.socialLinks.length).toBe(1);
    expect(user.socialLinks[0]).toEqual({
      linkOrUsername: 'https://example.com',
      appName: 'Example App',
      logo: 'example.png',
      displayText: 'Visit Example App'
    });
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Social link added successfully',
      user: user
    });
  });

  it('should return 404 if user is not found', async () => {
    const req = {
      userId: 'user123',
      body: {
        linkOrUsername: 'https://example.com',
        appName: 'Example App',
        logo: 'example.png',
        displayText: 'Visit Example App'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValueOnce(null);

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 400 if maximum number of social links is reached', async () => {
    const req = {
      userId: 'user123',
      body: {
        linkOrUsername: 'https://example.com',
        appName: 'Example App',
        logo: 'example.png',
        displayText: 'Visit Example App'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      _id: 'user123',
      socialLinks: [
        { linkOrUsername: 'https://link1.com', appName: 'App 1', logo: 'logo1.png', displayText: 'Visit App 1' },
        { linkOrUsername: 'https://link2.com', appName: 'App 2', logo: 'logo2.png', displayText: 'Visit App 2' },
        { linkOrUsername: 'https://link3.com', appName: 'App 3', logo: 'logo3.png', displayText: 'Visit App 3' },
        { linkOrUsername: 'https://link4.com', appName: 'App 4', logo: 'logo4.png', displayText: 'Visit App 4' },
        { linkOrUsername: 'https://link5.com', appName: 'App 5', logo: 'logo5.png', displayText: 'Visit App 5' }
      ]
    };

    User.findById.mockResolvedValueOnce(user);

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Maximum number of social links reached' });
  });

  it('should handle server error', async () => {
    const req = {
      userId: 'user123',
      body: {
        linkOrUsername: 'https://example.com',
        appName: 'Example App',
        logo: 'example.png',
        displayText: 'Visit Example App'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Some error message';
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error adding social link to user', error: new Error(errorMessage) });
  });
});