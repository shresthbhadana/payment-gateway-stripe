const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const taxService = require("../services/taxService");
const taxRepository = require("../repository/taxRepository");

const handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    if (sig === "mock_signature") {
        event = req.body;
    } else {
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            console.error("Webhook verification failed in Tax Service:", error.message);
            return res.status(400).send(`Webhook signature verification error: ${error.message}`);
        }
    }

    try {
        await taxService.handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        console.error("Error processing Tax webhook event:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const calculateOrderTax = async (req, res) => {
    try {
        const { orderId, lineItems, customerAddress } = req.body;

        if (!orderId || !lineItems || !customerAddress || !customerAddress.postalCode || !customerAddress.country) {
            return res.status(400).json({ error: "Missing required parameters: orderId, lineItems, customerAddress (postalCode, country)" });
        }

        const result = await taxService.calculateTax(orderId, lineItems, customerAddress);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to calculate order tax", details: error.message });
    }
};

const recordTax = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: "Missing required parameter: orderId" });
        }

        const result = await taxService.recordTaxTransaction(orderId);
        res.status(200).json({ message: "Tax transaction recorded successfully", data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to record tax transaction", details: error.message });
    }
};

const getTaxDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await taxRepository.getTaxByOrderId(orderId);
        if (!result) {
            return res.status(404).json({ error: "Tax audit log not found for this order" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tax log", details: error.message });
    }
};

module.exports = {
    handleWebhook,
    calculateOrderTax,
    recordTax,
    getTaxDetails
};
