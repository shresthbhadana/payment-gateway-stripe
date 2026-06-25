require("dotenv").config();
const planService = require("../src/services/planService");
const mongoose = require("mongoose");

const createPlan = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const plan = await planService.createNewPlan({
            name: "Verified Pro Plan",
            price: 15.00,
            currency: "usd",
            interval: "month"
        });
        console.log("\n--- New Verified Plan Details ---");
        console.log("stripePriceId:", plan.stripePriceId);
        await mongoose.connection.close();
    } catch (error) {
        console.error("Failed to create plan:", error);
    }
};

createPlan();
