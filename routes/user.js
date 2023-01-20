const express = require("express");
const router = express.Router();

const uid2 = require("uid2"); // Package qui sert à créer des string aléatoires.
const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string.
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string.

const User = require("../models/User"); // J'appel mon fichier route/model.

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username) {
      return res.status(400).json({ message: `please provide a username` });
    }

    const noDoubleMail = await User.exists({ email: email });
    if (noDoubleMail) {
      return res.status(400).json({ message: `email already used` });
    }

    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(64);

    const user = new User({
      account: {
        username,
      },
      email,
      password,
      newsletter,
      token,
      hash,
      salt,
    });

    await user.save();
    const response = {
      _id: userGuess._id,
      token: userGuess.token,
      account: userGuess.account,
      avatar: user.avatar,
    };
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: `This route doesn't exists` });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newHash = SHA256(user.salt + password).toString(encBase64);
    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  } catch (error) {
    res.status(400).json({ message: "This route doesn't exists" });
  }
});

module.exports = router;
