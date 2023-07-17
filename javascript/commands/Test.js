"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["test"],
        params: ["<test>"],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        examples: [
            {command: "e@test", effect: "the test."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);
            if(tokens.length===0) {
                e.message.channel.sendMessage("running test...", false, {
                    color: Skarm.generateRGB(),
                    author: {name: e.message.author.nick},
                    description: "Skarmory is brought to you by node js, github, Discord, and by viewers like you. Thank you.\r\n-PBS",
                    title: "This is an embed",
                    url: "http://xkcd.com/303",
                    timestamp: new Date(),
                    fields: [{name: "G", value: "And now"}, {name: "R", value: "for something"}, {
                        name: "E",
                        value: "completely"
                    }, {name: "P", value: "different"}],
                    footer: {text: "bottom text"}
                });
            }
            if(tokens[0]==="delete"){
                tokens.shift();
                const timeout = 15000;
                Skarm.sendMessageDelete(e.message.channel,`Testing delete message timeout ${timeout}\n`+tokens.join(" "),false,null,timeout,e.message.author.id,bot);
            }
            if(tokens[0]==="param"){
                let msg = Skarm.commandParamString(e.message.content.toLowerCase());
                Skarm.sendMessageDelay(e.message.channel,"Looking for -date");
                let d = Skarm.attemptNumParameterFetch(msg, "-d");
                Skarm.sendMessageDelay(e.message.channel,`Found data: ${d}`); // of length ${d.length}
            }
            if(tokens[0]==="das"){
                Skarm.spam(Guilds.get(e.message.channel.guild.id).flexActivityTable);
            }
            if(tokens[0]==="constants"){
                Skarm.spam(Constants.Lightsabers.Hilts);
            }
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
}

