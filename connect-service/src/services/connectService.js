const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sellerRepository = require("../repository/sellerRepository");


const onboardSeller = async({userId,email,businessName,refreshUrl,returnUrl})=>{
    let seller = await sellerRepository.getSellerByUserId(userId)
    let accountId;
    if(!seller){
        const account = await stripe.accounts.create({
            type:"express",
            country:"US",
            email,
            capabilities:{card_payments:{requested:true},transfers:{requested:true}},
            business_profile: {
                name: businessName
            },
            metadata:{userId,role:"seller"}
        });
        accountId = account.id;
        seller  = await sellerRepository.createOrUpdateSeller({
            userId,
            stripeConnectAccountId: accountId,
            email,
            businessName,
            onboardingCompleted: false
        });

    }else{
        accountId = seller.stripeConnectAccountId;
     
    }
   const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding"
    });
    return {
        stripeConnectAccountId: accountId,
        onboardingUrl: accountLink.url
    };
};
const getOnboardingStatus = async(userId)=>{
       const seller = await sellerRepository.getSellerByUserId(userId);
    if (!seller) {
        throw new Error("Local seller record not found");
    }
    const account = await stripe.accounts.retrieve(seller.stripeConnectAccountId);

    const onboardingCompleted = account.details_submitted;
      return await sellerRepository.createOrUpdateSeller({
        stripeConnectAccountId: seller.stripeConnectAccountId,
        onboardingCompleted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
    });

}
const createMarketplaceCheckout = async ({ orderId, amount, sellerUserId, appFeeAmount, successUrl, cancelUrl }) => {
    const seller = await sellerRepository.getSellerByUserId(sellerUserId);
    if (!seller || !seller.onboardingCompleted) {
        throw new Error("Vendor/Seller onboarding is not completed or seller does not exist.");
    }
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Marketplace Order #${orderId}`
                    },
                    unit_amount: Math.round(amount * 100) 
                },
                quantity: 1
            }
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
            application_fee_amount: Math.round(appFeeAmount * 100), 
            transfer_data: {
                destination: seller.stripeConnectAccountId 
            }
        },
        metadata: { orderId, sellerUserId }
    });
    return {
        sessionId: session.id,
        sessionUrl: session.url
    };
};
module.exports = {
    onboardSeller,
    getOnboardingStatus,
    createMarketplaceCheckout
};