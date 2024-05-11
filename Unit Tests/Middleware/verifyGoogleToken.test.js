const axios = require("axios");
const httpMocks = require("node-mocks-http");
const verifyGoogleToken = require("../../middleware/googleAuth");

jest.mock("axios");

describe("verifyGoogleToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    axios.get.mockClear();
  });

  it("should return 401 if no token is provided", async () => {
    await verifyGoogleToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ message: "Unauthorized" });
  });

  it("should call next if token is valid", async () => {
    const token = "valid_token";
    req.body.token = token;
    const response = { data: { id: "123" } };
    axios.get.mockResolvedValue(response);

    await verifyGoogleToken(req, res, next);

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    expect(req.decoded).toEqual(response.data);
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 if token is invalid", async () => {
    const token = "invalid_token";
    req.body.token = token;
    const error = new Error("Invalid token");
    axios.get.mockRejectedValue(error);

    await verifyGoogleToken(req, res, next);

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Invalid token",
      error: error.message,
    });
  });
});
