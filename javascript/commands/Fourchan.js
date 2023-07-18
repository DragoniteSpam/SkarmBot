"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["4"],
        params: ["id", "t..."],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        examples: [
            {command: "e@4 429537000408875008 Instance 4 protocol", effect: "Q"},
            {command: "e@4 429537000408875008", effect: "push an instance of parrot"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);
            if (tokens.length < 1) return Skarm.spam(tokens.length);
            if (tokens.length === 1) {
                let destinationChannel = bot.client.Channels.get(tokens[0]);
                let destinationGuild = Guilds.get(destinationChannel.guild.id);
                bot.parrot(e, destinationGuild, destinationChannel, destinationGuild.parrot.getVeryRandomLine(destinationGuild));       //override the parrot function with the target channel
                return;
            }

            let destination = tokens.splice(0, 1)[0];
            let chan = bot.client.Channels.get(destination);
            if (chan && tokens.join(" ").length > 1) Skarm.sendMessageDelay(chan, tokens.join(" "));
            else Skarm.spam(`<@${e.message.author.id}> hey, this message failed to send, probably because ${destination} resolved to null`);
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
}

