const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware.isAuthenticated);
router.use(authMiddleware.isAdmin);

router.post("/blacklist-user", adminController.blacklistUser);  
router.get("/reports", adminController.getReports);


module.exports = router;