

console.log("Starting http...")
require("./servers/http_server")

console.log("Starting https...")
require("./servers/https_server")

console.log("Starting dns service...")
require("./servers/dns_server")

console.log("Starting dhcp service...")
require("./servers/dns_server")

console.log("READY!")
