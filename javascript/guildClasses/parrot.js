/**
 * Parrot
 *
 * This class determines what skarm will tell each guild when he is triggered by any of his keywords.
 *
 * A single instance of this class should be attributed to any given guild.
 *
 * Due to the presence of an instance of this class in every guild, Parrot objects should **not** be used to store any quote data directly.
 * All quotes should be reserved for the static Parrot data.
 *
 * Available Commands from this file:
 *
 * getValidQuoteRepos ()                    -> { [String] repo names -> [Number] weights}
 * setRepoWeight (repoStr, weight)          -> void                                         // sets the `everything` weight for pulling into this repository
 * setTriggerWeight (term, repoStr, weight) -> void                                         // sets the weight for this keyword triggering a particular repo
 */

"use strict";
const fs = require("fs");
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Users = require("../user.js");

const quoteReposRoot = "./data/dynamicQuotes/";
const quoteDataSuffix = "/quotes.txt";
const triggerDataSuffix = "/triggers.json";

let linkVariables = function (parrot) {
    parrot.creationTime ??= Date.now;
}

let linkFunctions = function (parrot){

    // sarGroup.rename = function(newGroupName) {
    //     sarGroup.name = newGroupName;
    // };
}


class Parrot {
    constructor(guildId) {
        this.guildId = guildId;  // the GUID of the guild
        Parrot.initialize(this);
    }

    static initialize(parrot){
        if (!Parrot.quoteRepos) this.loadRepos();
        linkVariables(parrot);
        linkFunctions(parrot);
    }


    /**
     * quote repos: {
     *     "skyrim": [],
     *     "dna":    [],
     *     ...
     * }
     */
    static loadRepos() {
        Parrot.quoteRepos = {};
        console.log("Initializing Parrot Dynamic Quote Repositories");
        fs.readdir(quoteReposRoot, (err, files) => {
            console.log(`Found ${files.length} dynamic quote repos...`);
            files.forEach((file) => {
                let fullPath = quoteReposRoot + file + quoteDataSuffix;
                Parrot.quoteRepos[file] = fs.readFileSync(fullPath).toString().split("\n");
                console.log(`Found ${Parrot.quoteRepos[file].length} lines in archive: ${file}`);
            });
        });


    }
}

module.exports = Parrot;