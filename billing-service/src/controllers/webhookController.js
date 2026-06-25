const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookService = require("../services/webhookService");

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await webhookService.handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        console.error("Error handling webhook event:", error.message);
        res.status(500).json({ error: "Failed to process webhook update" });
    }
};

module.exports = {
    handleStripeWebhook
};
