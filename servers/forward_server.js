const originalUrl = require('original-url')
const { record } = require("../logger.js")
const { petition_warp, response_warp } = require("../warper.js")
const request = require('request');
const { query } = require('dns-query')

const { EXTERNAL_DNS, DOMAINS_UNDER_ATTACK } = require("../config.js");

const app = async function (req, res) {
    let { full: url, hostname } = originalUrl(req);

    if (DOMAINS_UNDER_ATTACK.indexOf(hostname) == -1) { res.end("compruebe la url" + DOMAINS_UNDER_ATTACK + " " + hostname); return; }

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
    // console.log("legit querry");
    const { answers, rcode } = await query(
        { question: { type: 'A', name: domain } },
        { endpoints: [EXTERNAL_DNS] }
    )
    // console.log("dns_response:", answers, rcode);

    ip = answers.filter(({ data, type }) => data && type == "A")[0].data;
    // console.log("legit ip for", domain, "is", ip, answers);

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