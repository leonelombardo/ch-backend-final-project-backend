const jwt = require("jsonwebtoken");

const { JWT_SECRET_KEY } = require("../config/jwt.config");
const CustomError = require("../classes/CustomError");

const generateToken = user => jwt.sign({ user }, JWT_SECRET_KEY, { expiresIn: "30m" });

const isValidToken = token => jwt.verify(token, JWT_SECRET_KEY);

const validateToken = (req, res, next) => {
    const token = req.cookies.token || req.body.token;
    
    if(!token) throw new CustomError({ status: 401, ok: false, response: "Unauthorized."});
    
    jwt.verify(token, JWT_SECRET_KEY, (error, credentials) => {
        if(error) throw new CustomError({ status: 403, ok: false, response: "Forbidden." });
        
        req.user = credentials.user;
        
        next();
    });
}

module.exports = { generateToken, isValidToken, validateToken };