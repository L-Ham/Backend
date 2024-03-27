const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe("editSocialLink", () => {
  it("should return an error message when the user is not found", async () => {
    const req = {
      userId: "user123",
      body: {
        linkId: "link123",
        linkOrUsername: "newUsername",
        appName: "newApp",
        logo: "newLogo",
        displayText: "newText",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValueOnce(null);

    await userController.editSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it("should update social link when valid input is provided", async () => {
    const req = {
      userId: "user123",
      body: {
        linkId: "link123",
        linkOrUsername: "newUsername",
        appName: "newApp",
        logo: "newLogo",
        displayText: "newText",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      _id: "user123",
      socialLinks: [
        {
          _id: "link123",
          linkOrUsername: "oldUsername",
          appName: "oldApp",
          logo: "oldLogo",
          displayText: "oldText",
        },
      ],
      save: jest.fn().mockResolvedValueOnce({
        _id: "user123",
        socialLinks: [
          {
            _id: "link123",
            linkOrUsername: "newUsername",
            appName: "newApp",
            logo: "newLogo",
            displayText: "newText",
          },
        ],
      }),
    };

    User.findById = jest.fn().mockResolvedValueOnce(user);

    await userController.editSocialLink(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Social link updated successfully",
      user: {
        _id: "user123",
        socialLinks: [
          {
            _id: "link123",
            linkOrUsername: "newUsername",
            appName: "newApp",
            logo: "newLogo",
            displayText: "newText",
          },
        ],
      },
    });
  });
});
