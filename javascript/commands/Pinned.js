"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["fetchpinned", "pinned"],
        params: ["#channel"],
        usageChar: "!",
        helpText: "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out. Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in My sight, shall snuff it.",
        examples: [
            {command: "e!pinned", effect: "Will cause Skarm to report the amount of pinned messages in the channel that it is run in."},
            {command: "e!fetchpinned #general", effect: "Will cause Skarm to report the amount of pinned messages in the channel #general."}
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);

            let channel,targetChannelID;
            if (tokens.length === 0) {
                channel = e.message.channel;
                targetChannelID=channel.id;
            } else {
                channel = null;
                targetChannelID = tokens[0].substring(2, tokens[0].length - 1);
                try {
                    channel = bot.client.Channels.get(targetChannelID);
                } catch (err) {
                    Skarm.sendMessageDelay(e.message.channel, targetChannelID + " is not a valid channel ID");
                    return;
                }
            }
            
            if (channel === null) {
                return Skarm.sendMessageDelay(e.message.channel, "failed to find channel id");
            }
            
            channel.fetchPinned().then(ex => {
                Skarm.sendMessageDelay(e.message.channel,"<#" + targetChannelID + "> has " + ex.messages.length + " pinned message" + ((ex.messages.length === 1) ? "" : "s"));
            });
        },
        
        help(bot,e) {
            Skarm.help(this, e);
        },
}

