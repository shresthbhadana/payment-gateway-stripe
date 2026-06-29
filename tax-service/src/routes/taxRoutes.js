const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxController");
router.post("/webhook", taxController.handleWebhook);
router.post("/calculate", taxController.calculateOrderTax);
router.post("/record", taxController.recordTax);
router.get("/details/:orderId", taxController.getTaxDetails);

module.exports = router;