"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
    aliases: ["summon", "summons"],
    params: ["add|remove|ignore|list", "term"],
    usageChar: "!",
    helpText: "Skarm can be asked to send you notifications for messages with certain keywords (often your username, or other topics you like to know about - for example, \"Wooloo\" or \"programming\"). You can add, remove, or list your summons.  Additionally, you can specify certain terms to ignore if they contain the word that you're interested in, but you are not interested in the larger word.  E.g. `Persona`, but not `personally`." +
        "\nMessages that skarm sends containing your summons will be deleted after 15 seconds (30 seconds for e!summons list) or immediately by clicking \u274c.",
    examples: [
        {
            command: "e!summon add persona",
            effect: "Will cause Skarm to notify you whenever `persona` appears in a message."
        },
        {
            command: "e!summon add skarmory skarmbot skram skarm",
            effect: "Will cause Skarm to notify you if any of the four terms listed appear in a messasge."
        },
        {
            command: "e!summon remove persona",
            effect: "Will remove `persona` from your summons and ignore lists."
        },
        {
            command: "e!summon ignore personal",
            effect: "Will prevent Skarm from notifying you whenever `personal` appears in a message even if other added terms are present."
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
        if (action === "ignore") {
            for (let i = 1; i < params.length; i++) {
                if (userData.ignoreSummon(params[i].replace(",", ""))) {
                    returnString += "Messages containing **" + params[i] + "** will never be notified about for " + e.message.author.username + "!\n";
                } else {
                    returnString += "Could not add the term " + params[i] + " to the ignore list. (Has it already been added?)\n";
                }
            }
            Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 15000, e.message.author.id, bot);
            return;
        }
        if (action === "remove") {
            for (let i = 1; i < params.length; i++) {
                if (userData.removeSummon(params[i].replace(",", ""))) {
                    returnString += "**" + params[i] + "** is no longer a summon/ignore for " + e.message.author.username + "!\n";
                } else {
                    returnString += "Could not remove the term " + params[i] + " as a summon/ignore. (Does it exist in the summon list?)\n";
                }
            }
            Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 15000, e.message.author.id, bot);
            return;
        }
        if (action === "list") {
            let summonString = userData.listSummons(term);
            returnString += "**" + e.message.author.username + "**, ";
            if (summonString.length === 0) {
                returnString += "you currently have no summons!";
            } else {
                returnString += "your current summons are:\n```" + summonString + "```";
            }
            
            let ignoreString = userData.listIgnores(term);
            if (ignoreString.length === 0) {
                returnString += "you currently have no ignored terms!";
            } else {
                returnString += "your current ignore terms are:\n```" + ignoreString + "```";
            }
            
            Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 30000, e.message.author.id, bot);
            return;
        }
        Skarm.help(this, e);
    },
    help(bot, e) {
        Skarm.help(this, e);
    },
}
