const dns2 = require('dns2');

const { Packet, UDPClient } = dns2;
const resolve = UDPClient();

const { GET_EXPOSED_IP, DOMAIN_CONFIG } = require("../config");

const boot = async () => {

    const server = dns2.createServer({
        udp: true,
        handle: async (request, send, rinfo) => {
            const response = Packet.createResponseFromRequest(request);
            const [question] = request.questions;
            const { name } = question;


            if (!DOMAIN_CONFIG[name]) {

                const query = await resolve(name);

                const f = ({ address }) => address;
                const addresses = query.answers.filter(f).map(f);
                if (addresses.length != 0) {
                    // console.log("[DNS]: bypassing", name, "->", addresses)

                    response.answers.push({
                        name,
                        type: Packet.TYPE.A,
                        class: Packet.CLASS.IN,
                        ttl: 300,
                        address: addresses[0]
                    });
                    send(response);
                } else {
                    // console.log("[DNS]: ignoring", name)
                    send(response);
                }

            } else {
                console.log("[DNS]: mascarade", name, "->", await GET_EXPOSED_IP())

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

    //TODO open multiple servers for every ip
    server.listen({
        udp: {
            port: 53,
            address: await GET_EXPOSED_IP(),
            type: "udp4",
        },

        tcp: {
            port: 53,
            address: await GET_EXPOSED_IP(),
        },
    });
    // // eventually
    // server.close();

    await new Promise((r) => {
        server.on('listening', () => {
            // console.log(server.addresses());
            r();
        });
    })
}

module.exports = { boot };