const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fraudService = require("../services/fraudService");
const fraudRepository = require("../repository/fraudRepository");


const handleWebhook =  async(req ,res)=>{
    const sig = req.headers["stripe-signature"];
    let event;
    try{
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    }catch(error){
            console.error("Webhook verification failed in Fraud Service:", error.message);
        return res.status(400).send(`Webhook verification failed: ${error.message}`);
    }
 try {
        await fraudService.handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        console.error("Error processing Stripe Radar webhook:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

}
const getFraudWarnings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await fraudRepository.getWarnings(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch fraud warnings", details: error.message });
    }
};
const getDisputes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await fraudRepository.getDisputes(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch disputes", details: error.message });
    }
};


const submitEvidence = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { evidence } = req.body;
        if (!disputeId || !evidence) {
            return res.status(400).json({ error: "Missing required parameters: disputeId, evidence object" });
        }
        const result = await fraudService.submitDisputeEvidence(disputeId, evidence);
        res.status(200).json({ message: "Evidence submitted successfully", dispute: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit dispute evidence", details: error.message });
    }
};
module.exports = {
    handleWebhook,
    getFraudWarnings,
    getDisputes,
    submitEvidence
};