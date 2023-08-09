"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["activity","activitytable"],
        params: ["-days # -page #"],
        usageChar: "!",
        helpText: "Prints out a table of guild activity from the past # days.  If not specified, default is 30 days.  Use the page option to access data outside of the top "+Constants.Tables.MaxTableLength+" members.",
        examples: [
            {command: "e!activity", effect: "Will cause Skarm to report the word and message counts of the top "+Constants.Tables.MaxTableLength+" members over the past 30 days."},
            {command: "e!activity -days 45", effect: "Will cause Skarm to report the word and message counts of the top "+Constants.Tables.MaxTableLength+" members over the past 45 days."},
            {command: "e!activity -page 2", effect: "Will cause Skarm to report the word and message counts of the "+(1+Constants.Tables.MaxTableLength)+"th-"+(2*Constants.Tables.MaxTableLength)+"th most active members over the past 30 days."},
            {command: "e!activity -days 45 -page 2", effect: "Will cause Skarm to report the word and message counts of the "+(1+Constants.Tables.MaxTableLength)+"th-"+(2*Constants.Tables.MaxTableLength)+"th most active members over the past 45 days."}
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let message = Skarm.commandParamString(e.message.content).toLowerCase();
            let tokens = Skarm.commandParamTokens(e.message.content);
            let days = Skarm.attemptNumParameterFetch(message, "-d") || 30;
            let page = Skarm.attemptNumParameterFetch(message, "-p") - 1 || 0;    //convert page to array index
            let dayImplemented = 1613001600000;                                      // Epoch timestamp of day of implementation
            let pageLength = Constants.Tables.MaxTableLength;

            if (isNaN(page)) {
                Skarm.sendMessageDelay(e.message.channel, "Expected page input as an integer. e.g.: `e!activity 2`");
                return;
            }
            //Skarm.logError(page);
            let guild = guildData;
            let table = guild.flexActivityTable;


            let cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
            if (cutoffDate < dayImplemented) {
                days = Math.ceil((Date.now() - dayImplemented) / (24 * 60 * 60 * 1000));
                cutoffDate = dayImplemented;
            }
            Skarm.spam("Cutoff date: " + new Date(cutoffDate) + " | raw: " + cutoffDate);


            //assemble user object table for the report
            let usersList = [];
            for (let userID in table) {
                let userTableObj = table[userID];
                let userReportObj = {userID: userID, words: 0, messages: 0};
                if (days < 0 || days > 365) {
                    userReportObj.words = userTableObj.totalWordCount;
                    userReportObj.messages = userTableObj.totalMessageCount;
                } else {
                    for (let day in table[userID].days) {
                        if (day < cutoffDate) continue; //we can't break here because data in hash table is not strictly ordered
                        if (day < dayImplemented) {  //hard cutoff for data at the date of implementation
                            delete table[userID].days[day];
                            continue;
                        }
                        let dayData = userTableObj.days[day];
                        userReportObj.words += isNaN(dayData.wordCount) ? 0 : dayData.wordCount;            // don't let any NaN mess with the final answer (drop it instead)
                        userReportObj.messages += isNaN(dayData.messageCount)? 0 : dayData.messageCount;
                    }
                }
                usersList.push(userReportObj);
            }
            usersList.sort((a, b) => {
                return b.words - a.words
            });

            table = usersList;
            let spacer = "\t";
            let description = ["```", "Member" + spacer + "Words " + spacer + "Messages"];

            let usersToPrint = [];
            for (let i = 0; i + page * pageLength < table.length && i < pageLength && page >= 0; i++) {
                let idx = i + page * pageLength;

                let userMention = Skarm.getUserMention(bot, table[idx].userID);

                usersToPrint.push({
                    Member:   userMention,
                    Words:    table[idx].words,
                    Messages: table[idx].messages,
                });
            }

            if (page * pageLength > table.length) {
                Skarm.sendMessageDelay(e.message.channel, "Requested page is outside of active member range.  Please try again.");
                return;
            }

            description = Skarm.formatTable(usersToPrint);

            let messageObject = {
                color: Skarm.generateRGB(),
                description: description,
                author: {name: e.message.author.nick},
                title: "Server Activity for the past " + days + " days",
                timestamp: new Date(),
                footer: {text: `Page ${page + 1}/${Math.ceil(table.length / pageLength)}`},
            };

            Skarm.sendMessageDelete(e.message.channel, " ", false, messageObject, 1 << 20, e.message.author, bot);
        },

        help(bot,e) {
            Skarm.help(this, e);
        },
}

