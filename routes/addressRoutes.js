const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const addressController = require("../controller/addressController")

const router = express.Router()

router.post("/user/address", authMiddleware, addressController.createAddress);
router.delete("/user/address", authMiddleware, addressController.deleteAddress);

module.exports = router;
