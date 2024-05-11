const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subReddit", () => ({
  find: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findById: jest.fn(),
}));

describe('getSubredditByNames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return matching subreddit names', async () => {
    const search = 'test';
    const subreddit = {
      _id: 'subreddit123',
      name: 'testSubreddit',
      appearance: {
        avatarImage: 'image123',
      },
      members: [],
      ageRestriction: false,
      description: 'Test description',
      _doc: {},
    };
    const avatarImage = {
      url: 'http://example.com/image.jpg',
    };
    SubReddit.find.mockResolvedValueOnce([subreddit]);
    UserUploadModel.findById.mockResolvedValueOnce(avatarImage);

    const req = { query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getSubredditByNames(req, res);

    expect(SubReddit.find).toHaveBeenCalledWith({
      name: new RegExp(`^${search}`, "i"),
    }, "_id name appearance.avatarImage members ageRestriction description");
    expect(UserUploadModel.findById).toHaveBeenCalledWith(subreddit.appearance.avatarImage);
    expect(res.json).toHaveBeenCalledWith({
      matchingNames: [{
        ...subreddit._doc,
        currentlyViewingCount: expect.any(Number),
        membersCount: subreddit.members.length,
        appearance: {
          ...subreddit.appearance,
          avatarImage: avatarImage,
        },
        isNSFW: subreddit.ageRestriction,
      }],
    });
  });

  it('should handle server error', async () => {
    const search = 'test';
    const errorMessage = 'Some error message';
    SubReddit.find.mockRejectedValueOnce(new Error(errorMessage));

    const req = { query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getSubredditByNames(req, res);

    expect(SubReddit.find).toHaveBeenCalledWith({
      name: new RegExp(`^${search}`, "i"),
    }, "_id name appearance.avatarImage members ageRestriction description");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error searching Subreddit Names', error: errorMessage });
  });
  it('should return matching subreddit names without avatar image', async () => {
    const search = 'test';
    const subreddit = {
      _id: 'subreddit123',
      name: 'testSubreddit',
      appearance: {},
      members: [],
      ageRestriction: false,
      description: 'Test description',
      _doc: {},
    };
    SubReddit.find.mockResolvedValueOnce([subreddit]);
  
    const req = { query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.getSubredditByNames(req, res);
  
    expect(SubReddit.find).toHaveBeenCalledWith({
      name: new RegExp(`^${search}`, "i"),
    }, "_id name appearance.avatarImage members ageRestriction description");
    expect(res.json).toHaveBeenCalledWith({
      matchingNames: [{
        ...subreddit._doc,
        currentlyViewingCount: expect.any(Number),
        membersCount: subreddit.members.length,
        appearance: {
          ...subreddit.appearance,
          avatarImage: null,
        },
        isNSFW: subreddit.ageRestriction,
      }],
    });
  });
  it('should return empty array if no matching subreddit names', async () => {
    const search = 'test';
    SubReddit.find.mockResolvedValueOnce([]);
  
    const req = { query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.getSubredditByNames(req, res);
  
    expect(SubReddit.find).toHaveBeenCalledWith({
      name: new RegExp(`^${search}`, "i"),
    }, "_id name appearance.avatarImage members ageRestriction description");
    expect(res.json).toHaveBeenCalledWith({ matchingNames: [] });
  });
  it('should return matching subreddit names without avatar image', async () => {
    const search = 'test';
    const subreddit = {
      _id: 'subreddit123',
      name: 'testSubreddit',
      appearance: {},
      members: [],
      ageRestriction: false,
      description: 'Test description',
      _doc: {},
    };
    SubReddit.find.mockResolvedValueOnce([subreddit]);
  
    const req = { query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.getSubredditByNames(req, res);
  
    expect(SubReddit.find).toHaveBeenCalledWith({
      name: new RegExp(`^${search}`, "i"),
    }, "_id name appearance.avatarImage members ageRestriction description");
    expect(res.json).toHaveBeenCalledWith({
      matchingNames: [{
        ...subreddit._doc,
        currentlyViewingCount: expect.any(Number),
        membersCount: subreddit.members.length,
        appearance: {
          ...subreddit.appearance,
          avatarImage: null,
        },
        isNSFW: subreddit.ageRestriction,
      }],
    });
  });
});