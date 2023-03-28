const { GET_EXPOSED_IP, GET_GATEWAY, GET_IP_RANGE } = require("../config");
const dhcp = require('dhcp');
(async () => {
    const EXPOSED_IP = await GET_EXPOSED_IP().join(".");
    const GATEWAY = await GET_GATEWAY().join(".");
    const IP_RANGE = await GET_IP_RANGE();


    var s = dhcp.createServer({
        range: IP_RANGE,
        randomIP: true,
        netmask: '255.255.255.0',
        router: [GATEWAY],
        dns: [EXPOSED_IP],
        broadcast: '192.168.0.255',
        server: EXPOSED_IP
    });

    s.listen();
})()
