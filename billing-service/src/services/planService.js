const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const planRepository = require("../repository/planRepository");


const createNewPlan = async({name,price,currency,interval})=>{
    const product = await stripe.products.create({
        name :name,
        description: `${name} recurring plan`,
    })

    const priceObject = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100) ,
        currency: currency || "usd",
        recurring: {
            interval: interval || "month"
        }
    })

    const newPlan = await planRepository.createPlan({
        stripeProductId : product.id,
        stripePriceId: priceObject.id,
        name: name,
        price: price,
         currency: currency || "usd",
        interval: interval || "month",
        active: true    
    })
    return newPlan
}
module.exports = {createNewPlan}