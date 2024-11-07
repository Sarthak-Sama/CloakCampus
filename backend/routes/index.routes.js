const express = require("express");
const router = express.Router();
const indexControllers = require("../controllers/index.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", (req, res) => {
  res.send("server is running");
});

router.post(
  "/auth/verify",
  authMiddleware.isAuthenticated,
  indexControllers.authVerify
);

module.exports = router;
