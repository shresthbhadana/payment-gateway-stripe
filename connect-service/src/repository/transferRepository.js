const Transfer = require("../models/transferModel");
const createTransferLog = async (transferData) => {
    return await Transfer.create(transferData);
};
const getTransfersBySeller = async (accountId) => {
    return await Transfer.find({ destinationAccountId: accountId }).sort({ createdAt: -1 });
};
module.exports = {
    createTransferLog,
    getTransfersBySeller
};