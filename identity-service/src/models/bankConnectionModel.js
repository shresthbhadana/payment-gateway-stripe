const mongoose = require("mongoose");
const bankConnectionSchema = new mongoose.Schema ({
    userId : {
        type : String,
        required : true,
        index:true
    },
    stripeSessionId : {
        type : String,
        required : true,
        index: true
    },
    stripeAccountId : { 
        type: String,
            required: true,
            unique: true,
            index: true
    },
    institutionName  : {
        type : String,
        required : true
    },
    status  : {
        type : String,
        defalt : "active"
    },
    supportedPermissions:[String],
    lastFourDigits : {
        type : String,
        default : "0000"
    }

},{
timestamps : true
}
);
module.exports = mongoose.model("BankConnection", bankConnectionSchema);