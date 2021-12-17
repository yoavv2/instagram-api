const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const routes = require("./config/routes");
const env = require("./config/env/index");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(routes);

mongoose
  .connect(env.mongoUrl)
  .then(listen)
  .catch((err) => console.error(err));

function listen() {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
