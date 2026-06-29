const TaxCalculation = require("../models/taxCalculationModel");

const saveTaxCalculation = async (calculationData) => {
    return await TaxCalculation.findOneAndUpdate(
        { orderId: calculationData.orderId },
        calculationData,
        { upsert: true, new: true }
    );
};

const markTaxAsRecorded = async (orderId, stripeTransactionId) => {
    return await TaxCalculation.findOneAndUpdate(
        { orderId },
        { stripeTransactionId, status: "recorded" },
        { new: true }
    );
};

const getTaxByOrderId = async (orderId) => {
    return await TaxCalculation.findOne({ orderId });
};

module.exports = {
    saveTaxCalculation,
    markTaxAsRecorded,
    getTaxByOrderId
};