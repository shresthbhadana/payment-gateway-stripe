const express = require("express");
const router = express.Router();
const {
    createOrder,
    getOrderById,
    handleInternalPaymentSuccess,
    handleInternalPaymentFailure
} = require("../controllers/orderController");

// Public routes
router.post("/", createOrder);
router.get("/:id", getOrderById);

// Service-to-service internal callbacks
router.post("/internal/payment-success", handleInternalPaymentSuccess);
router.post("/internal/payment-failure", handleInternalPaymentFailure);

module.exports = router;
