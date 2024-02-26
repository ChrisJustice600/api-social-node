const express =require("express");
const usersCtrl = require("./routes/usersCtrl");

// Router 
exports.router = (function(){
    const apiRouter = express.Router();

    // Users routes
    apiRouter.route("/users/register/").post(usersCtrl.register);
    apiRouter.route("/users/login/").post(usersCtrl.login);
    // Récupérer les infos de l'utilisateur
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);

    return apiRouter
})(); 