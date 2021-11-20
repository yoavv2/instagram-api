const User = require("../models/user");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const mongoose = require("mongoose");

const { randColor } = require("./avatarBackgrounds");

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
  user.password = md5(user.password);
  let avatar = `https://avatars.dicebear.com/api/bottts/${user.username}.svg?background=${randColor}`;
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
    res.status(403).json({ message: "Username Or Password are wrong" });
    return;
  }
  const userExist = await User.findOne({
    username,
    password: md5(password),
  });
  if (!userExist) {
    res.status(403).json({ message: "One of the paramateres is incorrect" });
    return;
  }
  const token = jwt.sign({ id: userExist._id }, "shahar");

  res.json({ token });
}

async function me(req, res) {
  console.log(`res.body`, res.body);
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

async function follow(req, res) {
  const { username } = req.params;
  const myId = req.userId;
  try {
    const whoToFollow = await User.findOne({ username });

    if (!whoToFollow) {
      res.sendStatus(400);
      return;
    }
    const whoToFollowId = whoToFollow._id.toString();
    console.log("whoToFollowId => ", whoToFollow._id);
    console.log("myId=> ", myId);

    await User.findByIdAndUpdate(myId, {
      $addToSet: { following: mongoose.Types.ObjectId(whoToFollow._id) },
    });
    await User.findByIdAndUpdate(whoToFollowId, {
      $addToSet: { followers: mongoose.Types.ObjectId(myId) },
    });

    res.send();
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

async function unfollow(req, res) {
  const { username } = req.params;
  const myId = req.userId;
  try {
    const whoToUnfollow = await User.findOne({ username });

    if (!whoToUnfollow) {
      res.sendStatus(400);
      return;
    }
    const whoToUnfollowId = whoToUnfollow._id.toString();
    await User.findByIdAndUpdate(myId, {
      $pull: { following: mongoose.Types.ObjectId(whoToUnfollow._id) },
    });
    await User.findByIdAndUpdate(whoToUnfollowId, {
      $pull: { followers: mongoose.Types.ObjectId(myId) },
    });
    res.send();
  } catch (err) {
    console.log(err);
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
  follow,
  unfollow,
};
