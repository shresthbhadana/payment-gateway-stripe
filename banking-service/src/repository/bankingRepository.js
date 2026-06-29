const Cardholder = require("../models/cardholderModel");
const FinancialAccount = require("../models/financialAccountModel");

// Create or update cardholder
const saveCardholder = async (cardholderData) => {
    return await Cardholder.findOneAndUpdate(
        { userId: cardholderData.userId },
        cardholderData,
        { upsert: true, new: true }
    );
};

const getCardholderByUserId = async (userId) => {
    return await Cardholder.findOne({ userId });
};

const getCardholderByStripeId = async (stripeCardholderId) => {
    return await Cardholder.findOne({ stripeCardHolderId: stripeCardholderId });
};

const pushIssuedCard = async (stripeCardHolderId, cardData) => {
    return await Cardholder.findOneAndUpdate(
        { stripeCardHolderId },
        { $push: { issuedCards: cardData } },
        { new: true }
    );
};

// Create or update financial account
const saveFinancialAccount = async (accountData) => {
    return await FinancialAccount.findOneAndUpdate(
        { userId: accountData.userId },
        accountData,
        { upsert: true, new: true }
    );
};

const getFinancialAccountByUserId = async (userId) => {
    return await FinancialAccount.findOne({ userId });
};

const getFinancialAccountByStripeId = async (stripeFinancialAccountId) => {
    return await FinancialAccount.findOne({ stripeFinancialAccountId });
};

module.exports = {
    saveCardholder,
    getCardholderByUserId,
    getCardholderByStripeId,
    pushIssuedCard,
    saveFinancialAccount,
    getFinancialAccountByUserId,
    getFinancialAccountByStripeId
};