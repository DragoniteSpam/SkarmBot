"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["notify"],
        params: ["#"],
        usageChar: "@",
        helpText: "Toggles the notifications of various information for this channel.  Use without a number input to view current state of channel.\nAliases:\n" + 
                    "1: join, leave\n" + 
                    "2: ban\n" + 
                    "3: name\n" + 
                    "4: voice, vox\n" + 
                    "",
        examples: [
            {command: "e@notify", effect: "Will cause Skarm to list all available notification settings to toggle."},
            {command: "e@notify 4", effect: "Will cause Skarm to toggle announcing all voice channel join and leave activity in the guild to the channel in which the command was sent."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let notifChannels = guildData.notificationChannels;
            let args = Skarm.commandParamTokens(e.message.content.toLowerCase());

            if (args.length === 0) {
                Skarm.sendMessageDelay(e.message.channel, " ",false,{
                    color: Constants.Colors.BLUE,
                    author: {name: e.message.author.nick},
                    description: `Configure notification settings for <#${e.message.channel.id}>:\r\n\r\n`+
                        `1: **${(e.message.channel.id in notifChannels.MEMBER_JOIN_LEAVE) ? "Disable":"Enable"}** member join/leave notifications\n`+
                        `2: **${(e.message.channel.id in notifChannels.BAN)               ? "Disable":"Enable"}** ban notifications\n`+
                        `3: **${(e.message.channel.id in notifChannels.NAME_CHANGE)       ? "Disable":"Enable"}** name change notifications\n`+
                        `4: **${(e.message.channel.id in notifChannels.VOICE_CHANNEL)     ? "Disable":"Enable"}** voice channel join/change/leave notifications\n`+
                        `5: **${(e.message.channel.id in notifChannels.XKCD)              ? "Disable":"Enable"}** posting new XKCDs upon their release \n`,
                    timestamp: new Date(),
                });
                return;
            }

            switch (args[0]) {
                case "join":
                case "leave":
                case "1":
                    if (e.message.channel.id in notifChannels.MEMBER_JOIN_LEAVE) {
                        delete notifChannels.MEMBER_JOIN_LEAVE[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Member join/leave notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.MEMBER_JOIN_LEAVE[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Member join/leave notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "ban":
                case "2":
                    if (e.message.channel.id in notifChannels.BAN) {
                        delete notifChannels.BAN[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Member ban notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.BAN[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Member ban notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "name":
                case "3":
                    if (e.message.channel.id in notifChannels.NAME_CHANGE) {
                        delete notifChannels.NAME_CHANGE[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Member name change notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.NAME_CHANGE[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Member name change notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "voice":
                case "vox":
                case "4":
                    if (e.message.channel.id in notifChannels.VOICE_CHANNEL) {
                        delete notifChannels.VOICE_CHANNEL[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Voice channel activity notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.VOICE_CHANNEL[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Voice channel activity notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "xkcd":
                case "5":
                    if (e.message.channel.id in notifChannels.XKCD) {
                        delete notifChannels.XKCD[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "New XKCDs will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.XKCD[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "New XKCDs will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "debug":
                    Skarm.spam(JSON.stringify(notifChannels));
                    break;
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

