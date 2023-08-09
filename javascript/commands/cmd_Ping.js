"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["ping"],
        params: [""],
        usageChar: "!",
        helpText: "Sends a test message to the channel, and then attempts to edit it. Useful for testing the bot's response time.",
        examples: [{command: "e!ping", effect: "Skarm will send a message, and then edit the message to include the time that it took for the event to be registered."}],
        ignoreHidden: false,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let timeStart = Date.now();
            // don't use sendMessageDelay - you want this to be instantaneous
            e.message.channel.sendMessage("Testing response time...").then(e => {
                e.edit("Response time: `" + (Date.now() - timeStart) + " ms`");
            });
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

