"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["pin"],
        params: ["threshold"],
        usageChar: "@",
        helpText: "Toggles the pinning of messages with the required number of upvote reactions (⬆️) in the channel. This command is only usable by users with kicking boots.",
        examples: [
            {command: "e@pin", effect: "Will report the state of pinning upvoted messages."},
            {command: "e@pin 4", effect: "Will set 4 as the threshold for upvotes in order to pin a message in the channel."},
            {command: "e@pin 0", effect: "Will disable automatically pinning messages with any number of upvotes in the channel."}
        ],
        ignoreHidden: true,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);
            let channel = e.message.channel;

            if(tokens.join("").length > 0) {
                if(!isNaN(tokens[0] - 0)){
                    guildData.setPinnedChannel(channel.id, tokens[0] - 0);
                    Skarm.spam("updating data with " + tokens[0]);
                }else{
                    Skarm.help(this, e);
                }
            }else{
                Skarm.spam(`Params of e@pin: ${tokens}`);
            }

            let threshold = guildData.getPinnedChannelState(channel.id);
            if(threshold){
                Skarm.sendMessageDelay(channel, bot.nick + " will pin messages in **" + e.message.channel.name + `** Once they receive ${threshold} upvotes! (⬆️)`);
            }else{
                Skarm.sendMessageDelay(channel, bot.nick + " will not pin upvoted messages in **" + e.message.channel.name + "**");
            }

        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

