const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware.isAuthenticated);
router.use(authMiddleware.isAdmin);

router.post("/blacklist-user", adminController.blacklistUser);
router.post("/unblacklist-user", adminController.unblacklistUser);

router.get("/blacklisted-users", adminController.getBlacklistedUsers);
router.get("/searchUser", adminController.searchUser);
router.get("/reports", adminController.getReports);

module.exports = router;
