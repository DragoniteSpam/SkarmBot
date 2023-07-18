"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        //TODO: double check what isn't useless here
        aliases: ["munroe"],
        params: ["push | lockcheck"],
        usageChar: "@",
        helpText: "This feature has been deprecated to now run through e@notify.  Please use that command instead.",
        examples: [
            {command: "e@munroe push", effect: "Forces a check for the latest xkcd release."}
        ],
        ignoreHidden: true,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let args = Skarm.commandParamTokens(e.message.content);

            if (args.length === 0) {
                //Skarm.sendMessageDelay(e.message.channel, "XKCDs are " + ((e.message.channel.id in bot.channelsWhoLikeXKCD) ? "" : "not ") +" currently being sent to " + e.message.channel.name + ".");
                Skarm.sendMessageDelay(this.helpText);
                return;
            }

            let leave = true;
            for (let mom in Constants.Moms) {
                if (Constants.Moms[mom].id === e.message.author.id){
                    leave = false;
                }
            }

            if (leave) return;

            // noinspection FallThroughInSwitchStatementJS
            switch (args[0]) {
                case "push":
                    bot.xkcd.checkForNewXKCDs();
                    break;
                case "lockcheck":
                    Skarm.spam("XKCD lock state: " + bot.xkcd.lock);
                    break;
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

