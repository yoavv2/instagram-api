const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const postsController = require("../controllers/posts.controller");
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log(`auth routes`);
  try {
    const user = jwt.verify(token, "shahar");
    req.userId = user.id;
    next();
  } catch (err) {
    console.log(err);
    res.status(403).send();
  }
};

router.get("/user/me", auth, usersController.me);
router.post("/post", auth, postsController.create);
router.get("/post", postsController.getAll);
router.post("/user", usersController.create);
router.post("/user/available", usersController.isAvailable);
router.post("/login", usersController.login); // req.body => username, password
router.get("/health", auth, (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
