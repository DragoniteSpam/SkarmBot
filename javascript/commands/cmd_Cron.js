"use strict";
const { parseCronExpression } = require(`cron-schedule`);
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require(`./_imports.js`);

// how many samples skarm will print
let DATES = 5;

module.exports = {
        aliases: [`cron`],
        params: [`cron-expression`],
        usageChar: `!`,
        helpText: [`Evaluates a cron expression for the next 5 times that it will be triggered.  Format:`,
                    `\`\`\``,
                    `┌───────────── second (0 - 59, optional)`,
                    `│ ┌───────────── minute (0 - 59)`,
                    `│ │ ┌───────────── hour (0 - 23)`,
                    `│ │ │ ┌───────────── day of month (1 - 31)`,
                    `│ │ │ │ ┌───────────── month (1 - 12)`,
                    `│ │ │ │ │ ┌───────────── weekday (0 - 7)`,
                    `* * * * * *`,
                    `\`\`\``,
                ].join(`\n`),
        examples: [
            {command: `e!cron 0 * * * *`, effect: `Skarm will print the next ${DATES} hours.`},
            {command: `e!cron 0 0 * * *`, effect: `Skarm will print the next ${DATES} days.`},
            {command: `e!cron 0 0 * * 1`, effect: `Skarm will print the next ${DATES} Mondays.`},
            {command: `e!cron 0 9 * * 1`, effect: `Skarm will print the next ${DATES} Mondays at 9am (09:00).`},
            {command: `e!cron 0 17 * * 5`, effect: `Skarm will print the next ${DATES} Fridays at 5pm (17:00).`},
            {command: `e!cron 0 0 1 * *`, effect: `Skarm will print the first day of each of the next ${DATES} months.`},
        ],
        ignoreHidden: true,
        category: `meta`,

        execute(bot, e, userData, guildData) {
            let expression = Skarm.commandParamString(e.message.content);
            try {
                let cron = parseCronExpression(expression);
                Skarm.sendMessageDelay(e.message.channel, `Next ${DATES} dates:\n` + cron.getNextDates(DATES).map(a => a.toLocaleString("sv")).join("\n"));
            } catch (error) {
                Skarm.help(this, e);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

