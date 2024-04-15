const User = require("../../models/user");
const userController = require("../../controllers/userController");
const mongoose = require('mongoose');

describe('deleteSocialLink', () => {
    it('should delete the social link of the user and return the updated user', async () => {
      const userId = new mongoose.Types.ObjectId(123456789012);
      const linkId = 'link1';
      const req = {
        userId,
        body: {
          socialLinkId: linkId
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
          this.socialLinks = this.socialLinks.filter(link => link._id !== linkId);
          return Promise.resolve(this);
        })
      };
      
      user.socialLinks.pull = jest.fn().mockImplementation(function(linkToRemove) {
        this.splice(this.indexOf(linkToRemove), 1);
      });
      
      User.findById = jest.fn().mockImplementation((id) => {
        if (id === userId) {
          return Promise.resolve(user);
        } else {
          return Promise.resolve(null);
        }
      });
      await userController.deleteSocialLink(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Social link deleted successfully',
        user
      });
    });
  
    it('should return a 404 status code if user is not found', async () => {
      const userId = 'invalidUserId';
      const linkId = 'validLinkId';
      const req = {
        userId,
        body: {
          socialLinkId: linkId
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockResolvedValue(null);
  
      await userController.deleteSocialLink(req, res);
  
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
          socialLinkId: linkId
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
  
      await userController.deleteSocialLink(req, res);
  
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
          socialLinkId: linkId
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockRejectedValue(new Error('Database error'));
  
      await userController.deleteSocialLink(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error deleting social link from user',
        error: new Error('Database error')
      });
    });
  });