const subredditController = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe('addRuleWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a rule widget to the subreddit', async () => {
    const subredditId = 'subreddit123';
    const ruleWidget = {
      rule: 'Some rule',
      description: 'Some description',
      appliedTo: 'Some appliedTo',
      reportReasonDefault: 'Some reportReasonDefault',
    };

    const subreddit = {
      moderators: ['userId123'],
      widgets: [
        { type: 'rulesWidgets', data: [] },
      ],
      save: jest.fn().mockResolvedValueOnce({}),
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: 'userId123',
      body: {
        subredditId,
        ...ruleWidget,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRuleWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.widgets[0].data).toHaveLength(1);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Rule added successfully",
      savedSubreddit: {},
    });
  });

  it('should handle error if subreddit is not found', async () => {
    const subredditId = 'subreddit123';
    const ruleWidget = {
      rule: 'Some rule',
      description: 'Some description',
      appliedTo: 'Some appliedTo',
      reportReasonDefault: 'Some reportReasonDefault',
    };

    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      userId: 'userId123',
      body: {
        subredditId,
        ...ruleWidget,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRuleWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should handle error if user is not a moderator', async () => {
    const subredditId = 'subreddit123';
    const ruleWidget = {
      rule: 'Some rule',
      description: 'Some description',
      appliedTo: 'Some appliedTo',
      reportReasonDefault: 'Some reportReasonDefault',
    };

    const subreddit = {
      moderators: [],
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: 'userId123',
      body: {
        subredditId,
        ...ruleWidget,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRuleWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
  });

  it('should handle error if maximum number of widgets is reached', async () => {
    const subredditId = 'subreddit123';
    const ruleWidget = {
      rule: 'Some rule',
      description: 'Some description',
      appliedTo: 'Some appliedTo',
      reportReasonDefault: 'Some reportReasonDefault',
    };

    const subreddit = {
      moderators: ['userId123'],
      widgets: [
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
        { type: 'rulesWidgets', data: [] },
      ],
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: 'userId123',
      body: {
        subredditId,
        ...ruleWidget,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRuleWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Maximum 20 widgets allowed" });
  });

  it('should handle error if maximum number of rules is reached', async () => {
    const subredditId = 'subreddit123';
    const ruleWidget = {
      rule: 'Some rule',
      description: 'Some description',
      appliedTo: 'Some appliedTo',
      reportReasonDefault: 'Some reportReasonDefault',
    };

    const subreddit = {
      moderators: ['userId123'],
      widgets: [
        { type: 'rulesWidgets', data: [
          { ruleText: 'Rule 1', fullDescription: 'Description 1', appliesTo: 'Applies To 1', reportReason: 'Reason 1' },
          { ruleText: 'Rule 2', fullDescription: 'Description 2', appliesTo: 'Applies To 2', reportReason: 'Reason 2' },
          { ruleText: 'Rule 3', fullDescription: 'Description 3', appliesTo: 'Applies To 3', reportReason: 'Reason 3' },
          { ruleText: 'Rule 4', fullDescription: 'Description 4', appliesTo: 'Applies To 4', reportReason: 'Reason 4' },
          { ruleText: 'Rule 5', fullDescription: 'Description 5', appliesTo: 'Applies To 5', reportReason: 'Reason 5' },
          { ruleText: 'Rule 6', fullDescription: 'Description 6', appliesTo: 'Applies To 6', reportReason: 'Reason 6' },
          { ruleText: 'Rule 7', fullDescription: 'Description 7', appliesTo: 'Applies To 7', reportReason: 'Reason 7' },
          { ruleText: 'Rule 8', fullDescription: 'Description 8', appliesTo: 'Applies To 8', reportReason: 'Reason 8' },
          { ruleText: 'Rule 9', fullDescription: 'Description 9', appliesTo: 'Applies To 9', reportReason: 'Reason 9' },
          { ruleText: 'Rule 10', fullDescription: 'Description 10', appliesTo: 'Applies To 10', reportReason: 'Reason 10' },
          { ruleText: 'Rule 11', fullDescription: 'Description 11', appliesTo: 'Applies To 11', reportReason: 'Reason 11' },
          { ruleText: 'Rule 12', fullDescription: 'Description 12', appliesTo: 'Applies To 12', reportReason: 'Reason 12' },
          { ruleText: 'Rule 13', fullDescription: 'Description 13', appliesTo: 'Applies To 13', reportReason: 'Reason 13' },
          { ruleText: 'Rule 14', fullDescription: 'Description 14', appliesTo: 'Applies To 14', reportReason: 'Reason 14' },
          { ruleText: 'Rule 15', fullDescription: 'Description 15', appliesTo: 'Applies To 15', reportReason: 'Reason 15' },
        ] },
      ],
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: 'userId123',
      body: {
        subredditId,
        ...ruleWidget,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRuleWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Maximum 15 rules allowed" });
  });

  it('should handle server error', async () => {
    const subredditId = 'subreddit123';
    const ruleWidget = {
      rule: 'Some rule',
      description: 'Some description',
      appliedTo: 'Some appliedTo',
      reportReasonDefault: 'Some reportReasonDefault',
    };
    const errorMessage = 'Some error message';

    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      userId: 'userId123',
      body: {
        subredditId,
        ...ruleWidget,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRuleWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error adding rule" });
  });
});