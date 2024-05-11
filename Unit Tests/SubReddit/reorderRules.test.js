const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe('reorderRules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reorder subreddit rules successfully', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const rulesOrder = ['rule1', 'rule2', 'rule3'];
    const subreddit = {
      moderators: [userId],
      rules: {
        ruleList: [
          { _id: 'rule1', name: 'Rule 1' },
          { _id: 'rule2', name: 'Rule 2' },
          { _id: 'rule3', name: 'Rule 3' },
        ],
      },
      save: jest.fn().mockResolvedValueOnce({
        rules: {
          ruleList: [
            { _id: 'rule1', name: 'Rule 1' },
            { _id: 'rule2', name: 'Rule 2' },
            { _id: 'rule3', name: 'Rule 3' },
          ],
        },
      }),
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId, rulesOrder } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.reorderRules(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rules reordered successfully",
      rules: subreddit.rules.ruleList,
    });
  });

  it('should handle error if subreddit is not found', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const rulesOrder = ['rule1', 'rule2', 'rule3'];
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId, rulesOrder } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.reorderRules(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const rulesOrder = ['rule1', 'rule2', 'rule3'];
    const errorMessage = 'Some error message';
    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, body: { subredditId, rulesOrder } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.reorderRules(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error reordering rules' });
  });
});