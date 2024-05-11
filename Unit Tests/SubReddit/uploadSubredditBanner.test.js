const { uploadBannerImage } = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");
const UserUpload = require("../../controllers/userUploadsController");
const mongoose = require("mongoose");
jest.mock("../../models/subReddit");
jest.mock("../../controllers/userUploadsController");

describe("uploadBannerImage", () => {
  const req = {
    userId: "testUserId",
    body: { subredditId: "testSubredditId" },
    files: [{ name: "testFile" }],
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockSubreddit = {
    moderators: ["testUserId"],
    appearance: {},
    save: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if subreddit does not exist", async () => {
    SubReddit.findById.mockResolvedValue(null);
    await uploadBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "subreddit not found" });
  });

  it("should return 403 if user is not a moderator", async () => {
    mockSubreddit.moderators = ["anotherUserId"];
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await uploadBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "User not a moderator" });
  });

  it("should return 400 if no file provided", async () => {
    req.files = [];
    mockSubreddit.moderators = ["testUserId"];
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await uploadBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "No file provided for banner image",
    });
  });

  it("should return 400 if failed to upload banner image", async () => {
    req.files = [{ name: "testFile" }];
    UserUpload.uploadMedia.mockResolvedValue(null);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await uploadBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to upload banner image",
    });
  });

  it("should upload banner image successfully", async () => {
    UserUpload.uploadMedia.mockResolvedValue("uploadedImageId");
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await uploadBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Banner image uploaded successfully",
    });
  });

  it("should return 500 if there is an error", async () => {
    const errorMessage = "Error occurred";
    SubReddit.findById.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    await uploadBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error uploading banner image",
    });
  });
});
