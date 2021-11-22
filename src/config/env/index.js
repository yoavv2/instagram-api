const develpoment = require("./development");
const production = require("./production");

let enviroment = develpoment;
if (process.env.NODE_ENV === "production") {
  enviroment = production;
}

module.exports = enviroment;

// module.exports = {
//   mongoUrl: "mongodb://localhost:27017/instagram",
// };
