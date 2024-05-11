const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const { getBannerImage } = require("../../controllers/subredditController");
jest.mock("../../models/subReddit");
jest.mock("../../models/userUploads");

describe("getBannerImage", () => {
  const req = { query: { subredditId: "testSubredditId" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  const mockSubreddit = { appearance: { bannerImage: "testBannerImageId" } };
  const mockBannerImage = { _id: "testBannerImageId", url: "testUrl", originalname: "testOriginalname" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if subreddit does not exist", async () => {
    SubReddit.findById.mockResolvedValue(null);
    await getBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return 404 if banner image does not exist in subreddit", async () => {
    SubReddit.findById.mockResolvedValue({ appearance: {} });
    await getBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Banner image not found" });
  });

  it("should return 404 if banner image does not exist in UserUploadModel", async () => {
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    UserUploadModel.findById.mockResolvedValue(null);
    await getBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Banner image not found" });
  });

  it("should return banner image if it exists", async () => {
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    UserUploadModel.findById.mockResolvedValue(mockBannerImage);
    await getBannerImage(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockBannerImage);
  });
  
 
});