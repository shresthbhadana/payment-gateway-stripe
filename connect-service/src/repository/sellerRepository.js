const Seller = require("../models/selllerModel");
const createOrUpdateSeller = async(sellerData)=>{
    const query = {};
    if (sellerData.stripeConnectAccountId) {
        query.stripeConnectAccountId = sellerData.stripeConnectAccountId;
    } else if (sellerData.userId) {
        query.userId = sellerData.userId;
    } else {
        throw new Error("Either stripeConnectAccountId or userId must be provided");
    }

    const isCreation = sellerData.userId && sellerData.email;
    return await Seller.findOneAndUpdate(
        query,
        sellerData,
        {upsert: !!isCreation, new:true}
    )
}

const getSellerByUserId = async(userId)=>{
    return await Seller.findOne({userId})
}
const getSellerByAccountId = async(accountId)=>{
    return await Seller.findOne({stripeConnectAccountId: accountId})
}

module.exports= {
    createOrUpdateSeller,
    getSellerByUserId,
    getSellerByAccountId
}