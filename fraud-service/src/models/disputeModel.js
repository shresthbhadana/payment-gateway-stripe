const mongoose = require("mongoose");
const disputeSchema = new mongoose.Schema({
        stripeDisputeId : {
        type : String,
        required : true,
        unique : true,
        index:true
    },
     chargeId : {
        type : String,
        required : true,
        index:true
    },
    amount :{
        type : Number,
        required : true,
    },
    currency  : {
        type : String,
        default : "usd"
    },
    reason : {
         type : String,
         default : "general"
    },
      status: {
            type: String,
            enum: ["needs_response", "warning_needs_response", "under_review", "won", "lost"],
            default: "needs_response"
        },
        evidenceSubmitted: {
            type: Boolean,
            default: false
        }
},{
    timestamps : true
})
module.exports = mongoose.model("Dispute",disputeSchema);
