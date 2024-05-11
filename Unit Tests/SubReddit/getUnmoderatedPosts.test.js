const { getUnmoderatedPosts } = require('../../controllers/subredditController');
const User = require('../../models/user');
const subReddit = require('../../models/subReddit');
const Post = require('../../models/post');
const UserServices = require('../../services/userServices');
const PostServices = require('../../services/postServices');
const UserUploadModel = require('../../models/userUploads');

jest.mock('../../models/user');
jest.mock('../../models/subreddit');
jest.mock('../../models/post');
jest.mock('../../services/userServices');
jest.mock('../../services/postServices');
jest.mock('../../models/userUploads');

describe('getUnmoderatedPosts', () => {
  const req = { 
    query: { subredditName: 'test', page: '1', limit: '10' },
    userId: '123'
  };
  const res = {
    status: jest.fn(function() {
      return this;
    }),
    json: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if subreddit is not found', async () => {
    subReddit.findOne.mockResolvedValue(null);

    await getUnmoderatedPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'subreddit not found' });
  });

  it('should return 403 if user is not a moderator', async () => {
    subReddit.findOne.mockResolvedValue({ moderators: ['456'] });

    await getUnmoderatedPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are not a moderator' });
  });

  it('should return 500 if retrieved array is empty', async () => {
    subReddit.findOne.mockResolvedValue({ moderators: ['123'], posts: ['1', '2'] });
    UserServices.paginateResults.mockResolvedValue({ slicedArray: [] });

    await getUnmoderatedPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'The retrieved array is empty' });
  });

  it('should return 200 with unmoderated posts if posts found', async () => {
    subReddit.findOne.mockResolvedValue({ moderators: ['123'], posts: ['1', '2'], name: 'testSubreddit' });
    User.findById.mockImplementation((id) => {
      if (id === '123') {
        return Promise.resolve({ _id: '123', savedPosts: ['1'] });
      }
      return Promise.resolve({ _id: id, userName: 'testUser', avatarImage: 'imageId' });
    });
    UserUploadModel.findById.mockResolvedValue({ url: 'imageUrl' });
    User.find.mockResolvedValue([{ userName: 'testUser' }]);
    Post.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: '1', upvotedUsers: ['123'], downvotedUsers: [], isEdited: true }])
    });
    UserServices.paginateResults.mockResolvedValue({ slicedArray: [{ _id: '1', upvotedUsers: ['123'], downvotedUsers: [], isEdited: true }] });
    PostServices.getImagesUrls.mockResolvedValue(['imageUrl']);
    PostServices.getVideosUrls.mockResolvedValue(['videoUrl']);
  
    await getUnmoderatedPosts(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should return 500 if error occurs', async () => {
    subReddit.findOne.mockRejectedValue(new Error('Test error'));

    await getUnmoderatedPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error getting subreddit\'s unmoderated posts', error: 'Test error' });
  });
});