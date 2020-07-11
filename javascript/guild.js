"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");

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
    };
    
    guild.sendWoeMessage = function() {
        // for best results, the woe message should be formatted something like:
        // "Yo, {user.username}! If you can see this, it means you've been
        // restricted from using the server."
        Skarm.sendMessageDelay(this.woe.channel, this.woe.message);
    };
    
    guild.learnLine = function(e) {
        this.lines[e.message.content.toLowerCase()] = true;
        this.pruneLines();
    };
    
    guild.pruneLines = function() {
        let keys = Object.keys(this.lines);
        if (keys.length <= Constants.Vars.LOG_CAPACITY) {
            return;
        }
        
        for (let i = 0; i < keys.length; i++) {
            delete this.lines[keys[i]];
        }
    };
    
    guild.getPermissions = function(user) {
        for (let mom in Constants.Moms) {
            if (Constants.Moms[mom].id == user.id) return Permissions.SUDO;
        }
        if (!user.memberOf(this)) return Permissions.NOT_IN_GUILD;
        
        return Permissions.BASE;
    };
    
    guild.hasPermissions = function(user, perm) {
        return !!(this.getPermissions(user) & perm);
    };
    
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
        
        return currentMessage;
    };
    
    guild.togglePinnedChannel = function(channel) {
        if (!this.channelsPinUpvotes) this.channelsPinUpvotes = { };
        this.channelsPinUpvotes[channel] = !this.channelsPinUpvotes[channel];
        return this.channelsPinUpvotes[channel];
    };
    
    guild.updateEXP = function(e) {
		if (!this.expTable) {
			this.expTable = { };
		}
        
        let author = e.message.author;
        
		if(author.id in this.expTable) {
			if (this.expTable[author.id].lastMessage + 6000 >= Date.now()) return;
		}else {
			this.expTable[author.id] = {
                exp: Skinner.getMinEXP(0),
                level: 0,
                nextLevelEXP: Skinner.getMinEXP(1),
                lastMessage: undefined,
            };
		}
        
        let userEXPData = this.expTable[author.id];
        
        userEXPData.exp += 15 + Math.floor(10 * Math.random());
        userEXPData.lastMessage = Date.now();
        
        // level up?
        if(userEXPData.exp >= userEXPData.nextLevelEXP) {
            userEXPData.level = Skinner.getLevel(userEXPData.exp);
            userEXPData.nextLevelEXP = Skinner.getMinEXP(userEXPData.level + 1);
            
            e.message.channel.sendMessage("Level up! " + e.message.member.nickMention
                + " is now **Level " + userEXPData.level + ".**"
            );
            
            //assign level up roles if appropriate
            if (!this.rolesTable) {
                this.rolesTable = { };
            }
            
            //give users the role achieved at their level or the next one available bellow it
            let i = userEXPData.level;
            for (i; i >= 0; i--) {
                if (i in this.rolesTable) {
                    e.message.member.assignRole(this.rolesTable[i]);
                    if (!this.roleStack) {
                        for (i--; i >= 0; i--) {
                            if(i in this.rolesTable){
                                e.message.member.unassignRole(this.rolesTable[i]);
                            }
                        }
                        break;
                    }
                }
            }
        }
    };
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
        
        this.lines = { };
        this.channelsPinUpvotes = { };
        
		this.rolesTable = {};
		this.expTable = {};
		this.boostTable= {};
		
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
    
    static saveDebug() {
        fs.writeFile("debug/guilds.butt",
            JSON.stringify(Guild.guilds),
            "utf8",
            function(err) {
                if (err) console.log("something went wrong: " + err);
            }
        );
    }
}

module.exports = Guild;