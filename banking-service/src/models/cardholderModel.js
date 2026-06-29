const mongoose = require("mongoose");
const cardholderSchema = new mongoose.Schema({
    userId :{
        type : String ,
        required : true,
        unique : true,
        index: true
    },

    stripeCardHolderId : {
        type : String,
        required : true,
        unique : true,
        index : true
    },
     name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: "active"
        },
            issuedCards: [
            {
                stripeCardId: { type: String, unique: true, index: true },
                cardType: { type: String, enum: ["virtual", "physical"], default: "virtual" },
                last4: String,
                status: { type: String, default: "active" },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },  { timestamps: true }
)
module.exports = mongoose.model("Cardholder",cardholderSchema);
