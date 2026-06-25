const subscriptionService = require("../services/subscriptionService");

const createCheckoutSession = async (req, res) => {
    try {
        const { userId, email, priceId, successUrl, cancelUrl } = req.body;
        if (!userId || !email || !priceId || !successUrl || !cancelUrl) {
            return res.status(400).json({ error: "Missing required checkout parameters" });
        }

        const session = await subscriptionService.createSubscriptionSession({
            userId,
            email,
            priceId,
            successUrl,
            cancelUrl
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: "Failed to create checkout session", details: error.message });
    }
};

const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId, immediate } = req.body;
        if (!subscriptionId) {
            return res.status(400).json({ error: "subscriptionId is required" });
        }

        let result;
        if (immediate) {
            result = await subscriptionService.cancelSubscriptionImmediate(subscriptionId);
        } else {
            result = await subscriptionService.cancelSubscriptionAtPeriodEnd(subscriptionId);
        }
        res.status(200).json({ message: "Subscription cancel request processed", data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to cancel subscription", details: error.message });
    }
};

const pauseSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        if (!subscriptionId) {
            return res.status(400).json({ error: "subscriptionId is required" });
        }

        const result = await subscriptionService.pauseSubscription(subscriptionId);
        res.status(200).json({ message: "Subscription payments paused", data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to pause subscription", details: error.message });
    }
};

const resumeSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        if (!subscriptionId) {
            return res.status(400).json({ error: "subscriptionId is required" });
        }

        const result = await subscriptionService.resumeSubscription(subscriptionId);
        res.status(200).json({ message: "Subscription payments resumed", data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to resume subscription", details: error.message });
    }
};

module.exports = {
    createCheckoutSession,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription
};
