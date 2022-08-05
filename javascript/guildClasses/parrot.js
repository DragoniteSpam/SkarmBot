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
 * getValidQuoteRepos ()                    -> { [String] repo names -> [Number] weights}   // gets the weights for `everything` repo
 * setEverythingWeight (repoStr, weight)    -> void                                         // sets the `everything` weight for pulling into this repository
 * setTriggerWeight (term, repoStr, weight) -> void                                         // sets the weight for this keyword triggering a particular repo
 * getRandomLine (message)                  -> String                                       // returns a random line from one of the quote repositories, weighted by trigger message words
 */

"use strict";
const fs = require("fs");
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Users = require("../user.js");

const quoteReposRoot = "./data/dynamicQuotes/";
const quoteDataSuffix = "/quotes.txt";
const triggerDataSuffix = "/triggers.json";

let triggerData = {};

let linkVariables = function (parrot) {
    parrot.creationTime ??= Date.now;
    parrot.repoWeights ??= {};
    parrot.everythingWeights ??= {};

    // initialize weights and `everything` weights for each dynamic quote repo
    for(let repo in Parrot.quoteRepos){
        let accessPath = quoteReposRoot + repo + triggerDataSuffix;
        triggerData[repo] ??= JSON.parse(fs.readFileSync(accessPath).toString());                                        // load in JSON data if it hasn't already been loaded in by another process thread
        parrot.repoWeights[repo] ??= triggerData[repo].triggerWeights;
        parrot.everythingWeights[repo] ??= triggerData[repo].everythingWeight;
    }

    // externally handle special cases: skarm and shanties
    // hard coded defaults for skarm and shanties
    parrot.repoWeights["skarm"] ??= {
        "skarm":        					1,
        "skram!":       					1,
        "birdbrain":    					1,
        "spaghetti":    					0.1,
        "botface":      					1,
        "something completely different":	1,
    };
    parrot.repoWeights["shanty"] ??= {
        "johnny":       0.01,
        "jonny":        0.01,
        "jon":          0.01,
        "johny":        0.01,
        "drunk":        0.02,
        "sing":         0.03,
        "rum":          0.04,
        "ship":         0.05,
        "captain":      0.06,
        "sea":          0.08,
        "maui":         0.09,
        "sailor":       0.10,
        "stan":         0.11,
        "shanty":       0.35,
        "shanties":     0.40,
        "dreadnought":  0.50,
    };
    parrot.repoWeights["everything"] ??= {
        "skarm":        					1,
        "skram!":       					1,
        "birdbrain":    					1,
    };

    parrot.everythingWeights["skarm"] ??= 100;
    parrot.everythingWeights["shanty"] ??= 1;
}

let linkFunctions = function (parrot){
    // returns a hashmap of valid quote repos and their associated distributions of everything
    parrot.getValidQuoteRepos = function () {
        return parrot.everythingWeights;
    }

    // sets the `everything` weight for pulling into this repository
    // only sets the weight if it is a valid 0+ number
    // returns `true` on success and `false` otherwise
    parrot.setEverythingWeight = function (repoStr, weight) {
        if(repoStr in parrot.everythingWeights && isFinite(weight) && weight >= 0) {
            parrot.everythingWeights[repoStr] = weight;
            return true;
        }
        return false;
    }

    // sets the weight for this keyword triggering a particular repo
    // only sets the weight if it is a valid 0+ number
    // returns `true` on success and `false` otherwise
    parrot.setTriggerWeight = function (term, repoStr, weight) {
        if(repoStr in parrot.repoWeights && isFinite(weight) && weight >= 0) {
            parrot.repoWeights[repoStr][term] = weight;
            if(weight === 0) {
                delete parrot.repoWeights[repoStr][term];
            }
            return true;
        }
        return false;

    }

    // returns a random line from one of the quote repositories, weighted by:
    // * trigger message words
    // * everything redistribution
    // * additional keywords
    parrot.getRandomLine = function (message) {
        // todo
    }
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
        let files = fs.readdirSync(quoteReposRoot);
        console.log(`Found ${files.length} dynamic quote repos...`);
        for(let file of files) {
            let fullPath = quoteReposRoot + file + quoteDataSuffix;
            Parrot.quoteRepos[file] = fs.readFileSync(fullPath).toString().split("\n");
            console.log(`Found ${Parrot.quoteRepos[file].length} lines in archive: ${file}`);
        }
    }
}

module.exports = Parrot;
