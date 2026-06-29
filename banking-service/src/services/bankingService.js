const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bankingRepository = require("../repository/bankingRepository");

const createCardholder = async (userId, payload) => {
    const existing = await bankingRepository.getCardholderByUserId(userId);
    if (existing) {
        return existing;
    }
    const cardholder = await stripe.issuing.cardholders.create({
        type: "individual",
        name: payload.name,
        email: payload.email,
        phone_number: payload.phone,
        individual: {
            first_name: payload.firstName,
            last_name: payload.lastName,
            dob: {
                day: payload.dob.day,
                month: payload.dob.month,
                year: payload.dob.year
            }
        },
        billing: {
            address: {
                line1: payload.address.line1,
                city: payload.address.city,
                state: payload.address.state,
                postal_code: payload.address.postalCode,
                country: payload.address.country
            }
        }
    });
    const saved = await bankingRepository.saveCardholder({
        userId,
        stripeCardHolderId: cardholder.id,
        name: cardholder.name,
        email: cardholder.email,
        status: cardholder.status
    });
    return saved;
};

const issueCard = async (userId, type = "virtual") => {
    const cardholder = await bankingRepository.getCardholderByUserId(userId);
    if (!cardholder) {
        throw new Error("Cardholder account doesn't exist");
    }

    const card = await stripe.issuing.cards.create({
        cardholder: cardholder.stripeCardHolderId,
        currency: "usd",
        type: type,
        status: "active"
    });
    const cardDetails = {
        stripeCardId: card.id,
        cardType: card.type,
        last4: card.last4,
        status: card.status
    };
    const updated = await bankingRepository.pushIssuedCard(cardholder.stripeCardHolderId, cardDetails);
    console.log(`[Stripe Issuing] Card issued: ${card.id} (Last4: ${card.last4})`);
    return updated;
};

// Create or update financialAccount
const createFinancialAccount = async (userId) => {
    const existing = await bankingRepository.getFinancialAccountByUserId(userId);
    if (existing) {
        return existing;
    }
    const fa = await stripe.treasury.financialAccounts.create({
        supported_currencies: ["usd"],
        features: {
            card_issuing: { requested: true },
            deposit_insurance: { requested: true },
            financial_addresses: {
                aba: { requested: true }
            }
        }
    });
    let routingNumber = null;
    let accountNumber = null;
    if (fa.financial_addresses && fa.financial_addresses.length > 0) {
        const abaAddress = fa.financial_addresses.find(addr => addr.supported_networks.includes("ach"));
        if (abaAddress && abaAddress.aba) {
            routingNumber = abaAddress.aba.routing_number;
            accountNumber = abaAddress.aba.account_number;
        }
    }
    const balances = {
        cash: fa.balance.cash.usd / 100,
        inboundPending: fa.balance.inbound_pending.usd / 100,
        outboundPending: fa.balance.outbound_pending.usd / 100
    };
    const saved = await bankingRepository.saveFinancialAccount({
        userId,
        stripeFinancialAccountId: fa.id,
        status: fa.status,
        routingNumber,
        accountNumber,
        balances
    });

    return saved;
};

const syncFinancialAccountDetails = async (userId) => {
    const localFa = await bankingRepository.getFinancialAccountByUserId(userId);
    if (!localFa) {
        throw new Error("Financial account not found locally.");
    }

    const fa = await stripe.treasury.financialAccounts.retrieve(localFa.stripeFinancialAccountId);
    let routingNumber = localFa.routingNumber;
    let accountNumber = localFa.accountNumber;
    if (fa.financial_addresses && fa.financial_addresses.length > 0) {
        const abaAddress = fa.financial_addresses.find(addr => addr.supported_networks.includes("ach"));
        if (abaAddress && abaAddress.aba) {
            routingNumber = abaAddress.aba.routing_number;
            accountNumber = abaAddress.aba.account_number;
        }
    }
    const balances = {
        cash: fa.balance.cash.usd / 100,
        inboundPending: fa.balance.inbound_pending.usd / 100,
        outboundPending: fa.balance.outbound_pending.usd / 100
    };
    return await bankingRepository.saveFinancialAccount({
        userId,
        stripeFinancialAccountId: fa.id,
        status: fa.status,
        routingNumber,
        accountNumber,
        balances
    });
};

// Webhook Router
const handleWebhookEvent = async (event) => {
    const data = event.data.object;
    switch (event.type) {
        case "issuing_card.created":
            console.log(`[Issuing Webhook] Card Created: ${data.id}`);
            return { success: true };

        case "treasury.financial_account.created":
            console.log(`[Treasury Webhook] Financial Account Created: ${data.id}`);
            return { success: true };
        case "treasury.financial_account.features_status_updated":
            console.log(`[Treasury Webhook] Features status updated for: ${data.id}`);

            const localAcct = await bankingRepository.getFinancialAccountByStripeId(data.id);
            if (localAcct) {
                await syncFinancialAccountDetails(localAcct.userId);
            }
            return { success: true };

        default:
            console.log(`Unhandled Banking event type: ${event.type}`);
            return { unhandled: true };
    }
};

module.exports = {
    createCardholder,
    issueCard,
    createFinancialAccount,
    syncFinancialAccountDetails,
    handleWebhookEvent
};