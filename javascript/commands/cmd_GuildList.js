"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["guildlist", "gl"],
        params: [""],
        usageChar: "@",
        helpText: "Lists the guilds that skarm is currently in and the owners of each one.",
        examples: [
            {command: "e@gl", effect: "Lists guilds."},
            {command: "e@gl 394225763483779084", effect: "Lists guild members."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let argv = Skarm.commandParamTokens(e.message.content);
            if(argv.length === 0) {
                let guilds = [];
                bot.client.Guilds.forEach((guild) => {
                    guilds.push({
                        name: guild.name,
                        value: "" +
                            `Guild ID: ${guild.id}\r\n`+
                            `Owner: ${guild.owner.username} \r\n` +
                            "<@" + guild.owner.id + ">" + "\r\n" +
                            "Member Count: " + guild.members.length,
                        inline: true,
                        members: guild.members.length
                    });
                    if (guild.owner.username.includes("Deleted User") && guild.members.length < 3) {
                        Skarm.log(`Think about leaving the guild with a deleted owner: ${guild.id}`);
                        // guild.leave();    // keeping this commented out just in case
                    }
                });

                guilds.sort((a, b) => {
                    return b.members - a.members
                });

                let embedobj = {
                    color: Skarm.generateRGB(),
                    title: `Guilds where skarm can be found (${guilds.length})`,
                    description: " ",
                    fields: guilds,
                    timestamp: new Date(),
                    footer: {text: "Guild List Query"}
                };
                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);
            }

            if(argv.length ===1) {
                let guild = bot.client.Guilds.get(argv[0]);
                if(!guild){
                    Skarm.sendMessageDelay(e.message.channel, "Guild not found");
                    return;
                }
                let memberList = [];
                for(let i = 0; i<50 && i<guild.members.length; i++){
                    memberList.push("<@"+guild.members[i].id +">");
                }

                let embedobj = {
                    color: Skarm.generateRGB(),
                    title: `Guild members`,
                    description: memberList.join("\r\n"),
                    timestamp: new Date(),
                    footer: {text: "Guild Member Query"}
                };
                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);

            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

