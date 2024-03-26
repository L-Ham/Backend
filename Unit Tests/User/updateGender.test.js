const User = require("../../models/user");
const userController = require("../../controllers/userController");
describe("updateGender", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully update user gender when valid user ID is provided", (done) => {
    const req = {
      userId: "validUserId",
      body: { gender: "male" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementationOnce((data) => {
        // Assertions
        expect(User.findById).toHaveBeenCalledWith("validUserId");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(data).toEqual({
          message: "User gender updated successfully",
          user: {
            gender: "male",
          },
        });
        done();
      }),
    };
    const next = jest.fn();

    User.findById = jest.fn().mockResolvedValue({
      gender: "female",
      save: jest.fn().mockResolvedValue({
        gender: "male",
      }),
    });

    userController.updateGender(req, res, next);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should not update user gender if the gender is the same as the current gender", (done) => {
    const req = {
      userId: "validUserId",
      body: { gender: "female" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementationOnce((data) => {
        // Assertions
        expect(User.findById).toHaveBeenCalledWith("validUserId");
        expect(res.status).toHaveBeenCalledWith(400);
        expect(data).toEqual({
          message: "Gender is already set to this value",
        });
        done();
      }),
    };
    const next = jest.fn();

    User.findById = jest.fn().mockResolvedValue({
      gender: "female",
      save: jest.fn().mockResolvedValue({
        gender: "female",
      }),
    });

    userController.updateGender(req, res, next);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should not update user gender if the gender is the same as the current gender", (done) => {
    const req = {
      userId: "validUserId",
      body: { gender: "female" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementationOnce((data) => {
        // Assertions
        expect(User.findById).toHaveBeenCalledWith("validUserId");
        expect(res.status).toHaveBeenCalledWith(400);
        expect(data).toEqual({
          message: "Gender is already set to this value",
        });
        done();
      }),
    };
    const next = jest.fn();

    User.findById = jest.fn().mockResolvedValue({
      gender: "female",
      save: jest.fn().mockResolvedValue({
        gender: "female",
      }),
    });

    userController.updateGender(req, res, next);
  });
});
