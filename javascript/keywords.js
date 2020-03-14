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
        aliases: ["sandwich", "sandwiches"],
        standalone: true,
        odds: 0.1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_steals" + e.message.author.username + "'s sandwich_");
        },
    },
    Sandvich: {
        aliases: ["sandvich", "sandviches"],
        standalone: true,
        odds: 0.25,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_steals" + e.message.author.username + "'s sandvich_");
        },
    },
    Balance: {
        aliases: ["perfectly balanced", "perfect balance"],
        standalone: false,
        odds: 0.5,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "as all things should be");
        },
    },
    Thanks: {
        aliases: ["thanks skarm"],
        standalone: false,
        odds: 0.4,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "no problem, buddy");
        },
    },
    KnifeDragon: {
        aliases: ["knife dragon"],
        standalone: false,
        odds: 1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_stabs dragonite_");
        },
    },
    Cookie: {
        aliases: ["cookie"],
        standalone: false,
        odds: 0.1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_steals" + e.message.author.username + "'s cookies_");
        },
    },
    Debug: {
        aliases: ["debug"],
        standalone: false,
        odds: 1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "the bugs didn't go away, they just got better at hiding");
        },
    },
    Wooki: {
        aliases: ["droids", "wooki"],
        standalone: true,
        odds: 0.3,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "it is critical that we send an attack group there immediately. it is a system we cannot afford to lose.");
        },
    },
}