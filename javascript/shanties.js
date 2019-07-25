"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class ShantyCollection {
    constructor() {
        this.list = [];
        this.scan();
    }
    
    load(filename) {
        if (fs.existsSync("data/shanties/" + filename)){
            this.list.push(new Shanty(filename));
        }
    }
    
    scan() {
        this.list = [];
        fs.readdir("data/shanties", (err, files) => {
            files.forEach(file => {
                this.load(file);
            });
        });
    }
}

class Shanty {
    constructor(filename) {
        this.filename = filename;
        this.lines = fs.readFileSync("data/shanties/"+filename).toString().split('\n');
        // the old system had you specify the number of lines per message (usually 2 or 4).
        // we no longer do that. shanties should automatically post two lines per message.
    }
}

module.exports = {
    ShantyCollection,
    Shanty
}