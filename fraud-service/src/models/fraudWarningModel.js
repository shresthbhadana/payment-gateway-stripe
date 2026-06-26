const mongoose = require("mongoose");

const fraudWarningSchema = new mongoose.Schema(
    {
        stripeWarningId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        chargeId: {
            type: String,
            required: true,
            index: true
        },
        paymentIntentId: {
            type: String,
            index: true
        },
        fraudType: {
            type: String,
            default: "card_never_received" 
        },
        riskScore: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["pending_review", "reviewed", "refunded_by_platform"],
            default: "pending_review"
        },
        actionable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FraudWarning", fraudWarningSchema);
