const https = require('https');
const fs = require('fs');
const tls = require("tls");
const {sh} = require("../utils.js") 

let secureContextCache = {};

async function getSecureContext(domain, cb) {
    // console.log("getSecureContext for", domain);

    if (!secureContextCache[domain]) {
        await add_domain(domain)
        let key = await tryHardRead('ssl/certs/general/key.pem');
        let cert = await tryHardRead('ssl/certs/servers/' + domain + "/cert.pem") + "\n" + await tryHardRead('ssl/certs/ca/ca-cert.pem');
        let ca = await tryHardRead('ssl/certs/ca/ca-cert.pem');

        const opt = {
            key, cert, ca
        }
        // console.log(opt)

        secureContextCache[domain] = tls.createSecureContext(opt);
        // secureContextMemo.addCACert(ca);
    }

    if (cb) {
        cb(null, secureContextCache[domain]);
        return
    } else {
        return secureContextCache[domain]
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


let pending_domains = [];

let taken_mutex = false;

async function add_domain(new_domain) {
    pending_domains.push(new_domain);
    if (!taken_mutex) {
        taken_mutex = true;

        while (pending_domains.length > 0) {
            const domain = pending_domains.pop();
            console.log("executing signing routine for ", domain)
            let command = "bash -c \"bash ssl/build_server.sh " + domain + " ssl\"";
            // console.log(command)
            await sh(command);
        }
    }

    taken_mutex = false;
}

const boot = async () => {

    const {DOMAIN_CONFIG} = require("../config");
    await Promise.all(Object.keys(DOMAIN_CONFIG).map(async (domain) => {

        await getSecureContext(domain, () => {
            console.log("the ssl is signed for", domain);
        });

    }))

    const httpsOptions = {
        SNICallback: getSecureContext,
    };

    let server = https.createServer(httpsOptions, require("./forward_server").app);
    server.listen(443);


}

module.exports = { boot };
