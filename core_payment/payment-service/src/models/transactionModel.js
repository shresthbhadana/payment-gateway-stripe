const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            index: true
        },
        stripeSessionId: {
            type: String,
            index: true
        },
        stripePaymentIntentId: {
            type: String,
            index: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "usd"
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending"
        },
        customerEmail: {
            type: String
        },
        paymentType: {
            type: String,
            enum: ["checkout", "payment_intent", "payment_link", "terminal"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
