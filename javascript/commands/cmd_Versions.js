"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

/**
 * Guild data is assumed to be moving too rapidly to be able to safely operate on it
 */
module.exports = {
    aliases: ["versions"],
    params: [],
    usageChar: "@",
    helpText: "Debug command to log the packages perceived in the runtime environment",
    examples: [
        { command: "e@versions", effect: "Logs operating environment" }
    ],
    ignoreHidden: false,
    perms: Permissions.MOM,
    category: "infrastructure",

    execute(bot, e, userData, guildData) {
        Skarm.sendMessageDelay(e.message.channel, `
Perceived environment:
\`\`\`json
${JSON.stringify(process.versions, null, 4)
            }
\`\`\`
            `);
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

