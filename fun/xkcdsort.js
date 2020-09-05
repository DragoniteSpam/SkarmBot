"use strict";

const fs = require("fs");

const lookup = [
    "xkcd-1-500.json",
    "xkcd-501-1000.json",
    "xkcd-1001-1500.json",
    "xkcd-1501-2000.json",
    "xkcd-2001-2355.json"
];

let output = {
    alphabetized: [ ],
    ordered: [ ],
}

for (let file of lookup) {
    let data = JSON.parse(fs.readFileSync(file).toString());
    for (let title in data) {
        output.alphabetized[data[title]] = [title, data[title]];
        output.ordered[data[title]] = title;
    }
}

output.alphabetized.sort(function(a, b) {
    return (a[0] > b[0]) ? 1 : -1;
});

fs.writeFileSync("xkcd-log.json", JSON.stringify(output), { encoding: "utf8" });