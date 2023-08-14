const { mongoose, isValidObjectId } = require("mongoose");
const User = mongoose.model("User");

const authMiddleware = async (req, res, next) => {
  try {
    const { access_token } = req.headers;
    if (!access_token || !isValidObjectId(access_token)) {
      return res.status(401).json({
        code: "Invalid-Token ",
        error: "Please provide Valid access token",
      });
    }
    const existUser = await User.findById({ _id: access_token }).select({
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
