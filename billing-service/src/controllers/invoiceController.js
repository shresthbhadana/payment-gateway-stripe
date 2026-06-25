const invoiceRepository = require("../repository/invoiceRepository");

const getUserInvoices = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "userId path parameter is required" });
        }

        const invoices = await invoiceRepository.getInvoicesByUserId(userId);
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch invoices", details: error.message });
    }
};

module.exports = {
    getUserInvoices
};
