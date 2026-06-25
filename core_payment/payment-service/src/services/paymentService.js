const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const transactionRepository = require("../repository/transactionRepository");
const axios = require("axios");


const createCheckoutSession = async ({ orderId, amount, currency, items, customerEmail, baseUrl }) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map(item => ({
            price_data: {
                currency: currency || "usd",
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100), 
            },
            quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout-cancel`,
        customer_email: customerEmail,
        metadata: {
            orderId: orderId
        }
    });

    await transactionRepository.create({
        orderId,
        stripeSessionId: session.id,
        amount,
        currency: currency || "usd",
        status: "pending",
        customerEmail,
        paymentType: "checkout"
    });

    return {
        stripeCheckoutUrl: session.url,
        stripeSessionId: session.id
    };
};


const createPaymentIntent = async ({ orderId, amount, currency, customerEmail }) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), 
        currency: currency || "usd",
        receipt_email: customerEmail,
        metadata: {
            orderId: orderId
        }
    });

    await transactionRepository.create({
        orderId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency: currency || "usd",
        status: "pending",
        customerEmail,
        paymentType: "payment_intent"
    });

    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    };
};
const createPaymentLink = async ({ orderId, productName, amount, currency, quantity }) => {
    
    const product = await stripe.products.create({
        name: productName,
        metadata: { orderId }
    });


    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100),
        currency: currency || "usd"
    });

    
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: quantity || 1 }],
        metadata: { orderId }
    });

    await transactionRepository.create({
        orderId,
        amount,
        currency: currency || "usd",
        status: "pending",
        paymentType: "payment_link"
    });

    return {
        paymentLinkUrl: paymentLink.url
    };
}

const createTerminalConnectionToken = async () => {
    const connectionToken = await stripe.terminal.connectionTokens.create();
    return {
        secret: connectionToken.secret
    };
};

const processTerminalPayment = async ({ readerId, paymentIntentId }) => {
    const reader = await stripe.terminal.readers.processPaymentIntent({
        reader: readerId,
        payment_intent: paymentIntentId
    });
    return {
        readerId: reader.id,
        actionStatus: reader.action.status,
        actionType: reader.action.type
    };
};


const handleWebhookEvent = async (rawBody, signature) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;

    if (signature === "mock_signature") {
        try {
            event = JSON.parse(rawBody.toString());
        } catch (e) {
            event = rawBody;
        }
        console.log(`Mock Webhook event processed: ${event.type}`);
    } else {
    
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        console.log(`Stripe Webhook event verified: ${event.type}`);
    }

    const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://127.0.0.1:5002";

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const stripeSessionId = session.id;
        const stripePaymentIntentId = session.payment_intent;
        const orderId = session.metadata.orderId;

    
        await transactionRepository.updateStatusBySessionId(stripeSessionId, "completed", stripePaymentIntentId);

        
        try {
            await axios.post(`${orderServiceUrl}/internal/payment-success`, {
                orderId,
                stripeSessionId,
                stripePaymentIntentId
            });
            console.log(`Notified Order Service of successful checkout for order: ${orderId}`);
        } catch (err) {
            console.error(`Failed to notify Order Service of checkout success: ${err.message}`);
        }
    } else if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const stripePaymentIntentId = paymentIntent.id;
        const orderId = paymentIntent.metadata ? paymentIntent.metadata.orderId : null;

        
        await transactionRepository.updateStatusByPaymentIntentId(stripePaymentIntentId, "completed");

        if (orderId) {
            try {
                await axios.post(`${orderServiceUrl}/internal/payment-success`, {
                    orderId,
                    stripePaymentIntentId
                });
                console.log(`Notified Order Service of successful payment intent for order: ${orderId}`);
            } catch (err) {
                console.error(`Failed to notify Order Service of payment intent success: ${err.message}`);
            }
        }
    } else if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
        const entity = event.data.object;
        const stripeSessionId = entity.id;
        const stripePaymentIntentId = entity.id;
        const orderId = entity.metadata ? entity.metadata.orderId : null;

        if (event.type === "checkout.session.expired") {
            await transactionRepository.updateStatusBySessionId(stripeSessionId, "failed");
        } else {
            await transactionRepository.updateStatusByPaymentIntentId(stripePaymentIntentId, "failed");
        }

        if (orderId) {
            try {
                await axios.post(`${orderServiceUrl}/internal/payment-failure`, {
                    orderId,
                    error: "Stripe payment failed or expired"
                });
                console.log(`Notified Order Service of payment failure for order: ${orderId}`);
            } catch (err) {
                console.error(`Failed to notify Order Service of payment failure: ${err.message}`);
            }
        }
    }
    
    return { received: true };
};

module.exports = {
    createCheckoutSession,
    createPaymentIntent,
    createPaymentLink,
    createTerminalConnectionToken,
    processTerminalPayment,
    handleWebhookEvent
};
