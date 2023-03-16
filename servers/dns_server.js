const https_server = require("./https_server");
const NetcatServer = require('netcat/server');
const NetcatClient = require('netcat/client');


function forge_DNS_response(query, [ip_a, ip_b, ip_c, ip_d], expiration) {
    let ex_a = expiration >> 12;
    let ex_b = expiration >> 8 & 0xFF;
    let ex_c = expiration >> 4 & 0xFF;
    let ex_d = expiration & 0xFF;

    let response = new Uint8Array(query.length + 16);
    response.set(query, 0)
    response.set([0x81, 0x80, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00], 2)
    response.set([0xc0, 0x0c, 0x00, 0x01, 0x00, 0x01, ex_a, ex_b, ex_c, ex_d, 0x00, 0x04, ip_a, ip_b, ip_c, ip_d], query.length)

    return response;

}

function get_domain_from_DNS_query(buffer) {
    let sections = [];
    let url_section = buffer.slice(12);
    while (url_section[0] != 0) {
        let size = url_section[0];
        sections.push(url_section.slice(1, size + 1).toString());
        url_section = url_section.slice(size + 1)
    }

    return sections.join(".")
}

const IP = require("../config").EXPOSED_IP;


let whitelist = {
    "www.microsoft.com": true,
}

whitelist[IP[3] + "." + IP[2] + "." + IP[1] + "." + IP[0] + ".in-addr.arpa"] = true;

const nc = new NetcatServer()
const server = nc.udp().port(53).listen();

function proxify(rinfo, data) {
    let client = new NetcatClient().udp().port(53).init().send(data, "8.8.8.8");
    client.on("data", ({ data, rinfo: dns_rinfo }) => {
        server.port(rinfo.port).send(data, rinfo.address)
    });
}

server.on('data', async function (rinfo, data) {
    let domain = get_domain_from_DNS_query(data);
    console.log("[dns]:petition " + domain + (whitelist[domain] ? " (whitelisted)" : ""));
    if (whitelist[domain]) {
        proxify(rinfo, data);
        return;
    }

    await https_server.add_domain(domain);

    console.log(" result: " + IP);
    server.port(rinfo.port).send(forge_DNS_response(data, IP, 60), rinfo.address)

})


console.log("DNS up");


