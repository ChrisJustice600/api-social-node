const express = require("express");
const usersCtrl = require("./routes/usersCtrl");
const messagesCtrl = require("./routes/messagesCtrl");

// Router
exports.router = (function () {
  const apiRouter = express.Router();

  // Users routes
  apiRouter.route("/users/register/").post(usersCtrl.register);
  apiRouter.route("/users/login/").post(usersCtrl.login);
  // Récupérer les infos de l'utilisateur
  apiRouter.route("/users/me/").get(usersCtrl.getUserProfile);
  apiRouter.route("/users/me/").put(usersCtrl.updateUserProfile);

  //   Messages routes
  apiRouter.route("/messages/new/").post(messagesCtrl.createMessage);
  apiRouter.route("/messages/").get(messagesCtrl.listMessages);

  return apiRouter;
})();

// {
//   "userId": 1,
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3MDk2MjQ4NTAsImV4cCI6MTcwOTYyODQ1MH0.FoypjZ70USMC05AV_UlYLjqRNjPL5XcBLQqjI801LjQ"
// }
