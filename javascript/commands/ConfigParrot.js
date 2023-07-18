"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["parrot", "config-parrot"],
        params: ["[varied]"],
        usageChar: "@",
        helpText: "Configures the keywords that skarm will respond to, how he will respond, and how likely he is to respond.",
        examples: [
            {command: "e@parrot",                        effect: "Will list the available keyword tables that can be configured."},
            {command: "e@parrot skyrim",                 effect: "Will list the weights for keywords in the `skyrim` table.  Messages sent with keyword weights that add up to >1 will guarantee that skarm responds."},
            {command: "e@parrot skyrim jarl 0.3",        effect: "Sets the probability of skarm responding upon hearing `jarl` to 0.3"},
            {command: "e@parrot e scaling 0",            effect: "Sets the degree to which the size of the quote repo affects the probability that it will be drawn from when `everything` is called.\r\n0 -> everything weights are independent of size. 1 -> the more lines there are in a quote repo, the higher the probability that it will be drawn from (linearly growing share)\r\nCalling this command without the number will return the current value."},
            {command: "e@parrot e w",                    effect: "Will list the weights for how the everything distribution is factored into the other repositories."},
            {command: "e@parrot e w skyrim 0.3",         effect: "Will set the weight for the skyrim distribution to receive 0.3 shares of the distribution for every sum total of weights."},
            {command: "e@parrot factory-reset",          effect: "Will reset the weights of all repositories to the defaults that skarm started off with."},
            {command: "e@parrot factory-reset skyrim",   effect: "Will reset the weights of all of the skyrim weights to the defaults that skarm started off with."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            let guildRoles = e.message.guild.roles;
            let action = tokens.shift();
            let outputString = "Unknown command.  Please run `e?parrot` for help on how to use e@parrot.";
            let fields = [];
            let quoteRepos = guildData.parrot.getValidQuoteRepos();

            let reservedTerms = ["add", "delete", "del", "rename", "ren"];
            let reservedHash = {};
            for (let rt of reservedTerms) reservedHash[rt]=true;

            // Read currently configured terms
            if(action === undefined){
                outputString = "The following repositories are currently triggered by the following keywords.  Use `e@parrot yourRepositoryHere` to view probabilities";
                for(let repo in quoteRepos){
                    fields.push({name: `${repo}`, value: `${Object.keys(quoteRepos[repo]).join(", ")}`, inline: true});
                }
            }

            // operations on a specific repo
            if (action in quoteRepos) {
                let quoteRepoTerm = tokens.shift();    // take next token to determine what to act on
                let repoKeywordWeightMapping = quoteRepos[action];

                // if no term is specified, list current config
                if (quoteRepoTerm === undefined) {
                    outputString = `Weights attributed to each keyword in \`${action}\`.  Weights that add up to at least 1 will guarantee skarm responds.`;
                    for (let keyword in repoKeywordWeightMapping) {
                        fields.push({name: `${keyword}`, value: `${repoKeywordWeightMapping[keyword]}`, inline: true});
                    }
                } else {
                    // if a term is specified, make sure it's valid then make the adjustment
                    // i.e. `e@parrot skyrim whiterun 1` sets the probability of whiterun being triggered to 1
                    // i.e. `e@parrot skyrim whiterun 0` removes whiterun from the word list for skyrim
                    // console.log("repo data:", repoKeywordWeightMapping);
                    if(tokens.length === 1){
                        let newVal = tokens.shift();
                        guildData.parrot.setTriggerWeight(quoteRepoTerm, action, newVal);
                        outputString = `Weight of term \`${quoteRepoTerm}\` set to \`${repoKeywordWeightMapping[quoteRepoTerm]}\``;
                    } else {
                        outputString = `The weight of term \`${quoteRepoTerm}\` is currently set to \`${repoKeywordWeightMapping[quoteRepoTerm]}\``;
                    }
                }
            }

            if (action === "e") {
                let subAction = tokens.shift();    // take next token to determine what to act on

                // view and edit everything weights
                //             {command: "e@parrot e w",             effect: "Will list the weights for how the everything distribution is factored into the other repositories."},
                //             {command: "e@parrot e w skyrim 0.3",  effect: "Will set the weight for the skyrim distribution to receive 0.3 shares of the distribution for every sum total of weights."},
                if (subAction === "w") {
                    let everythingWeights = guildData.parrot.getEverythingWeights();
                    if(tokens.length === 2){
                        let repo = tokens.shift();
                        let newWeight = tokens.shift()-0;
                        if(repo in everythingWeights && !isNaN(newWeight)){
                            guildData.parrot.setEverythingWeight(repo, newWeight);
                        }
                        outputString = `Everything weight for \`${repo}\` set to \`${guildData.parrot.getEverythingWeights()[repo]}\``;
                    } else {
                        outputString = "The following weights are assigned to each repo for each point of everything:";
                        for(let repo in everythingWeights){
                            fields.push({name: `${repo}`, value: `${everythingWeights[repo]}`, inline: true});
                        }
                    }
                }


                // read and adjust scaling
                //            {command: "e@parrot e scaling 0",     effect: "Sets the degree to which the size of the quote repo affects the probability that it will be drawn from when `everything` is called.\r\n0 -> everything weights are independent of size. 1 -> the more lines there are in a quote repo, the higher the probability that it will be drawn from (linearly growing share)\r\nCalling this command without the number will return the current value."},
                if (subAction === "scaling" || subAction === "s") {
                    if(tokens.length === 1){
                        let newScaling = tokens.shift();
                        guildData.parrot.setEverythingScaling(newScaling);
                        outputString = `Repo everything scaling set to: ${guildData.parrot.getEverythingScaling()}`;
                    } else {
                        outputString = `Repo everything scaling is set to: ${guildData.parrot.getEverythingScaling()}`;
                    }
                }
            }


            if (action === "factory-reset"){
                let repo = tokens.shift();    // take next token to determine what to act on
                if(repo in quoteRepos){
                    // {command: "e@parrot factory-reset skyrim",   effect: "Will reset the weights of all of the skyrim weights to the defaults that skarm started off with."},
                    guildData.parrot.resetRepo(repo);
                    outputString = `Reset data for repo: ${repo}`;
                } else {
                    // {command: "e@parrot factory-reset",   effect: "Will reset the weights of all repositories to the defaults that skarm started off with."},
                    guildData.parrot.hardReset();
                    outputString = "All weight scalings have been reset to defaults";
                }
            }

            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Skarm.generateRGB(),
                author: {name: e.message.author.nick},
                description: outputString,
                timestamp: new Date(),
                fields: fields,
                footer: {text: "Parrot Configuration"}
            });
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

