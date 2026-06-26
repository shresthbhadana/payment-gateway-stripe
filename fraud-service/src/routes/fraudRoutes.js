const express = require("express");
const router = express.Router();
const fraudController = require("../controllers/fraudController");
router.post("/webhook", fraudController.handleWebhook);
router.get("/warnings", fraudController.getFraudWarnings);
router.get("/disputes", fraudController.getDisputes);
router.post("/disputes/:disputeId/evidence", fraudController.submitEvidence);
module.exports = router;