const { getUserNotifications } = require('../../controllers/notificationController');
const Notification = require('../../models/notification');
const User = require('../../models/user');

jest.mock('../../models/Notification');
jest.mock('../../models/User');

describe('getUserNotifications', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 'userId',
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  it('should return all notifications for the user', async () => {
    const notifications = [{}, {}];
    User.findById.mockResolvedValue({});
    const query = Promise.resolve(notifications);
    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockReturnValue(query)
    });
  
    await getUserNotifications(req, res);
  
    expect(Notification.find).toHaveBeenCalledWith({ receiverId: 'userId' });
    expect(res.status).toHaveBeenCalledWith(200);
   
  });
  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await getUserNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User Not Found" });
  });



  it('should limit the number of notifications returned if limit is provided', async () => {
    const notifications = [{}];
    req.query.limit = '1';
    User.findById.mockResolvedValue({});
    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(notifications)
    };
    Notification.find.mockReturnValue(query);

    await getUserNotifications(req, res);

    expect(query.limit).toHaveBeenCalledWith(Number(req.query.limit));
    expect(res.json).toHaveBeenCalledWith(notifications);
  });

  it('should return 500 if there is an error', async () => {
    const errorMessage = 'Error';
    User.findById.mockRejectedValue(new Error(errorMessage));

    await getUserNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error Retrieving User Notifications", error: errorMessage });
  });
});