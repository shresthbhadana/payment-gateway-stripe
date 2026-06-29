const express = require("express");
const router = express.Router();
const bankingController = require("../controllers/bankingController");

router.post("/webhook", bankingController.handleWebhook);
router.post("/cardholders", bankingController.createCardholder);
router.post("/cards", bankingController.issueNewCard);
router.post("/treasury/accounts", bankingController.createTreasuryAccount);

router.get("/treasury/accounts/:userId", bankingController.getTreasuryAccount);

module.exports = router;
