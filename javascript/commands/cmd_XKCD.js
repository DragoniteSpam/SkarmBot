"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["xkcd"],
        params: ["[id]"],
        usageChar: "!",
        helpText: "Returns the XKCD with the specified ID; if no ID is specified, it will return the latest strip instead. ID may be an index or a strip name.",
        examples: [
            {command: "e!xkcd ", effect: "Provides a link to the most recent XKCD comic."},
            {command: "e!xkcd 753", effect: "Provides a link to XKCD 753."},
            {command: "e!xkcd compiling", effect: "Provides a link to the xkcd titled `compiling`."},
            {command: "e!xkcd web", effect: "Provides a link for every xkcd containing `web` in its title."}
        ],
        ignoreHidden: true,
        category: "web",

        execute(bot, e, userData, guildData) {
            bot.comics.get("xkcd").post(e.message.channel, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

