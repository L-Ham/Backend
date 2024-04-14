const axios = require("axios");
const verifyGoogleToken = async (req, res, next) => {
  const token = req.body.token;
  console.log("ANA FL GOOGLE");
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    req.decoded = response.data;
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid token", error: error.message });
  }
};

module.exports = verifyGoogleToken;
