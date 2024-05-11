const User = require("../../models/user");
const UserUploadModel = require("../../models/userUploads");
const userController = require("../../controllers/userController");

describe("getBannerImage", () => {
  it("should return the banner image when it exists", async () => {
    const req = {
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      bannerImage: "bannerImageId",
    });

    UserUploadModel.findById = jest.fn().mockResolvedValue({
      _id: "bannerImageId",
      url: "bannerImageUrl",
      originalname: "bannerImageName",
    });

    await userController.getBannerImage(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(UserUploadModel.findById).toHaveBeenCalledWith("bannerImageId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      _id: "bannerImageId",
      url: "bannerImageUrl",
      originalname: "bannerImageName",
    });
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should return a 404 error when the user is not found", async () => {
    const req = {
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getBannerImage(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    expect(res.send).not.toHaveBeenCalled();
  });

  it("should return a 404 error when the banner image is not found", async () => {
    const req = {
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      bannerImage: "bannerImageId",
    });

    UserUploadModel.findById = jest.fn().mockResolvedValue(null);

    await userController.getBannerImage(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(UserUploadModel.findById).toHaveBeenCalledWith("bannerImageId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Banner image not found",
    });
    expect(res.send).not.toHaveBeenCalled();
  });

  it("should return a 500 error when there is an error getting the banner image", async () => {
    const req = {
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    await userController.getBannerImage(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error getting banner image",
    });
    expect(res.send).not.toHaveBeenCalled();
  });
});
