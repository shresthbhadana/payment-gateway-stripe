const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookService = require("../services/webhookService");

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Webhook verification failed:", error.message);
        return res.status(400).send(`Webhook verification failed: ${error.message}`);
    }

    try {
        await webhookService.handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        console.error("Error handling Stripe Connect webhook event:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = {
    handleStripeWebhook
};