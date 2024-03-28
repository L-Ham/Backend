const SubReddit = require("../../models/subreddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subreddit", () => ({
  findById: jest.fn(),
}));

describe("addRule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a rule to a valid subreddit", async () => {
    const subredditId = "subreddit123";
    const rule = "Rule 1";
    const description = "Description 1";
    const appliedTo = "Applied To 1";
    const reportReasonDefault = "Report Reason Default 1";

    const subreddit = {
      rules: [],
      save: jest.fn().mockResolvedValueOnce({
        rules: [
          {
            rule,
            description,
            appliedTo,
            reportReasonDefault,
          },
        ],
      }),
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      body: {
        subredditId,
        rule,
        description,
        appliedTo,
        reportReasonDefault,
      },
    };
    const res = {
      json: jest.fn(),
    };

    await subredditController.addRule(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.rules).toHaveLength(1);
    expect(subreddit.rules[0]).toEqual({
      rule,
      description,
      appliedTo,
      reportReasonDefault,
    });
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Rule added successfully",
      savedSubreddit: {
        rules: [
          {
            rule,
            description,
            appliedTo,
            reportReasonDefault,
          },
        ],
      },
    });
  });

  it("should return 404 if subreddit ID is invalid", async () => {
    const subredditId = "subreddit123";

    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      body: {
        subredditId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRule(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return 500 if there is an error", async () => {
    const subredditId = "subreddit123";

    SubReddit.findById.mockRejectedValueOnce("Error");

    const req = {
      body: {
        subredditId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addRule(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error adding rule" });
  });
});