// WIFI LAN
module.exports = {
    EXPOSED_IP: (() => {
        const { networkInterfaces } = require('os');


        const nets = networkInterfaces();
        const results = [];

        for (const name in nets) {
            for (const net of nets[name]) {
                // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (name == "WiFi")
                        results.push(net.address.split(".").map(e => Number.parseInt(e)));
                }
            }
        }
        console.log("public ip will be", results[0])
        return results[0];
    })(),
    EXTERNAL_DNS: [8, 8, 8, 8],
    DOMAINS_UNDER_ATTACK: ["example.com"]
}

// // VM
// module.exports = {
//     EXPOSED_IP: [192, 168, 1, 30],
//     EXTERNAL_DNS: [8, 8, 8, 8],
//     DOMAINS_UNDER_ATTACK:["example.com"]
// }

// // wsl
// module.exports = {
//     EXPOSED_IP: [127, 0, 0, 1],
//     EXTERNAL_DNS: [8, 8, 8, 8]
// }