require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const checkAccount = async () => {
    try {
        const account = await stripe.accounts.retrieve();
        console.log("Stripe Key Account ID:", account.id);
    } catch (error) {
        console.error("Failed to retrieve account:", error);
    }
};

checkAccount();
