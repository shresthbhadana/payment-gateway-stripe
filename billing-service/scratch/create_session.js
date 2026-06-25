require("dotenv").config();
const subscriptionService = require("../src/services/subscriptionService");
const mongoose = require("mongoose");

const createSession = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const session = await subscriptionService.createSubscriptionSession({
            userId: "user_shresth_99",
            email: "shresth@example.com",
            priceId: "price_1TlqFhRtGW4wsLuYcqzwfXZQ",
            successUrl: "https://example.com/success",
            cancelUrl: "https://example.com/cancel"
        });
        console.log("\n--- Fresh Session URL ---");
        console.log(session.sessionUrl);
        await mongoose.connection.close();
    } catch (error) {
        console.error("Failed to generate session:", error);
    }
};

createSession();
