
const fs = require("fs");

function scape(str) {
    return str.split("/").join("-")
        .split("<").join("-")
        .split(">").join("-")
        .split(":").join("-")
        .split("\"").join("-")
        .split("\\").join("-")
        .split("|").join("-")
        .split("?").join("-")
        .split("*").join("-")
}



module.exports = {
    record: (domain, original_request, warped_request, original_response, warped_response, client_data) => {
        let path = "persistence/recordings/" + scape(client_data.client_ip) + "/" + scape(domain.split("?")[0]);
        console.log("path: ", path);
        let name = +  new Date().getTime() + ".json";
        let info = {
            original_request, warped_request, original_response, warped_response, client_data
        };
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) throw err;
            const full_file = path + "/" + name;
            fs.writeFile(full_file, JSON.stringify(info, null, 4), (err) => {
                if (err) throw err;
            });
        });

    }
}