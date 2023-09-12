const User = require("../models/userSchema");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AccessToken = require("../models/accessTokenSechma");
const { validationResult } = require("express-validator");

const registerController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ code: "Invalid-Input", errors: errors.toString() });
    }
  
    const { firstName, lastName, userName, email, password, confirmPassword } =
      req.body;
  
    try {
      const existingEmailUser = await User.findOne({ email });
      const existingUsernameUser = await User.findOne({ userName });
  
      if (existingEmailUser) {
        return res
          .status(400)
          .json({ code: "Invalid-Input", error: "Email already exists!!" });
      }
      if (existingUsernameUser) {
        return res
          .status(400)
          .json({ code: "Invalid-Input", error: "Username already exists!!" });
      }
  
      if (password !== confirmPassword) {
        return res.status(400).json({
          code: "Invalid-Input",
          error: "Password and Confirm Password don't match !!",
        });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newUser = new User({
        firstName,
        lastName,
        userName,
        email,
        password: hashedPassword,
      });
  
      const savedUser = await newUser.save();
      savedUser.password = undefined;
  
      if (!savedUser) {
        return res.status(400).json({
          code: "Internal-Server-Error",
          error: "Something went wrong while registering user",
        });
      }
  
      return res.status(200).json({
        message: "User Registered Successfully !!",
        User: savedUser,
      });
    } catch (error) {
      console.error("Error while registering user:", error);
      return res
        .status(500)
        .json({ code: "Internal-Server-Error", error: "Internal server error" });
    }
  };
  
const loginController = async (req, res) => {
    const { userName, password } = req.body;
  
    if (!userName || !password) {
      return res
        .status(422)
        .json({ code: "Invalid_INPUT", error: "Please fill all feilds" });
    }
    const existUserName = await User.findOne({ userName });
    if (!existUserName) {
      return res
        .status(404)
        .json({ code: "User-Not-Found", error: "User not found" });
    }
  
    const token = await jwt.sign(
      { _id: existUserName._id },
      process.env.JWT_SECRET_KEY
    );
  
    const accesstoken = new AccessToken();
    accesstoken.userId = existUserName._id;
    accesstoken.accessToken = token;
  
    await accesstoken.save();
  
    const comparePassword = await bcrypt.compare(
      password,
      existUserName.password
    );
    if (!comparePassword) {
      return res.status(400).json({
        code: "Invalid-UserName-Password",
        error: "Invalid username or password",
      });
    }
    return res.status(200).json({
      code: "Success",
      message: "Login successfully",
      data: { token },
    });
  };

const forgetPassword = async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY, {
      expiresIn: "15m",
    });
  
    const data = await User.updateOne(
      { email },
      { $set: { resetToken: resetToken } }
    );
  
    sendEmail(user.firstName, email, resetToken);
  
    res.status(200).json({
      code: "Reset-Token-Sent",
      message: "Please check your mail for password reset",
      data,
    });
  };
  
const resetPassword = async (req, res) => {
    try {
      const { password, confirmPassword } = req.body;
      const { resetToken } = req.params;
  
      const decoded = jwt.verify(resetToken, process.env.JWT_RESET_KEY);
  
      if (!password || !confirmPassword) {
        return res
          .status(400)
          .json({ code: "Invalid-Feilds", message: "Please fill all feilds" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          code: "Invalid-Input",
          message: "Password and confirm password does not matched",
        });
      }
  
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
  
      user.password = hashedPassword;
      await user.save();
  
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      return res
        .status(204)
        .json({ success: true, message: "This is already used " });
    }
  };

module.exports = {registerController,loginController,forgetPassword,resetPassword}