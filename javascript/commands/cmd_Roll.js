"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["roll"],
        params: ["#d# + #"],
        usageChar: "!",
        helpText: "Roll up to 64 dice with a max value of up to 1000 per die!",
        examples: [
            {command: "e!roll 20", effect: "Will cause Skarm to roll `1d20` and report the outcome."},
            {command: "e!roll d20", effect: "Will cause Skarm to roll `1d20` and report the outcome."},
            {command: "e!roll 4d20", effect: "Will cause Skarm to roll `4d20` and report the outcome."},
            {command: "e!roll 20 + 1", effect: "Will cause Skarm to roll `1d20 + 1` and report the outcome."},
            {command: "e!roll d20 + 1", effect: "Will cause Skarm to roll `1d20 + 1` and report the outcome."},
            {command: "e!roll 3d20 + 9", effect: "Will cause Skarm to roll `3d20 + 9` and report the outcome."},
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let message = Skarm.commandParamString(e.message.content.toLowerCase());
            if (message.includes("+")) message = message.replace("+", " + ").replaceAll("  ", " ");
            let tokens = message.split(" ");

            if (tokens.length < 1 || tokens.join("").length === 0) {
                this.help(bot, e);
                return;
            }

            let dPointIndex = tokens[0].indexOf("d");

            let dieMagnitude = tokens[0].substring(dPointIndex + 1) - 0;
            let dieCount = 1;

            if (dPointIndex > 0) {
                dieCount = tokens[0].substring(0, dPointIndex) - 0;
            }

            dieCount = Math.min(0x40, dieCount);             //prevent user-end exploits
            dieMagnitude = Math.min(1000, dieMagnitude);     //prevent user-end exploits

            //Skarm.spam(`dieCount: ${dieCount}, dieMag: ${dieMagnitude}`);

            let rollValues = [];
            let rollAccumulator = 0;
            if (tokens.length > 1 && message.includes("+")) {
                let i = 1;
                while (i < tokens.length) {
                    if (tokens[i++].includes("+")) {
                        //Skarm.spam(`Found + at token ${i} of ${tokens.length}: ${tokens[i-1]}`);
                        break;
                    }
                }
                rollAccumulator = (i < tokens.length) ? tokens[i] - 0 : 0;
                //Skarm.spam(`Roll Accumulator: ${rollAccumulator}`);
            }

            let baseValue = rollAccumulator;

            for (let i = 0; i < dieCount; i++) {
                let rollValue = 1 + Math.floor(dieMagnitude * Math.random());
                rollAccumulator += rollValue;
                rollValues.push(rollValue);
            }

            if (baseValue > 0) {              //append base value to end of addition array
                rollValues.push(baseValue);
            }

            Skarm.sendMessageDelay(e.message.channel, `${rollValues.join(" + ")} = **${rollAccumulator}**`);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

