const User = require("../models/user");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

let colors = [
  "aliceBlue",
  "antiqueWhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedAlmond",
  "blue",
  "blueViolet",
  "brown",
  "burlyWood",
  "cadetBlue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerBlue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkBlue",
  "darkCyan",
  "darkGoldenRod",
  "darkGray",
  "darkGrey",
  "darkGreen",
  "darkKhaki",
  "darkMagenta",
  "darkOliveGreen",
  "darkOrange",
  "darkOrchid",
  "darkRed",
  "darkSalmon",
  "darkSeaGreen",
  "darkSlateBlue",
  "darkSlateGray",
  "darkSlateGrey",
  "darkTurquoise",
  "darkViolet",
  "deepPink",
  "deepSkyBlue",
  "dimGray",
  "dimGrey",
  "dodgerBlue",
  "fireBrick",
  "floralWhite",
  "forestGreen",
  "fuchsia",
  "gainsboro",
  "ghostWhite",
  "gold",
  "goldenRod",
  "gray",
  "grey",
  "green",
  "greenYellow",
  "honeyDew",
  "hotPink",
  "indianRed",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderBlush",
  "lawnGreen",
  "lemonChiffon",
  "lightBlue",
  "lightCoral",
  "lightCyan",
  "lightGoldenRodYellow",
  "lightGray",
  "lightGrey",
  "lightGreen",
  "lightPink",
  "lightSalmon",
  "lightSeaGreen",
  "lightSkyBlue",
  "lightSlateGray",
  "lightSlateGrey",
  "lightSteelBlue",
  "lightYellow",
  "lime",
  "limeGreen",
  "linen",
  "magenta",
  "maroon",
  "mediumAquaMarine",
  "mediumBlue",
  "mediumOrchid",
  "mediumPurple",
  "mediumSeaGreen",
  "mediumSlateBlue",
  "mediumSpringGreen",
  "mediumTurquoise",
  "mediumVioletRed",
  "midnightBlue",
  "mintCream",
  "mistyRose",
  "moccasin",
  "navajoWhite",
  "navy",
  "oldLace",
  "olive",
  "oliveDrab",
  "orange",
  "orangeRed",
  "orchid",
  "paleGoldenRod",
  "paleGreen",
  "paleTurquoise",
  "paleVioletRed",
  "papayaWhip",
  "peachPuff",
  "peru",
  "pink",
  "plum",
  "powderBlue",
  "purple",
  "rebeccaPurple",
  "red",
  "rosyBrown",
  "royalBlue",
  "saddleBrown",
  "salmon",
  "sandyBrown",
  "seaGreen",
  "seaShell",
  "sienna",
  "silver",
  "skyBlue",
  "slateBlue",
  "slateGray",
  "slateGrey",
  "snow",
  "springGreen",
  "steelBlue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "whiteSmoke",
  "ellow",
  "yellowGreen",
];
let randColor = colors[Math.floor(Math.random() * colors.length)];

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
    await User.findByIdAndUpdate(myId, {
      $addToSet: { following: mongoose.Types.ObjectId(whoToFollow._id) },
    });
    res.send();
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

async function unfollow(req, res) {
  const { username } = req.params;
  const myId = req.userId;
  try {
    const whoToUnFollow = await User.findOne({ username });
    if (!whoToUnFollow) {
      res.sendStatus(400);
      return;
    }
    await User.findOneAndUpdate(myId, {
      $pull: { following: mongoose.Types.ObjectId(whoTounFollow._id) },
    });
    res.send();
  } catch (e) {
    console.log(e);
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
