const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const secretKey = process.env.JWT_SECRET_KEY;

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        code: "Invalid-Token",
        error: "Please provide a valid JWT token",
      });
    }

    const token = authorization.split(" ")[1];

    let decodedToken;
    try {
      decodedToken = jwt.verify(authorization, secretKey);
    } catch (error) {
      return res.status(401).json({
        code: "Unauthorized",
        error: "Invalid token or token expired",
      });
    }

    const existUser = await User.findById(decodedToken._id).select({
      password: 0,
    });

    if (!existUser) {
      return res
        .status(401)
        .json({ code: "Unauthorized", error: "User does not exist" });
    }

    req.User = existUser;
    next();
  } catch (error) {
    console.error(error.toString());
    res.status(401).json({ code: "Unauthorized", error: "Unusual Activity" });
  }
};

module.exports = authMiddleware;
