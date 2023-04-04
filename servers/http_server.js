const http = require('http')

const boot = async () => {
    http.createServer(require("./forward_server").app).listen(80);
}

module.exports = { boot };