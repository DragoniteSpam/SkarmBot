"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["game"],
        params: ["[name]"],
        usageChar: "@",
        helpText: "Sets Skarm's current game. Omitting the game name will reset it to the spaghetti count.",
        examples: [
            {command: "e@game", effect: "Resets the game to switch between the normal oscillating states."},
            {command: "e@game We are here to drink your beer", effect: "Sets the game skarm is currently playing to `We are here to drink your beer` indefinitely."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let cps = Skarm.commandParamString(e.message.content);
            if (cps === undefined || cps === null || cps.length < 1 || cps === "cycle") {
                bot.game = Constants.GameState.AUTOMATIC;
                cps = bot.games[bot.game];
            } else {
                bot.game = Constants.GameState.MANUAL;
            }
            if (cps === "-")
                cps = undefined;

            bot.client.User.setGame({name: cps, type: 0, url: "https://github.com/DragoniteSpam/Skarmbot"});

            Skarm.sendMessageDelay(e.message.channel, "Game set to **" + cps + "**.");

        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

