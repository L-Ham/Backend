const SubReddit = require("../../models/subReddit");
const subredditServices = require("../../services/subredditServices");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subReddit");
jest.mock("../../services/subredditServices");

describe('addTextWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if subreddit is not found', async () => {
    const req = { userId: 'user123', body: { subredditId: 'subreddit123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockResolvedValueOnce(null);

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should return 403 if user is not a moderator', async () => {
    const req = { userId: 'user123', body: { subredditId: 'subreddit123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockResolvedValueOnce({ moderators: ['user456'] });

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are not a moderator' });
  });

  it('should return 400 if maximum number of widgets is exceeded', async () => {
    const req = { userId: 'user123', body: { subredditId: 'subreddit123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockResolvedValueOnce({ moderators: ['user123'] });
    subredditServices.checkWidgetsSize.mockReturnValueOnce(false);

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Maximum 20 widgets allowed' });
  });

  it('should add a text widget successfully', async () => {
    const req = { 
      userId: 'user123', 
      body: { 
        subredditId: 'subreddit123', 
        widgetName: 'widget1', 
        text: 'text1', 
        textHtml: 'textHtml1', 
        shortName: 'shortName1' 
      } 
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const subreddit = { 
      moderators: ['user123'], 
      textWidgets: [], 
      orderWidget: [], 
      save: jest.fn().mockResolvedValueOnce('savedSubreddit') 
    };

    SubReddit.findById.mockResolvedValueOnce(subreddit);
    subredditServices.checkWidgetsSize.mockReturnValueOnce(true);

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.json).toHaveBeenCalledWith({ message: 'Text widget added successfully', savedSubreddit: 'savedSubreddit' });
  });

  it('should handle server error', async () => {
    const req = { userId: 'user123', body: { subredditId: 'subreddit123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockRejectedValueOnce(new Error('Some error message'));

    await subredditController.addTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error adding text widget' });
  });
});