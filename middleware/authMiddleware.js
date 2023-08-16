const { mongoose, isValidObjectId } = require("mongoose");
const User = require("../models/userSchema");
const accessToken = require("../models/accessTokenSechma");

const authMiddleware = async (req, res, next) => {
  try {
    const { access_token } = req.headers;
    if (!access_token) {
      return res.status(401).json({
        code: "Invalid-Token ",
        error: "Please provide Valid access token",
      });
    }

    const validAccessToken = await accessToken.findOne({
      accessToken: access_token,
    });

    if (!validAccessToken) {
      return res.status(400).json({
        code: "User-Not-Logged-In",
        message: "Please login first to access this resource",
      });
    }
    const existUser = await User.findById({
      _id: validAccessToken.userId,
    }).select({
      password: 0,
    });
    if (!existUser) {
      return res
        .status(401)
        .json({ code: "Unauthorized", error: "User does not exists " });
    }
    req.User = existUser;
    next();
  } catch (error) {
    console.error(error.toString());
    res.status(401).json({ code: "Unauthorized", error: "Unusual Activity" });
  }
};

module.exports = authMiddleware;
