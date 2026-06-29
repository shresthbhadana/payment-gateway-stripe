const express = require("express");
const router = express.Router();
const taxRoutes = require("./taxRoutes");
router.use("/", taxRoutes);
module.exports = router;