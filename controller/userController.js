const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mappedUser = require("../helpers/reqMapper");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");

const User = require("../models/userSchema");
const Address = require("../models/addressSchema");
const AccessToken = require("../models/accessTokenSechma");
const sendEmail = require("../utils/sendEmail");

// const registerController = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res
//       .status(400)
//       .json({ code: "Invalid-Input", errors: errors.toString() });
//   }

//   const { firstName, lastName, userName, email, password, confirmPassword } =
//     req.body;

//   try {
//     const existingEmailUser = await User.findOne({ email });
//     const existingUsernameUser = await User.findOne({ userName });

//     if (existingEmailUser) {
//       return res
//         .status(400)
//         .json({ code: "Invalid-Input", error: "Email already exists!!" });
//     }
//     if (existingUsernameUser) {
//       return res
//         .status(400)
//         .json({ code: "Invalid-Input", error: "Username already exists!!" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         code: "Invalid-Input",
//         error: "Password and Confirm Password don't match !!",
//       });
//     }

//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const newUser = new User({
//       firstName,
//       lastName,
//       userName,
//       email,
//       password: hashedPassword,
//     });

//     const savedUser = await newUser.save();
//     savedUser.password = undefined;

//     if (!savedUser) {
//       return res.status(400).json({
//         code: "Internal-Server-Error",
//         error: "Something went wrong while registering user",
//       });
//     }

//     return res.status(200).json({
//       message: "User Registered Successfully !!",
//       User: savedUser,
//     });
//   } catch (error) {
//     console.error("Error while registering user:", error);
//     return res
//       .status(500)
//       .json({ code: "Internal-Server-Error", error: "Internal server error" });
//   }
// };

// const loginController = async (req, res) => {
//   const { userName, password } = req.body;

//   if (!userName || !password) {
//     return res
//       .status(422)
//       .json({ code: "Invalid_INPUT", error: "Please fill all feilds" });
//   }
//   const existUserName = await User.findOne({ userName });
//   if (!existUserName) {
//     return res
//       .status(404)
//       .json({ code: "User-Not-Found", error: "User not found" });
//   }

//   const token = await jwt.sign(
//     { _id: existUserName._id },
//     process.env.JWT_SECRET_KEY
//   );

//   const accesstoken = new AccessToken();
//   accesstoken.userId = existUserName._id;
//   accesstoken.accessToken = token;

//   await accesstoken.save();

//   const comparePassword = await bcrypt.compare(
//     password,
//     existUserName.password
//   );
//   if (!comparePassword) {
//     return res.status(400).json({
//       code: "Invalid-UserName-Password",
//       error: "Invalid username or password",
//     });
//   }
//   return res.status(200).json({
//     code: "Success",
//     message: "Login successfully",
//     data: { token },
//   });
// };

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

    const address = await Address.find({ user_id: existUser._id });
    existUser.address = address;

    return res.status(200).json({
      code: "Success",
      message: "User exists",
      user: { existUser },
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

// const createAddress = async (req, res) => {
//   try {
//     const { address, city, state, pin_code, phone_no } = req.body;
//     const userId = req.User._id;

//     if (!address || !city || !state || !pin_code || !phone_no) {
//       return res
//         .status(400)
//         .json({ code: "Invalid_Input", error: "Please fill all feilds" });
//     }
//     const newAddress = new Address({
//       user_id: userId,
//       address,
//       city,
//       state,
//       pin_code,
//       phone_no,
//     });

//     const savedAddress = await newAddress.save();

//     await User.findByIdAndUpdate(
//       userId,
//       { $push: { addresses: savedAddress._id } },
//       { new: true, upsert: true }
//     );

//     res.json({ code: "Address-Created-Successfully", data: newAddress });
//   } catch (error) {
//     console.error(error.toString());
//   }
// };

const getUserWithId = async (req, res) => {
  try {
    const { id } = req.params;

    const existUser = await User.findById(id).populate("addresses", "address");
    console.log(existUser);
    return res.status(200).json({
      code: "Valid-User",
      message: "User exist in this id",
      existUser,
    });
  } catch (error) {
    console.error(error.toString());
    return res
      .status(400)
      .json({ code: "Invalid-User", error: "User not found" });
  }
};

// const deleteAddress = async (req, res) => {
//   try {
//     const userId = req.User._id;
//     const address = req.User.addresses.toString();
//     const addressArray = address.split(",");
//     const deleteaddress = await Address.deleteMany({
//       _id: { $in: addressArray },
//     });
//     const userUpdateResult = await User.updateOne(
//       { _id: userId },
//       { $pull: { addresses: { $in: addressArray } } }
//     );
//     if (!deleteaddress) {
//       return res.status(200).json({
//         code: "Address-Deletion-Failed",
//         message: "Address deletion failed or user not updated",
//       });
//     }
//     return res.status(200).json({
//       code: "Deletion-Successfully",
//       message: "User Address Deleted successfully",
//     });
//   } catch (error) {
//     console.log(error.toString());
//     return res
//       .status(400)
//       .json({ code: "Something-Went-Wrong", message: "Deletion is not done" });
//   }
// };

// const forgetPassword = async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY, {
//     expiresIn: "15m",
//   });

//   const data = await User.updateOne(
//     { email },
//     { $set: { resetToken: resetToken } }
//   );

//   sendEmail(user.firstName, email, resetToken);

//   res.status(200).json({
//     code: "Reset-Token-Sent",
//     message: "Please check your mail for password reset",
//     data,
//   });
// };

// const resetPassword = async (req, res) => {
//   try {
//     const { password, confirmPassword } = req.body;
//     const { resetToken } = req.params;

//     const decoded = jwt.verify(resetToken, process.env.JWT_RESET_KEY);

//     if (!password || !confirmPassword) {
//       return res
//         .status(400)
//         .json({ code: "Invalid-Feilds", message: "Please fill all feilds" });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         code: "Invalid-Input",
//         message: "Password and confirm password does not matched",
//       });
//     }

//     const user = await User.findById(decoded._id);
//     if (!user) {
//       return res.status(400).json({ error: "User not found" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);

//     user.password = hashedPassword;
//     await user.save();

//     res.json({ message: "Password reset successfully" });
//   } catch (error) {
//     return res
//       .status(204)
//       .json({ success: true, message: "This is already used " });
//   }
// };

const profileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }
    res.json({ message: "Profile image uploaded successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const cloudinaryUpload = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const userId = req.User._id;
    const uploadFile = await User.findByIdAndUpdate(
      userId,
      { $push: { files: result.url } },
      { new: true, upsert: true }
    ).select({ password: 0 });
    res.json({
      code: "File-Upload-Successfully",
      data: uploadFile,
    });
  } catch (error) {
    res.status(400).json({ message: "file not upload", error: error.message });
  }
};

module.exports = {
  // registerController,
  // loginController,
  getUser,
  getUsers,
  deleteUser,
  // createAddress,
  getUserWithId,
  // deleteAddress,
  // forgetPassword,
  // resetPassword,
  profileImage,
  cloudinaryUpload,
};
