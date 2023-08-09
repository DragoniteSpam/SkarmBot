"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["comics"],
        params: ["#"],
        usageChar: "@",
        helpText: "Toggles the notifications of comic strips for this channel.  Use without a number input to view current state of channel.",
        examples: [
            {command: "e@comics", effect: "Will cause Skarm to list all available comic subscriptions to toggle."},
            {command: "e@comics 1", effect: "Will cause Skarm to toggle announcing all new releases of comic 1 from the list."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let comicCollection = bot.comics;
            let topics = comicCollection.getAvailableSubscriptions();
            let notifChannels = guildData.comicChannels;
            let args = Skarm.commandParamTokens(e.message.content);

            function constructStatusBody() {
                let body = "";
                for(let i in topics) {
                    let comicName = topics[i];
                    notifChannels[comicName] ??= { };  // make sure all comic channel lists exist before accessing them
                    body += `[${i}] **${comicName}** posts are currently set to: **${(e.message.channel.id in notifChannels[comicName]) ? "Enabled":"Disabled"}**\n`;
                }
                // console.log("Notification channels:", notifChannels);
                // console.log("Current comic topics:", topics);
                return body;
            }

            if (args.length === 0) {
                Skarm.sendMessageDelay(e.message.channel, " ",false,{
                    color: Constants.Colors.BLUE,
                    author: {name: e.message.author.nick},
                    description: `Configure notification settings for <#${e.message.channel.id}>:\r\n\r\n`+ constructStatusBody(),
                    timestamp: new Date(),
                });
                return;
            }

            let idx = args[0];
            if (idx in topics) {
                let topic = topics[idx];
                if (e.message.channel.id in notifChannels[topic]) {
                    delete notifChannels[topic][e.message.channel.id];
                    Skarm.sendMessageDelay(e.message.channel, `New releases of ${topic} will no longer be sent to **${e.message.channel.name}!**`);
                }else{
                    notifChannels[topic][e.message.channel.id] = Date.now();
                    Skarm.sendMessageDelay(e.message.channel, `New releases of ${topic} will be sent to **${e.message.channel.name}!**`);
                }
                return;
            }

            Skarm.sendMessageDelay(e.message.channel, `Invalid input: \`${idx}\``);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

