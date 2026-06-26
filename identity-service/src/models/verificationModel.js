const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
    userId : {
        type :String,
        required : true,
        unique : true,
        index : true
    },
    stripeSessionId : {
        type : String,
        required : true,
        unique : true,
        index : true

    },
    clientSecret : { 
        type : String,
        required : true
    },
    status  : {
           type: String,
            enum: ["requires_input", "processing", "verified", "failed", "canceled"],
            default: "requires_input"
    },
     errorReason: {
            type: String,
            default: null
        },
        verifiedDetails: {
            firstName: String,
            lastName: String,
            dob: String,
            idNumberType: String
        }
},{timestamps :true}
)

module.exports = mongoose.model("Verification",verificationSchema)