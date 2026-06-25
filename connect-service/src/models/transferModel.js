const mongoose = require("mongoose");
const transferSchema = new mongoose.Schema(
{
    stripeTransferId :{
        type:String,
        required :true,
        unique: true,

    },
    orderId  : {
        type: String,required : true,index: true
    },
    amount : {type : String,required : true,index: true},
     currency: { type: String, default: "usd" },
        destinationAccountId: { type: String, required: true }
},
{timestamps:true}

)
module.exports = mongoose.model("Tranfer",transferSchema)