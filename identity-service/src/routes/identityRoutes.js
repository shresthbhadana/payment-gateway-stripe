const express = require("express");
const router = express.Router();
const identityController = require("../controllers/identityControllers");

router.post("/webhook", identityController.handleWebhook);
router.post("/verify/session", identityController.createIDVerification);
router.get("/verify/status/:userId", identityController.getIDVerificationStatus);
router.post("/financial-connections/session", identityController.createBankLinkSession);
router.get("/financial-connections/accounts/:userId", identityController.getConnectedBanks);

module.exports = router;
