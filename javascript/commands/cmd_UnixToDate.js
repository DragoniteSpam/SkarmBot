"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["time", "unixtodate", "utd", "unix"],
        params: ["#"],
        usageChar: "!",
        helpText: "Takes a date+time or unix timestamp and presents all equivalent representations",
        examples: [
            {
                command: "e!time",
                effect: "Prints the current time"
            },
            {
                command: "e!time 2024-01-01 20:00:00",
                effect: "Prints the time formats for this timestamp."
            },
            {
                command: "e!utd 1640000000000",
                effect: "Prints the time formats for this timestamp."
            }
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e) {
            let tokens = Skarm.commandParamString(e.message.content);
            let time;


            //no input -> you get the current time
            if (tokens.length === 0) {
                time = Date.now();
            } else if (!isNaN(tokens-0)) {
                time = Number(tokens);
            } else {
                time = (new Date(tokens)).getTime();
            }

            // ms to s
            time = Math.floor(time/1000);

            let formats = [
                {tail:"t", description:"short time"},
                {tail:"T", description:"long time"},
                {tail:"d", description:"short date"},
                {tail:"D", description:"long date"},
                {tail:"f", description:"short date/time"},
                {tail:"F", description:"long date/time"},
                {tail:"R", description:"relative time"},
            ];
            let discordTimes = formats.map(f => {
                return {
                    name: f.description,
                    value: `\`<t:${time}:${f.tail}>\`\n<t:${time}:${f.tail}>`,
                    inline: true
                }
            });
            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                title: "Time Conversion",
                fields: [
                    {
                        name: "Unix",
                        value: `${time*1000}`,
                        inline: true
                    },
                    ...discordTimes,
                ],
                timestamp: new Date(time * 1000),
                footer: {text: "Footer timestamp"}
            });
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}
