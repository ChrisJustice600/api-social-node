const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwt.utils");
const models = require("../models");

// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;

// Routes
module.exports = {
  register: async (req, res) => {
    // Récupération des paramètres envoyés dans la requête
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const bio = req.body.bio;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "missing parameters" });
    }

    // Vérification de la longueur du pseudo, l'email et le mot de passe
    if (username.length < 5 || username.length > 12) {
      return res.status(400).json({ error: "wrong username length (must be 5-12)" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "invalid email" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error:
          "invalid password (must be 4-8 characters and include at least 1 number)",
      });
    }

    try {
      // Recherche de l'utilisateur par email
      const userFound = await models.User.findOne({
        attributes: ["email"],
        where: { email },
      });

      // Si l'utilisateur n'existe pas
      if (!userFound) {
        // Hash du mot de passe
        const bcryptedPassword = await bcrypt.hash(password, 5);

        // Création d'un nouvel utilisateur
        const newUser = await models.User.create({
          email,
          username,
          password: bcryptedPassword,
          bio,
          isAdmin: 0,
        });

        return res.status(201).json({ userId: newUser.id });
      } else {
        return res.status(409).json({ error: "user already exists" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "unable to register user" });
    }
  },

  login: async (req, res) => {
    // Récupération des paramètres envoyés dans la requête
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: "missing parameters" });
    }

    try {
      // Recherche de l'utilisateur par email
      const userFound = await models.User.findOne({ where: { email } });

      if (userFound) {
        // Comparaison du mot de passe saisi avec le hash en base de données
        const match = await bcrypt.compare(password, userFound.password);

        if (match) {
          return res.status(200).json({
            userId: userFound.id,
            token: jwtUtils.generateTokenForUser(userFound),
          });
        } else {
          return res.status(403).json({ error: "invalid password" });
        }
      } else {
        return res.status(404).json({ error: "user not found in DB" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "unable to login user" });
    }
  },

  getUserProfile: async (req, res) => {
    // Récupération du header d'authentification
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    if (userId < 0) {
      return res.status(400).json({ error: "wrong token" });
    }
  
    try {
      // Recherche de l'utilisateur par id
      const user = await models.User.findOne({
        attributes: ["id", "email", "username", "bio"],
        where: { id: userId },
      });
  
      if (user) {
        return res.status(201).json(user);
      } else {
        return res.status(404).json({ error: "user not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "cannot fetch user" });
    }
    },
  
    updateUserProfile: async (req, res) => {
      // Récupération du header d'authentification
      const headerAuth = req.headers["authorization"];
      const userId = jwtUtils.getUserId(headerAuth);
  
      // Paramètre bio
      const bio = req.body.bio;
  
      try {
        // Recherche de l'utilisateur par id
        const userFound = await models.User.findOne({
          attributes: ["id", "bio"],
          where: { id: userId },
        });
  
        if (userFound) {
          // Mise à jour de l'utilisateur (bio)
          await userFound.update({ bio: bio || userFound.bio });
  
          // Récupération de l'utilisateur mis à jour pour renvoyer les données complètes
          const updatedUser = await models.User.findOne({
            attributes: ["id", "email", "username", "bio"],
            where: { id: userId },
          });
  
          return res.status(201).json(updatedUser);
        } else {
          return res.status(404).json({ error: "user not found" });
        }
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "cannot update user profile" });
      }
    },
  };
  