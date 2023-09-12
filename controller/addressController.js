const Address = require("../models/addressSchema");
const User = require("../models/userSchema");


const createAddress = async (req, res) => {
    try {
      const { address, city, state, pin_code, phone_no } = req.body;
      const userId = req.User._id;
  
      if (!address || !city || !state || !pin_code || !phone_no) {
        return res
          .status(400)
          .json({ code: "Invalid_Input", error: "Please fill all feilds" });
      }
      const newAddress = new Address({
        user_id: userId,
        address,
        city,
        state,
        pin_code,
        phone_no,
      });
  
      const savedAddress = await newAddress.save();
  
      await User.findByIdAndUpdate(
        userId,
        { $push: { addresses: savedAddress._id } },
        { new: true, upsert: true }
      );
  
      res.json({ code: "Address-Created-Successfully", data: newAddress });
    } catch (error) {
      console.error(error.toString());
    }
};

const deleteAddress = async (req, res) => {
    try {
      const userId = req.User._id;
      const address = req.User.addresses.toString();
      const addressArray = address.split(",");
      const deleteaddress = await Address.deleteMany({
        _id: { $in: addressArray },
      });
      const userUpdateResult = await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { $in: addressArray } } }
      );
      if (!deleteaddress) {
        return res.status(200).json({
          code: "Address-Deletion-Failed",
          message: "Address deletion failed or user not updated",
        });
      }
      return res.status(200).json({
        code: "Deletion-Successfully",
        message: "User Address Deleted successfully",
      });
    } catch (error) {
      console.log(error.toString());
      return res
        .status(400)
        .json({ code: "Something-Went-Wrong", message: "Deletion is not done" });
    }
};

module.exports={createAddress,deleteAddress}