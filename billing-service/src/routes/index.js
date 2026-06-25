const express = require("express");
const router = express.Router();

const planRoutes = require("./planRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const webhookRoutes = require("./webhookRoutes");

router.use("/plans", planRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/webhook", webhookRoutes);

module.exports = router;

