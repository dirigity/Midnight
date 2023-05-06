module.exports = {
    domain_config: {
        "example.com": {
            logging: true,
            petition_warp: async (headers, body, url) => {

                if (headers["accept-encoding"]) {
                    delete headers["accept-encoding"];
                }

                return [headers, body, url]
            },

            response_warp: async (headers, body, statusCode) => {
                body = body.split("illustrative").join("nefarious");
                if (headers["content-length"]) {
                    headers["content-length"] = body.length + "";
                }

                return [headers, body, statusCode]
            }
        },
        "api.moyoung.com": {
            logging: true,
        },
        "wr.moyoung.com": {
            logging: true,
        },
        "qcdn.moyoung.com": {
            logging: true,
        },
    }
}