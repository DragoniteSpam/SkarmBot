"use strict";

/**
 * Comics
 * 
 * An intermediate interface like Commands 
 * that allows for scalable onboarding of many puzzle classes
 */

const fs = require("fs");

class ComicsCollection {
    constructor (bot) {
        this.comicClasses = { };
        this.comics = { };
        let dir = fs.readdirSync("./javascript/notificationServices/")
                    .filter(filename => filename[0] != "_")
                    .map(f => f.split(".")[0]);
        
        for (let file of dir) {
            this.comicClasses[file] = require("./notificationServices/" + file);
            this.comics[file] = new this.comicClasses[file](bot);
        }

        console.log(`Initialized ${Object.keys(this.comicClasses).length} notification services.`);
    }

    get (target) {
        return this.comics[target];
    }

    poisonPill (target = undefined) {
        if(target) {
            return this.comics[target].poisonPill();
        }
        for (let comic in this.comics) {
            this.comics[comic].poisonPill();
        }
    }

    save (target = undefined) {
        if(target) {
            return this.comics[target].save();
        }
        for (let comic in this.comics) {
            this.comics[comic].save();
        }
    }
}

module.exports = ComicsCollection;
