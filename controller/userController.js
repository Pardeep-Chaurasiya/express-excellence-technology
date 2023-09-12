
const mappedUser = require("../helpers/reqMapper");
const cloudinary = require("../utils/cloudinary");

const User = require("../models/userSchema");
const Address = require("../models/addressSchema");


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

  getUser,
  getUsers,
  deleteUser,
  getUserWithId,
  profileImage,
  cloudinaryUpload,
};
