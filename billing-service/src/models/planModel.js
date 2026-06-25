const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        stripeProductId: { type: String, required: true, unique: true },
        stripePriceId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: "usd" },
        interval: { type: String, enum: ["day", "week", "month", "year"], default: "month" },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
