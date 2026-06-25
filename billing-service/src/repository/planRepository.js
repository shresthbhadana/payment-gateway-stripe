const Plan =  require("../models/planModel");
const createPlan = async (planData) => {
    return await Plan.findOneAndUpdate(
        { stripePriceId: planData.stripePriceId },
        planData,
        { new: true, upsert: true }
    );
};

const getPlanByPricdId = async(priceId)=>{
    return await Plan.findOne({stripePriceId: priceId})
}

const getAllPlans = async (page = 1, limit = 10, filter = {}) => {

    const skip = (page - 1) * limit;


    const query = {
        active: true,
        ...filter
    };


    const plans = await Plan.find(query)
        .skip(skip)
        .limit(limit);


    const total = await Plan.countDocuments(query);


    return {
        plans,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    createPlan,
    getPlanByPricdId,
    getAllPlans
}