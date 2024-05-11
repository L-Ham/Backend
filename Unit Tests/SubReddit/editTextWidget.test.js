const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subReddit");

describe("editTextWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should edit a text widget successfully", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const textWidgetId = "widget123";
    const widgetName = "Widget Name";
    const text = "Widget Text";
    const textHtml = "Widget HTML";
    const shortName = "Widget Short Name";

    const subreddit = {
      _id: subredditId,
      moderators: [userId],
      textWidgets: {
        id: jest.fn().mockReturnValueOnce({
          widgetName: "Old Widget Name",
          text: "Old Widget Text",
          textHtml: "Old Widget HTML",
          shortName: "Old Widget Short Name",
        }),
      },
      save: jest.fn().mockResolvedValueOnce(true),
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId,
      body: {
        subredditId,
        textWidgetId,
        widgetName,
        text,
        textHtml,
        shortName,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.json).toHaveBeenCalledWith({
      message: "Text widget edited successfully",
      widgets: subreddit.textWidgets,
    });
  });

  it("should handle error if subreddit is not found", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should handle error if user is not a moderator", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const subreddit = {
      _id: subredditId,
      moderators: ["user456"],
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not a moderator",
    });
  });

  it("should handle server error", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const errorMessage = "Some error message";
    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error editing text widget",
    });
  });
});
