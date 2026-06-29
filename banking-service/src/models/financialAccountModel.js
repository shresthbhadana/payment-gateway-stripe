const mongoose = require("mongoose");

const financialAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        stripeFinancialAccountId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        status: {
            type: String,
            default: "open"
        },
        routingNumber: {
            type: String,
            default: null
        },
        accountNumber: {
            type: String,
            default: null
        },
        balances: {
            cash: { type: Number, default: 0 },
            inboundPending: { type: Number, default: 0 },
            outboundPending: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FinancialAccount", financialAccountSchema);
