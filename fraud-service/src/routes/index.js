const express = require("express");
const router = express.Router();
const fraudRoutes = require("./fraudRoutes");

router.use("/", fraudRoutes);

module.exports = router;
