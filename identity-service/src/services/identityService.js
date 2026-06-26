const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const identityRepository = require("../repository/identityRepository");
 
//stripe identity service
const createVerificationSession = async(userId)=>{
    const session = await stripe.identity.verificationSessions.create({
        type : "document",
        options : {
             document: {
                require_matching_selfie: true
            }
        },
        metadata:{
            userId : userId
        }

    })
    await identityRepository.saveVerificationSession({
        userId,
        stripeSessionId: session.id,
        clientSecret: session.client_secret,
        status: session.status
    });
 return {
        sessionId: session.id,
        clientSecret: session.client_secret,
        status: session.status
    };
};
const syncVerificationResult = async(stripeSessionId)=>{
    const session = await stripe.identity.verificationSessions.retrieve(stripeSessionId,{    expand: ["last_verification_report"]})
 let details = {};
    let errorReason = null;
    if(session.status ==="verified" && session.last_verification_report){
        const report = session.last_verification_report;
        if(report.document){
            details = {
                 firstName: report.document.first_name,
                lastName: report.document.last_name,
                dob: report.document.dob ? `${report.document.dob.year}-${report.document.dob.month}-${report.document.dob.day}` : null,
                idNumberType: report.document.type
            }
            }
        }else if(session.status==="failed"){
            errorReason = session.last_error ? session.last_error.code : "verification_failed";
        }
          return await identityRepository.updateVerificationStatus(stripeSessionId, session.status, details, errorReason);
    }

//stripe Financial connections services
const createFinancialConnectionsSession = async(userId,stripeCustomerId)=>{
    const session = await stripe.financialConnections.sessions.create({
        account_holder : {
            type : "customer",
             customer: stripeCustomerId
        },
        permissions :["balances","ownership","payment_method"]
    });
    return {
        sessionId :session.id,
        clientSecret: session.client_secret
    }
}

const registerConnectedBank = async(accountData,stripeSessionId)=>{
    const session = await stripe.financialConnections.sessions.retrieve(stripeSessionId,{
        expand  : ['account_holder']
    })
        const stripeCustomerId = session.account_holder ? session.account_holder.customer : null;
    const connection = await identityRepository.saveBankConnection({
        userId: stripeCustomerId || "guest_user",
        stripeSessionId: stripeSessionId,
        stripeAccountId: accountData.id,
        institutionName: accountData.institution_name,
        status: accountData.status,
        supportedPermissions: accountData.permissions,
        lastFourDigits: accountData.last4
    });
    console.log(`[Financial Connections] Bank linked successfully: ${accountData.institution_name} - ${accountData.last4}`);
    return connection;
}


//webhook routing handlers 
const handleWebhookEvent = async (event) => {
    const data = event.data.object;
    switch (event.type) {
        case "identity.verification_session.verified":
            console.log(`[Identity Webhook] User Identity Verified: ${data.id}`);
            return await syncVerificationResult(data.id);
            
        case "identity.verification_session.failed":
            console.error(`[Identity Webhook] User Identity Verification Failed: ${data.id}`);
            return await syncVerificationResult(data.id);
        case "financial_connections.account.created":
            console.log(`[Financial Connections Webhook] Account Created: ${data.id}`);
            // Register bank account info
            return await registerConnectedBank(data, event.data.object.session);
            
        default:
            console.log(`Unhandled Identity event type: ${event.type}`);
            return { unhandled: true };
    }
};


module.exports = {
    createVerificationSession,
    syncVerificationResult,
    createFinancialConnectionsSession,
    handleWebhookEvent
};

