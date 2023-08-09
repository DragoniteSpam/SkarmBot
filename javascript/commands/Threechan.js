"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["3"],
        params: ["id", "t..."],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        examples: [
            {command: "e@1 429537000408875008", effect: "keys at this level"},
            {command: "e@1 429537000408875008 notificationChannels", effect: "keys of this level or formatter"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);
            try {
                let struct = guildData;
                while(tokens.length) {
                    let next = tokens.splice(0,1); //pop from the front
                    if(next in struct) {
                        struct = struct[next];
                    } else {
                        struct = `Error: key \`${next}\` does not exist in this structure`;
                        tokens = [];
                        break;
                    }
                }

                let response = JSON.stringify(struct, null, 3);
                if(response && response.length > Constants.MAX_MESSAGE_LENGTH) {
                    response = "Message is too long, keys: " + JSON.stringify(Object.keys(struct),null,3);
                }

                if(response && response.length > Constants.MAX_MESSAGE_LENGTH) {
                    response = "Message is too long, type: " + typeof(struct);
                }

                Skarm.sendMessageDelay(e.message.channel, response);
            } catch (err) {
                console.log(err);
                Skarm.sendMessageDelay(e.message.channel, "Error encountered while attempting to access.");
            }
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
}

