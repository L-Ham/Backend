const {
  hideNotification,
} = require("../../controllers/notificationController");
const Notification = require("../../models/notification");
const User = require("../../models/user");

jest.mock("../../models/notification");
jest.mock("../../models/user");

describe("hideNotification", () => {
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

    await hideNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification Not Found",
    });
  });

  it("should return 404 if user is not found", async () => {
    Notification.findById.mockResolvedValue({});
    User.findById.mockResolvedValue(null);

    await hideNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User Not Found" });
  });

  it("should return 401 if notification was not sent to the user", async () => {
    Notification.findById.mockResolvedValue({ receiverId: "otherUserId" });
    User.findById.mockResolvedValue({});

    await hideNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "This notification wasn't sent to this user",
    });
  });

  it("should hide notification and return 200", async () => {
    const notification = { receiverId: "userId" };
    Notification.findById.mockResolvedValue(notification);
    User.findById.mockResolvedValue({});
    Notification.findByIdAndDelete = jest.fn();

    await hideNotification(req, res);

    expect(Notification.findByIdAndDelete).toHaveBeenCalledWith(
      "notificationId"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification Hidden Successfully",
    });
  });

  it("should return 500 if there is an error", async () => {
    const errorMessage = "Error";
    Notification.findById.mockRejectedValue(new Error(errorMessage));

    await hideNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Hiding Notification",
      error: errorMessage,
    });
  });
});
