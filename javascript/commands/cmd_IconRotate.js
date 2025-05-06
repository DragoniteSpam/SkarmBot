"use strict";
const { parseCronExpression } = require("cron-schedule");
const { IconRotator, Icon, isValidUrl } = require("../guildClasses/IconRotator.js");
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

        let command = params.splice(0, 1)[0];
        args = args.replace(command, "").trim();
        try {
            switch (command) {
                case "enable":
                    rotator.enabled = true;
                    break;

                case "disable":
                    rotator.enabled = false;
                    break;

                case "add":
                    addIcon(rotator, params, args);
                    break;

                case "edit":
                    editIcon(rotator, params, args);
                    break;

                case "delete":
                    deleteIcon(rotator, params);
                    break;
            }
        } catch (error) {
            console.log("Failed to complete operation with error:", error);
        }

        send(e, rotator);
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

async function send(e, rotator) {
    await rotator.catchUp();

    let state = rotator.getCurrentState();
    let {nextState, upcomingTime} = rotator.getNextState();

    Skarm.sendMessageDelay(e.message.channel, " ", false, {
        title: "Server Icon Auto-rotation state",
        description: [
            rotator.enabled ? "Scheduled Rotations Enabled" : "Disabled",
            `Last time checked (ET) ${new Date(rotator?.lastUpdatedTime)?.toLocaleString('sv')}`,
            `Current icon: ${state?.name} ${state?.url}`,
            `Coming up next: ${nextState?.name} ${nextState?.url} ${upcomingTime?.toLocaleString('sv')}`,
        ].join("\n"),
        fields: rotator.icons.map((icon, i) => {
            let name = icon.name || "Unnamed";
            name = `${i + 1}: ${name}`;

            return {
                name: name,
                value: [
                    `Cron: ${icon.cron}`,
                    `Next scheduled time: ${icon.nextScheduledTime()}`,
                    `Valid: ${icon.isValidIcon()}`,
                    `Image: ${icon.url}`,
                ].join("\n")
            };
        }),
    });
}

function addIcon(rotator, params, args) {
    let url = extractUrl(params);
    let cron = extractCron(params);
    let name = args.replace(url, "").replace(cron, "").trim();
    let icon = new Icon({ name, url, cron });
    rotator.icons.push(icon);
}

function editIcon(rotator, params, args) {
    let identifier = params.splice(0, 1);
    let icon = extractIcon(rotator, identifier);
    if (!icon) {
        throw `Failed to find icon with identifier ${identifier}`;
    }
    let url = extractUrl(params);
    let cron = extractCron(params);
    let name = args.replace(url, "").replace(cron, "").replace(identifier, "").trim();
    if (url) icon.url = url;
    if (cron) icon.cron = cron;
    if (name) icon.name = name;
}

function deleteIcon(rotator, params) {
    let icon = extractIcon(rotator, params[0]);
    if (!icon) {
        throw `Failed to find icon with identifier ${identifier}`;
    }
    let index = rotator.icons
        .map((x, i) => { return { x, i } })
        .find(icons => icons.x.url === icon.url)?.i;

    // delete the icon
    if (index in rotator.icons) {
        rotator.icons.splice(index, 1);
    }
}

function extractUrl(params) {
    let url = params.find(param => isValidUrl(param));
    if (!url) return;
    params.splice(params.indexOf(url), 1);
    return url;
}

function extractIcon(rotator, identifier) {
    return rotator.icons.find(icon => icon.name?.indexOf(identifier) === 0) ||
        rotator.icons.find((icon, i) => i + 1 === identifier);
}

function extractCron(params) {
    let candidateExpressions = [
        params.slice(0, 6),    // try the first 6
        params.slice(0, 5),    // try the first 5
        params.slice(-6),      // try the last 6
        params.slice(-5),      // try the last 5
    ];

    return candidateExpressions
        .map(expr => expr.join(" "))     // convert param sequence to cron string
        .find(expr => isValidCron(expr)) // convert to cron expression or null, stop on the first valid expression
}

function isValidCron(cron) {
    try {
        return parseCronExpression(cron); // truthy object
    } catch (error) {
        return null; // falsy null
    }
}
