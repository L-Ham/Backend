const jwt = require("jsonwebtoken");
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);
  if (!token) {
    // return res.status(401).json({ message: "Unauthorized: No token provided" });
    req.userId = null;
    next();
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      req.userId = decoded.user.id;
      console.log("Ana fl Authentication");
      // console.log(req.userId);
      next();
    });
  }
};

module.exports = authenticateToken;
