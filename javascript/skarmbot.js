"use strict";
// actual bot code goes here, because i want to try to only have bot.js
// for delegating work on events
const fs = require("fs");

const { ShantyCollection, Shanty } = require("./shanties.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Commands = require("./commands.js");
const Keywords = require("./keywords.js");
const XKCD = require("./xkcd.js");
const Skinner = require("./skinnerbox.js");
const { spawn } = require("child_process");
const Permissions = require("./permissions.js");


const Users = require("./user.js");
const Guilds = require("./guild.js");

class Bot {
    /**
     * timer30min: tasks skarm will perform once every half hour. Write additional scheduled tasks here.
     * version: the count of how many git commits skarm is currently sitting on.
     * pid: a random number generated and bound to a given version of the Bot class for the sake of being able to terminate a specific instance of skarm when multiple are running during testing or accidental forks occur
     * client: pointer to Discordie object used to access all discord data not supplied by the event skarm has to handle
     *
     * Referneces: Skarm will speak if these are mentioned
     *
     *
     **/
    constructor(client,version) {
        this.version=version;

        this.pid = Math.floor(Math.random()*1024)&(-32)+this.version;
        this.client = client;

        this.nick = "Skarm";
        this.validNickReferences = {
            "skarm":        					1,
            "skram!":       					1,
            "birdbrain":    					1,
            "spaghetti":    					0.1,
            "botface":      					1,
			"something completely different":	1,
        };

        this.skyrimOddsModifier = 1/20;
        //words that will get skarm to talk skyrim
        this.validESReferences = {
            "balgruuf":     0.25,
            "ulfric":       0.25,
            "dovah":      	0.45,
            "whiterun":     0.25,
            "imperial":     0.05,
            "war":          0.05,
            "ysmir":        0.50,
            "shor":         0.69,
        };

        //words that will get skarm singing
        this.validShantyReferences = {
            "johnny":       0.01,
            "jonny":        0.01,
            "jony":         0.01,
            "johny":        0.01,
            "drunk":        0.02,
            "sing":         0.03,
            "rum":          0.04,
            "ship":         0.05,
            "captain":      0.06,
            "sea":          0.08,
            "maui":         0.09,
            "sailor":       0.10,
            "stan":         0.11,
            "shanty":       0.35,
            "shanties":     0.40,
            "dreadnought":  0.50,
			//"shantest":     1.2,
        };


        this.minimumMessageReplyLength = 3;

        this.shanties = new ShantyCollection();
        this.skyrim = fs.readFileSync("./data/skyrim/outtake.skyrim").toString().trim().split("\n");
        this.channelsWhoLikeXKCD = {};

        this.channelsHidden = {};
        this.channelsCensorHidden = {};
        this.guildsWithWelcomeMessage = {};
        this.xkcd = new XKCD(this);
        setTimeout(()=>{{
            for(let channel in this.channelsWhoLikeXKCD){
                let channelGuild;
                try {
                    channelGuild = Guilds.get(client.Channels.get(channel).guild.id);
                }catch (e) {
                    Skarm.logError("Failed to get guild for channel "+channel+"  -  "+JSON.stringify(e));
                    continue;
                }
                //Skarm.logError(channelGuild.id);
                //Skarm.logError(JSON.stringify(channelGuild.notificationChannels));
                channelGuild.notificationChannels.XKCD[channel]=Date.now();
                delete this.channelsWhoLikeXKCD[channel];
            }

            Skarm.log(`Failed to initialize ${Object.keys(this.channelsWhoLikeXKCD).length} xkcd notification channels.`);
            this.xkcd.save();
        }},1000);

        /**
         * keeps a short lifespan cache of messages sent by skarm which are going to be deleted,
         * and provides a fast lane for the author who triggered the message or a moderator to remove the message without waiting for the timer.
         * This hashmap is modified by OnMessageReactionAdd and Skarm.sendMessageDelete
         * @structure MessageID:String: -> {senderID:String,self:Boolean,timeout:JStimeout}
         */
        this.toBeDeletedCache = {};

        this.mapping = Skarm.addCommands(Commands);

        this.keywords = Skarm.addKeywords(Keywords);

        this.games = ["e!help", this.getSpaghetti() + " lines of spaghetti"];
        this.game=0;

        this.timer30min = setInterval(function() {
            this.save(Constants.SaveCodes.DONOTHING);
            this.xkcd.lock--;
            console.log("XKCD Lock state: "+this.xkcd.lock);
        }.bind(this), 30 * 60 * 1000);

        this.timer1min = setInterval(function() {
            if(this.game > -1) {
                this.client.User.setGame({name: this.games[(++this.game) % this.games.length], type: 0});
            }
        }.bind(this),60*1000);
    }

    // events
    OnMessageDelete(e) {
        var string = "";
        if (e.message){
            if (!e.message.author.bot){
                if (!e.message){
                    string = "<message not cached>"; 
                } else {
                    string = e.message.content + " by " +
                        e.message.author.username;
                }
                fs.appendFile("../skarmData/deleted.txt", string + "\r\n", (err) => {
                    if (err){
                        Skarm.logError(err);
                    }
                });
                Constants.Channels.DELETED.sendMessage(string + " <#" +
                    e.message.channel_id + ">");
            }
        }
    }
    
    OnMessageReactionAdd(e) {
        const UPVOTE = 0x2b06;
        const REQUIRED_UPVOTES = 3;
        const REDX = '\u274c';

		if(!e)
			return Skarm.log("encountered null event in OnMessageReactionAdd");
		if(e.message==null)
			return Skarm.log("encountered null message in onMessageReactionAdd");
		if(!e.message.guild)
			return Skarm.log("encountered null guild in OnMessageReactionAdd");
		
		if(e.message.id in this.toBeDeletedCache) {
            for (let i in e.message.reactions) {
                let reaction = e.message.reactions[i];
                //Skarm.log(JSON.stringify(reaction));
                if (reaction.emoji.name === REDX) {
                    if (this.toBeDeletedCache[e.message.id].self) {
                        this.toBeDeletedCache[e.message.id].self = true;
                    } else {
                        if (this.toBeDeletedCache[e.message.id].senderID === e.user.id || Guilds.get(e.message.guild.id).hasPermissions(e.user, Permissions.MOD)) {
                            clearTimeout(this.toBeDeletedCache[e.message.id].timeout);
                            e.message.delete();
                            delete this.toBeDeletedCache[e.message.id];
                        }
                    }
                }
            }
        }

        if (e.message !== null && !e.message.pinned && Guilds.get(e.message.guild.id).channelsPinUpvotes[e.message.channel_id] /*!== undefined && === true */) {
            let upvotes = 0;
            for (let i in e.message.reactions) {
                let reaction = e.message.reactions[i];
                if (reaction.emoji.name.charCodeAt(0) === UPVOTE && ++upvotes === REQUIRED_UPVOTES) {
                    e.message.pin().catch(_ => {console.log('Failed to pin');});
                    break;
                }
            }
        }
    }
    
    OnMemberAdd(e) {
        let guildData = Guilds.get(e.guild.id);
		if(!(e.member.id in guildData.expTable)){
			guildData.expTable[e.member.id] = {
                exp: Skinner.getMinEXP(0),
                level: 0,
                nextLevelEXP: Skinner.getMinEXP(1),
                lastMessage: undefined,
            };
		}
		guildData.roleCheck(e.member,guildData.expTable[e.member.id]);
		guildData.notify(this.client,Constants.Notifications.MEMBER_JOIN,e);
		if(guildData.welcoming){
			for(let channel in guildData.welcomes){
				let sms = guildData.welcomes[channel];
				while(sms.indexOf("<newmember>")>-1){
					sms=sms.replace("<newmember>","<@"+e.member.id+">");
				}
				Skarm.sendMessageDelay(this.client.Channels.get(channel),sms);
			}
		}
    }
    
	OnMemberUpdate(e) {
		if(e.rolesRemoved.length > 0){
			let changes = "Roles removed for " + e.member.username + " in " + e.guild.name + ": ";
			for (let i in e.rolesRemoved) {
				changes += e.rolesRemoved[i].name;
				if (i < e.rolesRemoved.length - 1) {
					changes += ", ";
                }
			}
			Skarm.log(changes);
		}
		if (e.rolesAdded.length > 0){
			let changes = "Roles added for " + e.member.username + " in " + e.guild.name + ": ";
			for (let i in e.rolesAdded) {
				changes += e.rolesAdded[i].name;
				if (i < e.rolesAdded.length - 1) {
					changes += ", ";
                }
			}
			Skarm.log(changes);
		}
		if(e.previousNick !== e.member.nick) Guilds.get(e.guild.id).notify(this.client,Constants.Notifications.NICK_CHANGE, e);
    }

	OnMemberRemove(e) {
        Guilds.get(e.guild.id).notify(this.client,Constants.Notifications.MEMBER_LEAVE,e);
    }

    OnGuildBanAdd(e) {
        Guilds.get(e.guild.id).notify(this.client,Constants.Notifications.BAN, e);
    }

    OnGuildBanRemove(e) {
        Guilds.get(e.guild.id).notify(this.client,Constants.Notifications.BAN_REMOVE, e);
    }

    OnVoiceChannelJoin(e){
        //console.log("Voice join event: "+JSON.stringify(e));
        Guilds.get(e.guildId).notify(this.client,Constants.Notifications.VOICE_JOIN, e);
    }

    OnVoiceChannelLeave(e) {
        //timeout exists to test async condition in which join event arrives first.
        // This will likely only ever arrive first under congested network traffic conditions
        //setTimeout(() => {}, 20);
        //console.log("Voice leave event: " + JSON.stringify(e));
        Guilds.get(e.guildId).notify(this.client, Constants.Notifications.VOICE_LEAVE, e);

    }

    OnMessageCreate(e) {
        // don't respond to other bots (or yourself)
        if (e.message.author.bot) {
            if (e.message.author.id === Constants.ID) {
                if (e.message.content === "sorry...") {
                    setTimeout(function () {
                        e.message.delete();
                    }, 12000);
                }
            }
            return false;
        }

        // i don't know how you would delete a message the instant it's created,
        // but apparently it can happen...
        if (e.message.deleted) {
            return false;
        }
        // don't respond to private messages (yet) //TODO
        if (e.message.isPrivate) {
            e.message.channel.sendMessage("private message responses not yet implemented");
            return false;
        }

        let userData = Users.get(e.message.author.id);
        let guildData = Guilds.get(e.message.channel.guild_id);
        guildData.executeMayhem();
        guildData.updateEXP(e);
        guildData.updateActivity(e);

        // now we can start doing stuff
        let author = e.message.author;
        let text = e.message.content.toLowerCase();
        let first = text.split(" ")[0];

        // this is where all of the command stuff happens
        let cmdData = this.mapping.cmd[first];
        if (cmdData) {
            if (!this.channelsHidden[e.message.channel_id] || !cmdData.ignoreHidden) {
                // i'm not a fan of needing to pass "this" as a parameter to you
                // own functions, but javascript doesn't seem to want to execute
                // functions called in this way in the object's own scope and
                // you don't otherwise have a way to reference it
                if (guildData.hasPermissions(userData, cmdData.perms)) {
                    cmdData.execute(this, e);
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "**" + author.username +
                        "** was not found in the sudoers file. This incident will" +
                        " be reported. Prepare to get coal in your christmas" +
                        " stocking this year, " + author.username + ".");
                }
                return true;
            }
        }

        // ignore messages that mention anyone or anything
        if (e.message.mentions.length > 0 ||
            e.message.mention_roles.length > 0 ||
            e.message.mention_everyone
        ) {
            return false;
        }

        // ignore hidden channels after this
        if (this.channelsHidden[e.message.channel_id]) {
            return false;
        }

        // each of these will kick out of the function if it finds something,
        // so the most important ones should be at the top
        if (!this.channelsCensorHidden[e.message.channel_id]) {
            this.censor(e);
        }

        this.summons(e);

        if (this.mentions(e, this.validESReferences)) {
            this.returnSkyrim(e);
            return true;
        }

        if (this.mentions(e, this.validShantyReferences)) {
            this.singShanty(e);
            return true;
        }


        for (let word in this.keywords) {

            let partial = text;
            let allComponentsMatch = true;
            let components = word.split("*");
            if(components.length===0) continue;
            //make sure every component exists in sequence for matches with multiple parts.
            for(let c in components){
                let component = components[c];
                if(partial.includes(component)){
                    partial = partial.substring(partial.indexOf(component)+component.length);
                }else{
                    allComponentsMatch=false;
                    break;
                }
            }

            if (!allComponentsMatch) {
                continue;
            }

            let keyword = this.keywords[word];
            if (keyword.standalone && (!text.startsWith(word + " ") &&
                !text.endsWith(" " + word) &&
                !text.includes(" " + word + " "))
            ) {
                continue;
            }

            if (Math.random() > keyword.odds) {
                continue;
            }

            keyword.execute(this, e);
            return true;
        }

        //Skarm.spam("Parrot");
        this.parrot(e);

        return false;
    }

    OnPresenceUpdate(e){
        let proceed = (n)=>{
            if(Users.get(e.user.id).previousName)
                return Guilds.get(e.guild.id).notify(this.client, Constants.Notifications.NAME_CHANGE, e);
            else if(n>0){
                return setTimeout(()=>{proceed(n-1);},25);
            }
            //Skarm.spam("Failed to find defined previous name for User ID: "+e.user.id);
            //Skarm.spam("OnPresenceUpdate JSON object retrieved: "+JSON.stringify(Users.get(e.user.id)));
        };
        if(e.user.bot)return;
        //Skarm.spam("Presence Update detected for User : "+ (e.user.id));
        proceed(100);
    }

    OnPresenceMemberUpdate(e){
        if(e.old.username !== e.new.username){
            Users.get(e.new.id).previousName = e.old.username+"#"+e.old.discriminator;
            //Skarm.spam(`Username update set to user object:  ${Users.get(e.new.id).previousName} is now ${e.new.username}`);
            //Skarm.spam("OnPresenceMemberUpdate JSON object for user: "+JSON.stringify(Users.get(e.new.id)));
            setTimeout(() =>{
                Users.get(e.new.id).previousName = undefined;
                //Skarm.spam("Username update timeout");
            },10000);
        }else{
            //Skarm.spam("No change detected: "+e.old.username+" -> "+ e.new.username);
        }
    }

    /**
	* Deletes anything that may not be picked up by garbage collection upon the termination of this object.
	*/
	poisonPill(){
		clearInterval(this.timer30min);
		clearInterval(this.timer1min);
		this.xkcd.poisonPill();
	}
	
    // functionality




    //does many things, and stuff and things...
    censor(e) {
    }
    
    toggleChannel(map, channel) {
        map[channel] = !map[channel];
        return map[channel];
    }
    
    removeChannel(map, channel) {
        map[channel] = false;
    }
    
    addChannel(map, channel) {
        map[channel] = true;
    }
    
    toggleGuild(map, channel) {
        // guilds have a channel associated with them
        if (!!map[channel.guild_id]) {
            map[channel.guild_id] = undefined;
            return false;
        }
        
        map[channel.guild_id] = channel.id;
        return true;
    }
    
    // learning and reciting lines
    parrot(e) {
        if (this.mentions(e, this.validNickReferences)) {
			//once skarm starts singing, he'd rather do that than talk
			let seed = Math.random();
			if(seed < (new Date).getDay()*this.skyrimOddsModifier){
				return this.returnSkyrim(e);
			}
			let guild = Guilds.get(e.message.guild.id);
            let line = guild.getRandomLine(e);
            if (line !== undefined) {
                Skarm.sendMessageDelay(e.message.channel, line);
				guild.lastSendLine=line;
            }
            return;
        }
        
        this.attemptLearnLine(e);
    }

    //skarm will enqueue a shanty to be sung in just the one channel which triggered the song
	singShanty(e) {
	    //console.log("they've started singing");
	    const guildData = Guilds.get(e.message.channel.guild_id);
	    try {
            if (guildData.channelBuffer[e.message.channel.id].length > 0)
                return this.parrot(e);
        }catch (e) {
            Skarm.logError(JSON.stringify(e));
        }
	    guildData.queueMessage(e.message.channel,this.shanties.getNextBlock());
	    while(this.shanties.isSinging)
            guildData.queueMessage(e.message.channel,this.shanties.getNextBlock());
		//Skarm.sendMessageDelay(e.message.channel,this.shanties.getNextBlock());

        if(guildData.channelBuffer[e.message.channel.id].length > 10)
            Skarm.spam(`Warning: Over 10 shanty lines may have been loaded in to be sent to <#${e.message.channel.id}>`);

        this.parrot(e);
	}

	//sends a random skyrim line to the channel which the event message originated from
	returnSkyrim(e){
		Skarm.sendMessageDelay(e.message.channel,this.skyrim[Math.floor(this.skyrim.length * Math.random())]);
	}
    
    getRandomLine(e) {
        return Guilds.get(e.message.guild.id).getRandomLine(e);
    }


    attemptLearnLine(e) {
        if (e.message.content.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)) return;
        let hash = (this.messageHash(e) / 10) % 1;
        if (hash < Constants.Vars.LEARN_MESSAGE_ODDS) {
            Guilds.get(e.message.guild.id).learnLine(e);
        }
    }
    
    messageHash(e) {
        if (e.message.content.length === 0) {
            return 0;
        }
        
        let hash = 0;
        let str = e.message.content.toLowerCase();
        for (let i = 0; i < str.length; i++) {
          hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
        }
        
        return hash;
    }
    
    //checks if anyone's summons are triggered by the message and sends them out
    summons(e) {
        for (let user in Users.users) {
            let userData = Users.get(user);
            for (let term in userData.summons) {
                if (e.message.content.includes(term)) {
                    userData.attemptSummon(e, term);
                    break;
                }
            }
        }
    }
    
    // helpers


    mentions(e, references) {
        var text = e.message.content.toLowerCase();
        
        if (text.split(" ").length < this.minimumMessageReplyLength) {
            return false;
        }
        
        for (let keyword in references) {
            if (text.includes(keyword)) {
                return (Math.random() < references[keyword]);
            }
        }
        
        return false;
    }

    /**
     * Gives skarm the order to save all guild, user, and xkcd data
     * @param saveCode specifying the behavior of the save from Constants.SaveCodes
     */
    save(saveCode) {
        if (saveCode === Constants.SaveCodes.NOSAVE) {
            this.client.disconnect();
            process.exit(Constants.SaveCodes.NOSAVE);
        }

        Skarm.spam("\n\nBeginning save sequence...");
        console.log("\n\nBeginning save sequence...");
        Guilds.save();
        Users.save();
        this.xkcd.save();
        let savior = spawn('cmd.exe', ['/c', 'saveData.bat']);
        savior.on('exit', (code) => {
            console.log("Received code: " + code + " on saving data.");
            if (saveCode === Constants.SaveCodes.DONOTHING)
                return;
            if (saveCode === undefined)
                return;
            setTimeout(() => {
                this.client.disconnect();
                process.exit(saveCode);
            }, 2000);
        });

    }
    
    saveDebug() {
        Guilds.saveDebug();
        Users.saveDebug();
    }
    

    // javascript devs would be happier if you did this with promises and async.
    // i can't say i care enough to deal with promises and async.
    getSpaghetti() {
        let lines = 0;
        let files = fs.readdirSync("./javascript/");
        for (let i in files) {
            lines = lines + this.lineCount("./javascript/" + files[i]);
        }
        return lines + this.lineCount("./bot.js");
    }
    
    lineCount(file) {
        return fs.readFileSync(file).toString().split("\n").length;
    }
}

module.exports = Bot;
