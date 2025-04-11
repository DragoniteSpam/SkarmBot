"use strict";
const ComicsCollection = require("../comics.js");
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["comics"],
    params: ["#"],
    usageChar: "@",
    helpText: [
        "Toggles the notifications of comic strips for this channel.",
        "Use without a number input to view current state of channel.",
        "Specifying another number will indicate an alternative point from which skarm should start publishing comics.",
        "Once the early start point catches up with the current release, skarm will switch to just publishing new releases."
    ].join("\n"),
    examples: [
        { command: "e@comics", effect: "Will cause Skarm to list all available comic subscriptions to toggle." },
        { command: "e@comics 1", effect: "Will cause Skarm to toggle announcing all new releases of comic 1 from the list." },
        { command: "e@comics 1 20", effect: "Starts the comic subscription feed at entry 20, publishing the next entry in the sequence once per day." },
        { command: "e@comics 1 next", effect: "When the comic subscription is in catch-up mode, sends the next comic in the backlog.  Does nothing when caught up." },
    ],
    ignoreHidden: false,
    perms: Permissions.MOD,
    category: "administrative",

    execute(bot, e, userData, guildData) {
        let topics = ComicsCollection.getAvailableSubscriptions();
        let args = Skarm.commandParamTokens(e.message.content);
        let subscriptions = guildData.comicSubscriptions;

        function constructStatusBody() {
            let body = "";
            for (let i in topics) {
                let comicName = topics[i];
                let subscription = subscriptions.get(e.message.channel.id, comicName);
                if(subscription){
                    if(subscription.live()){
                        body += `[${i}] **${comicName}** posts are currently set to: **NEW RELEASES**\n`;
                    } else {
                        body += `[${i}] **${comicName}** posts are currently set to: **HISTORIC RELEASES** (current entry: ${subscription.index} | latest entry: ${ComicsCollection.get(comicName).length()})\n`;
                    }
                } else {
                    body += `[${i}] **${comicName}** posts are currently set to: **DISABLED**\n`;
                }
            }
            // console.log("Notification channels:", guildData.comicChannels);
            // console.log("Current comic topics:", topics);
            return body;
        }

        constructStatusBody();

        if (args.length === 0) {
            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Constants.Colors.BLUE,
                author: { name: e.message.author.nick },
                description: `Configure notification settings for <#${e.message.channel.id}>:\r\n\r\n` + constructStatusBody(),
                timestamp: new Date(),
            });
            return;
        }

        let variedStart = (args.length === 2);

        let idx = args[0];
        if (!(idx in topics)) {
            Skarm.sendMessageDelay(e.message.channel, `Invalid input: \`${idx}\``);
            return;
        }

        let comicName = topics[idx];
        if (subscriptions.isSubscribed(e.message.channel.id, comicName)) {
            if(variedStart && args[1] === "next" && !subscriptions.isLive(e.message.channel.id, comicName)){
                // Skarm.sendMessageDelay(e.message.channel, `Polling next ${comicName}!`);
                subscriptions.next(e.message.channel.id, comicName);
            } else {
                subscriptions.unsubscribe(e.message.channel.id, comicName);
                Skarm.sendMessageDelay(e.message.channel, `${comicName} will no longer be sent to **${e.message.channel.name}!**`);
            }
        } else {
            if(!variedStart){
                // basic subscription case: new releases
                subscriptions.subscribe(e.message.channel.id, comicName);
                Skarm.sendMessageDelay(e.message.channel, `New releases of ${comicName} will be sent to **${e.message.channel.name}!**`);
            } else {
                // validate the argument
                let startIdx = Math.floor(Number(args[1]));
                if(!Number.isInteger(startIdx) || startIdx < 0) {
                    Skarm.sendMessageDelay(e.message.channel, `Invalid starting point: \`${startIdx}\``);
                    return;
                }

                // set up the catch-up subscriber
                subscriptions.subscribeAt(e.message.channel.id, comicName, startIdx);
                Skarm.sendMessageDelay(e.message.channel, `Releases of ${comicName} starting at ${startIdx} will be sent to **${e.message.channel.name}** daily!`);
            }
        }
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

