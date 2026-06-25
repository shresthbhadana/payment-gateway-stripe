const express = require("express");
const router = express.Router();

const connectRoutes = require("./connectRoutes");
const webhookRoutes = require("./webhookRoutes");

router.use("/seller", connectRoutes);
router.use("/webhook", webhookRoutes);

module.exports = router;
