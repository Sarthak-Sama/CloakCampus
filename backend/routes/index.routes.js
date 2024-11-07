const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const indexControllers = require("../controllers/index.controller");
router.get("/", (req, res) => {
  res.send("server is running");
});

router.get("/auth/verify", indexControllers.authVerify);

module.exports = router;
