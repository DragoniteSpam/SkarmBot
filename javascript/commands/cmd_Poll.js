"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["poll"],
    params: ["target"],
    usageChar: "@",
    helpText: "Polls a comic or all comics.",
    examples: [
        { command: "e!poll", effect: "Skarm will poll all the comics." },
        { command: "e!poll XKCD", effect: "Skarm will poll the XKCD channel for new releases." },
        { command: "e!poll WorkChronicles", effect: "Skarm will poll the WorkChronicles channel for new releases." },
    ],
    ignoreHidden: false,
    perms: Permissions.MOM,
    category: "infrastructure",

    execute(bot, e, userData, guildData) {
        Skarm.spam("Polling:", e.message.content);
        bot.comics.poll(Skarm.commandParamString(e.message.content));
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

