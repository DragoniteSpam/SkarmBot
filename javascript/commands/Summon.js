"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["summon", "summons"],
        params: ["add|remove|list", "term"],
        usageChar: "!",
        helpText: "Skarm can be asked to send you notifications for messages with certain keywords (often your username, or other topics you like to know about - for example, \"Wooloo\" or \"programming\"). You can add, remove, or list your summons." +
            "\nMessages that skarm sends containing your summons will be deleted after 15 seconds (30 seconds for e!summons list) or immediately by clicking \u274c.",
        examples: [
            {
                command: "e!summons add jeff",
                effect: "Will cause Skarm to notify you whenever `jeff` appears in a message."
            },
            {
                command: "e!summons add skarmory skarmbot skram skarm",
                effect: "Will cause Skarm to notify you if any of the four terms listed appear in a messasge."
            },
            {
                command: "e!summons remove jeff",
                effect: "Will stop Skarm from notifying you whenever `jeff` appears in a message."
            },
            {
                command: "e!summon list",
                effect: "Will cause Skarm to report the list of terms that you will be notified about."
            }
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let params = Skarm.commandParamTokens(e.message.content.toLowerCase());
            let action = params[0];
            let term;
            if (params.length) {
                term = params[1];
            } else {
                term = "";
            }
            let returnString = "";
            if (action === "add") {
                for (let i = 1; i < params.length; i++) {
                    if (userData.addSummon(params[i].replace(",", ""))) {
                        returnString += "**" + params[i] + "** is now a summon for " + e.message.author.username + "!\n";
                    } else {
                        returnString += "Could not add the term " + params[i] + " as a summon. (Has it already been added?)\n";
                    }
                }
                Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 15000, e.message.author.id, bot);
                return;
            }
            if (action === "remove") {
                for (let i = 1; i < params.length; i++) {
                    if (userData.removeSummon(params[i].replace(",", ""))) {
                        returnString += "**" + params[i] + "** is no longer a summon for " + e.message.author.username + "!\n";
                    } else {
                        returnString += "Could not remove the term " + params[i] + " as a summon. (Does it exist in the summon list?)\n";
                    }
                }
                Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 15000, e.message.author.id, bot);
                return;
            }
            if (action === "list") {
                let summonString = userData.listSummons(term);
                if (summonString.length === 0) {
                    returnString += "**" + e.message.author.username + "**, you currently have no summons!";
                } else {
                    returnString += "**" + e.message.author.username + "**, your current summons are:\n```" + summonString + "```";
                }
                Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 30000, e.message.author.id, bot);
                return;
            }
            Skarm.erroneousCommandHelpPlease(e.message.channel, this);
        },
        help(bot, e) {
            Skarm.help(this, e);
        },
}

