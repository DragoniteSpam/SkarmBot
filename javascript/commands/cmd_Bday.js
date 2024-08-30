"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["birthday", "bday", "bd"],
    params: ["date (YYYY-MM-DD)", "allow", "deny"],
    usageChar: "!",
    helpText: [
        "Sets your birthday for skarm.  This information will be used to announce your birthday to the server.",
        "You must opt in to which servers are allowed to use this information by sending the message `e!bd allow` in that server.",
    ].join("\r\n"),
    examples: [
        { command: "e!bday", effect: "Skarm will tell you what your current birthday is set to." },
        { command: "e!bday 2000-01-01", effect: "Skarm will set his records of your birthday to `2001-01-01`." },
        { command: "e!bday -", effect: "Skarm will delete his records of your birthday." },
        { command: "e!bday allow", effect: "Allows skarm to announce your birthday to the guild you sent this message in." },
        { command: "e!bday deny", effect: "Blocks skarm from announcing your birthday to the guild you sent this message in." },
    ],
    ignoreHidden: true,
    category: "general",

    execute(bot, e, userData, guildData) {
        let action = Skarm.commandParamString(e.message.content);
        if (action.length === 0) {
            let permitted = userData.birthdayAllowedGuilds[e.message.guild.id] ? "allowed" : "not allowed";
            Skarm.sendMessageDelay(e.message.channel, `I currently have your birthday as: \`${userData.birthday}\`.  This server is ${permitted} to announce your birthday.  You can change this with \`e!bd allow\` and \`e!bd deny\``);
            return;
        }

        if (action.trim().toLowerCase()[0] === "a") { // shorthand support "a" for "allow"
            userData.birthdayAllowedGuilds[e.message.guild.id] = true;
            Skarm.sendMessageDelay(e.message.channel, `Granted permission for this server to announce your birthdays`);
            return;
        }

        if (action.trim().toLowerCase()[0] === "d") { // shorthand support "d" for "deny"
            delete userData.birthdayAllowedGuilds[e.message.guild.id];
            Skarm.sendMessageDelay(e.message.channel, `Denied permission for this server to announce your birthdays`);
            return;
        }

        if (action === "-") {
            userData.birthday = undefined;
            Skarm.sendMessageDelay(e.message.channel, `Date deleted.`);
            return;
        }

        // default after all other cases: date format
        try {
            let date = (new Date(action)).toISOString().split("T")[0];
            userData.birthday = date;
            let permitted = userData.birthdayAllowedGuilds[e.message.guild.id] ? "allowed" : "not allowed";
            Skarm.sendMessageDelay(e.message.channel, `Recorded your birthday as: \`${userData.birthday}\` This server is ${permitted} to announce your birthday.  You can change this with \`e!bd allow\` and \`e!bd deny\``);
            return;
        } catch (error) {
            Skarm.sendMessageDelay(e.message.channel, `Something went wrong! Please try again with the format \`YYYY-MM-DD\``);
            Skarm.logError(error);
            Skarm.spam("Error in module: cmd_Bday - date parsing error", error, action);
            return;            
        }
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

