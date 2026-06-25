const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sellerRepository = require("../repository/sellerRepository");
const transferRepository = require("../repository/transferRepository");

//express account changing
const handleAccountUpdate = async(data)=>{
    const accountId = data.id
    const detailsSubmitted = data.details_submitted;
    const chargesEnabled = data.charges_enabled;
    const payoutsEnabled = data.payouts_enabled;
    const onboardingCompleted = detailsSubmitted;
    await sellerRepository.createOrUpdateSeller({
        stripeConnectAccountId : accountId,
        onboardingCompleted,
        chargesEnabled,
        payoutsEnabled
    })
     console.log(` [Connect Account Sync] Account: ${accountId} - Verification: ${onboardingCompleted}`);
};
//tranfer logs updated
const handleTransferCreated = async(data)=>{
      const stripeTransferId = data.id;
    const amount = data.amount / 100;
    const currency = data.currency;
    const destinationAccountId = data.destination;

      await transferRepository.createTransferLog({
        stripeTransferId,
        orderId: data.metadata && data.metadata.orderId ? data.metadata.orderId : "N/A",
        amount,
        currency,
        destinationAccountId
    });
    console.log(` [Transfer Created] Splitting payout of $${amount} sent to Connected Account: ${destinationAccountId}`);
};
 //Handlers Mappings
 const eventHandlers= {
     "account.updated": handleAccountUpdate,
    "transfer.created": handleTransferCreated
 }
const handleWebhookEvent = async(event)=>{
    const handler = eventHandlers[event.type];
    if(handler){
await handler(event.data.object);
    }else{
         console.log(`Unhandled Stripe Connect event type: ${event.type}`);
    }
}

module.exports = {
    handleWebhookEvent
}

