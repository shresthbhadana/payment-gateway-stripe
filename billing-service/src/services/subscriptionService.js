const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const subscriptionRepository = require("../repository/subscriptionRepository");


const getOrCreateStripeCustomer = async(userId,email)=>{
   const subscription = await subscriptionRepository.getSubscriptionByUserId(userId);
    if (subscription && subscription.stripeCustomerId) {
        return subscription.stripeCustomerId;
    }
    const customers = await stripe.customers.list({
        email: email,
        limit :1
    })
      if (customers.data.length > 0) {
        return customers.data[0].id;
    }

  const newCustomer = await stripe.customers.create({
        email: email,
        metadata: { userId }
    });
    return newCustomer.id;
};


//stripe checkout session
const createSubscriptionSession = async ({ userId, email, priceId, successUrl, cancelUrl }) => {
    const customerId = await getOrCreateStripeCustomer(userId, email);
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1
            }
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId },
        subscription_data: {
            metadata: { userId }
        }
    });
    return {
        sessionId: session.id,
        sessionUrl: session.url
    };
};
const cancelSubscriptionImmediate = async (subscriptionId) => {
    return await stripe.subscriptions.cancel(subscriptionId);
};

const cancelSubscriptionAtPeriodEnd = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
    });
};

const pauseSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        pause_collection: {
            behavior: "keep_as_draft"
        }
    });
};

const resumeSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        pause_collection: ""
    });
};
module.exports = {
    getOrCreateStripeCustomer,
    createSubscriptionSession,
    cancelSubscriptionImmediate,
    cancelSubscriptionAtPeriodEnd,
    pauseSubscription,
    resumeSubscription
};