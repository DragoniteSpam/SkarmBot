"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

module.exports = {
    Hug: {
        aliases: ["hug", "hugs"],
        standalone: true,
        odds: 0.1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_hugs " + e.message.author.username + "_");
        },
    },
    Sandwich: {
        aliases: ["sandwich", "sandwiches"],
        standalone: true,
        odds: 0.1,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_steals " + e.message.author.username + "'s sandwich_");
        },
    },
    Sandvich: {
        aliases: ["sandvich", "sandviches"],
        standalone: true,
        odds: 0.25,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "_steals " + e.message.author.username + "'s sandvich_");
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
    Time: {
        aliases: ["what time"],
        standalone: false,
        odds: 0.75,

        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, new Date(Date.now()*2*Math.random()));
        },
    },
    Thanks: {
        aliases: ["thank*skarm"],
        standalone: false,
        odds: 0.9,
        
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
        odds: 0.3,
        
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
    FightClub1: {
        aliases: ["first*rule*fight*club"],
        standalone: true,
        odds: 0.9,

        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel,  "The first rule of Fight Club is: you do not talk about Fight Club.");
        },
    },
    FightClub2: {
        aliases: ["second*rule*fight*club"],
        standalone: true,
        odds: 0.9,

        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel,  "The second rule of Fight Club is: you DO NOT talk about Fight Club!");
        },
    },

    Faith: {
        aliases: ["faithless imperial"],
        standalone: true,
        odds: 0.1,
        
        execute(bot, e) {
			
			function getRandSky(){
				return bot.skyrim[Math.floor(Math.random()*bot.skyrim.length)];//TODO
			}
			
			var ret=[
				"Faith is the denial of observation so that belief can be preserved.",
				"We'll drive out the stormcloaks and restore what we own. Like Imperial soaps and towlettes. They used to make me feel so clean. I LOVE, **LOVE** moist towlettes.",
			];
			var rend="";
			for(var i =0;i<40;i++){
				while(Math.random()<(1 - (1/40)) && !rend.includes("stormcl"))
					rend = getRandSky();
				ret.push(rend);
			}
            Skarm.sendMessageDelay(e.message.channel, ret[Math.floor(Math.random()*ret.length)]);
        },
    },
}
