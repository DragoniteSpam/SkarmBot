"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

const guilddb = "..\\data\\guilds.penguin";

class Guild {
    constructor(id) {
        this.id = id;
        
        this.woe = {
            message: "",
            channel: null,
        };
        
        this.mayhem = {
            roles: [
                "696896531990577192",
                "696896610726182952",
                "696896579629744178",
            ],
            basePosition: 2,
        };
        
        this.lines = {};
        
        Guild.add(this);
    }
    
    executeMayhem() {
        let guildData = Guild.getData(this.id);
        let mayhem = this.mayhem.roles.shift();
        this.mayhem.roles.push(mayhem);
        for (let i = 0; i < guildData.roles.length; i++) {
            let roleData = guildData.roles[i];
            if (roleData.id === mayhem) {
                roleData.setPosition(this.mayhem.basePosition);
            }
        }
    }
    
    sendWoeMessage(user) {
        // for best results, the woe message should be formatted something like:
        // "Yo, {user.username}! If you can see this, it means you've been
        // restricted from using the server."
        Skarm.sendMessageDelay(this.woe.channel, this.woe.message);
    }
    
    learnLine(e) {
        this.lines[e.message.content.toLowerCase()] = e.message.content.toLowreCase();
        this.pruneLines();
    }
    
    pruneLines(e) {
        let keys = Object.keys(this.lines);
        if (keys.length <= Constants.Vars.LOG_CAPACITY) {
            return;
        }
        
        for (let i = 0; i < keys.length; i++) {
            delete this.lines[keys[i]];
        }
    }
    
    getRandomLine(e) {
        let keywords = e.message.content.toLowerCase().split(" ");
        let keys = Object.keys(this.lines);
        // if there are no stored messages, you can't return anything
        if (keys.length == 0) {
            return undefined;
        }
        let sort = function(array) {
            array.sort(function(a, b) {
                return b.length - a.length;
            });
        }
        
        sort(keywords);
        let currentMessage = "";
        let currentMessageScore = -1;
        let testWords = Math.min(Constants.Vars.SIMILAR_MESSAGE_KEYWORDS,
            keywords.length);
        
        // try a given number of messages
        for (let i = 0; i < Constants.Vars.SIMILAR_MESSAGE_ATTEMPTS; i++) {
            let message = this.lines[keys[Math.floor(Math.random() * keys.length)]];
            let messageScore = 0;
            // messages are scored based on how many of the longest words
            // in the original they share
            for (let j = 0; j < testWords; j++) {
                if (message.includes(keywords[i])) {
                    messageScore++
                }
            }
            if (messageScore > currentMessageScore) {
                currentMessageScore = messageScore;
                currentMessage = message;
            }
        }
        
        return currentMessage;
        
    }
    
    static initialize(client) {
        Guild.guilds = {};
        Guild.client = client;
    }
    
    static add(guild) {
        if (guild in Guild.guilds) {
            return false;
        }
        Guild.guilds[guild.id] = guild;
        return true;
    }
    
    static remove(guild) {
        if (!(guild in Guild.guilds)) {
            return false;
        }
        delete Guild.guilds[guild.id];
        return true;
    }
    
    static get(id) {
        return Guild.guilds[id] ? Guild.guilds[id] : new Guild(id);
    }
    
    static getData(id) {
        return Guild.client.Guilds.get(id);
    }
    
    static load() {
        Encrypt.read(guilddb, function(data, filename) {
            Guild.guilds = JSON.parse(data);
        });
    }
    
    static save() {
        Encrypt.write(guilddb, JSON.stringify(Guild.guilds));
    }
}

module.exports = Guild;