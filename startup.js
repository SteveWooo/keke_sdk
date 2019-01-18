const express = require("express");
const app = express();

app.use("/dist", express.static("public"));

//输出端口//今天也是没有sdk的活呢
app.listen(83, function(){
	console.log("listened at : 83");
});
