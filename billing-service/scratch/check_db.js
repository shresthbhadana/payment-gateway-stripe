require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("../src/models/planModel");
const Subscription = require("../src/models/subscriptionModel");
const Invoice = require("../src/models/invoiceModel");

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const plans = await Plan.find({});
        console.log("\n--- Plans in DB ---");
        console.log(JSON.stringify(plans, null, 2));

        const subscriptions = await Subscription.find({});
        console.log("\n--- Subscriptions in DB ---");
        console.log(JSON.stringify(subscriptions, null, 2));

        const invoices = await Invoice.find({});
        console.log("\n--- Invoices in DB ---");
        console.log(JSON.stringify(invoices, null, 2));

        await mongoose.connection.close();
    } catch (error) {
        console.error("Database query failed:", error);
    }
};

checkDB();
