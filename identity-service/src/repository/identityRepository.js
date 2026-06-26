const Verification = require("../models/verificationModel");
const BankConnection  = require("../models/bankConnectionModel");

const saveVerificationSession = async(sessionData)=>{
     return await Verification.findOneAndUpdate(
        { userId: sessionData.userId },
        sessionData,
        { upsert: true, new: true }
    );
};
const updateVerificationStatus = async(stripeSessionId,status ,details={},errorReason= null)=>{
    const updateData = {status};
       if (Object.keys(details).length > 0) {
        updateData.verifiedDetails = details;
    }
    if (errorReason) {
        updateData.errorReason = errorReason;
    }
       return await Verification.findOneAndUpdate(
        { stripeSessionId },
        updateData,
        { new: true }
    );

}
const getVerificationByUserId = async (userId) => {
    return await Verification.findOne({ userId });
};
const saveBankConnection = async(connectionData)=>{
    return await BankConnection.findOneAndUpdate(
           { stripeAccountId: connectionData.stripeAccountId },
        connectionData,
        { upsert: true, new: true }
)
}
const getConnectedBanksByUserId = async(userId)=>{
    return await BankConnection.find({ userId }).sort({ createdAt: -1 });
}


module.exports = {
    saveVerificationSession,
    updateVerificationStatus,
    getVerificationByUserId,
    saveBankConnection,
    getConnectedBanksByUserId
};