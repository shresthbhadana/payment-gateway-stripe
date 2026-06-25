const Order = require("../models/orderModel");

const create = async (orderData) => {
    const order = new Order(orderData);
    return await order.save();
};

const findById = async (id) => {
    return await Order.findById(id);
};

const updatePaymentStatus = async (id, paymentStatus, stripeSessionId = null, stripePaymentIntentId = null) => {
    const updateData = { paymentStatus };
    if (stripeSessionId) {
        updateData.stripeSessionId = stripeSessionId;
    }
    if (stripePaymentIntentId) {
        updateData.stripePaymentIntentId = stripePaymentIntentId;
    }

    return await Order.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true,  runValidators: true }
    );
};

const updateStripeSessionId = async (id, stripeSessionId) => {
    return await Order.findByIdAndUpdate(
        id,
        { $set: { stripeSessionId } },
        { new: true,  runValidators: true },

    );
};

module.exports = {
    create,
    findById,
    updatePaymentStatus,
    updateStripeSessionId
};
