const User = require('../models/user');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const mongoose = require('mongoose');

const { randColor } = require('./avatarBackgrounds');

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
  let avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}&backgroundColor=${randColor}`;
  user.avatar = avatar;

  try {
    const savedUser = await user.save();
    res.status(201).send(savedUser);
  } catch (err) {
    res.status(400).json({ message: 'name and or email are allready in use' });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(403).json({ message: 'Username Or Password are wrong' });
    return;
  }
  const userExist = await User.findOne({
    username,
    password: md5(password),
  });
  if (!userExist) {
    res.status(403).json({ message: 'One of the paramateres is incorrect' });
    return;
  }
  const token = jwt.sign({ id: userExist._id }, 'shahar');

  res.json({ token });
}

async function me(req, res) {
  console.log('me() controller called');
  console.log('req.userId:', req.userId);
  
  try {
    const user = await User.findById(req.userId);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('No user found with ID:', req.userId);
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error in me():', err);
    res.status(500).json({ message: err.message });
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
      username: new RegExp(username, 'ig'),
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

async function updateAvatar(req, res) {
  try {
    const userId = req.user.id;
    const avatarUrl = req.file?.path;
    
    if (!avatarUrl) {
      console.error('No avatar file received');
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('Updating avatar URL:', avatarUrl);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Avatar updated successfully:', updatedUser.avatar);
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating avatar:', err);
    res.status(500).json({ message: 'Failed to update avatar', error: err.message });
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
  updateAvatar
};
