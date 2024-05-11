const { getSubredditType } = require('../../controllers/subredditController');
const SubReddit = require("../../models/subReddit");
const mongoose = require('mongoose');
jest.mock('../../models/SubReddit');

describe('getSubredditType', () => {
  const req = { 
    query: { 
      subredditName: 'testSubredditName'
    } 
  };
  const res = { 
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const mockSubreddit = { 
    name: 'testSubredditName', 
    ageRestriction: '18+',
    privacy: 'public'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if subreddit does not exist', async () => {
    SubReddit.findOne.mockResolvedValue(null);
    await getSubredditType(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should return subreddit type if subreddit exists', async () => {
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    await getSubredditType(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Retrieved subreddit type",
      ageRestriction: mockSubreddit.ageRestriction,
      privacy: mockSubreddit.privacy
    });
  });

  it('should return 500 if there is an error', async () => {
    const errorMessage = 'Error occurred';
    SubReddit.findOne.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    await getSubredditType(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Error getting subreddit type", 
      error: errorMessage 
    });
  });
});