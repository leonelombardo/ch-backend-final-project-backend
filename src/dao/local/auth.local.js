const fs = require("fs");
const CustomError = require("../../classes/CustomError");
const { verifyPassword } = require("../../utils/bcrypt.util");
const { isValidToken } = require("../../utils/jwt.utils");

class AuthDAO{
    constructor(){
        this.users = process.cwd() + "/src/fs/users.json"
    }

    async login(body){
        const { email, password } = body;

        if(!email || !password) throw new CustomError({ status: 400, ok: false, response: "Invalid request." });

        const response = await fs.promises.readFile(this.users);
        const users = JSON.parse(response);

        const user = users.find(user => user.email === email);

        if(!user) throw new CustomError({ status: 400, ok: false, response: "Invalid username or password." });

        if(!verifyPassword(password, user.password)) throw new CustomError({ status: 400, ok: false, response: "Invalid username or password." });

        const updated = {...user, last_connection: new Date().toLocaleString("en-US") };
        const update = users.map(x => x.id !== updated.id ? x : updated);

        await fs.promises.writeFile(this.users, JSON.stringify(update, null, "\t"));

        return user;
    }

    async logout(token){
        const response = await fs.promises.readFile(this.users);
        const users = JSON.parse(response);

        const { user } = isValidToken(token);
        
        const found = users.find(x => x.id === user.id );
        
        const updated = {...found, last_connection: new Date().toLocaleString("en-US") };
        const update = users.map(x => x.id !== updated.id ? x : updated);

        await fs.promises.writeFile(this.users, JSON.stringify(update, null, "\t"));
    }
}

module.exports = AuthDAO;