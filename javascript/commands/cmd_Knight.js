"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["mod", "knight","mods"],
        params: ["member | clear"],
        usageChar: "@",
        helpText: "Administrator command for appointing and removing moderators.  Moderators can use certain administrative commands. Use `e@mod clear` to remove all moderators (caution is advised).",
        examples: [
            {command: "e@mod",    effect: "Lists all members who have been granted moderator-level access to Skarmbot in this guild."},
            {command: "e@mod @TrustedMember",    effect: "Adds or removes `@TrustedMember` to the moderators list for the guild.  If they are currently on the list, they will be removed.  Otherwise, they will be added."},
            {command: "e@mod clear",    effect: "Removes all moderators from the guild."},
        ],
        ignoreHidden: false,
        perms: Permissions.ADMIN,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let words = Skarm.commandParamTokens(e.message.content);
            if (!guildData.moderators)
                guildData.moderators = {};
            if (words.length === 0) {
                let list = Object.keys(guildData.moderators);
                if (list.length === 0) {
                    Skarm.sendMessageDelay(e.message.channel, "The administrators have not approved of any mods at this time. Use `e@mod @member` to add someone to the mod list.");
                    return;
                }

                let mods = "";
                for (let i in list) {
                    var mod = Guilds.client.Users.get(list[i]);
                    if (mod != null)
                        mods += mod.username + ", ";
                }
                Skarm.sendMessageDelay(e.message.channel, "The current moderators in this guild are: " + mods.substring(0, mods.length - 2));
                return;
            }

            if (words[0] === "clear" || words[0] === "c") {
                guildData.moderators = {};
                Skarm.sendMessageDelay(e.message.channel, "Removed everyone from the moderators list.");
                return;
            }

            //mention => toggle
            let member = words[0].replace("<", "").replace("@", "").replace("!", "").replace(">", "");

            Skarm.log("Toggling state of: " + member);

            if (member in guildData.moderators) {
                delete guildData.moderators[member];
                Skarm.sendMessageDelay(e.message.channel, "Removed <@" + member + "> from the moderators list.");

            } else {
                guildData.moderators[member] = Date.now();
                Skarm.sendMessageDelay(e.message.channel, "Added <@" + member + "> to the moderators list.");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

