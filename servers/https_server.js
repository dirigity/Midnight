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

async function getSecureContext(domain, cb) {
    // console.log("certificate for", domain);

    if (!secureContextMemo[domain]) {
        await add_domain(domain)
        let key = await tryHardRead('ssl/certs/general/key.pem');
        let cert = await tryHardRead('ssl/certs/servers/' + domain + "/cert.pem") + "\n" + await tryHardRead('ssl/certs/ca/ca-cert.pem');
        let ca = await tryHardRead('ssl/certs/ca/ca-cert.pem');

        const opt = {
            key, cert, ca
        }
        // console.log(opt)

        secureContextMemo[domain] = tls.createSecureContext(opt);
        // secureContextMemo.addCACert(ca);
    }

    if (cb) {
        cb(null, secureContextMemo[domain]);
        return
    } else {
        return secureContextMemo[domain]
    }
}

function tryHardRead(file_path, n = 10) {
    return new Promise((r) => {
        fs.readFile(file_path, { encoding: 'utf8' }, (err, data) => {
            if (err) {
                if (n > 0) {
                    r(tryHardRead(file_path), n - 1);
                } else {
                    console.err("[ERR]: self_sign_error");
                    r(false);
                }
            }
            else r(data);
        })
    });
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
            let command = "bash -c \"bash ssl/build_server.sh " + pending_domains.pop() + " ssl\"";
            // console.log(command)
            await sh(command);
        }
    }

    taken_mutex = false;
}

const { DOMAINS_UNDER_ATTACK } = require("../config");
DOMAINS_UNDER_ATTACK.forEach((domain) => {
    getSecureContext(domain, () => {
        console.log("the ssl is signed for", domain);
    });

})


start_server()
console.log("HTTPS up")
