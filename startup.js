const express = require("express");
const app = express();

app.use("/public", express.static("public"));

app.listen(83);
