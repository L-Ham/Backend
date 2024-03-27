const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe("followUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should successfully follow a user who is not already followed", async () => {
    const req = {
      userId: new ObjectId("660361f20a90d8a02dff19e2"),
      body: {
        usernameToFollow: "user2",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const user1 = {
      _id: new ObjectId("660361f20a90d8a02dff19e2"),
      following: [],
      blockUsers: [],
      save: jest.fn(),
    };

    const user2 = {
      _id: new ObjectId("660361f20a90d8a02dff19e3"),
      followers: [],
      blockUsers: [],
      save: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(user1);
    User.findOne = jest.fn().mockResolvedValue(user2);
    await userController.followUser(req, res, next);
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    console.log(user1.following);
    expect(User.findOne).toHaveBeenCalledWith({ userName: "user2" });
    expect(user1.following).toContainEqual(user2._id);
    expect(user2.followers).toContainEqual(user1._id);
    expect(user1.save).toHaveBeenCalled();
    expect(user2.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User followed successfully",
      user: user2,
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return an error message when attempting to follow a user who does not exist", async () => {
    const req = {
      userId: new ObjectId().toString(),
      body: {
        usernameToFollow: "user2",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    User.findById = jest.fn().mockResolvedValue(null);
    await userController.followUser(req, res, next);
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  //should return an error message when attempting to follow a user who is already followed
  it("should return an error message when attempting to follow a user who is already followed", async () => {
    const oid = new ObjectId("660361f20a90d8a02dff19e2");
    const oid2 = new ObjectId("660361f20a90d8a02dff19e3");
    const req = {
      userId: oid,
      body: {
        usernameToFollow: "user2",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const user1 = {
      _id: oid,
      following: [oid2],
      blockUsers: [],
    };

    const user2 = {
      _id: oid2,
      followers: [oid],
      blockUsers: [],
    };

    User.findById = jest.fn().mockResolvedValue(user1);
    User.findOne = jest.fn().mockResolvedValue(user2);
    await userController.followUser(req, res, next);
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(User.findOne).toHaveBeenCalledWith({ userName: "user2" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already followed",
    });
  });
  //should return an error message when attempting to follow a user who is blocked
  it("should return an error message when attempting to follow a user who is blocked", async () => {
    const oid = new ObjectId("660361f20a90d8a02dff19e2");
    const oid2 = new ObjectId("660361f20a90d8a02dff19e3");
    const req = {
      userId: oid,
      body: {
        usernameToFollow: "user2",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const user1 = {
      _id: oid,
      following: [],
      blockUsers: [],
    };

    const user2 = {
      _id: oid2,
      followers: [],
      blockUsers: [oid],
    };

    User.findById = jest.fn().mockResolvedValue(user1);
    User.findOne = jest.fn().mockResolvedValue(user2);
    await userController.followUser(req, res, next);
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(User.findOne).toHaveBeenCalledWith({ userName: "user2" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "You have been blocked by this user",
    });
  });
  //
});
