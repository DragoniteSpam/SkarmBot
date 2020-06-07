"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

const guilddb = "data\\guilds.penguin";

const MIN_LINES = 40;

let defaultLines = ["please stand by"];
fs.readFile("data\\default.birb", function(err, data) {
    defaultLines = data.toString().split("\n");
});

// since de/serialized objects don't keep their functions
const linkFunctions = function(guild) {
    guild.executeMayhem = function() {
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
    guild.sendWoeMessage = function() {
        // for best results, the woe message should be formatted something like:
        // "Yo, {user.username}! If you can see this, it means you've been
        // restricted from using the server."
        Skarm.sendMessageDelay(this.woe.channel, this.woe.message);
    }
    
    guild.learnLine = function(e) {
        this.lines[e.message.content.toLowerCase()] = true;
        this.pruneLines();
    }
    
    guild.pruneLines = function() {
        let keys = Object.keys(this.lines);
        if (keys.length <= Constants.Vars.LOG_CAPACITY) {
            return;
        }
        
        for (let i = 0; i < keys.length; i++) {
            delete this.lines[keys[i]];
        }
    }
    
    guild.getRandomLine = function(e) {
        let keywords = e.message.content.toLowerCase().split(" ");
        let keys = Object.keys(this.lines);
        // if there are no stored messages, use the default log instead
        if (keys.length < MIN_LINES) {
            keys = defaultLines;
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
            let message = keys[Math.floor(Math.random() * keys.length)];
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
        
        return currentMessage
    }
}

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
        
        linkFunctions(this);
    }
    
    static initialize(client) {
        Guild.guilds = {};
        try {
            Guild.load();
            Guild.client = client;
        } catch (e) {
            console.log("something bad happened when loading guilds: " + e);
        }
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
            for (let g in Guild.guilds) {
                linkFunctions(Guild.guilds[g]);
            }
        });
    }
    
    static save() {
        Encrypt.write(guilddb, JSON.stringify(Guild.guilds));
    }
}

module.exports = Guild;