const express = require("express");
const router = express.Router();
const connectController = require("../controllers/connectController");

// Vendor / Seller onboarding
router.post("/onboard", connectController.onboardSeller);

// Retrieve onboarding status
router.get("/status/:userId", connectController.checkStatus);

// Create checkout session for marketplace transactions
router.post("/checkout", connectController.createCheckout);

module.exports = router;
