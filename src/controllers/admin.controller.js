const { Router } = require("express");
const { UsersDAO } = require("../factory/index")

const { validateToken } = require("../utils/jwt.utils");

const adminController = Router();
const Users = new UsersDAO();

adminController.post("/validate", validateToken, async (req, res, next) => {
    if(!req.user || req.user.role !== "admin") return res.status(403).json({ status: 403, ok: false, response: "Forbidden." });

    return res.status(200).json({ status: 200, ok: true, response: "Valid admin token." });
})

adminController.post("/user/:id/role", validateToken, async (req, res, next) => {
    if(!req.user || req.user.role !== "admin") return res.status(403).json({ status: 403, ok: false, response: "Forbidden." });

    if(!req.body.role) return res.status(401).json({ status: 401, ok: false, response: "Invalid request." });

    try{
        const response = await Users.updateRole(req.params.id, req.body.role);
        
        res.status(200).json({ status: 200, ok: true, response });
    }catch(error){
        next(error);
    }
})

module.exports = adminController;