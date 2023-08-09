"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["workchronicles", "work"],
        params: ["[id]"],
        usageChar: "!",
        helpText: "Returns the Work Chronicle with the specified ID.  ID is the strip name.",
        examples: [
            {command: "e!workchronicles Just do it", effect: "Provides a link to Work Chronicle `Just do it`."},
            {command: "e!xkcd you", effect: "Provides a link for every Work Chronicle containing `you` in its title."}
        ],
        ignoreHidden: true,
        category: "web",

        execute(bot, e, userData, guildData) {
            bot.comics.get("work_chronicles").post(e.message.channel, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

