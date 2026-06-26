const FraudWarning = require("../models/fraudWarningModel");
const Dispute = require("../models/disputeModel");

//create fraud warning
const saveFraudWarning = async(warningData)=>{
    return await FraudWarning.findOneAndUpdate(
        {stripeWarningId :warningData.stripeWarningId},
        warningData,
        {upsert: true,new: true}
    )
};

//createDispute
const createOrUpdateDispute = async (disputeData) => {
    return await Dispute.findOneAndUpdate(
        { stripeDisputeId: disputeData.stripeDisputeId },
        disputeData,
        { upsert: true, new: true }
    );
};
//get warnings 
const getWarnings = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const items = await FraudWarning.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
        
    const total = await FraudWarning.countDocuments();
    
    return {
        items,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit)
        }
    };
};

//get disputes
const getDisputes = async(page = 1,limit = 10)=>{
    const skip = (page-1)*limit;

    const items = await Dispute.find()
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)

    const total = await Dispute.countDocuments();
    
    return {
        items,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit)
        }
    };
}

const getDisputeById = async (stripeDisputeId) => {
    return await Dispute.findOne({ stripeDisputeId });
};
const markEvidenceSubmitted = async (stripeDisputeId) => {
    return await Dispute.findOneAndUpdate(
        { stripeDisputeId },
        { evidenceSubmitted: true, status: "under_review" },
        { new: true }
    );
};

module.exports = {
    saveFraudWarning,
    createOrUpdateDispute,
    getWarnings,
    getDisputes,
    getDisputeById,
    markEvidenceSubmitted
};
