const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const authController = require("../controller/authController")

const router = express.Router()

router.post("/register", authController.registerController);
router.post("/login", authController.loginController);

router.post("/user/forgotpassword", authController.forgetPassword);
router.put("/user/verify-reset-password/:resetToken",authController.resetPassword);

module.exports = router;