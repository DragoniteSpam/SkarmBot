"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");
const Users = require("./user.js");

const guilddb = "../skarmData/guilds.penguin";

const MIN_LINES = 40;

let defaultLines = ["please stand by"];

let messageIsAction = function(message) {
    if (message.startsWith("_") && message.endsWith("_")) return true;
    if (message.startsWith("*") && message.endsWith("*")) return true;
    return false;
};

fs.readFile("data/default.birb", function(err, data) {
    defaultLines = data.toString().split("\n");
});

// I'm not a fan of this, but if you load an older version of an object it
// won't contain new variables that you might have added
const linkVariables = function(guild) {
    if (guild.lines === undefined) guild.lines = { };
    if (guild.actions === undefined) guild.actions = { };
    if (guild.mayhemRoles === undefined) guild.mayhemRoles = { };
    if (guild.notificationChannels === undefined) guild.notificationChannels = {
        NAME_CHANGE:        {},

        BAN:                {},
        VOICE_CHANNEL:      {},

        MEMBER_JOIN_LEAVE:  {},
        ASYNC_HANDLER:      {},
        XKCD:               {},
    };
    if (guild.notificationChannels.ASYNC_HANDLER === undefined) guild.notificationChannels.ASYNC_HANDLER = {};
    if (guild.notificationChannels.XKCD === undefined) guild.notificationChannels.XKCD = {};
    if (guild.activityTable === undefined) guild.activityTable = [ ];
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
                        console.error(e);
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

    guild.queueMessage = function(channel,message,tts,object){
        //console.log("enqueueing...");
        if(!this.channelBuffer){
            this.channelBuffer = {};
        }
        if(channel.id in this.channelBuffer){
            this.channelBuffer[channel.id].push({_1: message, _2:tts, _3: object});
        }else{
            this.channelBuffer[channel.id]=[{_1: message, _2:tts, _3: object}];
        }
        //console.log(`Enqueued message: '${JSON.stringify(this.channelBuffer[channel.id])}' for ${channel.id}`);
        //console.log(`New buffer length: ${this.channelBuffer[channel.id].length}`);
    };

	guild.getRandomLine = function(e) {
        if (messageIsAction(e.message.content)) return this.getRandomAction(e);

        //handle the queue message buffer for e@5 and shanties
        //console.log("checking the buffer...");
        if(typeof(this.channelBuffer)==="undefined") {
            //console.log(`redefining channel buffer: ${JSON.stringify(this.channelBuffer)}`);
            this.channelBuffer = {};
        }
        if(e.message.channel.id in this.channelBuffer) {
            if (this.channelBuffer[e.message.channel.id].length > 0) {
                return this.channelBuffer[e.message.channel.id].shift()._1;
            }else{
                //console.log("no messages in buffer");
            }
        }else{
            //console.log("channel has no buffer. Channel ID:"+e.message.channel.id+"\n guild channelBuffer object:"+JSON.stringify(this.channelBuffer));
        }

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

    /**
     * Handles distributing notifications to guilds
     * @param client the discordie object to retrieve Channel objects to send messages to
     * @param notification the notification ID from Constants.Notifications
     * @param eventObject the relevant data which is unique on a per-notification basis, contained within the object wrapper.  The @notification must specify what its contents are.
     * @return success state:
     *      0 - all good,
     *      1 - not yet implemented,
     *      2 - event not acted upon due to concurrent thread trigger. Occurs on voice channel join and leave
     *      3 - event thrown without proper cause
     */
	guild.notify = function(client, notification, eventObject) {
	    if(guild===undefined)
	        return Skarm.logError("Undefined guild");
        if (notification === Constants.Notifications.MEMBER_LEAVE) {
            let user = eventObject.user;
            for (let channelID in guild.notificationChannels.MEMBER_JOIN_LEAVE) {
                Skarm.sendMessageDelay(client.Channels.get(channelID), " " + JSON.stringify(eventObject.getCachedData()), false, {
                    color: Constants.Colors.RED,
                    description: `**${user.username}#${user.discriminator}** has left the server. (${user.id})`,
                    timestamp: new Date(),
                    footer: {text: "User Leave"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.MEMBER_JOIN) {
            let member = eventObject.member;
            for (let channelID in guild.notificationChannels.MEMBER_JOIN_LEAVE) {
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.GREEN,
                    description: `**${member.username}#${member.discriminator}** has joined the server. (${member.id})`,
                    timestamp: new Date(),
                    footer: {text: "User Join"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.BAN) {//KICK EVENT NOT PROVIDED BY JS DISCORD API's.  SUCH AN EVENT ONLY EXISTS UNDER PYTHON LIBRARIES.
            let member = eventObject.user;
            for (let channelID in guild.notificationChannels.BAN) {
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.RED,
                    description: `**${member.username}#${member.discriminator}** has been banned from the server. (${member.id})`,
                    timestamp: new Date(),
                    footer: {text: "User Banned"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.BAN_REMOVE) {//KICK EVENT NOT PROVIDED BY JS DISCORD API's.  SUCH AN EVENT ONLY EXISTS UNDER PYTHON LIBRARIES.
            let member = eventObject.user;
            for (let channelID in guild.notificationChannels.BAN) {
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.GREEN,
                    description: `**${member.username}#${member.discriminator}** has been unbanned from the server. (${member.id})`,
                    timestamp: new Date(),
                    footer: {text: "Ban Removed"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.VOICE_JOIN) {
            let member = eventObject.user;
            for (let channelID in guild.notificationChannels.VOICE_CHANNEL) {
                //console.log("notify loop: " + JSON.stringify(eventObject));
                let dsc = `**${member.username}#${member.discriminator}** has joined the voice channel. **${eventObject.channel.name}**`;
                if(guild.notificationChannels.ASYNC_HANDLER[member.id]===eventObject.channelId){
                    //console.log(`Previous state is equal to current state: ${guild.notificationChannels.ASYNC_HANDLER[member.id]}`);
                    return 2;
                }else {
                    if (guild.notificationChannels.ASYNC_HANDLER[member.id] != null) {
                        dsc = `**${member.username}#${member.discriminator}** has switched from **${client.Channels.get(guild.notificationChannels.ASYNC_HANDLER[member.id]).name}** to **${client.Channels.get(eventObject.channelId).name}**`;
                    }
                    guild.notificationChannels.ASYNC_HANDLER[member.id] = eventObject.channelId;
                }

                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.GREEN,
                    description: dsc,
                    timestamp: new Date(),
                    footer: {text: "Voice Channel Join"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.VOICE_LEAVE) {
            let member = eventObject.user;
            for (let channelID in guild.notificationChannels.VOICE_CHANNEL) {
                let dsc = `**${member.username}#${member.discriminator}** has left the voice channel. **${eventObject.channel.name}**`;

                if (eventObject.newChannelId != null) {
                    if(guild.notificationChannels.ASYNC_HANDLER[member.id]===eventObject.newChannelId){
                        return 2;
                    }else{
                        if(!guild.notificationChannels.ASYNC_HANDLER[member.id]){
                            Skarm.logError("User channel swap data was lost during downtime.");
                        }else {
                            dsc = `**${member.username}#${member.discriminator}** has switched from **${client.Channels.get(guild.notificationChannels.ASYNC_HANDLER[member.id]).name}** to **${client.Channels.get(eventObject.newChannelId).name}**`;
                            guild.notificationChannels.ASYNC_HANDLER[member.id] = eventObject.newChannelId;
                        }
                    }
                } else {
                    delete guild.notificationChannels.ASYNC_HANDLER[member.id];
                }
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.RED,
                    description: dsc,
                    timestamp: new Date(),
                    footer: {text: "Voice Channel Leave"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.NICK_CHANGE) {
            let member = eventObject.member;
            let oldName="";
            if(eventObject.previousNick){
                oldName=eventObject.previousNick;
            }else{
                oldName=member.username;
            }
            for (let channelID in guild.notificationChannels.NAME_CHANGE) {
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.BLUE,
                    description: `User nickname update: **${oldName}** is now known as **${member.name}**!  (<@${member.id}>)`,
                    timestamp: new Date(),
                    footer: {text: "Nickname change"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.NAME_CHANGE) {
            let member = eventObject.member;
            let oldName= Users.get(eventObject.user.id).previousName;
            Skarm.logError(`Might be sending out name change notification out to guild: ${JSON.stringify(guild.id)}\n> ${JSON.stringify(guild.notificationChannels)}`);
            Skarm.spam("Notification of name change: "+oldName +" -> " + JSON.stringify(eventObject.user));
            if(oldName===undefined){// && !guild.hasPermissions(eventObject.user,Permissions.MOM)){
                Skarm.logError(`scratch that. ${eventObject.user.name} was not detected to have changed names`);
                return 3;
            }
            for (let channelID in guild.notificationChannels.NAME_CHANGE) {
                let dsc = `**${oldName}** is now known as **${member.username}#${member.discriminator}**!  (<@${member.id}>)`;
                Skarm.spam(`Sending message to <#${channelID}> regarding name change of ${oldName}:\n`);
                Skarm.spam(dsc);
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.BLUE,
                    description: dsc,
                    timestamp: new Date(),
                    footer: {text: "Username change"}
                });
            }
            return 0;
        }
        if (notification === Constants.Notifications.XKCD) {//TODO: MAY NOT BE FULLY OPERATIONAL
            for (let channelID in guild.notificationChannels.XKCD) {
                Skarm.spam(`Sending XKCD message to <#${channelID}>`);
                Skarm.sendMessageDelay(client.Channels.get(channelID), eventObject);
            }
            return 0;
        }

    };

	//TODO: make this into timsort if the runtime is bad
	guild.sortActivityTable = function (){
	    for(let i in guild.activityTable){
	        guild.minSortActivityTable(i);
        }
	    return guild.activityTable.sort((a,b)=>{return b.totalWords-a.totalWords;});
    };

    //I'm throwing in -0 at the end of various things to make sure that any numbers stored as strings are cast properly

    //aggregates and cleans up total words then performs a single swap if appropriate
    guild.minSortActivityTable = function (i) {
        //Skarm.spam("Partially sorting at index "+i);
        i=i-0;
        let updatedTotal=0;
        for(let day in guild.activityTable[i].days){
            if(((day-0) + 31*24*60*60*1000)<Date.now()){
                delete guild.activityTable[i].days[day];
            }else{
                //Skarm.spam(guild.activityTable[i].da)
                updatedTotal += guild.activityTable[i].days[day]-0;
            }
        }
        //Skarm.spam("Updated total: "+updatedTotal);
        guild.activityTable[i].totalWords=updatedTotal;
        //Skarm.spam(`new total words for ${JSON.stringify(guild.activityTable[i])}`);

        if(i===0)return;
        //Skarm.spam(i);
        //Skarm.spam(JSON.stringify(guild.activityTable));
        if(guild.activityTable[i].totalWords > guild.activityTable[i-1].totalWords){
            let temp = guild.activityTable[i];
            guild.activityTable[i]=guild.activityTable[i-1];
            guild.activityTable[i-1]=temp;
        }
    };

	guild.updateActivity = function(e) {
	    let day = Date.now();
	    let wordCount = e.message.content.replaceAll("  "," ").replaceAll("\r\n","\n").replaceAll("\n\n","\n").replaceAll("\n"," ").split(" ").length;
	    day -= day % (24* 60* 60* 1000);
	    for(let i in guild.activityTable){
	        let member = guild.activityTable[i];
	        if(member.userID===e.message.author.id){
	            if(day in member.days){
	                member.days[day]+=wordCount;
                }else{
	                member.days[day]=wordCount;
                }
	            guild.minSortActivityTable(i);
	            return;
            }
        }

	    guild.activityTable.push({
            userID:e.message.author.id,
            days:{},
            totalWords:0,
	    });
	    guild.activityTable[guild.activityTable.length-1].days[day]=wordCount;
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

		//[{userID -> String, days -> {Date:Long -> wordCount:Int},totalWords -> Int}]
		this.activityTable = [];

		this.channelBuffer = { };
        /**
         * The collection of channels which have been opted by the moderators to receive various notifications:
         * The contents of each inner object are of the form {channel:String -> timestamp:Float}
         * timestamp correlates to when the value was added to the hashset.
         * @type {{NAME_CHANGE: {}, KICK_BAN: {}, VOICE_CHANNEL: {}, MEMBER_LEAVE: {}, XKCD: {}}}
         */
		this.notificationChannels = {
            /**
             * set of channels which receive name change notifications in this guild.
             * @type{channel:String -> timestamp:Float}
             */
            NAME_CHANGE:            {},

            /**
             * set of channels which receive ban notifications in this guild.
             * @type{channel:String -> timestamp:Float}
             */
            BAN:                    {},

            /**
             * set of channels which receive voice channel activity notifications in this guild.
             * @type{channel:String -> timestamp:Float}
             */
            VOICE_CHANNEL:          {},
            ASYNC_HANDLER:          {},

            /**
             * set of channels which receive member join and leave notifications in this guild.
             * @type{channel:String -> timestamp:Float}
             */
            MEMBER_JOIN_LEAVE:      {},

            /**
             * set of channels which receive xkcds in this guild.
             * @type{channel:String -> timestamp:Float}
             */
            XKCD:                   {},
        };

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
