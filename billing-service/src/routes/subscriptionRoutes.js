const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription
} = require("../controllers/subscriptionController");

router.post("/checkout-session", createCheckoutSession);
router.post("/cancel", cancelSubscription);
router.post("/pause", pauseSubscription);
router.post("/resume", resumeSubscription);

module.exports = router;

