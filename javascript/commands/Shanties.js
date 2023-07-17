"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["shanties", "shanty"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Prints a list of the shanties skarm knows and is thus likely to sing while under the influence",
        examples: [
            {command: "e!shanties", effect: "Skarm will list all the shanties that he knows."},
            {command: "e!shanty joli", effect: "Skarm will list all of the shanties that he knows that contain `joli` in their title"}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let target = Skarm.commandParamString(e.message.content);
            let names = Object.keys(ShantyCollection.shanties);
            let shanties = "";
            for (let name of names) {
                if (name.includes(target))
                    shanties += name + ", ";
            }
            if (shanties.length === 0) {
                Skarm.sendMessageDelay(e.message.channel, "I can't recall any shanties with that in the title ヽ( ｡ ヮﾟ)ノ");
                return;
            }
            
            Skarm.sendMessageDelay(e.message.channel, "I recall the following shanties:\n" + shanties.substring(0,shanties.trim().length - 1));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

