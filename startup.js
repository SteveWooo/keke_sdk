const express = require("express");
const app = express();

app.use("/dist", express.static("public"));

app.listen(83, function(){
	console.log("listened at : 83");
});
