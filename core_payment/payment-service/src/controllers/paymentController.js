const paymentService = require("../services/paymentService");

const createCheckoutSession = async (req, res) => {
    try {
        const { orderId, amount, currency, items, customerEmail } = req.body;

        if (!orderId || !amount || !items || !items.length) {
            return res.status(400).json({ error: "Missing required parameters: orderId, amount, items" });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const sessionDetails = await paymentService.createCheckoutSession({
            orderId,
            amount,
            currency,
            items,
            customerEmail,
            baseUrl
        });

        res.status(201).json(sessionDetails);
    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        res.status(500).json({ error: "Failed to create Stripe checkout session", details: error.message });
    }
};

const createPaymentIntent = async (req, res) => {
    try {
        const { orderId, amount, currency, customerEmail } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ error: "Missing required parameters: orderId, amount" });
        }

        const result = await paymentService.createPaymentIntent({
            orderId,
            amount,
            currency,
            customerEmail
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating payment intent:", error.message);
        res.status(500).json({ error: "Failed to create Stripe payment intent", details: error.message });
    }
};

const createPaymentLink = async (req, res) => {
    try {
        const { orderId, productName, amount, currency, quantity } = req.body;

        if (!orderId || !productName || !amount) {
            return res.status(400).json({ error: "Missing required parameters: orderId, productName, amount" });
        }

        const result = await paymentService.createPaymentLink({
            orderId,
            productName,
            amount,
            currency,
            quantity
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating payment link:", error.message);
        res.status(500).json({ error: "Failed to create Stripe payment link", details: error.message });
    }
};

const createTerminalConnectionToken = async (req, res) => {
    try {
        const result = await paymentService.createTerminalConnectionToken();
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating terminal connection token:", error.message);
        res.status(500).json({ error: "Failed to create terminal connection token", details: error.message });
    }
};

const processTerminalPayment = async (req, res) => {
    try {
        const { readerId, paymentIntentId } = req.body;

        if (!readerId || !paymentIntentId) {
            return res.status(400).json({ error: "Missing required parameters: readerId, paymentIntentId" });
        }

        const result = await paymentService.processTerminalPayment({
            readerId,
            paymentIntentId
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error processing terminal payment:", error.message);
        res.status(500).json({ error: "Failed to process terminal payment", details: error.message });
    }
};

const handleWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];
    try {
        const result = await paymentService.handleWebhookEvent(req.rawBody, signature);
        res.json(result);
    } catch (error) {
        console.error("Webhook processing failed:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

const checkoutSuccess = async (req, res) => {
    const { session_id } = req.query;
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2ecc71;">Payment Successful!</h1>
            <p>Thank you for your payment. Your order is now being processed.</p>
            ${session_id ? `<p>Stripe Session ID: <code>${session_id}</code></p>` : ""}
            <p style="color: #7f8c8d;">You can close this window now.</p>
        </div>
    `);
};

const checkoutCancel = async (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Payment Cancelled</h1>
            <p>The checkout session has been cancelled. No charge was made.</p>
            <a href="http://localhost:5000/health" style="color: #3498db; text-decoration: none;">Go Back</a>
        </div>
    `);
};

module.exports = {
    createCheckoutSession,
    createPaymentIntent,
    createPaymentLink,
    createTerminalConnectionToken,
    processTerminalPayment,
    handleWebhook,
    checkoutSuccess,
    checkoutCancel
};
