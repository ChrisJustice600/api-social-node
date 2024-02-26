const bcrypt = require("bcrypt");
const jwtUtils  = require('../utils/jwt.utils');
const models = require('../models');

// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;

// Routes
module.exports= {
    register : function(req, res){
     // recuperation des parametres envoyés dans le requete
    const email    = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const bio      = req.body.bio;

    if (email == null || username == null || password == null) {
        return res.status(400).json({ 'error': 'missing parameters' });
      }

    // TODO verify pseudo length, mail regex, password etc.
    if (username.length >= 13 || username.length <= 4) {
      return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 'error': 'email is not valid' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
    }

    models.User.findOne({
        attributes: ['email'],
        where: { email: email }
      }) //--Si la recherche aboutie--///
      .then(function(userFound) {
        if (!userFound) {
          //-------- ETAPE 1-------///
            // si l'utilisateur ne se trouve pas dans la bd
            // on recupere le PASSWORD ET on le crypt  avec bcrypt
          bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
             //-------- ETAPE 2-------///
            //  On crée un nouveau utilisateur
            const newUser = models.User.create({
              email: email,
              username: username,
              password: bcryptedPassword,
              bio: bio,
              isAdmin: 0
            }) //-LA FONCTION RENVOIE UNE PROMESSE///
            .then(function(newUser) {
              return res.status(201).json({
                'userId': newUser.id
              })
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'cannot add user' });
            });
          });
            //-------- ETAPE 3-------///
          // Si l'utilisateur existe deja dans la base de donné
        } else {
          return res.status(409).json({ 'error': 'user already exist' });
        }
      })
      // Erreur lors de la verification, la recherche n'a pas aboutie
      .catch(function(err) {
        return res.status(500).json({ 'error': 'unable to verify user' });
      });

    },

    login : function(req, res){
    // recuperation des parametres envoyés dans le requete
    const email    = req.body.email;
    const password = req.body.password;

    if (email == null || password == null) {
        return res.status(400).json({ 'error': 'missing parameters' });
      }

    models.User.findOne({
        where: { email: email }
      })//--Renvoie une promesse--///
      .then(function(userFound) {
        if(userFound) {
          bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
            if(resBycrypt) {
              return res.status(200).json({
                'userId': userFound.id,
                'token': jwtUtils.generateTokenForUser(userFound)
            });
            } else {
              return res.status(403).json({ 'error': 'invalid password' });
            }
          });
        } else {
          return res.status(404).json({ 'error': 'user not exist in DB' });
        }
      })
      .catch(function(err) {
        return res.status(500).json({ 'error': 'unable to verify user' });
      });
    },
    getUserProfile: function(req, res) {
      // Getting auth header
      const headerAuth  = req.headers['authorization'];
      const userId = jwtUtils.getUserId(headerAuth);
  
      if (userId < 0)
        return res.status(400).json({ 'error': 'wrong token' });
  
      models.User.findOne({
        attributes: [ 'id', 'email', 'username', 'bio' ],
        where: { id: userId }
      }).then(function(user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      }).catch(function(err) {
        res.status(500).json({ 'error': 'cannot fetch user' });
      });
    },
    updateUserProfile : function(req, res){
      const headerAuth  = req.headers['authorization'];
      const userId = jwtUtils.getUserId(headerAuth);

      // parametre à recuperer de la requette
      const bio = req.body.bio;
    }
}