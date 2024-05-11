const subredditController = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");

jest.mock("../../models/subReddit");

describe('deleteTextWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle subreddit not found', async () => {
    const req = { userId: 'user1', body: { subredditId: 'subreddit1', textWidgetId: 'widget1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    SubReddit.findById.mockResolvedValueOnce(null);

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should handle user not being a moderator', async () => {
    const req = { userId: 'user1', body: { subredditId: 'subreddit1', textWidgetId: 'widget1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const subreddit = { moderators: ['user2'] };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    await subredditController.deleteTextWidget(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are not a moderator' });
  });
  it('should handle text widget ID not provided', async () => {
    const req = { userId: 'user1', body: { subredditId: 'subreddit1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    const subreddit = { moderators: ['user1'] };
    SubReddit.findById.mockResolvedValueOnce(subreddit);
  
    await subredditController.deleteTextWidget(req, res);
  
    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Text widget ID is required' });
  });
  
  it('should handle text widget not found', async () => {
    const req = { userId: 'user1', body: { subredditId: 'subreddit1', textWidgetId: 'widget1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    const subreddit = { 
      moderators: ['user1'], 
      textWidgets: [{ _id: 'widget2' }] 
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);
  
    await subredditController.deleteTextWidget(req, res);
  
    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Text widget not found' });
  });
  
  it('should delete text widget successfully', async () => {
    const req = { userId: 'user1', body: { subredditId: 'subreddit1', textWidgetId: 'widget1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    const subreddit = { 
      moderators: ['user1'], 
      textWidgets: [{ _id: 'widget1' }], 
      save: jest.fn().mockResolvedValueOnce(true) 
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);
  
    await subredditController.deleteTextWidget(req, res);
  
    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Text widget deleted successfully', 
      widgets: subreddit.textWidgets 
    });
  });
  
  it('should handle server error', async () => {
    const req = { userId: 'user1', body: { subredditId: 'subreddit1', textWidgetId: 'widget1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    const errorMessage = 'Some error message';
    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));
  
    await subredditController.deleteTextWidget(req, res);
  
    expect(SubReddit.findById).toHaveBeenCalledWith(req.body.subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting text widget', error: errorMessage });
  });

});