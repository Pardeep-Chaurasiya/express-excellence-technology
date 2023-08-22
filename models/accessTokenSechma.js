const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const accessTokenSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, index: { expires: "1h" } },
});

const AccessToken = mongoose.model("accessToken", accessTokenSchema);
module.exports = AccessToken;
