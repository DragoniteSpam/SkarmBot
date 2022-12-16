"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class ShantyCollection {
    constructor() {
        this.scan();              // populate shanty list
        this.shanties = ShantyCollection.shanties;
    }
    
    load(filename) {
        let shantyPath = "data/shanties/" + filename;
        if (fs.existsSync(shantyPath)) {
			let name = filename.replace(".shanty", "");
			while (name.indexOf("-") > 0) {
				name = name.replace("-", " ");
            }
			// this.names.push(name);
            // this.list.push(new Shanty(filename));
            ShantyCollection.shanties ??= {};
            ShantyCollection.shanties[name] = new Shanty(filename);
        } else{
            console.log("Error: Missing shanty", shantyPath);
        }
    }
    
    scan() {
        this.list = [];
        fs.readdir("data/shanties", (err, files) => {
            files.forEach(file => {
                this.load(file);
            });

            console.log("Initialized", ShantyCollection.getCumulativeLinesLength(), "lines across", Object.keys(ShantyCollection.shanties).length, "shanties");
        });
    }

    static getCumulativeLinesLength() {
        let totalLines = 0;
        for(let shanty in ShantyCollection.shanties){
            totalLines += ShantyCollection.shanties[shanty].getLineCount();
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
    constructor(iterator){
        ShantyIterator.linkFunctions(this);
        if(iterator) {
            this.shantyName  = iterator.shantyName;
            this.currentLine = iterator.currentLine;
        }
        if(!this.shantyName || !this.currentLine) this.resetIterator();

        // the old system had you specify the number of lines per message
        // (usually 2 or 4). we no longer do that. shanties should automatically
        // post two lines per message.
    }

    static linkFunctions(iterator){
        iterator.resetIterator = function (){
            // reset the iterator to a new shanty
            let shantyNames = Object.keys(ShantyCollection.shanties);
            let oldShanty = iterator.shantyName;
            let newShanty = shantyNames[Math.floor(shantyNames.length * Math.random())];
            while(oldShanty === newShanty){
                newShanty = shantyNames[Math.floor(shantyNames.length * Math.random())];
            }
            iterator.shantyName = newShanty;
            iterator.resetBlock();
        }

        iterator.resetBlock = function () {
            iterator.currentLine = 0;
        }

        iterator.next = function(){
            let block = "";
            //  Debug:
            // console.log("Getting line count of shanty:", iterator.shantyName);
            // console.log(ShantyCollection.shanties[iterator.shantyName]);
            // console.log(ShantyCollection.shanties[iterator.shantyName].getLineCount());
            if(iterator.currentLine < ShantyCollection.shanties[iterator.shantyName].getLineCount()){
                block = ShantyCollection.shanties[iterator.shantyName].getBlockFrom(iterator.currentLine);
                iterator.currentLine += 2;
            }else{
                iterator.resetIterator();
                return iterator.next();
            }
            return block;
        }

    }
}

module.exports = {
    ShantyCollection,
    Shanty,
    ShantyIterator
}
