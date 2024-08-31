"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["birthdayannouncements", "bda"],
    params: ["enable", "disable", "list", "count"],
    usageChar: "@",
    helpText: [
        "Configures skarm to announce the birthdays of current members."
    ].join("\n"),
    examples: [
        { command: "e@birthdayannouncements enable", effect: "Configures skarm to announce birthdays in **this channel**" },
        { command: "e@bda", effect: "Indicates if this channel will announce birthdays" },
        { command: "e@bda enable", effect: "Configures skarm to announce birthdays in **this channel**" },
        { command: "e@bda disable", effect: "Turns off announcement of birthdays in **this channel**.  Announcements in other channels are unaffected." },
        { command: "e@bda list", effect: "Lists all channels in this server that will announce birthdays (in case multiple are configured)" },
        { command: "e@bda count", effect: "Provides a count of how many users have allowed skarm to announce their birthday in this server" },
        { command: "e@bda announce", effect: "Sends the announcement ahead of skarm's automated schedule for the day!" },
    ],
    ignoreHidden: false,
    perms: Permissions.MOD,
    category: "administrative",

    execute(bot, e, userData, guildData) {
        let cmd = Skarm.commandParamString(e.message.content);
        let bda = guildData.birthdayAnnouncer;
        let channel = e.message.channel;
        let success;
        switch (cmd) {
            case "enable":
            case "e":
                success = bda.enable(channel.id);
                if (success) {
                    Skarm.sendMessageDelay(channel, "I'll announce birthdays in this channel!");
                } else {
                    Skarm.sendMessageDelay(channel, "This channel is already configured to announce birthdays!");
                }
                break;

            case "disable":
            case "d":
                bda.disable(channel.id);
                Skarm.sendMessageDelay(channel, "Birthday announcements disabled in this channel!");
                break;

            case "list":
            case "l":
            case "":
                if (bda.channels.length > 0) {
                    Skarm.sendMessageDelay(channel, `Birthday announcements will be sent to: ${bda.channels.map(ch => `<#${ch}>`).join(" ")}`);
                } else {
                    Skarm.sendMessageDelay(channel, "Birthday announcements aren't being sent to any channels!");
                }
                break;

            case "count":
            case "c":
                Skarm.sendMessageDelay(channel, `I'll announce the birthdays of ${bda.getEnabledMembers().length} server members!`);
                break;

            case "announce":
                bda.announce();
                break;
        }

    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

