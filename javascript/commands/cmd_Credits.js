"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["credits"],
        params: [""],
        usageChar: "!",
        helpText: "It's literally just the credits. Why do you need help with this?",
        examples: [{command: "e!credits", effect: "Shows the credits."}],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let version = bot.version;
            Skarm.sendMessageDelay(e.message.channel,
            `**Skarm Bot 2**\n
            Lead spaghetti chef: Dragonite#7992
            Seondary spaghetti chef: ArgoTheNaut#9716
            Version: ${version}
            
            Library: Discordie (JavaScript):
            <https://qeled.github.io/discordie/#/?_k=m9kij6>
            
            Dragonite:
            <https://www.youtube.com/c/dragonitespam>
            <https://github.com/DragoniteSpam/SkarmBot>
            
            Argo:
            <https://github.com/ArgoTheNaut>
            
            Extra ideas came from SuperDragonite2172, willofd2011, and probably other people.
            
            Thanks to basically everyone on the Kingdom of Zeal server for testing this bot, as well as all of the people who Argo somehow tricked into worshipping him as their god-king.
            
            Wolfram-Alpha is awesome:
            <https://www.npmjs.com/package/node-wolfram>
            
            Random quotes are from Douglas Adams, Sean Dagher, The Longest Johns, George Carlin, Terry Pratchett, Arthur C. Clark, Rick Cook, and The Elder Scrolls V: Skyrim.`
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

