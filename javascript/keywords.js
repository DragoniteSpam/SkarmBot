"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./Constants.js");

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
    HelloThere: {
        aliases: ["hello there"],
        standalone: false,
        odds: 1,
        
        execute(bot, e) {
            let head = "<:skarmhead:422560671574523904>";
            let blank = "<:background:448285187550347275>";

            let sabers = e._constants.Lightsabers;

            let refName = e._userData.getName(e);

			function randomLeft(){
			    try {
                    if (1)
                        return sabers.Hilts.Left;
                } catch (e){
			        Skarm.spam((sabers));
                }
			    let colors  = [
                    "<:redlightsaberyx:455820731775844367>",
                    "<:greenlightsaberyx:422559631030878209>",
                    "<:bluelightsaberyx:422558517287845889>",
                    "<:Purplelightsaberymx:455819615440732171>"
                ];
                return colors[Math.floor(Math.random() * colors.length)];
			}

			function randomRight(){
                try {
                    if (1)
                        return sabers.Hilts.Right;
                } catch (e){
                    Skarm.spam((sabers));
                }
                let colors =[
                    "<:redlightsaberyx:455820732228698122>",
                    "<:greenlightsaberyx:422559630741340171>",
                    "<:bluelightsaberyx:422558517589704704>",
                    "<:Purplelightsaberyx:455819615071633422>"
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            function recursiveEdits(message,i){
			    if(!message.content.toLowerCase().includes("hilt")) return;
			    setTimeout(() => {
                    if(i%2){//Left start
                        message.edit(Skarm.lightsaber.insertLeft(message.content,2)).then((r) => recursiveEdits(r,i+1));
                    }else{//Right start
                        message.edit(Skarm.lightsaber.insertRight(message.content,2)).then((r) => recursiveEdits(r,i+1));
                    }
                },350);
            }

            let content = "GENERAL " + refName.toUpperCase() + "\nYou are a bold one.\n" + randomLeft() + randomLeft() + head + randomRight() + randomRight();
            if(e.message.author.username.toLowerCase().includes("master")){
                content = "MASTER JEDI" + "\nYou are a bold one.\n" +
                    randomLeft() + randomLeft() + blank + randomRight() + randomRight() +"\n" +
                    randomLeft() + randomLeft() + head + randomRight() + randomRight() +"\n" +
                    randomLeft() + randomLeft() + blank + randomRight() + randomRight() +"\n"
            }
            e.message.channel.sendMessage(content).then(r  =>{
                recursiveEdits(r,Math.floor(Math.random()*2));
            });
        },
    },
}