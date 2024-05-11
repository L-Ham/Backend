const { readAllNotifications } = require('../../controllers/notificationController');
const Notification = require('../../models/notification');
const User = require('../../models/user');

jest.mock('../../models/Notification');
jest.mock('../../models/User');

describe('readAllNotifications', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 'userId'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await readAllNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User Not Found" });
  });

  it('should mark all notifications as read and return 200', async () => {
    User.findById.mockResolvedValue({});
    Notification.updateMany = jest.fn();

    await readAllNotifications(req, res);

    expect(Notification.updateMany).toHaveBeenCalledWith(
      { receiverId: 'userId' },
      { isRead: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "All Notifications Marked as Read Successfully" });
  });

  it('should return 500 if there is an error', async () => {
    const errorMessage = 'Error';
    User.findById.mockRejectedValue(new Error(errorMessage));

    await readAllNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error Marking All Notifications as Read", error: errorMessage });
  });
});