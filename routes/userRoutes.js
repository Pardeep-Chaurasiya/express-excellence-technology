const express = require("express");
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


router.get("/user/get", authMiddleware, userController.getUser);
router.get("/user/getusers", authMiddleware, userController.getUsers);
router.put("/user/deleteuser", authMiddleware, userController.deleteUser);
router.get("/user/get/:id", authMiddleware, userController.getUserWithId);
router.put("/user/profile-image",authMiddleware,upload.single("profileImage"),userController.profileImage);
router.post("/user/upload",authMiddleware,upload.single("file"),userController.cloudinaryUpload);

module.exports = router;
