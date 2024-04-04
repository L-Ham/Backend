const User = require("../../models/user");
const userController = require("../../controllers/userController");
jest.mock("../../models/User");

describe("deleteSocialLink", () => {
  it("should delete the social link and return success message", async () => {
    const userId = "userId";
    const linkId = "linkId";
    const user = {
      socialLinks: [
        {
          _id: linkId,
          url: "http://example.com",
        },
      ],
      save: jest.fn(),
    };
    user.socialLinks.pull = function (linkId) {
      const linkIndex = this.findIndex(
        (link) => link._id.toString() === linkId
      );
      if (linkIndex > -1) {
        this.splice(linkIndex, 1);
      }
    };
    User.findById.mockResolvedValue(user);

    const req = {
      params: {
        userId,
      },
      body: {
        socialLinkId: linkId,
      },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    // Mock the User.findById method
    User.findById = jest.fn().mockImplementation((id) => {
      return new Promise((resolve, reject) => {
        if (id === userId) {
          resolve(user);
        } else {
          reject("User not found");
        }
      });
    });

    // Mock the user.save method
    user.save = jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        if (user.socialLinks.length === 0) {
          resolve(user);
        } else {
          reject("Error deleting social link");
        }
      });
    });
    await userController.deleteSocialLink(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.socialLinks.pull).toHaveBeenCalledWith(linkId);
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Social link deleted successfully",
    });
    expect(next).not.toHaveBeenCalled();
  });
  it("should return 404 if user is not found", async () => {
    const userId = "userId";
    const linkId = "linkId";

    User.findById = jest.fn().mockResolvedValue(null);

    const req = {
      userId,
      body: {
        socialLinkId: linkId,
      },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    await userController.deleteSocialLink(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 404 if social link is not found", async () => {
    const userId = "userId";
    const linkId = "linkId";

    const user = {
      _id: userId,
      socialLinks: [
        { _id: "linkId1", url: "https://example.com/link1" },
        { _id: "linkId2", url: "https://example.com/link2" },
        { _id: "linkId3", url: "https://example.com/link3" },
      ],
    };

    User.findById = jest.fn().mockResolvedValue(user);

    const req = {
      userId,
      body: {
        socialLinkId: linkId,
      },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    await userController.deleteSocialLink(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Social link not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors and return 500", async () => {
    const userId = "userId";
    const linkId = "linkId";

    User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    const req = {
      userId,
      body: {
        socialLinkId: linkId,
      },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    await userController.deleteSocialLink(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error deleting social link from user",
      error: new Error("Database error"),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
