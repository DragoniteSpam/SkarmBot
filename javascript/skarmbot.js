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
    constructor(client, version) {
        this.version=version;

        //upper bits: randomly generated.  Lower bits: mod of version number
        this.pid = Math.floor(Math.random()*Constants.processIdMax)<<Constants.versionOffsetBits + this.version%Constants.versionOffsetBits;
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
            "jon":          0.01,
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

        this.guildsWithWelcomeMessage = {};
        this.xkcd = new XKCD(this);


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
            if(this.game > Constants.GameState.MANUAL) {
                this.client.User.setGame({name: this.games[(++this.game) % this.games.length], type: 0});
            }
        }.bind(this),60*1000);
    }

    // events
    OnMessageDelete(message) {
        let string = "";
        if (message){
            if (!message.author.bot){
                if (!message){
                    string = "<message not cached>"; 
                } else {
                    string = message.content + " by " + message.author.username;
                }
                fs.appendFile("../skarmData/deleted.txt", string + "\r\n", (err) => {
                    if (err){
                        Skarm.logError(err);
                    }
                });
                Constants.Channels.DELETED.sendMessage(string + " <#" + message.channel.id + ">");
            }
        }
    }
    
    OnMessageReactionAdd(e) {
        const UPVOTE = 0x2b06;
        const REDX = '\u274c';

		if(!e)
			return Skarm.spam("encountered null event in OnMessageReactionAdd");
		if(e.message==null)
			return Skarm.spam("encountered null message in onMessageReactionAdd");
		if(!e.message.guild)
			return Skarm.spam("encountered null guild in OnMessageReactionAdd");

        let guildData = Guilds.get(e.message.guild.id);
        const REQUIRED_UPVOTES = guildData.channelsPinUpvotes[e.message.channel.id];

		if(e.message.id in this.toBeDeletedCache) {
            for (let i in e.message.reactions) {
                let reaction = e.message.reactions[i];
                //Skarm.log(JSON.stringify(reaction));
                if (reaction.emoji.name === REDX) {
                    if (this.toBeDeletedCache[e.message.id].self) {
                        this.toBeDeletedCache[e.message.id].self = true;
                    } else {
                        if (this.toBeDeletedCache[e.message.id].senderID === e.user.id || guildData.hasPermissions(e.user, Permissions.MOD)) {
                            clearTimeout(this.toBeDeletedCache[e.message.id].timeout);
                            e.message.delete();
                            delete this.toBeDeletedCache[e.message.id];
                        }
                    }
                }
            }
        }

        if (e.message !== null && !e.message.pinned && REQUIRED_UPVOTES) {
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
        guildData.assignNewMemberRoles(e.member, e.guild, this.client.User);
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
			Skarm.spam(changes);
		}
		if (e.rolesAdded.length > 0){
			let changes = "Roles added for " + e.member.username + " in " + e.guild.name + ": ";
			for (let i in e.rolesAdded) {
				changes += e.rolesAdded[i].name;
				if (i < e.rolesAdded.length - 1) {
					changes += ", ";
                }
			}
			Skarm.spam(changes);
		}
		if(e.member){
		    if(e.previousNick !== e.member.nick) {
                Guilds.get(e.guild.id).notify(this.client, Constants.Notifications.NICK_CHANGE, e);
            }
        }else{
		    Skarm.spam(Constants.Moms.MASTER.mention);
		    Skarm.spam(JSON.stringify(e));
        }
    }

	OnMemberRemove(e) {
        Guilds.get(e.guild.id).notify(this.client,Constants.Notifications.MEMBER_LEAVE, e);
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

        this.summons(e);

        // in the event that we eventually add PM responses, it would probably
        // be a bad idea to try to execute the mayhem colors on it
        if (!e.message.isPrivate) {
            //always run these per-guild functions
            guildData.executeMayhem(this.client.User);
            guildData.updateEXP(e);
            guildData.updateActivity(e);
            guildData.appendZipfData(e.message.content);
        }

        // now we can start doing stuff
        let author = e.message.author;
        let text = e.message.content.toLowerCase();
        let first = text.split(" ")[0];

        // check if message has prior commitments to attend to in the channel
        let userChannelState = userData.actionState[e.message.channel.id];
        if(userChannelState){
            let handler = userChannelState.handler;              // save handler
            clearTimeout(userChannelState.timeout);              // destroy timeout
            delete userData.actionState[e.message.channel.id];   // destroy state remnant
            handler(e);                                          // handle state
            return;
        }

        // this is where all of the command stuff happens
        let cmdData = this.mapping.cmd[first];
        let helpData = this.mapping.help[first];
        let data = cmdData || helpData;
        if (data) {
            if (!guildData.hiddenChannels[e.message.channel.id] || !data.ignoreHidden) {
                // i'm not a fan of needing to pass "this" as a parameter to you
                // own functions, but javascript doesn't seem to want to execute
                // functions called in this way in the object's own scope and
                // you don't otherwise have a way to reference it
                if (guildData.hasPermissions(userData, data.perms)) {
                    if(cmdData) {
                        data.execute(this, e, userData, guildData);
                    }
                    if(helpData) {
                        data.help(this, e);
                    }
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "**" + author.username +
                        "** was not found in the sudoers file. This incident will" +
                        " be reported. Prepare to get coal in your christmas" +
                        " stocking this year, " + author.username + ".");
                }
                return true;
            }else{
                Skarm.spam(`Attempted to use command \`${e.message.content}\` in channel: \`${e.message.channel.id}\``);
            }
        }

        // ignore messages that mention anyone or anything
        if (e.message.mentions.length > 0 ||
            e.message.mention_roles.length > 0 ||
            e.message.mention_everyone) {
            return false;
        }

        // ignore hidden channels after this
        if (guildData.hiddenChannels[e.message.channel.id]) {
            return false;
        }


        if (this.mentions(e, this.validESReferences) && this.isValidResponse(e)) {
            this.returnSkyrim(e);
            return true;
        }

        if (this.mentions(e, this.validShantyReferences) && this.isValidResponse(e)) {
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

            Skarm.spam(`hit on keyword: "${word}"`);

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

            /**
             * This is a hacked together fix because as of 51/02/22, the module keywords.js is not properly reading the require(Constants) line at the head of its own file within functions
             * As a consequence of this, the constants are injected as a property of the message creation event.
             * This was done as a sub-property of the message creation event to avoid restructuring keyword.execute parameters for every command as hopefully a fix will quickly be found for this.
             * @type {Constants}
             * @private
             */
            e._constants = Constants;
            e._userData = userData;

            keyword.execute(this, e, userData, guildData);
            return true;
        }


        if(this.isValidResponse(e)){
            this.parrot(e, guildData.aliases);
        }

        return false;
    }

    OnPresenceUpdate(e){
        let proceed = (n)=>{
            if(Users.get(e.user.id).previousName) {
                return Guilds.get(e.guild.id).notify(this.client, Constants.Notifications.NAME_CHANGE, e);
            }
            if(n>0){
                return setTimeout(()=>{proceed(n-1);},25);
            }
        };
        if(e.user.bot)return;
        //Skarm.spam("Presence Update detected for User : "+ (e.user.id));
        proceed(100);
    }

    OnPresenceMemberUpdate(e){
        if(e.old.username !== e.new.username){
            Users.get(e.new.id).previousName = e.old.username+"#"+e.old.discriminator;
            console.log(`Old username ${e.old.username} updated to new username ${e.new.username}`);
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




    toggleChannel(map, channel) {
        map[channel] = !map[channel];
        return map[channel];
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

    /**
     * Learning and reciting lines
     * @param e
     * @param additionalAliases optional additional aliases to check against
     * @param channel an override target channel if you don't want to use e.message.channel
     */
    parrot(e, additionalAliases, channel) {
        channel = channel || e.message.channel;
        let guildId = (channel && channel.guild.id) || e.message.guild.id;
        if (this.mentions(e, this.validNickReferences) || (additionalAliases && this.mentions(e, additionalAliases))) {
			//once skarm starts singing, he'd rather do that than talk
			let seed = Math.random();
			if(seed < (new Date).getDay()*this.skyrimOddsModifier){
				return this.returnSkyrim(e);
			}
			let guild = Guilds.get(guildId);
            let line = guild.getRandomLine(e);
            if (line !== undefined) {
                Skarm.sendMessageDelay(channel, line);
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

    /**
     * Generates a deterministic hash of a message based on the message content and message author ID
     * @param e
     * @returns {number}
     */
    messageHash(e) {
        if (e.message.content.length === 0) {
            return 0;
        }
        
        let hash = e.message.author.id % Constants.Vars.USER_OFFSET_MOD;
        let str = e.message.content.toLowerCase();
        for (let i = 0; i < str.length; i++) {
          hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
        }

        // console.log(e.message.content, hash);
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


    isValidResponse(e) {
        let text = e.message.content.toLowerCase();
        return !(text.split(" ").length < this.minimumMessageReplyLength);
    }

    mentions(e, references) {
        let text = e.message.content.toLowerCase();

        
        for (let keyword of Object.keys(references)) {
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

        Skarm.STDERR("\n\nBeginning save sequence at " + new Date());

        Guilds.save();
        Users.save();
        this.xkcd.save();

        Skarm.STDERR("Beginning push to cloud storage...");

        let savior = spawn('powershell.exe', [Constants.skarmRootPath + 'saveData.ps1']);
        savior.stdout.on("data", (data) => {
            data = data.toString().replaceAll("\r","").replaceAll("\n","");
            if(data.length > 1)
                Skarm.STDERR(data);
        });
        savior.stderr.on("data", (data) => {
            data = data.toString().replaceAll("\r","").replaceAll("\n","");
            if(data.length > 1)
                Skarm.STDERR(data);
        });
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
        let dirPaths = [
            "./javascript/",
            "./javascript/guildClasses/"
        ];
        for(let dirPath of dirPaths) {
            let files = fs.readdirSync(dirPath);
            for (let i in files) {
                if (files[i].includes(".js"))
                    lines = lines + this.lineCount(dirPath + files[i]);
            }
        }
        return lines + this.lineCount("./bot.js");
    }
    
    lineCount(file) {
        return fs.readFileSync(file).toString().split("\n").length;
    }
}

module.exports = Bot;
