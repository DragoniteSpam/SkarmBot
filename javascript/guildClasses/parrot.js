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
const Guilds = require("../guild.js");
const {ShantyCollection, Shanty} = require("../shanties");

const quoteReposRoot = "./data/dynamicQuotes/";
const quoteDataSuffix = "/quotes.txt";
const triggerDataSuffix = "/triggers.json";

let triggerData = {};

let linkVariables = function (parrot) {
    parrot.creationTime ??= Date.now;
    parrot.repoWeights ??= { };               // word -> repo || everything
    parrot.everythingWeights ??= { };         // everything -> other repos

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
        "john":         0.01,
        "jon":          0.01,
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
        "skarm":        					0.1,
        "skram!":       					0.1,
        "birdbrain":    					0.1,
    };

    parrot.everythingWeights["skarm"] ??= 1;
    parrot.everythingWeights["shanty"] ??= 1;

    parrot.everythingScaling ??= 1;    // The power to which the cardinality of the repo should be raised before factoring it into the weighted distribution
};

let linkFunctions = function (parrot){
    // returns a hashmap of valid quote repos and their associated distributions
    parrot.getValidQuoteRepos = function () {
        return parrot.repoWeights;
    }

    parrot.getEverythingWeights = function () {
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


    parrot.getEverythingScaling = function () {
        return parrot.everythingScaling;
    }

    parrot.setEverythingScaling = function (newScaling) {
        if(!isNaN(newScaling - 0))
            parrot.everythingScaling = newScaling;
    }

    /**
    * Returns a random line from one of the quote repositories, weighted by:
    * * trigger message words
    * * everything redistribution
    * * additional keywords
    */
    parrot.getRandomLine = function (message, guildData) {
        let tokens = message.toLowerCase().split(" ");
        let messageOutcomes = { };
        for(let token of tokens) {
            for(let repo in parrot.repoWeights) {
                messageOutcomes[repo] ??= 0;
                for (let weight in parrot.repoWeights[repo]){
                    if(token.includes(weight)){
                        messageOutcomes[repo] += parrot.repoWeights[repo][weight];

                    }
                }
            }
        }

        console.log("Message outcomes (ev): ", messageOutcomes); //outcomes with everything

        // distribute odds of `everything` to the real repositories
        let everythingSum = 0;
        for(let repo in parrot.everythingWeights){
            everythingSum += parrot.everythingWeights[repo];
        }
        // console.log(parrot.everythingWeights);

        // only distribute when you can avoid dividing by zero (everything has values)
        if(everythingSum) {
            for(let repo in parrot.everythingWeights){
                messageOutcomes[repo] += messageOutcomes.everything * parrot.everythingWeights[repo] / everythingSum;
            }
            delete messageOutcomes["everything"];
        }

        console.log("Message outcomes (ne): ", messageOutcomes); //outcomes without everything

        // check if sufficient trigger token appearance to justify next step
        let outcomeSum = 0;
        for(let repo in messageOutcomes){
            outcomeSum += messageOutcomes[repo];
        }
        console.log("Outcome sum:", outcomeSum);
        if (outcomeSum < Math.random()) return;   // if the cumulative probability of the trigger words doesn't exceed 1, it only has a random chance of triggering.


        // parrot.everythingScaling = 0 -> every repo is equally likely
        // parrot.everythingScaling = 1 -> every line is equally likely
        // scale message outcomes by (the amount of lines in each repo) ^ everythingScaling
        for(let repo in messageOutcomes){
            messageOutcomes[repo] *= Math.pow(parrot.getRepoLineCount(repo, guildData), parrot.getEverythingScaling());
        }

        console.log("Message outcomes (sc): ", messageOutcomes); //outcomes without everything

        // reset outcome sum for repo indexing
        outcomeSum = 0;
        for(let repo in messageOutcomes){
            outcomeSum += messageOutcomes[repo];
        }
        console.log("Outcome sum:", outcomeSum);

        let outcomeRepoIndex = Math.random() * outcomeSum;


        for(let repo in messageOutcomes){
            outcomeRepoIndex -= messageOutcomes[repo];
            if(outcomeRepoIndex <= 0) {
                console.log("Outcome repo:", repo);
                return parrot.getRepoLine(repo, guildData);
            }
        }

        return false;
    }

    /**
     * Returns a random string from the repo specified
     * @param repo
     */
    parrot.getRepoLine = function (repo, guildData) {
        let lines;
        switch(repo){
            case "skarm":
                // console.log("Acquiring guild quote...");
                lines = Object.keys(guildData.lines);
                return lines[Math.floor(Math.random() * lines.length)];
                break;

            case "shanty":
                // console.log("Acquiring shanty line...");
                return guildData.shanties.getNextBlock();
                break;

            default:
                lines = Parrot.quoteRepos[repo];
                // console.log(repo);
                // console.log(repo, Parrot.quoteRepos[repo]);
                return lines[Math.floor(Math.random() * lines.length)];
                break;
        }
    }

    /**
     * Returns the amount of lines in a particular archive
     */
    parrot.getRepoLineCount = function (repo, guildData) {
        switch(repo){
            case "skarm":
                return Object.keys(guildData.lines).length;

            case "shanty":
                return guildData.shanties.getCumulativeLinesLength();

            default:
                return Parrot.quoteRepos[repo].length;
        }
    }
}


class Parrot {
    constructor(guildId) {
        this.guildId = guildId;  // the GUID of the guild
        Parrot.initialize(this);
    }

    static initialize(parrot){
        if (!Parrot.quoteRepos) this.loadRepos();
        linkFunctions(parrot);
        linkVariables(parrot);
    }

    /**
     * quote repos: {
     *     "skyrim": [],
     *     "dna":    [],
     *     ...
     * }
     */
    static loadRepos() {
        Parrot.quoteRepos = { };
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
