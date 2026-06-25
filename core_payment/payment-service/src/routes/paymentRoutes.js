const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    createPaymentIntent,
    createPaymentLink,
    createTerminalConnectionToken,
    processTerminalPayment,
    handleWebhook,
    checkoutSuccess,
    checkoutCancel
} = require("../controllers/paymentController");

// Core payments - Checkouts
router.post("/checkout-session", createCheckoutSession);

// Core payments - Payment Intents & Elements
router.post("/payment-intent", createPaymentIntent);

// Core payments - Payment Links
router.post("/payment-link", createPaymentLink);

// Core payments - POS Terminal
router.post("/terminal/connection-token", createTerminalConnectionToken);
router.post("/terminal/process-payment", processTerminalPayment);

// Webhook endpoint
router.post("/webhook", handleWebhook);

// Mock success/cancel redirect targets
router.get("/checkout-success", checkoutSuccess);
router.get("/checkout-cancel", checkoutCancel);

module.exports = router;
