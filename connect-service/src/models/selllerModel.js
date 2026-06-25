const mongoose = require("mongoose");
const sellerSchema = new mongoose.Schema({
    userId : {
        type : String,
        required: true,
        unique: true,
        index:true,
    },
    stripeConnectAccountId : {
        type : String,
        required : true,
        unique : true,
    },
    email : {
        type: String,
        required : true,
        unique : true
    },
    businessName: { type: String },
        onboardingCompleted: { type: Boolean, 
            default: false },
chargesEnabled: { type: Boolean,
            
default: false },
        payoutsEnabled: { type: Boolean, default: false }
         },
    { timestamps: true }
);
module.exports = mongoose.model("Seller", sellerSchema);