"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class ShantyCollection {
    constructor(prior) {
        this.scan();              // populate shanty list
    }
    
    load(filename) {
        let shantypath = "data/shanties/" + filename;
        if (fs.existsSync(shantypath)) {
			let name = filename.replace(".shanty", "");
			while (name.indexOf("-") > 0) {
				name = name.replace("-", " ");
            }
			this.names.push(name);
            this.list.push(new Shanty(filename));
            ShantyCollection.shanties ??= {};
            ShantyCollection.shanties[name] = new Shanty(filename);
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
    }
    
    getBlockFrom(startLine) {
        let block = "";
        
        // lazy way of safely fetching the next two lines and resetting if
        // you've hit the end
        for(let i = 0; startLine+i < this.lines.length && i<2; i++){
            block += this.lines[startLine + i] + "\n";
        }

        return block;
    }

    getLineCount() {
        return this.lines.length;
    }
}

class ShantyIterator {
    constructor(shantyName){
        this.shantyName = shantyName;
        this.currentLine = 0;
        // the old system had you specify the number of lines per message
        // (usually 2 or 4). we no longer do that. shanties should automatically
        // post two lines per message.
    }

    resetBlock() {
        this.currentLine = 0;
    }

    next(){
        let block = "";
        if(this.currentLine < ShantyCollection[this.shantyName].getLineCount()){
            block = [this.shantyName].getBlockFrom(this.currentLine);
            this.currentLine+=2;
        }else{
            // reset the iterator to a new shanty
            let oldShanty = this.shantyName;
            let newShanty = oldShanty;
            let shantyNames = Object.keys(ShantyCollection.shanties);
            while(oldShanty === newShanty){
                newShanty = shantyNames[Math.floor(shantyNames.length * Math.random())];
            }
            this.resetBlock();
        }
        return block;
    }
}

module.exports = {
    ShantyCollection,
    Shanty,
    ShantyIterator
}