const {
  readNotification,
} = require("../../controllers/notificationController");
const Notification = require("../../models/notification");
const User = require("../../models/user");

jest.mock("../../models/notification");
jest.mock("../../models/user");

describe("readNotification", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { notificationId: "notificationId" },
      userId: "userId",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 404 if notification is not found", async () => {
    Notification.findById.mockResolvedValue(null);

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification Not Found",
    });
  });

  it("should return 404 if user is not found", async () => {
    Notification.findById.mockResolvedValue({});
    User.findById.mockResolvedValue(null);

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User Not Found" });
  });

  it("should return 400 if notification is already read", async () => {
    Notification.findById.mockResolvedValue({ isRead: true });
    User.findById.mockResolvedValue({});

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification Already Marked as Read",
    });
  });

  it("should return 401 if notification was not sent to the user", async () => {
    Notification.findById.mockResolvedValue({
      receiverId: "otherUserId",
      isRead: false,
    });
    User.findById.mockResolvedValue({});

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "This notification wasn't sent to this user",
    });
  });

  it("should mark notification as read and return 200", async () => {
    const notification = {
      receiverId: "userId",
      isRead: false,
      save: jest.fn(),
    };
    Notification.findById.mockResolvedValue(notification);
    User.findById.mockResolvedValue({});

    await readNotification(req, res);

    expect(notification.isRead).toBe(true);
    expect(notification.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification Marked as Read Successfully",
    });
  });

  it("should return 500 if there is an error", async () => {
    const errorMessage = "Error";
    Notification.findById.mockRejectedValue(new Error(errorMessage));

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Marking Notification as Read",
      error: errorMessage,
    });
  });
});
