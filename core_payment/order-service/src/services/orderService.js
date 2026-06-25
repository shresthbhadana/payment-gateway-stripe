const orderRepository = require("../repository/orderRepository");
const axios = require("axios");

const createOrder = async ({ items, customerEmail }) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await orderRepository.create({
        items,
        totalAmount,
        customerEmail,
        paymentStatus: "pending"
    });

    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://127.0.0.1:5001";
    
    try {
        console.log(`Calling payment-service to create checkout session for order: ${order._id}`);
        const response = await axios.post(`${paymentServiceUrl}/checkout-session`, {
            orderId: order._id.toString(),
            amount: totalAmount,
            currency: "usd",
            items: items,
            customerEmail: customerEmail
        });

        await orderRepository.updateStripeSessionId(order._id, response.data.stripeSessionId);

        return {
            orderId: order._id,
            totalAmount: order.totalAmount,
            paymentStatus: "pending",
            stripeCheckoutUrl: response.data.stripeCheckoutUrl,
            stripeSessionId: response.data.stripeSessionId
        };
    } catch (paymentError) {
        console.error("Payment Service Call Failed:", paymentError.message);
        await orderRepository.updatePaymentStatus(order._id, "failed");
        throw new Error(`Failed to initialize payment gateway: ${paymentError.message}`);
    }
};

const getOrderById = async (id) => {
    const order = await orderRepository.findById(id);
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

const handlePaymentSuccessCallback = async ({ orderId, stripeSessionId, stripePaymentIntentId }) => {
    const order = await orderRepository.updatePaymentStatus(orderId, "paid", stripeSessionId, stripePaymentIntentId);
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

const handlePaymentFailureCallback = async ({ orderId }) => {
    const order = await orderRepository.updatePaymentStatus(orderId, "failed");
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

module.exports = {
    createOrder,
    getOrderById,
    handlePaymentSuccessCallback,
    handlePaymentFailureCallback
};
