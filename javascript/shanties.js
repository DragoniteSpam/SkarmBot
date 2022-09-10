"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class ShantyCollection {
    constructor() {
        this.list = [];           // array of Shanty objects
		this.names = [];          // array of shanty names (str)
        this.scan();              // populate shanty list
		this.isSinging = false;
		this.activeSong = -1;     // index of names and list arrays
		this.ivanhoe = 1/4;       // Probability of shanties variable.  TODO: deprecate
    }
    
    load(filename) {
        let shantypath = "data/shanties/" + filename;
        if (fs.existsSync(shantypath)) {
            this.list.push(new Shanty(filename));
			let name = filename.replace(".shanty", "");
			while (name.indexOf("-") > 0) {
				name = name.replace("-", " ");
            }
			this.names.push(name);
        } else{
            console.log("Error: Missing shanty", shantypath);
        }
    }
    
    scan() {
        this.list = [];
        fs.readdir("data/shanties", (err, files) => {
            files.forEach(file => {
                this.load(file);
            });

            // TODO: fix every guild having their own instance of every single shanty
            console.log("Initialized", this.getCumulativeLinesLength(), "lines across", this.list.length, "shanties");
        });
    }
	
	drinkCount() {
		if (!this.isSinging) return 0;
		return this.list[this.activeSong].currentLine;
	}
	
	getNextBlock() {
		if (!this.isSinging) {
			this.isSinging = true;
			this.activeSong = Math.floor(Math.random() * this.list.length);
		}
		return this.list[this.activeSong].getNextBlock(this);
	}

    getCumulativeLinesLength() {
        let totalLines = 0;
        for(let shanty of this.list){
            totalLines += shanty.getLineCount();
        }
        return totalLines;
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
    
    getNextBlock(collection) {
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
        } 
		if (this.currentLine >= this.lines.length) {
            collection.isSinging=false;
			collection.activeSong=-1;
        }
        
        return block;
    }
    
    resetBlock() {
        this.currentLine = 0;
    }

    getLineCount() {
        return this.lines.length;
    }
}

module.exports = {
    ShantyCollection,
    Shanty
}