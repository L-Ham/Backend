const { editCommunityDetails } = require('../../controllers/subredditController');
const SubReddit = require('../../models/subReddit');

jest.mock('../../models/subReddit');

describe('editCommunityDetails', () => {
  it('should edit the community details of the subreddit', async () => {
    const req = { 
      userId: 'validUserId', 
      body: { 
        subredditId: 'validSubredditId', 
        communityDescription: 'newDescription', 
        currentlyViewingNickname: 'newNickname', 
        membersNickname: 'newMembersNickname' 
      } 
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const subredditMock = { 
      _id: 'validSubredditId', 
      moderators: ['validUserId'], 
      description: 'oldDescription', 
      currentlyViewingNickname: 'oldNickname', 
      membersNickname: 'oldMembersNickname', 
      save: jest.fn() 
    };

    SubReddit.findById.mockResolvedValue(subredditMock);

    await editCommunityDetails(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(subredditMock.description).toBe(req.body.communityDescription);
    expect(subredditMock.currentlyViewingNickname).toBe(req.body.currentlyViewingNickname);
    expect(subredditMock.membersNickname).toBe(req.body.membersNickname);
    expect(subredditMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit's Community Details Edited Successfully", subreddit: subredditMock });
  });

  it('should return a 404 status code if subreddit is not found', async () => {
    const req = { userId: 'validUserId', body: { subredditId: 'invalidSubredditId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockResolvedValue(null);

    await editCommunityDetails(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should return a 500 status code if user is not a moderator', async () => {
    const req = { userId: 'validUserId', body: { subredditId: 'validSubredditId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const subredditMock = { _id: 'validSubredditId', moderators: ['anotherUserId'] };

    SubReddit.findById.mockResolvedValue(subredditMock);

    await editCommunityDetails(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'User is not a moderator to this subreddit' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const req = { userId: 'validUserId', body: { subredditId: 'validSubredditId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockRejectedValue(new Error('Database error'));

    await editCommunityDetails(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Editing Community Details', err: 'Database error' });
  });
});