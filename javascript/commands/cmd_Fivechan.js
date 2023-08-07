"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["5"],
        params: ["id", "t..."],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        examples: [
            {command: "e@5 429537000408875008 Instance 5 protocol", effect: "Q"},
            {command: "e@5 429537000408875008",                     effect: "ls"},
            {command: "e@5 429537000408875008 -",                   effect: "purge"},
            {command: "e@5 -",                                      effect: "purge everything"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            Skarm.spam(`Received command: ${e.message.content}`);
            let tokens = Skarm.commandParamTokens(e.message.content);
            if (tokens.length < 1) return;
            let destination = tokens.splice(0, 1)[0];
            let srcChannel = e.message.channel;
            let chan = bot.client.Channels.get(destination);
            if (chan) {
                if (tokens.length < 1) {
                    Skarm.sendMessageDelay(srcChannel, JSON.stringify(Guilds.get(chan.guild_id).channelBuffer[chan.id]));
                    return;
                }

                if (tokens.join("") === "-") {
                    Guilds.get(chan.guild_id).channelBuffer[chan.id] = [ ];
                    return Skarm.sendMessageDelay(e.message.channel, "cleared");
                }

                // Each \n constitutes its own message, for ease of buffering purposes
                let messages = tokens.join(" ").split("\n");
                for(let message of messages){
                    console.log(`Enqueueing ${message}`)
                    Skarm.queueMessage(Guilds, chan, message);
                }
            }

            // delete everything case
            if (destination === "-") {
                for(let guildId in Guilds.guilds){
                    Guilds.get(guildId).channelBuffer = { };
                    Skarm.spam(`Purged all @5's in guild: ${guildId}`);
                }
            }
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
}

