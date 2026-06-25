const invoiceRepository = require("../repository/invoiceRepository");

const getInvoicesByUserId = async (userId) => {
    return await invoiceRepository.getInvoicesByUserId(userId);
};

module.exports = {
    getInvoicesByUserId
};
