const dns2 = require('dns2');

const { Packet } = dns2;
const { UDPClient } = dns2;
const resolve = UDPClient();

const { GET_EXPOSED_IP, DOMAINS_UNDER_ATTACK, EXTERNAL_DNS } = require("../config");

const boot = async () => {

    const server = dns2.createServer({
        udp: true,
        handle: async (request, send, rinfo) => {
            const response = Packet.createResponseFromRequest(request);
            const [question] = request.questions;
            const { name } = question;


            if (DOMAINS_UNDER_ATTACK.indexOf(name) == -1) {
                console.log("proxifing   ", name)

                const query = await resolve(name);
                console.log(query);

                response.answers.push(query.answers[0]);

                send(response);
            } else {
                console.log("marcaradeing", name)

                response.answers.push({
                    name,
                    type: Packet.TYPE.A,
                    class: Packet.CLASS.IN,
                    ttl: 300,
                    address: await GET_EXPOSED_IP()
                });
                send(response);
            }


        }
    });

    server.on('request', (request, response, rinfo) => {
        console.log(request.header.id, request.questions[0], request);
    });

    server.on('requestError', (error) => {
        console.log('Client sent an invalid request', error);
    });

    server.on('close', () => {
        console.log('server closed');
    });

    // TODO open multiple servers for every ip
    server.listen({
        // Optionally specify port, address and/or the family of socket() for udp server:
        udp: {
            port: 53,
            address: await GET_EXPOSED_IP(),
            type: "udp4",  // IPv4 or IPv6 (Must be either "udp4" or "udp6")
        },

        // Optionally specify port and/or address for tcp server:
        tcp: {
            port: 53,
            address: await GET_EXPOSED_IP(),
        },
    });
    // // eventually
    // server.close();

    await new Promise((r) => {
        server.on('listening', () => {
            console.log(server.addresses());
            r();
        });
    })
}

module.exports = { boot };