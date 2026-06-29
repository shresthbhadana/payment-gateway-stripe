const mongoose = require("mongoose");

const taxCalculationSchema = new mongoose.Schema({
    orderId: {
        type :String,
        required : true,
        unique : true,
        index: true
    },
    stripeCalculationId : {
        type : String,
        required : true,
        unique : true,
        index: true
    },
    stripeTransactionId  : {
        type  :String,
        default : null,
        index:true
    },
    taxAmount : {
        type : Number,
        required : true
    },
    subtotal : {
        type : Number ,
        required : true
    },
    total :{
        type: Number,
        required: true
    },
    status: {
            type: String,
            enum: ["calculated", "recorded"],
            default: "calculated"
        },
  customerDetails: {
            postalCode: String,
            country: String,
            state: String,
            city: String
        },
          taxSummaryBreakdown: [
            {
                amount: Number,
                rate: Number,
                taxabilityReason: String,
                jurisdictionName: String
            }
        ]
},{timestamps :true});

module.exports = mongoose.model("TaxCalculation",taxCalculationSchema)