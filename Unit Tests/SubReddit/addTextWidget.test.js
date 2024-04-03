const SubReddit = require("../../models/subreddit");
const subredditController = require("../../controllers/subredditController");
jest.mock("../../models/subreddit", () => ({
  findById: jest.fn(),
}));

describe('addTextWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a text widget to the subreddit', async () => {
    const subredditId = 'subreddit123';
    const widgetName = 'Widget 1';
    const text = 'This is a text widget';

    const subreddit = {
      widgets: {
        textWidgets: [],
      },
      save: jest.fn().mockResolvedValueOnce({}),
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
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
    expect(subreddit.widgets.textWidgets).toHaveLength(1);
    expect(subreddit.widgets.textWidgets[0]).toEqual({
      widgetName,
      text,
    });
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Text widget added successfully",
      savedSubreddit: {},
    });
  });

  it('should handle error if subreddit is not found', async () => {
    const subredditId = 'subreddit123';

    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      body: {
        subredditId,
        widgetName: 'Widget 1',
        text: 'This is a text widget',
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

  it('should handle server error', async () => {
    const subredditId = 'subreddit123';
    const errorMessage = 'Some error message';

    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      body: {
        subredditId,
        widgetName: 'Widget 1',
        text: 'This is a text widget',
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