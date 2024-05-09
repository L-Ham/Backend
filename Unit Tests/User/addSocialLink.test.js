const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe('addSocialLink', () => {
  it('should add a social link to the user and return the updated user', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        linkOrUsername: 'socialLink1',
        appName: 'app1',
        displayText: 'Social Link 1'
      }
    };
    const res = {
      json: jest.fn()
    };

    const user = {
      socialLinks: []
    };

    User.findById = jest.fn().mockResolvedValue(user);
    user.save = jest.fn().mockResolvedValue(user);

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.socialLinks).toHaveLength(1);
    expect(user.socialLinks[0]).toEqual({
      linkOrUsername: 'socialLink1',
      appName: 'app1',
      displayText: 'Social Link 1'
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Social link added successfully',
      user
    });
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const req = {
      userId,
      body: {
        linkOrUsername: 'socialLink1',
        appName: 'app1',
        displayText: 'Social Link 1'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if maximum number of social links is reached', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        linkOrUsername: 'socialLink1',
        appName: 'app1',
        displayText: 'Social Link 1'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      socialLinks: [
        { linkOrUsername: 'link1', appName: 'app1', displayText: 'Link 1' },
        { linkOrUsername: 'link2', appName: 'app2', displayText: 'Link 2' },
        { linkOrUsername: 'link3', appName: 'app3', displayText: 'Link 3' },
        { linkOrUsername: 'link4', appName: 'app4', displayText: 'Link 4' },
        { linkOrUsername: 'link5', appName: 'app5', displayText: 'Link 5' }
      ]
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Maximum number of social links reached'
    });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        linkOrUsername: 'socialLink1',
        appName: 'app1',
        displayText: 'Social Link 1'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await userController.addSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error adding social link to user',
      error: new Error('Database error')
    });
  });
});