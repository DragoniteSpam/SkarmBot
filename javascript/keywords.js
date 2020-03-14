"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./Constants.js");

module.exports = {
    Hug: {
        aliases: ["hug", "hugs"],
        standalone: true,
        odds: 0.1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_hugs" + e.message.author.username + "_");
        },
    },
    Sandwich: {
        aliases: ["sandwich"],
        standalone: true,
        odds: 0.1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_steals" + e.message.author.username + "'s sandwich_");
        },
    },
}