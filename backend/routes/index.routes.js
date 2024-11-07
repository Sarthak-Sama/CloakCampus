const express = require("express");
const router = express.Router();
const indexControllers = require("../controllers/index.controller");

router.get("/", (req, res) => {
  res.send("server is running");
});

router.post("/auth/verify", indexControllers.authVerify);

module.exports = router;
