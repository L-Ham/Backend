const { createCommunity } = require('../../controllers/subredditController');
const User = require('../../models/user');
const SubReddit = require('../../models/subReddit');

jest.mock('../../models/user');
jest.mock('../../models/subReddit');

describe('createCommunity', () => {
  it('should create a new community', async () => {
    const req = { 
      userId: 'validUserId', 
      body: { 
        name: 'newCommunity', 
        privacy: 'public', 
        ageRestriction: false 
      } 
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const userMock = { 
      _id: 'validUserId', 
      communities: [], 
      moderates: [], 
      save: jest.fn() 
    };
    const communityMock = { 
      _id: 'newCommunityId', 
      name: 'newCommunity', 
      privacy: 'public', 
      ageRestriction: false, 
      moderators: ['validUserId'], 
      members: ['validUserId'], 
      save: jest.fn() 
    };

    User.findById.mockResolvedValue(userMock);
    SubReddit.prototype.save.mockResolvedValue(communityMock);

    await createCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(userMock.communities).toContain(communityMock._id);
    expect(userMock.moderates).toContain(communityMock._id);
    expect(userMock.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Created community successfully', 
      savedCommunity: communityMock 
    });
  });

  it('should return a 404 status code if user is not found', async () => {
    const req = { userId: 'invalidUserId', body: { name: 'newCommunity' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findById.mockResolvedValue(null);

    await createCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if community name already exists', async () => {
    const req = { userId: 'validUserId', body: { name: 'existingCommunity' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const userMock = { _id: 'validUserId' };
    const existingCommunityMock = { _id: 'existingCommunityId', name: 'existingCommunity' };

    User.findById.mockResolvedValue(userMock);
    SubReddit.findOne.mockResolvedValue(existingCommunityMock);

    await createCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: req.body.name });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Community name already exists' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const req = { userId: 'validUserId', body: { name: 'newCommunity' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findById.mockRejectedValue(new Error('Database error'));

    await createCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create community' });
  });
});