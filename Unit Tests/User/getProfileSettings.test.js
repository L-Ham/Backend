const User = require("../../models/user");
const userController = require("../../controllers/userController");

jest.mock("../../models/user");

describe("getProfileSettings", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      userId: "user_id",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all profile settings if user is found", async () => {
    const user = {
      profileSettings: new Map([
        ["displayName", "John Doe"],
        ["about", "Lorem ipsum"],
        ["socialLinks", ["link1", "link2"]],
        ["avatarImage", "avatar.jpg"],
        ["bannerImage", "banner.jpg"],
        ["NSFW", true],
        ["allowFollow", false],
        ["contentVisibility", "public"],
        ["communitiesVisibility", "private"],
        ["clearHistory", true],
      ]),
      socialLinks: ["link1", "link2"],
    };
    User.findById.mockResolvedValueOnce(user);

    await userController.getProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith("user_id");
    expect(res.json).toHaveBeenCalledWith({
      profileSettings: {
        displayName: "John Doe",
        about: "Lorem ipsum",
        socialLinks: ["link1", "link2"],
        avatarImage: "avatar.jpg",
        bannerImage: "banner.jpg",
        NSFW: true,
        allowFollow: false,
        contentVisibility: "public",
        communitiesVisibility: "private",
        clearHistory: true,
      },
    });
  });

  it("should return default profile settings if user is found but some settings are missing", async () => {
    const user = {
      profileSettings: new Map([
        ["displayName", "John Doe"],
        ["about", "Lorem ipsum"],
        ["socialLinks", ["link1", "link2"]],
        ["avatarImage", "avatar.jpg"],
      ]),
      socialLinks: ["link1", "link2"],
    };
    User.findById.mockResolvedValueOnce(user);

    await userController.getProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith("user_id");
    expect(res.json).toHaveBeenCalledWith({
      profileSettings: {
        displayName: "John Doe",
        about: "Lorem ipsum",
        socialLinks: ["link1", "link2"],
        avatarImage: "avatar.jpg",
        bannerImage: undefined,
        NSFW: undefined,
        allowFollow: undefined,
        contentVisibility: undefined,
        communitiesVisibility: undefined,
        clearHistory: undefined,
      },
    });
  });

  it("should return 404 if user is not found", async () => {
    User.findById.mockResolvedValueOnce(null);

    await userController.getProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith("user_id");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if there is a server error", async () => {
    User.findById.mockRejectedValueOnce("Error");

    await userController.getProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith("user_id");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
