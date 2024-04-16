const { getSubredditByNames } = require('../../controllers/subredditController');
const User = require('../../models/user');
const SubReddit = require('../../models/subReddit');
const UserUploadModel = require('../../models/userUploads');

jest.mock('../../models/user');
jest.mock('../../models/subReddit');
jest.mock('../../models/userUploads');

describe('getSubredditByNames', () => {
  it('should return matching subreddit names', async () => {
    const req = { query: { search: 'test' }, userId: 'userId' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const userMock = { _id: 'userId' };
    const subredditMock = { 
      _doc: { name: 'testSubreddit' }, 
      members: [1, 2, 3], 
      appearance: { avatarImage: 'avatarImageId' } 
    };
    const avatarImageMock = { _id: 'avatarImageId', url: 'url1' };

    User.findById.mockResolvedValue(userMock);
    SubReddit.find.mockResolvedValue([subredditMock]);
    UserUploadModel.findById.mockResolvedValue(avatarImageMock);

    await getSubredditByNames(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(SubReddit.find).toHaveBeenCalledWith(
      { name: new RegExp(`^${req.query.search}`, 'i') }, 
      '_id name appearance.avatarImage members'
    );
    expect(UserUploadModel.findById).toHaveBeenCalledWith(subredditMock.appearance.avatarImage);
    expect(res.json).toHaveBeenCalledWith({ 
      matchingNames: [
        { 
          name: 'testSubreddit', 
          currentlyViewingCount: expect.any(Number), 
          membersCount: 3, 
          appearance: { avatarImage: avatarImageMock } 
        }
      ] 
    });
  });



  it('should return a 500 status code if an error occurs', async () => {
    const req = { query: { search: 'test' }, userId: 'userId' };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    User.findById.mockRejectedValue(new Error('Database error'));

    await getSubredditByNames(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error searching Subreddit Names', error: 'Database error' });
  });
});