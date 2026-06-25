const connectService = require("../services/connectService");
const onboardSeller = async(req,res) =>{
    try{
        const {userId, email, businessName, bussinessName, refreshUrl, returnUrl} = req.body;
        const finalBusinessName = businessName || bussinessName;
        if (!userId || !email || !finalBusinessName || !refreshUrl || !returnUrl) {
            return res.status(400).json({
                error : "Missing required onboarding parameters"
            });
        }
        const result = await connectService.onboardSeller({
            userId,
            email,
            businessName: finalBusinessName,
            refreshUrl,
            returnUrl
        });
        res.status(200).json(result);
    }catch(error){
        res.status(500).json({ error: "Onboarding failed", details: error.message });
    }
}
const checkStatus = async(req,res)=>{
    try{
        const {userId} = req.params;
        const status  = await connectService.getOnboardingStatus(userId);
        res.status(200).json(status); 
    }catch(error){
        res.status(500).json({
            error : "Failed to fetch status",
            details : error.message
        })
    }
}
const createCheckout = async (req, res) => {
    try {
        const { orderId, amount, sellerUserId, appFeeAmount, successUrl, cancelUrl } = req.body;
        if (!orderId || !amount || !sellerUserId || !appFeeAmount || !successUrl || !cancelUrl) {
            return res.status(400).json({ error: "Missing checkout session parameters" });
        }
        const session = await connectService.createMarketplaceCheckout({
            orderId,
            amount,
            sellerUserId,
            appFeeAmount,
            successUrl,
            cancelUrl
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: "Failed to create marketplace session", details: error.message });
    }
};
module.exports = {
    onboardSeller,
    checkStatus,
    createCheckout
};