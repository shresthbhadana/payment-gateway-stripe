const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { saveFraudWarning, createOrUpdateDispute, getDisputeById, markEvidenceSubmitted } = require("../repository/fraudRepository");
const { post } = require("axios");


const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://127.0.0.1:5002";

//helper to notify order service
const notifyOrderService = async(endpoint,payload)=>{
    try{
        const url = `${ORDER_SERVICE_URL}${endpoint}`;
        await post(url,payload);
        console.log(`[Fraud] Notified Order Service at ${endpoint}`);
    }catch(error){
        console.error(`[Fraud] Error notifying order service at ${endpoint} :`, error.message);
        throw error;
    }
}

const handleEarlyFraudWarning = async(data)=>{
    const stripeWarningId = data.id;
    const chargeId = data.charge;
        const paymentIntentId = data.payment_intent;
    const fraudType = data.fraud_type;
    const riskScore = data.actionable ? 75 : 30;
    const warning = await saveFraudWarning({
            stripeWarningId,
        chargeId,
        paymentIntentId,
        fraudType,
        riskScore,
        status: "pending_review",
        actionable: data.actionable
    });
      console.log(`[Radar Warning] Early Fraud Warning logged for Charge: ${chargeId}`);
      
      //notify order service to holf or block order
    await notifyOrderService("fraud-warning", {
        chargeId,
        paymentIntentId,
        stripeWarningId,
        riskScore,
        fraudType
    });
    return warning;
};
const handleDisputeCreated = async(data)=>{
    try{
        const stripeDisputeId = data.id;
    const chargeId = data.charge;
    const amount = data.amount / 100;
    const currency = data.currency;
    const reason = data.reason;
    const status = data.status;

    const dispute = await createOrUpdateDispute({
        stripeDisputeId,
        chargeId,
        amount,
        currency,
        reason,
        status,
        evidenceSubmitted: false
    });
    console.log(`[Dispute] Dispute created for Charge: ${chargeId}`);
    await notifyOrderService("dispute-created", {
        chargeId,
        stripeDisputeId,
        amount,
        currency,
        reason,
        status
    });
    return dispute;
    }catch(error){
        console.error(`[Fraud] Error handling dispute creation:`, error.message);
        throw error;
    }
}
const handleDisputeClosed = async (data) => {
    const stripeDisputeId = data.id;
    const status = data.status;
    const dispute = await createOrUpdateDispute({
        stripeDisputeId,
        chargeId: data.charge,
        amount: data.amount / 100,
        currency: data.currency,
        status,
        evidenceSubmitted: data.evidence_details && data.evidence_details.submission_count > 0
    });
    console.log(`[Stripe Dispute] Dispute Closed for Dispute ID: ${stripeDisputeId}. Result: ${status}`);
    // Notify Order Service of dispute result
    await notifyOrderService("dispute-closed", {
        stripeDisputeId,
        status
    });
    return dispute;
};

const eventHandlers = {
    "radar.early_fraud_warning.created": handleEarlyFraudWarning,
    "charge.dispute.created": handleDisputeCreated,
    "charge.dispute.closed": handleDisputeClosed
};

const handleWebhookEvent = async(event)=>{
    const handler = eventHandlers[event.type];
    if(handler){
        return await handler(event.data.object)
    }else { 
          console.log(`Unhandled Stripe Radar event type: ${event.type}`);
        return { unhandled: true };
    }

};


const submitDisputeEvidence = async(stripeDistriputeId , evidenceData)=>{
    const dispute = await getDisputeById(stripeDistriputeId);
    if(!dispute){
        throw new Error(`Dispute with ID ${stripeDistriputeId} not found`);
    }
    //submit evidnece
      await stripe.disputes.update(stripeDistriputeId, {
        evidence: evidenceData
    });
    //mark evidence as submitted
        const savedDispute = await markEvidenceSubmitted(stripeDistriputeId);
    console.log(`[Dispute Evidence] Submitted evidence for Dispute ID: ${stripeDistriputeId}`);
    return savedDispute;
};
   module.exports = {
    handleWebhookEvent,
    submitDisputeEvidence
};