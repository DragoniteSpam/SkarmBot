"use strict";
// actual bot code goes here, because i want to try to only have bot.js
// for delegating work on events
const fs = require("fs");
const { spawn } = require("child_process");

const { ShantyCollection, Shanty } = require("./shanties.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Commands = require("./commands.js");
const Keywords = require("./keywords.js");
const XKCD = require("./xkcd.js");
const Skinner = require("./skinnerbox.js");

const Users = require("./user.js");
const Guilds = require("./guild.js");

class Bot {
    constructor(client) {
        this.timer30min = setInterval(function() {
            this.save(Constants.SaveCodes.DONOTHING);
        }.bind(this), 30*60*1000);

        this.client = client;
        this.nick = "Skarm";
        
        // referneces: you will speak if these are mentioned
        this.validNickReferences = {
            "skarm":        					1,
            "skram!":       					1,
            "birdbrain":    					1,
            "spaghetti":    					0.05,
            "botface":      					1,
			"something completely different":	1,
        };
        
        this.validESReferences = {
            "balgruuf":     0.25,
            "ulfric":       0.25,
            "dovah":      	0.45,
            "whiterun":     0.25,
            "imperial":     0.05,
            "war":          0.05,
            "ysmir":        0.50,
        };
        
        this.validShantyReferences = {
			"johnny":       0.05,
			"jonny":        0.05,
			"jony":         0.05,
			"johny":        0.05,
			"drunk":        0.10,
            "sing":         0.15,
			"rum":          0.20,
            "ship":         0.25,
			"captain":      0.30,
			"shanty":       0.35,
			"shanties":     0.40,
			"sea":          0.40,
			"maui":         0.45,
			"sailor":       0.50,
			"stan":         0.55,
			"dreadnought":  0.60,
			//"shantest":   1.2,
        };
        
        this.minimumMessageReplyLength = 3;
        
        this.shanties = new ShantyCollection();
		this.skyrim = fs.readFileSync("./data/skyrim/outtake.skyrim").toString().trim().split("\n");
		this.skyrimOddsModifier = 1/20; 
        this.channelsWhoLikeXKCD = {};
        this.channelsHidden = {};
        this.channelsCensorHidden = {};
        this.guildsWithWelcomeMessage = {};
        
        this.xkcd = new XKCD();
        
        this.mapping = Skarm.addCommands(Commands);
        this.keywords = Skarm.addKeywords(Keywords);
    }
    
    // events
    OnMessageDelete(e) {
        var string = "";
        if (e.message != null){
            if (!e.message.author.bot){
                if (e.message == null){
                    string = "<message not cached>"; 
                } else {
                    string = e.message.content + " by " +
                        e.message.author.username;
                }
                fs.appendFile("./deleted.txt", string + "\r\n", (err) => {
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
        
		if(!e.message.guild)
			return;
		
		
		
        if (e.message !== null && !e.message.pinned && Guilds.get(e.message.guild.id).channelsPinUpvotes[e.message.channel_id] /*!== undefined && === true */) {
            let upvotes = 0;
            for (let i in e.message.reactions) {
                let reaction = e.message.reactions[i];
                if (reaction.emoji.name.charCodeAt(0) === UPVOTE && ++upvotes == REQUIRED_UPVOTES) {
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
		if(guildData.welcoming){
			for(let channel in guildData.welcomes){
				let sms = guildData.welcomes[channel];
				while(sms.indexOf("<newmember>")>-1){
					sms=sms.replace("<newmember>","<@"+e.member.id+">");
				}
				this.client.Channels.get(channel).sendMessage(sms);
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
	}
	
    OnMessageCreate(e) {
        // don't respond to other bots (or yourself)
        if (e.message.author.bot) {
            return false;
        }
        
        let userData = Users.get(e.message.author.id);
        let guildData = Guilds.get(e.message.channel.guild_id);
        guildData.executeMayhem();
        
        // i don't know how you would delete a message the instant it's created,
        // but apparently it can happen...
        if (e.message.deleted) {
            return false;
        }
        // don't respond to private messages (yet) //TODO
        if (e.message.isPrivate) {
            e.message.channel.sendMessage("private message responses not yet " +
                "implemented"
            );
            return false;
        }
        
        guildData.updateEXP(e);
		
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
        if(!this.channelsCensorHidden[e.message.channel_id]){
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
            if (!text.includes(word)) {
                continue;
            }
            
            let keyword = this.keywords[word];
            if (keyword.standalone && (!text.startsWith(word + " ") &&
                    !text.endsWith(" " + word) &&
                    !text.includes(" " + word + " "))
                ) {
                continue;
            }
            
            if (Math.random() > keyword.odds && false) {
                continue;
            }
            
            keyword.execute(this, e);
            return true;
        }
        
        this.parrot(e);
        
        return false;
    }
    
    
    // functionality
    censor(e) {
    }
    
    toggleChannel(map, channel) {
        map[channel] = !map[channel];
        return map[channel];
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
			if (this.shanties.isSinging && seed<this.shanties.ivanhoe * this.shanties.drinkCount()) {
				return this.singShanty(e);
            }
			//reset the seed weight
			if(this.shanties.isSigning)
				seed = (seed + this.shanties.ivanhoe * this.shanties.drinkCount())/(1+this.shanties.ivanhoe * this.shanties.drinkCount());
			//roll for skyrim
			if(seed < (new Date).getDay()*this.skyrimOddsModifier){
				return this.returnSkyrim(e);
			}
			
            let line = this.getRandomLine(e);
            if (line !== undefined) {
                Skarm.sendMessageDelay(e.message.channel, line);
            }
            return;
        }
        
        this.attemptLearnLine(e);
    }
	
	singShanty(e) {
		Skarm.sendMessageDelay(e.message.channel,this.shanties.getNextBlock());
	}
	
	returnSkyrim(e){
		Skarm.sendMessageDelay(e.message.channel,this.skyrim[Math.floor(this.skyrim.length * Math.random())]);
	}
    
    getRandomLine(e) {
        return Guilds.get(e.message.guild.id).getRandomLine(e);
    }
    
    attemptLearnLine(e) {
        let hash = (this.messageHash(e) / 10) % 1;
        if (hash < Constants.Vars.LEARN_MESSAGE_ODDS) {
            Guilds.get(e.message.guild.id).learnLine(e);
        }
    }
    
    messageHash(e) {
        if (e.message.content.length == 0) {
            return 0;
        }
        
        let hash = 0;
        let str = e.message.content.toLowerCase();
        for (let i = 0; i < str.length; i++) {
          hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
        }
        
        return hash;
    }
    
    // summons
    summons(e) {
        let content = e.message.content;
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
    
    save(saveCode) {
        Guilds.save();
        Users.save();
		let savior = spawn('cmd.exe', ['/c', 'saveData.bat']);
		savior.on('exit', (code) =>{
			console.log("Recieved code: "+code+" on saving data to GIT");
			if(saveCode===Constants.SaveCodes.DONOTHING)
				return;
			if(saveCode===undefined)
				return;
			setTimeout(() => {process.exit(saveCode);},2000);
		});
    }
    
    saveDebug() {
        Guilds.saveDebug();
        Users.saveDebug();
    }
    
    setGame(game) {
        if (!game) game = this.getSpaghetti() + " lines of spaghetti";
        this.client.User.setGame({ name: game, type: 0 });
        return game;
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