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
        this.lines = fs.readFileSync("data/shanties/" + filename)
            .toString().split('\n');
        this.currentLine = 0;
        // the old system had you specify the number of lines per message
        // (usually 2 or 4). we no longer do that. shanties should automatically
        // post two lines per message.
    }
    
    getNextBlock() {
        let block = "";
        
        // lazy way of safely fetching the next two lines and resetting if
        // you've hit the end
        if (this.currentLine < this.lines.length) {
            block = block + this.lines[this.currentLine] + "\n";
            this.currentLine++;
        }
        if (this.currentLine < this.lines.length) {
            block = block + this.lines[this.currentLine] + "\n";
            this.currentLine++;
        } else {
        }
        
        return block;
    }
    
    resetBlock() {
        this.currentLine = 0;
    }
}

module.exports = {
    ShantyCollection,
    Shanty
}