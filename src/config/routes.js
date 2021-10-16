const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log(token);
  try {
    jwt.verify(token, "shahar");
    next();
  } catch (err) {
    // err
    // console.log(err);
    res.status(403).send("Not Nice");
  }
};

router.post("/user", usersController.create);
router.get("/get", usersController.getAllUsers);
router.post("/login", usersController.login); // req.body => username, password
router.get("/health", auth, (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
