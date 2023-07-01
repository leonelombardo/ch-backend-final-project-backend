const Users = require("../models/users.model");
const CustomError = require("../../classes/CustomError");
const { verifyPassword } = require("../../utils/bcrypt.util");
const { isValidToken } = require("../../utils/jwt.utils");

class AuthDAO{
    async login(body){
        const { email, password } = body;

        if(!email || !password) throw new CustomError({ status: 400, ok: false, response: "Invalid request." });
        
        const user = await Users.findOne({ email });

        if(!user) throw new CustomError({ status: 400, ok: false, response: "Invalid username or password." });


        if(!verifyPassword(password, user.password)) throw new CustomError({ status: 400, ok: false, response: "Invalid username or password." });

        const update = { ...user._doc, last_connection: new Date().toLocaleString("en-US") };

        await Users.updateOne({ _id: user._id }, update);

        return user;
    }

    async logout(token){
        const { user } = isValidToken(token);
        
        const update = { ...user, last_connection: new Date().toLocaleString("en-US") };

        await Users.updateOne({ _id: user._id }, update);
    }
}

module.exports = AuthDAO;