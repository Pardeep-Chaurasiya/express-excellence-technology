const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { mongoose } = require("mongoose");
const User = mongoose.model("User");
const mappedUser = require("../helpers/reqMapper");

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

// const registerController = async (req, res) => {
//   const { firstName, lastName, userName, email, password, confirmPassword } =
//     req.body;
//   if (
//     !firstName ||
//     !lastName ||
//     !userName ||
//     !email ||
//     !password ||
//     !confirmPassword
//   ) {
//     return res
//       .status(422)
//       .json({ code: "Invalid-Input", error: "Please fill all feilds" });
//   }

//   const existEmail = await User.findOne({ email });
//   const existUserName = await User.findOne({ userName });
//   if (existEmail) {
//     return res
//       .status(400)
//       .json({ code: "Invalid-Input", error: "Email already exists!!" });
//   }
//   if (existUserName) {
//     return res
//       .status(400)
//       .json({ code: "Invalid-Input", error: "Username already exists!!" });
//   }
//   const salt = 10;
//   const hashPassword = await bcrypt.hash(password, salt);
//   if (password !== confirmPassword) {
//     return res.status(400).json({
//       code: "Invalid-Input",
//       error: "Password and Confirm Password does't matched !!",
//     });
//   }
//   const newUser = new User({
//     firstName,
//     lastName,
//     userName,
//     email,
//     password: hashPassword,
//   });

//   const saveUser = await newUser.save();
//   delete saveUser.password;

//   if (!saveUser) {
//     return res
//       .status(400)
//       .json({ code: "", error: "Something went wrong while register user" });
//   }
//   return res.status(200).json({
//     message: "User Register Successfully !!",
//     User: mappedUser(saveUser),
//   });
// };

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
  const access_token = existUserName._id.toString();
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
    data: { access_token },
  });
};

const getUser = async (req, res) => {
  try {
    const existUser = await User.findById({ _id: req.User._id }).select({
      password: 0,
    });
    if (!existUser) {
      return res
        .status(400)
        .json({ code: "User-Not-Found", error: "User does not exists " });
    }
    return res.status(200).json({
      code: "Success",
      message: "User exists",
      user: existUser,
    });
  } catch (error) {
    console.error(error.toString());
    return res
      .status(500)
      .json({ code: "Internal-Server-Error", error: error.toString() });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page } = req.query || 1;
    const { perPage } = req.query || 10;

    const startIndex = (page - 1) * perPage;

    const users = await User.find({})
      .select({
        password: 0,
      })
      .skip(startIndex)
      .limit(perPage);

    if (!users) {
      return res
        .status(400)
        .json({ code: "Users-Not-Found", error: "Users does not exists " });
    }
    return res.status(200).json({
      code: "Success",
      message: "Users exists",
      users,
    });
  } catch (error) {
    console.error(error.toString());
    return res
      .status(500)
      .json({ code: "Internal-Server-Error", error: error.toString() });
  }
};

const deleteUser = async (req, res) => {
  try {
    const existUser = await User.findById({ _id: req.User._id });
    if (!existUser) {
      return res
        .status(400)
        .json({ code: "User-Not-Found", error: "User does not exists " });
    }
    const deleteUser = await User.deleteOne(existUser);
    if (deleteUser) {
      return res.status(200).json({
        code: "Success",
        message: "User deleted successfully",
        user: mappedUser(existUser),
      });
    }
  } catch (error) {
    console.error(error.toString());
    return res
      .status(500)
      .json({ code: "Internal-Server-Error", error: error.toString() });
  }
};

module.exports = {
  registerController,
  loginController,
  getUser,
  getUsers,
  deleteUser,
};
