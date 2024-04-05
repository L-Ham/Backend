const SubReddit = require("../../models/subreddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subreddit", () => ({
  findById: jest.fn(),
}));

describe('deleteTextWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a text widget in the subreddit', async () => {
    const subredditId = 'subreddit123';
    const textWidgetId = 'textWidget123';

    const subreddit = {
      widgets: {
        textWidgets: [
          {
            _id: textWidgetId,
            widgetName: 'Widget 1',
            text: 'This is a text widget',
          },
        ],
      },
      save: jest.fn().mockResolvedValueOnce({}),
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      body: {
        subredditId,
        textWidgetId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.widgets.textWidgets.pull).toHaveBeenCalledWith(textWidgetId);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Text widget deleted successfully",
      savedSubreddit: {},
    });
  });

  it('should handle error if subreddit is not found', async () => {
    const subredditId = 'subreddit123';
    const textWidgetId = 'textWidget123';

    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      body: {
        subredditId,
        textWidgetId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should handle error if text widget ID is not provided', async () => {
    const subredditId = 'subreddit123';

    const req = {
      body: {
        subredditId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Text widget ID is required" });
  });

  it('should handle error if no text widgets are found', async () => {
    const subredditId = 'subreddit123';
    const textWidgetId = 'textWidget123';

    const subreddit = {
      widgets: {},
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      body: {
        subredditId,
        textWidgetId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No text widgets found" });
  });

  it('should handle server error', async () => {
    const subredditId = 'subreddit123';
    const textWidgetId = 'textWidget123';
    const errorMessage = 'Some error message';

    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      body: {
        subredditId,
        textWidgetId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error deleting text widget" });
  });

  it('should handle error if text widget ID is not found', async () => {
    const subredditId = 'subreddit123';
    const textWidgetId = 'textWidget123';

    const subreddit = {
      widgets: {
        textWidgets: [
          {
            _id: 'anotherTextWidgetId',
            widgetName: 'Widget 2',
            text: 'This is another text widget',
          },
        ],
      },
      save: jest.fn().mockResolvedValueOnce({}),
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      body: {
        subredditId,
        textWidgetId,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Text widget not found" });
  });
});