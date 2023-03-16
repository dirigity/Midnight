const https = require('https');
const fs = require('fs');
const tls = require("tls");
const { exec } = require("child_process")

async function sh(cmd) {
    return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

let server;

let secureContextMemo = {};

function getSecureContext(domain, cb) {
    // console.log("certificate for", domain);
    if (!secureContextMemo[domain]) {
        secureContextMemo[domain] = tls.createSecureContext({
            key: fs.readFileSync('ssl/certs/general/key.pem'),
            cert: fs.readFileSync('ssl/certs/servers/' + domain + "/cert.pem"),
            ca: fs.readFileSync('ssl/certs/ca/ca-cert.pem')
        });
    }
    if (cb) {
        cb(null, secureContextMemo[domain]);
        return
    } else {
        return secureContextMemo[domain]
    }
}

async function start_server() {
    if (server) server.close();

    const httpsOptions = {
        SNICallback: getSecureContext,
    };

    server = https.createServer(httpsOptions, require("./forward_server").app);
    server.listen(443);
}

let pending_domains = [];

let taken_mutex = false;
async function add_domain(new_domain) {
    // create certs;
    pending_domains.push(new_domain);
    if (!taken_mutex) {
        taken_mutex = true;

        while (pending_domains.length > 0) {
            let command = "export SSL_PATH=\"ssl\" && bash $SSL_PATH/build_server.sh " + pending_domains.pop();
            // console.log(command)
            await sh(command);
        }
    }

    taken_mutex = false;
}

module.exports = { add_domain }


start_server()
console.log("HTTPS up")
