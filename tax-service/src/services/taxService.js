const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const taxRepository = require("../repository/taxRepository");

const calculateTax = async (orderId, lineItems, customerAddress) => {

    const formattedLineItems = lineItems.map((item, idx) => ({
        amount: Math.round(item.amount * 100),
        quantity: item.quantity || 1,
        tax_code: item.tax_code || "txcd_99999999", 
        reference: `item_${idx}`
    }));


    const calculation = await stripe.tax.calculations.create({
        currency: "usd",
        line_items: formattedLineItems,
        customer_details: {
            address: {
                line1: customerAddress.line1 || "",
                city: customerAddress.city || "",
                state: customerAddress.state || "",
                postal_code: customerAddress.postalCode,
                country: customerAddress.country
            },
            address_source: "shipping"
        }
    });

    
    const breakdown = calculation.shipping_cost ? calculation.line_items.data : [];
    const taxSummaryBreakdown = calculation.line_items.data.map(item => ({
        amount: item.tax_amount / 100,
        rate: item.tax_behavior === "inclusive" ? 0 : (item.tax_amount / item.amount),
        taxabilityReason: item.taxability_reason,
        jurisdictionName: item.tax_breakdown ? item.tax_breakdown.map(j => j.jurisdiction.name).join(", ") : "N/A"
    }));

    
    const savedCalculation = await taxRepository.saveTaxCalculation({
        orderId,
        stripeCalculationId: calculation.id,
        taxAmount: calculation.tax_amount / 100, 
        subtotal: calculation.subtotal / 100,
        total: calculation.total / 100,
        status: "calculated",
        customerDetails: {
            postalCode: customerAddress.postalCode,
            country: customerAddress.country,
            state: customerAddress.state,
            city: customerAddress.city
        },
        taxSummaryBreakdown
    });

    return savedCalculation;
};

const recordTaxTransaction = async (orderId) =>{
    const localCalc = await taxRepository.getTaxByOrderId(orderId);
    if (!localCalc) {
        throw new Error(`Tax calculation not found for orderId ${orderId}`);
    }

    
    const transaction = await stripe.tax.transactions.createFromCalculation({
        calculation: localCalc.stripeCalculationId,
        reference: orderId // Unique reference code
    });


    const updated = await taxRepository.markTaxAsRecorded(orderId, transaction.id);
    console.log(`[Stripe Tax] Transaction recorded for Order: ${orderId}. Stripe ID: ${transaction.id}`);
    return updated;
};

// Webhook Settings handler
const handleWebhookEvent = async (event) => {
    switch (event.type) {
        case "tax.settings.updated":
            console.log(`[Stripe Tax Webhook] Tax Settings Updated: ${event.data.object.id}`);
            return { success: true };
        default:
            console.log(`Unhandled Tax event type: ${event.type}`);
            return { unhandled: true };
    }
};

module.exports = {
    calculateTax,
    recordTaxTransaction,
    handleWebhookEvent
};


