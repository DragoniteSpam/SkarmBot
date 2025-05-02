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
        "Image URLs are only accepted from imgur.  Links to discord images have expiration times that would break this feature after they expire.",
        '`e@ir <enable/disable>` toggles the entire feature on/off.  On by default with nothing in the list is effectively off.',
        '`e@ir add <cron?> <url?> <name?>` Creates a new entry in the collection.',
        '`e@ir edit <name|position> <cron?> <url?> <name?>` Modifies the properties of an entry in the list, changing the element by its name or position in the list.',
        '`e@ir delete <name|position>` Deletes an entry in the list based on its name or position in the list.',
    ].join("\n"),
    examples: [
        { command: "e@iconrotate", effect: "Lists the currently configured icons and their next upcoming rotations" },
        { command: "e@ir enable", effect: "Enables automatic rotation at scheduled intervals" },
        { command: "e@ir disable", effect: "Disables automatic rotation at scheduled intervals" },
        { command: "e@ir add https://imgur.com/VfxWCY3 Luthen 0 0 1 * *", effect: "Adds an image named 'Luthen' to the list to be set at the start of each month" },
        { command: "e@ir add https://imgur.com/tK23Y0v 0 0 7 * * Saw", effect: "Adds an image named 'Saw' to the list to be set on the 7th of each month" },
        { command: "e@ir add 0 0 14 * * https://imgur.com/j9p7uTU Maarva", effect: "Adds an image named 'Maarva' to the list to be set on the 14th of each month" },
        { command: "e@ir add 0 0 1 1 * https://imgur.com/j9p7uTU", effect: "Adds an unnamed image to the list to be set on Jan 1st every year" },
        { command: "e@ir edit Saw 0 0 21 * *", effect: "Edits the image named 'Saw' to the new schedule of the 21st of every month" },
        { command: "e@ir edit 2 0 0 21 * *", effect: "Edits the second image in the listto the new schedule of the 21st of every month" },
        { command: "e@ir delete Saw", effect: "Deletes the image named 'Saw' from the collection" },
        { command: "e@ir delete 2 ", effect: "Deletes the image in the second position in the collection" },
    ],
    ignoreHidden: false,
    perms: Permissions.MOD,
    category: "administrative",

    execute(bot, e, userData, guildData) {
        let args = commandParamString(e.message.content);
        let params = commandParamTokens(e.message.content);
        let rotator = guildData.iconRotator;

        send(e, rotator);
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

function send(e, rotator) {
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
            };
        }),
    });
}
