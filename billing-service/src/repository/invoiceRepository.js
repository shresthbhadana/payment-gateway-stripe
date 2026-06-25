const Invoice = require("../models/invoiceModel");

const createOrUpdateInvoice = async (invoiceData) => {
    return await Invoice.findOneAndUpdate(
        { stripeInvoiceId: invoiceData.stripeInvoiceId },
        invoiceData,
        { new: true, upsert: true }
    );
};


const getInvoicesByUserId = async (userId) => {
    return await Invoice.find({ userId }).sort({ createdAt: -1 });
};

module.exports = {
    createOrUpdateInvoice,
    getInvoicesByUserId
};
