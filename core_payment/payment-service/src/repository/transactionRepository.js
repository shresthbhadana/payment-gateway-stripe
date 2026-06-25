const Transaction = require("../models/transactionModel");

const create = async (data) => {
    const transaction = new Transaction(data);
    return await transaction.save();
};

const findBySessionId = async (stripeSessionId) => {
    return await Transaction.findOne({ stripeSessionId });
};

const findByPaymentIntentId = async (stripePaymentIntentId) => {
    return await Transaction.findOne({ stripePaymentIntentId });
};

const updateStatusBySessionId = async (stripeSessionId, status, stripePaymentIntentId = null) => {
    const updateData = { status };
    if (stripePaymentIntentId) {
        updateData.stripePaymentIntentId = stripePaymentIntentId;
    }
    return await Transaction.findOneAndUpdate(
        { stripeSessionId },
        { $set: updateData },
        { new: true }
    );
};

const updateStatusByPaymentIntentId = async (stripePaymentIntentId, status) => {
    return await Transaction.findOneAndUpdate(
        { stripePaymentIntentId },
        { $set: { status } },
        { new: true }
    );
};

module.exports = {
    create,
    findBySessionId,
    findByPaymentIntentId,
    updateStatusBySessionId,
    updateStatusByPaymentIntentId
};
