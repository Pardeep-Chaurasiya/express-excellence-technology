const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// const expireIn = new Date(Date.now() + 60 * 60 * 1000);

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
// accessTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

const AccessToken = mongoose.model("accessToken", accessTokenSchema);
module.exports = AccessToken;
