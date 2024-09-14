"use strict";

/**
 * Comics
 * 
 * An intermediate interface like Commands 
 * that allows for scalable onboarding of many comic classes
 */

const fs = require("fs");

class ComicsCollection {
    static initialize (bot) {
        ComicsCollection.comicClasses = { };
        ComicsCollection.comics = { };
        ComicsCollection.signatures = [ ];
        let dir = fs.readdirSync("./javascript/notificationServices/")
                    .filter(filename => filename[0] != "_")
                    .map(f => f.split(".")[0]);
        
        for (let file of dir) {
            ComicsCollection.comicClasses[file] = require("./notificationServices/" + file);
            ComicsCollection.comics[file] = new ComicsCollection.comicClasses[file](bot);
            let signature = ComicsCollection.comics[file].signature;
            console.log(`[ComicsCollection] Initialized comic: ${file} (${signature})`);
            ComicsCollection.signatures.push(signature);
        }

        console.log(`[ComicsCollection] Initialized ${Object.keys(ComicsCollection.comicClasses).length} notification services.`);
        return ComicsCollection;
    }

    static getAvailableSubscriptions() {
        return ComicsCollection.signatures;
    }

    static get (target) {
        if(!target) return null;
        console.log("Requested", target, "from comics collection:", Object.keys(ComicsCollection.comics));
        return ComicsCollection.comics[target] || ComicsCollection.comics[target.toLowerCase()];
    }

    static poll (target=undefined) {
        let comic = ComicsCollection.get(target);
        if(comic) {
            comic._poll();
        } else {
            for(let c in ComicsCollection.comics){
                ComicsCollection.comics[c]._poll();
            }
        }
    }

    static poisonPill (target = undefined) {
        if(target) {
            return ComicsCollection.comics[target].poisonPill();
        }
        for (let comic in ComicsCollection.comics) {
            ComicsCollection.comics[comic].poisonPill();
        }
    }

    static save (target = undefined) {
        if(target) {
            return ComicsCollection.comics[target].save();
        }
        for (let comic in ComicsCollection.comics) {
            ComicsCollection.comics[comic].save();
        }
    }
}

module.exports = ComicsCollection;
