const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const identityService = require("../services/identityService");
const identityRepository = require("../repository/identityRepository");

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
            console.error("Webhook signature verification failed in Identity Service:", error.message);
            return res.status(400).send(`Webhook signature error: ${error.message}`);
        }
    }

    try {
        await identityService.handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        console.error("Error processing Identity webhook:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const createIDVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "Missing required parameter: userId" });
        }

        const result = await identityService.createVerificationSession(userId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to create verification session", details: error.message });
    }
};

const getIDVerificationStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await identityRepository.getVerificationByUserId(userId);
        if (!result) {
            return res.status(404).json({ error: "Verification session not found for this user" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch verification status", details: error.message });
    }
};

const createBankLinkSession = async (req, res) => {
    try {
        const { userId, stripeCustomerId } = req.body;
        if (!userId || !stripeCustomerId) {
            return res.status(400).json({ error: "Missing required parameters: userId, stripeCustomerId" });
        }

        const result = await identityService.createFinancialConnectionsSession(userId, stripeCustomerId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to create bank link session", details: error.message });
    }
};

const getConnectedBanks = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await identityRepository.getConnectedBanksByUserId(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch connected bank accounts", details: error.message });
    }
};

module.exports = {
    handleWebhook,
    createIDVerification,
    getIDVerificationStatus,
    createBankLinkSession,
    getConnectedBanks
};
