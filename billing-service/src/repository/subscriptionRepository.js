const Subscription = require("../models/subscriptionModel");


const createOrUpdateSubscription = async (subscriptionData) => {
    return await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionData.stripeSubscriptionId },
        subscriptionData,
        { new: true, upsert: true }
    );
};

const getSubscriptionByUserId = async (userId) => {
    return await Subscription.findOne({ userId }).sort({ updatedAt: -1 });
};

module.exports = {
    createOrUpdateSubscription,
    getSubscriptionByUserId
};
