const express = require("express");
const router = express.Router();
const { getUserInvoices } = require("../controllers/invoiceController");

router.get("/:userId", getUserInvoices);

module.exports = router;
