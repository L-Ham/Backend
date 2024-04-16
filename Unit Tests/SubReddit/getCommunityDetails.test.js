const { getCommunityDetails } = require('../../controllers/subredditController');
const User = require('../../models/user');
const SubReddit = require('../../models/subReddit');
const UserUploadModel = require('../../models/userUploads');

jest.mock('../../models/user');
jest.mock('../../models/subReddit');
jest.mock('../../models/userUploads');

describe('getCommunityDetails', () => {
  it('should return the community details of the subreddit', async () => {
    const req = { userId: 'validUserId', query: { subRedditName: 'validSubRedditName' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { _id: 'validUserId', favoriteCommunities: ['subRedditId1'], muteCommunities: { mutedCommunityId: ['subRedditId2'] } };
    const subredditMock = { _id: 'subRedditId1', name: 'subReddit1', members: ['member1', 'member2'], appearance: { avatarImage: 'avatarImageId1', bannerImage: 'bannerImageId1' }, description: 'description1', membersNickname: 'membersNickname1', currentlyViewingNickname: 'currentlyViewingNickname1', createdAt: new Date() };
    const avatarImageMock = { _id: 'avatarImageId1', url: 'url1' };
    const bannerImageMock = { _id: 'bannerImageId1', url: 'url2' };

    User.findById.mockResolvedValue(userMock);
    SubReddit.findOne.mockResolvedValue(subredditMock);
    UserUploadModel.findById.mockResolvedValueOnce(avatarImageMock).mockResolvedValueOnce(bannerImageMock);
    User.findOne.mockResolvedValue(userMock);

    await getCommunityDetails(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: req.query.subRedditName });
    expect(UserUploadModel.findById).toHaveBeenCalledWith(subredditMock.appearance.avatarImage);
    expect(UserUploadModel.findById).toHaveBeenCalledWith(subredditMock.appearance.bannerImage);
    expect(User.findOne).toHaveBeenCalledWith({ _id: req.userId, "muteCommunities.mutedCommunityId": subredditMock._id });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit's Community Details Retrieved Successfully", communityDetails: expect.any(Object) });
  });

  it('should return a 404 status code if user is not found', async () => {
    const req = { userId: 'invalidUserId', query: { subRedditName: 'validSubRedditName' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue(null);

    await getCommunityDetails(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 404 status code if subreddit is not found', async () => {
    const req = { userId: 'validUserId', query: { subRedditName: 'invalidSubRedditName' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { _id: 'validUserId', favoriteCommunities: ['subRedditId1'], muteCommunities: { mutedCommunityId: ['subRedditId2'] } };

    User.findById.mockResolvedValue(userMock);
    SubReddit.findOne.mockResolvedValue(null);

    await getCommunityDetails(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: req.query.subRedditName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const req = { userId: 'validUserId', query: { subRedditName: 'validSubRedditName' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockRejectedValue(new Error('Database error'));

    await getCommunityDetails(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Getting Community Details', error: 'Database error' });
  });
});