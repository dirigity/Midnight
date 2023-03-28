
const fs = require("fs");

module.exports = {
    record: (domain, original_request, warped_request, original_response, warped_response, client_data) => {
        let path = "persistence/recordings/" + client_data.client_ip.split(":").join("-") + "/" + domain;
        let name = +  new Date().getTime() + ".json";
        let info = {
            original_request, warped_request, original_response, warped_response, client_data
        };
        // console.log(info)
        fs.mkdir(path, () => {
            const full_file = path + "/" + name;
            fs.writeFile(full_file, JSON.stringify(info), () => { });
        });

    }
}