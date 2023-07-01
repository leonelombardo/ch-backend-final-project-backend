const fs = require("fs");

const Users = require("../models/users.model");
const CustomError = require("../../classes/CustomError");
const { hashPassword } = require("../../utils/bcrypt.util");
const UserDTO = require("../../dto/user.dto");
const sendEmail = require("../../utils/email.utils");

class UsersDAO{
    constructor(){
        this.path = process.cwd() + "/src/fs/users.json"
    }

    async find(){
       const response = await Users.find();
       const formatted = response.map(user => UserDTO(user));
       
       return formatted;
    }

    async findById(id){
        const user = await Users.findById(id);

        if(!user) throw new CustomError({ status: 404, ok: false, response: "User not found." });

        return user;
    }

    async create(body){
        const { first_name, last_name, email, age, password } = body;

        if(!first_name || !last_name || !email || !age || !password) throw new CustomError({ status: 400, ok: false, response: "Invalid request." });;

        const user = { first_name, last_name, email, age, password: hashPassword(password), role: "user" };

        const response = await Users.create(user);

        return "User created.";
    }

    async changePassword(user, password){
        const found = await Users.findById(user._id);

        if(!found) throw new CustomError({ status: 404, ok: false, response: "User not found." });

        await Users.updateOne({ _id: user._id }, { password: hashPassword(password) });

        return found;
    }

    async switchRole(id){
        const user = await Users.findById(id);

        if(!user) throw new CustomError({ status: 404, ok: false, response: "User not found." });

        if(user.role === "premium"){
            await Users.updateOne({ _id: id }, { role: "user" } );

            return user;
        }

        const documentTypes = [];

        user.documents.forEach(document => (document.type === "dni" || document.type === "address" || document.type === "account_status") && documentTypes.push(document.type));

        if(!documentTypes.includes("dni") || !documentTypes.includes("address") || !documentTypes.includes("account_status")) throw new CustomError({ status: 400, ok: false, response: "Finish processing your documentation."});

        const update = {...user._doc, role: user._doc.role === "user" ? "premium" : "user" };

        await Users.updateOne({ _id: id }, update);

        return update;
    }

    async updateRole(id, role){
        const user = await Users.findById(id);

        if(!user) throw new CustomError({ status: 404, ok: false, response: "User not found." });

        const update = {...user._doc, role };

        await Users.updateOne({ _id: id }, update);

        return update;
    }

    async uploadDocument(id, files){
        const user = await Users.findById(id);

        if(!user) throw new CustomError({ status: 404, ok: false, response: "User not found." });
    
        if(!files.length) throw new CustomError({ status: 404, ok: false, response: "There are no documents to upload." });

        let documents = [...user._doc.documents];

        files.forEach(file => documents = documents.length ? [...documents, { type: file.document_type, reference: file.path }] : [{ type: file.document_type, reference: file.path }]);

        const updated = { ...user._doc, documents };

        await Users.updateOne({ _id: id }, updated);

        return documents;
    }

    async deleteOne(id){
        const user = await Users.findById(id);

        if(!user) throw new CustomError({ status: 404, ok: false, response: "User not found." });
        
        await Users.deleteOne({ _id: id });
        
        return "User removed.";
    }

    async deleteMany(){
        const limit = new Date(Date.now() - (2*24*60*60*1000));

        const users = await Users.find();
        const removed = users.filter(user => new Date(user.last_connection) <= limit);

        for(const user of removed){
            const message = `<span style="font-weight: bold;">${user.first_name}</span> we had to remove your account from our database for inactivity.`;
    
            await sendEmail(user.email, "Inactive account", message);
        }

        const response = await Users.deleteMany({ last_connection: { $lte: limit } });

        return "All inactive users were removed.";
    }
}

module.exports = UsersDAO;