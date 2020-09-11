"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");

const guilddb = "..\\skarmData\\guilds.penguin";

const MIN_LINES = 40;

let defaultLines = ["please stand by"];

let messageIsAction = function(message) {
    if (message.startsWith("_") && message.endsWith("_")) return true;
    if (message.startsWith("*") && message.endsWith("*")) return true;
    return false;
};

fs.readFile("data\\default.birb", function(err, data) {
    defaultLines = data.toString().split("\n");
});

// I'm not a fan of this, but if you load an older version of an object it
// won't contain new variables that you might have added
const linkVariables = function(guild) {
    if (guild.lines === undefined) guild.lines = { };
    if (guild.actions === undefined) guild.actions = { };
    if (guild.mayhemRoles === undefined) guild.mayhemRoles = { };
};

// since de/serialized objects don't keep their functions
const linkFunctions = function(guild) {
    guild.executeMayhem = function() {
        let guildData = Guild.getData(this.id);
        for (let roleID in this.mayhemRoles) {
            for (let i = 0; i < guildData.roles.length; i++) {
                let roleData = guildData.roles[i];
                if (roleData.id === roleID) {
                    try {
                        let output = Skarm.generateRGB();
                        roleData.commit(roleData.name, output, roleData.hoist, roleData.mentionable);
                    } catch (e) {
                        console.log(e);
                        // if you dont have permission to mess with the role, don't i guess
                    }
                }
            }
        }
    };
    
    guild.toggleMayhem = function(id) {
        this.mayhemRoles[id] = this.mayhemRoles[id] ? undefined : id;
        return !!this.mayhemRoles[id];
    };
    
	guild.soap = function () {
		if(this.lastSendLine) delete this.lines[this.lastSendLine];
		this.lastSendLine = undefined;
	}
	
    guild.sendWoeMessage = function() {
        // for best results, the woe message should be formatted something like:
        // "Yo, {user.username}! If you can see this, it means you've been
        // restricted from using the server."
        Skarm.sendMessageDelay(this.woe.channel, this.woe.message);
    };
    
    guild.learnAction = function(e) {
        let message = e.message.content;
        message = message.substring(1, message.length - 1).toLowerCase();
        this.actions[message] = true;
        this.pruneActions();
    };
    
    guild.pruneActions = function() {
        let keys = Object.keys(this.actions);
        if (keys.length <= Constants.Vars.LOG_CAPACITY) {
            return;
        }
        
        for (let i = 0; i < keys.length; i++) {
            delete this.actions[keys[i]];
        }
    };
    
    guild.getActionCount = function() {
        return Object.keys(this.actions).length;
    };
    
	guild.getRandomAction = function(e) {
        let message = e.message.content;
        message = message.substring(1, message.length - 1).toLowerCase();
        let keywords = message.split(" ");
        
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
        
        return "_" + currentMessage + "_";
    };
    
	guild.learnLine = function(e) {
        if (messageIsAction(e.message.content)) {
            guild.learnAction(e);
            return;
        }
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
    
	guild.getLineCount = function() {
        return Object.keys(this.lines).length;
    };
    
	guild.getRandomLine = function(e) {
        if (messageIsAction(e.message.content)) return this.getRandomAction(e);
        
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
    
	guild.getPermissions = function(user) {
        for (let mom in Constants.Moms) {
            if (Constants.Moms[mom].id == user.id) return Permissions.SUDO;
        }
        if (!user.memberOf(this)) return Permissions.NOT_IN_GUILD;
        
		let server = Guild.client.Guilds.get(this.id);
		let members = server.members;
		for (let i in members) {
			if (members[i].id == user.id) {
				let perms=members[i].permissionsFor(server);
				if (perms.General.ADMINISTRATOR)
					return Permissions.ADMIN | Permissions.MOD;
				break;
			}
		}
		
		if(this.moderators===undefined){
			this.moderators={};
		}
		
		if(user.id in this.moderators)
			return Permissions.MOD;
		
        return Permissions.BASE;
    };
    
	guild.hasPermissions = function(user, perm) {
        return (this.getPermissions(user) >= perm);
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
		let oldLevel=userEXPData.level;
		userEXPData.level = Skinner.getLevel(userEXPData.exp);
        if(userEXPData.exp >= userEXPData.nextLevelEXP || isNaN(userEXPData.nextLevelEXP) || oldLevel!=userEXPData.level) {
            userEXPData.nextLevelEXP = Skinner.getMinEXP(userEXPData.level);
            
			//set to >1 in case of level 0 role or for a hidden "point of trust" level
			if(this.announcesLevels)
				e.message.channel.sendMessage("Level up! " + e.message.member.nickMention+ " is now **Level " + userEXPData.level + ".**");
            
            //assign level up roles if appropriate
            if (!this.rolesTable) {
                this.rolesTable = { };
            }
            
			this.roleCheck(e.message.member,userEXPData);
        }
    };
	
	guild.roleCheck = function(member, userEXPData) {
		if(Object.keys(guild.rolesTable).length==0)
			return;
		//give users the role achieved at their level or the next one available bellow it
            let i = userEXPData.level;
		for (i; i >= 0; i--) {
			if (i in this.rolesTable) {
				member.assignRole(this.rolesTable[i]);
				if (!this.roleStack) {
					let n=i;
					for (i--; i >= 0; i--) {
						if(i in this.rolesTable){
							if(this.rolesTable[i] != this.rolesTable[n]){
								member.unassignRole(this.rolesTable[i]);
							}
						}
					}
					//logically unnecessary, but prevents anything goofy in case of revision
					break;
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
        
        this.mayhemRoles = { };
        
        this.lines = { };
        this.actions = { };
        this.channelsPinUpvotes = { };
        
		this.rolesTable = { };
		this.roleStack=false;	
		this.expTable = { };
		this.boostTable = { };
		this.moderators = { };
		this.announcesLevels=false;
		
		this.welcoming = true;
		this.welcomes = { };
		
		this.lastSendLine = undefined;
		
		Guild.add(this);
        
        linkFunctions(this);
    }
    
    static initialize(client) {
        Guild.guilds = { };
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
                linkVariables(Guild.guilds[g]);
                linkFunctions(Guild.guilds[g]);
            }
			console.log("Initialized "+ Object.keys(Guild.guilds).length + " Guilds");
        });
    }
    
    static save() {
        Encrypt.write(guilddb, JSON.stringify(Guild.guilds));
		console.log("Saved Guild Data");
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