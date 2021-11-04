const User = require("../models/user");
const jwt = require("jsonwebtoken");

async function getAllUsers(req, res) {
  const users = await User.find({});
  res.send(users);
}
async function isAvailable(req, res) {
  const { username } = req.body;
  const isExist = await User.findOne({ username });
  res.send(!isExist);
}

async function create(req, res) {
  const user = new User(req.body);
  let avatar = `https://avatars.dicebear.com/api/bottts/${user.username}.svg?background=%230000ff`;
  user.avatar = avatar;
  console.log("user : ", user);
  try {
    const savedUser = await user.save();
    res.status(201).send(savedUser);
  } catch (err) {
    res.status(400).json({ message: "name and or email are allready in use" });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(403)
      .json({ message: "One or more of the parameters are missing" });
    return;
  }
  const userExist = await User.findOne({ username, password });
  if (!userExist) {
    res.status(403).json({ message: "One of the paramateres is incorrect" });
    return;
  }
  const token = jwt.sign({ id: userExist._id }, "shahar");

  res.json({ token });
}

async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    res.send(user);
  } catch (err) {
    res.sendStatus(500);
  }
}

async function getUser(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      res.sendStatus(404);
    } else {
      res.json(user);
    }
  } catch (err) {
    res.sendStatus(500);
  }
}

async function search(req, res) {
  const { username } = req.params;
  try {
    const users = await User.find({
      username: new RegExp(username, "ig"),
    });
    res.json(users);
  } catch (e) {
    res.sendStatus(500);
  }
}

module.exports = {
  create,
  login,
  getAllUsers,
  isAvailable,
  me,
  getUser,
  search,
};
