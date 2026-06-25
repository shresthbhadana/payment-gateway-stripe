const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
    try {
        const { items, customerEmail } = req.body;

        if (!items || !items.length || !customerEmail) {
            return res.status(400).json({ error: "Missing required fields: items, customerEmail" });
        }

        const result = await orderService.createOrder({ items, customerEmail });
        
        res.status(201).json({
            message: "Order created successfully. Please redirect user to Stripe.",
            ...result
        });
    } catch (error) {
        console.error("Order creation failed:", error.message);
        res.status(500).json({ error: error.message || "Server error during order creation" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        res.json(order);
    } catch (error) {
        console.error("Error fetching order status:", error.message);
        if (error.message === "Order not found") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Server error fetching order details" });
    }
};

const handleInternalPaymentSuccess = async (req, res) => {
    try {
        const { orderId, stripeSessionId, stripePaymentIntentId } = req.body;
        
        await orderService.handlePaymentSuccessCallback({
            orderId,
            stripeSessionId,
            stripePaymentIntentId
        });
        
        res.json({ success: true, message: "Order payment status updated to paid" });
    } catch (error) {
        console.error("Error in internal payment success callback:", error.message);
        if (error.message === "Order not found") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Server error during internal payment updates" });
    }
};

const handleInternalPaymentFailure = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        await orderService.handlePaymentFailureCallback({ orderId });
        
        res.json({ success: true, message: "Order status updated to failed" });
    } catch (error) {
        console.error("Error in internal payment failure callback:", error.message);
        if (error.message === "Order not found") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Server error during internal status update" });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    handleInternalPaymentSuccess,
    handleInternalPaymentFailure
};
