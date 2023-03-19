function petition_warp(headers, body, url) {

    if(headers["accept-encoding"]){
        delete headers["accept-encoding"];
    }

    return [headers, body, url]
}

function response_warp(headers, body, statusCode) {
    body = body.split("illustrative").join("nefarious");
    if (headers["content-length"]) {
        headers["content-length"] = body.length + "";
    }

    return [headers, body, statusCode]
}

module.exports = { petition_warp, response_warp }