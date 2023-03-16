const http = require('http')
http.createServer(require("./forward_server").app).listen(80);
console.log("HTTP up")
