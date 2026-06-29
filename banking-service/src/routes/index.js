const express = require("express");
const router = express.Router();
const bankingRoutes = require("./bankingRoutes");

router.use("/", bankingRoutes);

module.exports = router;
