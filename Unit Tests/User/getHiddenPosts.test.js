const User = require("../../models/user");
const Post = require("../../models/post");
const SubReddit = require("../../models/subReddit");
const UserServices = require("../../services/userServices");
const PostServices = require("../../services/postServices");
const userController = require("../../controllers/userController");


jest.mock("../../models/user", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/post", () => ({
  find: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

jest.mock("../../services/userServices", () => ({
  paginateResults: jest.fn(),
}));

jest.mock("../../services/postServices", () => ({
  getImagesUrls: jest.fn(),
  getVideosUrls: jest.fn(),
}));

describe("getHiddenPosts", () => {
  it("should return 404 if user is not found", async () => {
    User.findOne.mockResolvedValueOnce(null);

    const req = { query: { username: "user123", page: "1", limit: "10" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await userController.getHiddenPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if the retrieved array is empty", async () => {
    User.findOne.mockResolvedValueOnce({ hidePosts: [] });
    UserServices.paginateResults.mockResolvedValueOnce({ slicedArray: [] });

    const req = { query: { username: "user123", page: "1", limit: "10" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await userController.getHiddenPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "The retrieved array is empty" });
  });

  it("should return 500 if there is an error", async () => {
    User.findOne.mockRejectedValueOnce(new Error("Test error"));

    const req = { query: { username: "user123", page: "1", limit: "10" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await userController.getHiddenPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Getting Posts Hidden by User",
      error: "Test error",
    });
  });
});