const subredditController = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");

jest.mock("../../models/subReddit");

describe('deleteRule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if subreddit is not found', async () => {
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { body: { subredditId: '123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteRule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should return 403 if user is not a moderator', async () => {
    const subreddit = { moderators: ['456'] };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId: '123', body: { subredditId: '123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteRule(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are not a moderator' });
  });

  it('should return 404 if rule ID is not provided', async () => {
    const subreddit = { moderators: ['123'] };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId: '123', body: { subredditId: '123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteRule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rule ID is required' });
  });

  it('should return 404 if rule is not found', async () => {
    const subreddit = { moderators: ['123'], rules: { ruleList: [] } };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId: '123', body: { subredditId: '123', ruleId: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteRule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rule not found' });
  });

  it('should delete the rule successfully', async () => {
    const subreddit = {
      moderators: ['123'],
      rules: { ruleList: [{ _id: '456', ruleText: 'old rule' }] },
      save: jest.fn().mockResolvedValueOnce(true),
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: '123',
      body: {
        subredditId: '123',
        ruleId: '456',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteRule(req, res);

    expect(subreddit.rules.ruleList.length).toBe(0);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rule deleted successfully',
      rules: subreddit.rules,
    });
  });
});