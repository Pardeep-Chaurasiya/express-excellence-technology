const express = require("express");
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const loginCheck = require("../middleware/loginCheck");

const router = express.Router();

router.post("/register", userController.registerController);
router.post("/login", userController.loginController);
router.get("/user/get", authMiddleware, userController.getUser);
router.get("/user/getusers", authMiddleware, userController.getUsers);
router.put("/user/deleteuser", authMiddleware, userController.deleteUser);
router.post("/user/address", authMiddleware, userController.createAddress);
router.get("/user/get/:id", authMiddleware, userController.getUserWithId);
router.delete("/user/address", authMiddleware, userController.deleteAddress);

module.exports = router;
