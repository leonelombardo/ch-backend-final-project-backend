const { Router } = require("express");

const CustomError = require("../classes/CustomError");

const { createPaymentIntent } = require("../services/payments.services");

const paymentsController = Router();

paymentsController.post("/stripe", async (req, res, next) => {
    if(!req.body.total) throw new CustomError({ status: 400, ok: false, response: "Invalid request." });

    try{
        const response = await createPaymentIntent(req.body.total);
        
        res.status(200).json({ status: 200, ok: true, response });
    }catch(error){
        next(error);
    }
})

module.exports = paymentsController;