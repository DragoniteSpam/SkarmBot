"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["leaderboard","levels"],
        params: ["start position"],
        usageChar: "!",
        helpText: "Prints out a table of the members with the most experience in the guild.  Use the page option to access data outside of the top "+Constants.Tables.MaxTableLength+" members.",
        examples: [
            {command: "e!leaderboard", effect: "Will cause Skarm to report the experience and ranks of the top 15 guild members."},
            {command: "e!leaderboard "+(Constants.Tables.MaxTableLength+1), effect: "Will cause Skarm to report the word and message counts of the "+(Constants.Tables.MaxTableLength + 1)+"th-"+(2 * Constants.Tables.MaxTableLength)+"th guild members."},
        ],
        ignoreHidden: true,
        category: "leveling",

        execute(bot, e, userData, guildData) {
            let message = Skarm.commandParamString(e.message.content).toLowerCase();
            let tokens = Skarm.commandParamTokens(e.message.content);
            let startIndex = (tokens && tokens[0] && tokens[0] > 0) ? tokens[0] - 1 : 0;     // initialize start index to be the place in the table where the leaderboard begins
            let iteratingIdx = startIndex;

            let table = guildData.getExpTable();
            let fullTableLen = table.length;
            table = table.splice(startIndex, Constants.Tables.MaxTableLength);     // extract desired elements
            for(let entry of table) {
                entry.rank = ++iteratingIdx;
                entry.member = Skarm.getUserMention(bot, entry.userID);

            }                              // add rank property to entries
            table = Skarm.formatTable(table, ["rank", "member", "exp", "level"], true);                   // covert array to string

            let messageObject = {
                color: Skarm.generateRGB(),
                description: table,
                author: {name: e.message.author.nick},
                title: `Experience Leaderboard`,
                timestamp: new Date(),
                footer: {text: `Page ${Math.floor(startIndex / Constants.Tables.MaxTableLength) + 1}/${Math.ceil(fullTableLen / Constants.Tables.MaxTableLength)}`},
            };

            Skarm.sendMessageDelete(e.message.channel, " ", false, messageObject, Constants.someBigNumber, e.message.author, bot);
        },

        help(bot,e) {
            Skarm.help(this, e);
        },
}

