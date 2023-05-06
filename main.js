const { fs, sh } = require("./utils");

(async () => {

    console.log("rebuild CA");

    let command = "bash -c \"bash ssl/build_ca.sh ssl\"";
    // console.log(command)
    await sh(command);

    console.log("exposed ip: ", await require("./config").GET_EXPOSED_IP())

    console.log("Starting http...")
    await require("./servers/http_server").boot()

    console.log("Starting https...")
    await require("./servers/https_server").boot()

    console.log("Starting dns service...")
    await require("./servers/dns_server").boot()

    // console.log("Starting dhcp service...")
    // await require("./servers/dhcp_server").boot();

    // wait for signatures

    console.log("READY!")

})();

