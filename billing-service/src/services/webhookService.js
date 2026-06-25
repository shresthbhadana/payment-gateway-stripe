const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const subscriptionRepository = require("../repository/subscriptionRepository");
const invoiceRepository = require("../repository/invoiceRepository");


const parseStripeDate = (timestamp) => {
    if (!timestamp) return undefined;
    const date = new Date(timestamp * 1000);
    return isNaN(date.getTime()) ? undefined : date;
};

const handleSubscriptionSync = async (data) => {
    const stripeSubscriptionId = data.id;
    const stripeCustomerId = data.customer;
    const stripePriceId = data.items.data[0].price.id;
    const status = data.status;
    const isPaused = data.pause_collection ? true : false;

    let userId = data.metadata ? data.metadata.userId : null;

    if (!userId && stripeCustomerId) {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        userId = customer.metadata ? customer.metadata.userId : null;
    }

    if (userId) {
        await subscriptionRepository.createOrUpdateSubscription({
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            stripePriceId,
            status,
            isPaused,
            currentPeriodStart: parseStripeDate(data.current_period_start),
            currentPeriodEnd: parseStripeDate(data.current_period_end)
        });
        console.log(`🔄 [Subscription Sync] DB updated for Subscription: ${stripeSubscriptionId} (Status: ${status}, User: ${userId})`);
    }
};


const handleSubscriptionDeletion = async (data) => {
    const stripeSubscriptionId = data.id;
    await subscriptionRepository.createOrUpdateSubscription({
        stripeSubscriptionId,
        status: "canceled",
        isPaused: false
    });
    console.log(`❌ [Subscription Cancelled] DB updated: Subscription ${stripeSubscriptionId} set to 'canceled'`);
};

const handleInvoiceSuccess = async (data) => {
    const stripeInvoiceId = data.id;
    const stripeCustomerId = data.customer;
    const subscriptionId = data.subscription;
    const amount = data.amount_paid / 100;
    const currency = data.currency;
    const status = data.status;
    const hostedInvoiceUrl = data.hosted_invoice_url;
    const pdfUrl = data.invoice_pdf;

    let userId = null;
    if (stripeCustomerId) {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        userId = customer.metadata ? customer.metadata.userId : null;
    }

    if (userId) {
        await invoiceRepository.createOrUpdateInvoice({
            userId,
            stripeCustomerId,
            stripeInvoiceId,
            subscriptionId,
            amount,
            currency,
            status,
            hostedInvoiceUrl,
            pdfUrl
        });
        console.log(`✅ [Invoice Paid] DB updated: Invoice ${stripeInvoiceId} of $${amount} paid successfully (User: ${userId})`);
    }
};

const handleInvoiceFailure = async (data) => {
    const stripeInvoiceId = data.id;
    await invoiceRepository.createOrUpdateInvoice({
        stripeInvoiceId,
        status: "unpaid"
    });
    console.log(`⚠️ [Invoice Failed] DB updated: Invoice ${stripeInvoiceId} marked as 'unpaid'`);
};


const eventHandlers = {
    "customer.subscription.created": handleSubscriptionSync,
    "customer.subscription.updated": handleSubscriptionSync,
    "customer.subscription.deleted": handleSubscriptionDeletion,
    "invoice.payment_succeeded": handleInvoiceSuccess,
    "invoice.payment_failed": handleInvoiceFailure
};


const handleWebhookEvent = async (event) => {
    const handler = eventHandlers[event.type];

    if (handler) {
        
        await handler(event.data.object);
    } else {
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
};

module.exports = {
    handleWebhookEvent
};
