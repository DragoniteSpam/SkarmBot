"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["nick", "nickname", "setname"],
        params: ["newName"],
        usageChar: "!",
        helpText: "Set what you want skarm to call you across all servers.\r\nIf no nickname is given, skarm will default to your server nickname. \r\nUse `e!nick -` to remove",
        examples: [
            {command: "e!nick", effect: "Skarm will tell you what your current nickname is set to."},
            {command: "e!nick 27", effect: "Skarm will set your nickname to `27`."},
            {command: "e!setname -", effect: "Skarm will remove your nickname from his records and default to server nickname where possible."}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let newNick = Skarm.commandParamString(e.message.content);
            if (!newNick.length) {
                Skarm.sendMessageDelay(e.message.channel, `Your current nickname is: ${userData.nickName}`);
                return;
            }
            if (newNick === "-") {
                userData.nickName = undefined;
                Skarm.sendMessageDelay(e.message.channel, `Nickname removed`);
                return;
            }
            userData.nickName = newNick.substring(0, 32); //limits imposed by discord inherited by skarm for the sake of sanity and such things
            Skarm.sendMessageDelay(e.message.channel, `Skarm will now refer to you as "${userData.nickName}"`);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

