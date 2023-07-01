const { STRIPE_SECRET_KEY } = require("../config/payments.config");

const stripe = require("stripe")(STRIPE_SECRET_KEY);

const createPaymentIntent = async (total) => {
    return await stripe.paymentIntents.create({
        amount: total * 100,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
            customer: "testing"
        }
    });
    
}

module.exports = { createPaymentIntent };