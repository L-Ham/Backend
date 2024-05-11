const User = require("../../models/user");
const userController = require("../../controllers/userController");


describe('editSocialLink', () => {
  it('should update the social link of the user and return the updated user', async () => {
    const userId = 'userId';
    const linkId = 'link1';
    const req = {
      userId,
      body: {
        linkId,
        linkOrUsername: 'updatedSocialLink',
        appName: 'updatedApp',
        displayText: 'Updated Social Link'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn(function() {
        return this;
      })
    };

    const user = {
      _id: 'userId',
      socialLinks: [
        { _id: 'link1', linkOrUsername: 'socialLink1', appName: 'app1', displayText: 'Social Link 1' },
        { _id: 'link2', linkOrUsername: 'socialLink2', appName: 'app2', displayText: 'Social Link 2' }
      ],
      save: jest.fn().mockImplementation(function() {
      
        this.socialLinks[0] = {
          _id: linkId, 
          linkOrUsername: 'updatedSocialLink',
          appName: 'updatedApp',
          displayText: 'Updated Social Link'
        };
        return this;
      })
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await userController.editSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.socialLinks[0]).toEqual({
      _id: linkId,
      linkOrUsername: 'updatedSocialLink',
      appName: 'updatedApp',
      displayText: 'Updated Social Link'
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Social link updated successfully',
      user
    });
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const linkId = 'validLinkId';
    const req = {
      userId,
      body: {
        linkId,
        linkOrUsername: 'updatedSocialLink',
        appName: 'updatedApp',
        displayText: 'Updated Social Link'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.editSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 404 status code if social link is not found', async () => {
    const userId = 'validUserId';
    const linkId = 'invalidLinkId';
    const req = {
      userId,
      body: {
        linkId,
        linkOrUsername: 'updatedSocialLink',
        appName: 'updatedApp',
        displayText: 'Updated Social Link'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      socialLinks: [
        { _id: 'link1', linkOrUsername: 'socialLink1', appName: 'app1', displayText: 'Social Link 1' },
        { _id: 'link2', linkOrUsername: 'socialLink2', appName: 'app2', displayText: 'Social Link 2' }
      ]
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await userController.editSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Social link not found' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const linkId = 'validLinkId';
    const req = {
      userId,
      body: {
        linkId,
        linkOrUsername: 'updatedSocialLink',
        appName: 'updatedApp',
        displayText: 'Updated Social Link'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await userController.editSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error updating social link for user',
      error: new Error('Database error')
    });
  });
});