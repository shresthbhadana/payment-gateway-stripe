const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        stripeCustomerId: { type: String, required: true },
        stripeInvoiceId: { type: String, required: true, unique: true },
        subscriptionId: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, default: "usd" },
        status: { type: String, enum: ["draft", "open", "paid", "uncollectible", "void"], required: true },
        hostedInvoiceUrl: { type: String },
        pdfUrl: { type: String }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
