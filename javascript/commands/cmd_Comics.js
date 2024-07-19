"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["comics"],
        params: ["#"],
        usageChar: "@",
        helpText: [
            "Toggles the notifications of comic strips for this channel.",
            "Use without a number input to view current state of channel.",
            "Use the parameter -s (starting point) to indicate an alternative point from which skarm should start publishing comics.",
            "Once the early start point catches up with the current release, skarm will switch to just publishing new releases."
        ].join("\n"),
        examples: [
            {command: "e@comics", effect: "Will cause Skarm to list all available comic subscriptions to toggle."},
            {command: "e@comics 1", effect: "Will cause Skarm to toggle announcing all new releases of comic 1 from the list."},
            {command: "e@comics 1 -s 0", effect: "Starts the comic subscription feed at entry 0, publishing the next entry in the sequence once per day."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let comicCollection = bot.comics;
            let topics = comicCollection.getAvailableSubscriptions();
            let args = Skarm.commandParamTokens(e.message.content);

            for(let i in topics) {
                let comicName = topics[i];
                guildData.comicChannels[comicName] ??= { };  // make sure all comic channel lists exist before accessing them
            }

            function constructStatusBody() {
                let body = "";
                for(let i in topics) {
                    let comicName = topics[i];
                    body += `[${i}] **${comicName}** posts are currently set to: **${(e.message.channel.id in guildData.comicChannels[comicName]) ? "Enabled":"Disabled"}**\n`;
                }
                // console.log("Notification channels:", guildData.comicChannels);
                // console.log("Current comic topics:", topics);
                return body;
            }

            constructStatusBody();

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
            if (!(idx in topics)) {
                Skarm.sendMessageDelay(e.message.channel, `Invalid input: \`${idx}\``);
                return;
            }

            let topic = topics[idx];
            if (e.message.channel.id in guildData.comicChannels[topic]) {
                delete guildData.comicChannels[topic][e.message.channel.id];
                Skarm.sendMessageDelay(e.message.channel, `New releases of ${topic} will no longer be sent to **${e.message.channel.name}!**`);
            }else{
                guildData.comicChannels[topic][e.message.channel.id] = Date.now();
                Skarm.sendMessageDelay(e.message.channel, `New releases of ${topic} will be sent to **${e.message.channel.name}!**`);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

