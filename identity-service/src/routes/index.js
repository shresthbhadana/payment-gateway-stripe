const express = require("express");
const router = express.Router();
const identityRoutes = require("./identityRoutes");

router.use("/", identityRoutes);

module.exports = router;
