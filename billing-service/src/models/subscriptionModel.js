const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        stripeCustomerId: { type: String, required: true },
        stripeSubscriptionId: { type: String, required: true, unique: true },
        stripePriceId: { type: String, required: true },
        status: { 
            type: String, 
            enum: ["active", "trialing", "past_due", "canceled", "incomplete", "unpaid"], 
            required: true 
        },
        currentPeriodStart: { type: Date },
        currentPeriodEnd: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
