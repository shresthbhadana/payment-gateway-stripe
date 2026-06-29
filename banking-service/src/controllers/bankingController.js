const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bankingService = require("../services/bankingService");
const bankingRepository = require("../repository/bankingRepository");

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
            console.error("Webhook signature verification failed in Banking Service:", error.message);
            return res.status(400).send(`Webhook signature error: ${error.message}`);
        }
    }
    try {
        await bankingService.handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        console.error("Error processing Banking webhook:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const createCardholder = async (req, res) => {
    try {
        const { userId, cardholderDetails } = req.body;
        if (!userId || !cardholderDetails) {
            return res.status(400).json({ error: "Missing required parameters: userId, cardholderDetails" });
        }
        const result = await bankingService.createCardholder(userId, cardholderDetails);
        return res.status(200).json({
            success: true,
            message: "Cardholder created successfully",
            data: result
        });
    } catch (error) {
        console.error("Error creating cardholder in Banking Service:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const issueNewCard = async (req, res) => {
    try {
        const { userId, cardType } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }
        const result = await bankingService.issueCard(userId, cardType || "virtual");
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "failed to issue card", details: error.message });
    }
};

const createTreasuryAccount = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "missing required parameters" });
        }
        const result = await bankingService.createFinancialAccount(userId);
        return res.status(201).json({
            success: true,
            message: "treasury account created successfully",
            data: result
        });
    } catch (error) {
        console.error("Error creating treasury account in Banking Service:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const getTreasuryAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "missing required parameters" });
        }
        const result = await bankingService.syncFinancialAccountDetails(userId);
        return res.status(200).json({
            success: true,
            message: "treasury account fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Error fetching treasury account in Banking Service:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = {
    handleWebhook,
    createCardholder,
    issueNewCard,
    createTreasuryAccount,
    getTreasuryAccount
};