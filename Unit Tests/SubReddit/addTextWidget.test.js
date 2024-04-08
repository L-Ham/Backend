const subredditController = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));
describe("addTextWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a text widget to the subreddit", async () => {
    const subredditId = "subreddit123";
    const widgetName = "Widget 1";
    const text = "Some text";

    const subreddit = {
      moderators: ["userId123"],
      widgets: [
        { type: "textWidgets", data: [] },
      ],
      save: jest.fn().mockResolvedValueOnce({}),
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: "userId123",
      body: {
        subredditId,
        widgetName,
        text,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.widgets[0].data).toHaveLength(1);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Text widget added successfully",
      savedSubreddit: {},
    });
  });

  it("should handle error if subreddit is not found", async () => {
    const subredditId = "subreddit123";
    const widgetName = "Widget 1";
    const text = "Some text";

    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      userId: "userId123",
      body: {
        subredditId,
        widgetName,
        text,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should handle error if user is not a moderator", async () => {
    const subredditId = "subreddit123";
    const widgetName = "Widget 1";
    const text = "Some text";

    const subreddit = {
      moderators: [],
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: "userId123",
      body: {
        subredditId,
        widgetName,
        text,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
  });

  it("should handle error if maximum number of widgets is reached", async () => {
    const subredditId = "subreddit123";
    const widgetName = "Widget 1";
    const text = "Some text";

    const subreddit = {
      moderators: ["userId123"],
      widgets: [
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
        { type: "textWidgets", data: [] },
      ],
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId: "userId123",
      body: {
        subredditId,
        widgetName,
        text,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Maximum 20 widgets allowed" });
  });

  it("should handle server error", async () => {
    const subredditId = "subreddit123";
    const widgetName = "Widget 1";
    const text = "Some text";
    const errorMessage = "Some error message";

    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      userId: "userId123",
      body: {
        subredditId,
        widgetName,
        text,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error adding text widget" });
  });
});