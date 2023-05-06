const { exec } = require("child_process")
const fs = require("fs");
const path = require("path");
function delete_dir_contents(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.rmSync(path.join(directory, file), { recursive: true });
        }
    });
}

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

module.exports = {
    sh, delete_dir_contents
}