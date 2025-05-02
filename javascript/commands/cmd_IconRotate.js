"use strict";
const { commandParamString, commandParamTokens } = require("../skarm.js");
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["iconrotate", "ir"],
    params: [],
    usageChar: "@",
    helpText: [
        "Configures automatic rotation of discord server icons.",
        "Uses [cron](https://www.npmjs.com/package/cron-schedule#:~:text=Cron%20expression%20format) expressions to schedule icon changes.",
        "Image URLs are only accepted from imgur.  Links to discord images have expiration times that would break this feature after they expire."
    ].join("\n"),
    examples: [
        { command: "e@iconrotate", effect: "Lists the currently configured icons and their next upcoming rotations" },
        { command: "e@ir enable", effect: "Enables automatic rotation at scheduled intervals" },
        { command: "e@ir disable", effect: "Disables automatic rotation at scheduled intervals" },
    ],
    ignoreHidden: false,
    perms: Permissions.MOD,
    category: "administrative",

    execute(bot, e, userData, guildData) {
        let args = commandParamString(e.message.content);
        let params = commandParamTokens(e.message.content);
        let rotator = guildData.iconRotator;

        Skarm.sendMessageDelay(e.message.channel, " ", false, {
            title: "Server Icon Auto-rotation state",
            description: [
                rotator.enabled ? "Scheduled Rotations Enabled" : "Disabled",
            ].join("\n"),
            fields: rotator.icons.map((icon, i) => {
                let name = icon.name || "Unnamed";
                name = `${i + 1}: ${name}`;

                return {
                    name: name,
                    value: [
                        `Cron: ${icon.cron}`,
                        `Next scheduled time: ${icon.nextScheduledTime()}`,
                        `Image: ${icon.url}`,
                    ].join("\n")
                }
            }),
        });
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

