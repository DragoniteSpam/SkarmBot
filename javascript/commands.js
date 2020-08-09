"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Web = require("./web.js");

const Users = require("./user.js");
const Guilds = require("./guild.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");

let commandParamTokens = function(message) {
    let tokens = message.trim().split(" ");
    tokens.shift();
    return tokens;
};
let commandParamString = function(message) {
    let tokens = message.trim().split(" ");
    tokens.shift();
    return tokens.join(" ");
};

module.exports = {
    // general
    Actions: {
        aliases: ["action", "actions", "actioncount"],
        params: [],
        usageChar: "!",
        helpText: "Returns the number of actions in Skarm's log for the current server.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let guild = e.message.guild;
            Skarm.sendMessageDelay(e.message.channel, "Actions known for **" +
                guild.name + "**: " + Guilds.get(guild.id).getActionCount());
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Lines: {
        aliases: ["line", "lines", "linecount"],
        params: [],
        usageChar: "!",
        helpText: "Returns the number of messages in Skarm's log for the current server.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let guild = e.message.guild;
            Skarm.sendMessageDelay(e.message.channel, "Lines known for **" +
                guild.name + "**: " + Guilds.get(guild.id).getLineCount());
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Google: {
        aliases: ["google"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns the results of a Google search of the specified query.",
        ignoreHidden: true,
        
        execute(bot, e) {
            Web.google(bot, e, commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Stack: {
        aliases: ["stack", "so", "stackoverflow"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns a Stackoverflow search for the given query",
        ignoreHidden: true,
        
        execute(bot, e) {
            Web.stackOverflow(bot, e, commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Suggest: {
        aliases: ["suggest", "suggestion"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Submit a suggestion for the bot for future consideration. Abusing this command will result in the death star being fired in the general vicinity of your house.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let userData = Users.get(e.message.author.id);
            let guildData = Guilds.get(e.message.guild.id);
            if (userData.getSuggestionBlacklist()) return;
            
            let discordUserData = e.message.author;
            let tokens = commandParamTokens(e.message.content);
            if (tokens.length == 0) {
                Skarm.sendMessageDelay(e.message.channel, "Please include a message with your suggestion!");
                return;
            }
            Skarm.sendMessageDelay(Constants.Channels.SUGGESTIONS, "Suggestion from **" + discordUserData.username + "#" + discordUserData.discriminator + ":** " + tokens.join(" "));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Skarll: {
        aliases: ["skarm"],
        params: [],
        usageChar: "!",
        helpText: "Provides a nanosecondly forecast of what the odds are that skarm will say something stupid (100%) and more importantly: what stupid thing Skarm'll say.",
        ignoreHidden: true,
        
        execute(bot, e) {
			let shanty = Math.floor(bot.shanties.ivanhoe*bot.shanties.drinkCount()*100);
			let skyrim=Math.floor((new Date).getDay()*bot.skyrimOddsModifier*100);
            Skarm.sendMessageDelay(e.message.channel, "Current shanty forecast: **" +shanty+"%**\n"+
			"The Elder Scrolls Forecast: **"+skyrim+"%**\n"+
			"Something completely normal: **0%**\n"+
			"Something completely different: **"+(100-shanty-skyrim)+"%**."
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Sudo: {
        aliases: ["sudo", "su"],
        params: ["mention"],
        usageChar: "!",
        helpText: "Shows the user's access level (pleb, moderator, admin, Mom, etc).",
        ignoreHidden: true,
        
        execute(bot, e) {
            let guildData = Guilds.get(e.message.guild.id);
			let words=commandParamTokens(e.message.content);
			let userData = Users.get(e.message.author.id);
            
			
			let member;
			if(words.length==1){
				let id=words[0].replace("<","").replace("@","").replace("!","").replace(">","");
				member=Guilds.client.Users.get(id).memberOf(e.message.guild);
				userData=Users.get(id);
				if(member==null){
					Skarm.sendMessageDelay("Failed to find mentioned member. Please try again using the format `e!su <@userID>`");
					return;
				}
			}else{
				member = e.message.author.memberOf(e.message.guild);
            }
            let permissions = guildData.getPermissions(userData);
            let permNames = [ ];
            
            if (permissions === Permissions.NOT_IN_GUILD) permNames.push("NOT_IN_GUILD");
            if (permissions & Permissions.RESTIRCTED) permNames.push("RESTIRCTED");
            if (permissions & Permissions.BASE) permNames.push("BASE");
            if (permissions & Permissions.MOD) permNames.push("MOD");
            if (permissions & Permissions.ADMIN) permNames.push("ADMIN");
            if (permissions == Permissions.SUDO) permNames.push("MOM");
            
			
            Skarm.sendMessageDelay(e.message.channel, "Current permissions of **" +
                member.name + "** in **" + e.message.guild.name + ":**\n" +
                permNames.join(", ")
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Knight: {
        aliases: ["mod", "knight"],
        params: ["member"],
        usageChar: "@",
        helpText: "Administrator command for appointing and removing moderators.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let userData = Users.get(e.message.author.id);
            let guildData = Guilds.get(e.message.guild.id);
			let words=commandParamTokens(e.message.content);
			if(!guildData.moderators)
				guildData.moderators={ };
			if(words.length==0){
				let list = Object.keys(guildData.moderators);
				if(list.length==0){
					Skarm.sendMessageDelay(e.message.channel,"The administrators have not approved of any mods at this time. Use `e@mod @member` to add someone to the mod list.");
					return;
				}
				
				let mods = "";
				for(let i in list){
					var mod =Guilds.client.Users.get(list[i]);
					if(mod!=null)
						mods+= mod.username+", ";
				}
				Skarm.sendMessageDelay(e.message.channel,"The current moderators in this guild are: "+mods.substring(0,mods.length-2));
				return;
			}
			//no param => list mods
			
			//mention => toggle
            let member = words[0].replace("<","").replace("@","").replace("!","").replace(">","");
			
			Skarm.log("Toggling state of: "+member);
			
			if(member in guildData.moderators){
				delete guildData.moderators[member];
				Skarm.sendMessageDelay(e.message.channel,"Removed <@"+member+"> from the moderators list.");
				
			}else{
				guildData.moderators[member]=Date.now();
				Skarm.sendMessageDelay(e.message.channel,"Added <@"+member+"> to the moderators list.");
			}
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Summon: {
        aliases: ["summon", "summons"],
        params: ["add|remove|list", "term"],
        usageChar: "!",
        helpText: "Skarm can be asked to send you notifications for messages with certain keywords (often your username, or other topics you like to know about - for example, \"Wooloo\" or \"programming\"). You can add, remove, or list your summons.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let params = commandParamTokens(e.message.content.toLowerCase());
            let userData = Users.get(e.message.author.id);
            let action = params[0];
            let term = params[1];
            if (action === "add") {
                if (userData.addSummon(term)) {
                    Skarm.sendMessageDelay(e.message.channel, "**" + term + "** is now a summon for " + e.message.author.username + "!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "Could not add the term " + term + " as a summon. (Has it already been added?)");
                }
                return;
            }
            if (action === "remove") {
                if (userData.removeSummon(term)) {
                    Skarm.sendMessageDelay(e.message.channel, "**" + term + "** is no longer a summon for " + e.message.author.username + "!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "Could not remove the term " + term + " as a summon. (Does it exist in the summon list?)");
                }
                return;
            }
            if (action === "list") {
                let summonString = userData.listSummons();
                if (summonString.length == 0) {
                    Skarm.sendMessageDelay(e.message.channel, "**" + e.message.author.username + "**, you currently have no summons!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "**" + e.message.author.username + "**, your current summons are:\n```" + summonString + "```");
                }
                return;
            }
            
            Skarm.erroneousCommandHelpPlease(e.message.channel, this);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Wolfy: {
        aliases: ["wolfram", "wolfy"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns a Wolfram|Alpha API request for the given query.",
        ignoreHidden: true,
        
        execute(bot, e) {
            Web.wolfy(bot, e, commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    XKCD: {
        aliases: ["xkcd"],
        params: ["id"],
        usageChar: "!",
        helpText: "Returns the XKCD with the specified ID",
        ignoreHidden: true,
        
        execute(bot, e) {
			let words = commandParamTokens(e.message.content);
            if (words.length == 0) {
                Skarm.sendMessageDelay(e.message.channel, "Please specify the ID of the xkcd you want to fetch!");
                return;
            }
            bot.xkcd.post(e.message.channel, words[0]);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    // we're still trying to persuade ourselves that these are funny
    Drago: {
        aliases: ["drago", "dragonite"],
        params: [],
        usageChar: "!",
        helpText: "reminds the bot author to get some sunshine once in a while",
        ignoreHidden: true,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "go play outside dragonite");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    //levels
	Rank: {
		aliases: ["rank","level"],
        params: ["<optionally mention a guild member>"],
        usageChar: "!",
        helpText: "returns how much exp you have in the guild",
        ignoreHidden: true,
        
        execute(bot, e) {
			let guildData =Guilds.get(e.message.channel.guild_id);
			let target = e.message.author.id;
			let tok =commandParamTokens(e.message.content);
			if(tok.length==1){
				tok = tok[0].replace("<","").replace("@","").replace(">","").replace("!","");
				if(!(tok in guildData.expTable)){
					Skarm.sendMessageDelay(e.message.channel,"Error: this user may have not talked at all or you didn't mention them properly.");
					return;
				}
				target = tok;
			}
			let user = guildData.expTable[target];
			let exp = user.exp;
			let lvl = user.level;//Skinner.getLevel(exp);
			let toNextLvl = user.nextLevelEXP-exp;
            Skarm.sendMessageDelay(e.message.channel, "Current total EXP: " +
                exp + "\nEXP required to go for next level: " +
                toNextLvl + "\nCurrent level: " + lvl);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	SRank: {
		aliases: ["srank","slevel"],
        params: ["exp"],
        usageChar: "@",
        helpText: "sets how much exp you have in the guild",
        ignoreHidden: true,
        
        execute(bot, e) {
			if (!Guilds.get(e.message.channel.guild_id).hasPermissions(Users.get(e.message.author.id), Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			let user = Guilds.get(e.message.channel.guild_id).expTable[e.message.author.id];
			user.exp = commandParamTokens(e.message.content)[0] - 0;
			user.level = Skinner.getLevel(user.exp);
			user.nextLevelEXP = Skinner.getMinEXP(user.level);
            Skarm.sendMessageDelay(e.message.channel, "Current total EXP: " + user.exp + "\nEXP required to go for next level: " + (user.nextLevelEXP - user.exp) + "\nCurrent level: " + user.level);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	RoleStack: {
		aliases: ["rolestack"],
        params: ["enable/disable"],
        usageChar: "@",
        helpText: "Toggles whether or not to keep previous roles when rewarding a new level up role.",
        ignoreHidden: true,
        
        execute(bot, e) {
			if (!Guilds.get(e.message.channel.guild_id).hasPermissions(Users.get(e.message.author.id), Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			let guildData = Guilds.get(e.message.channel.guild_id);
			let tokens = commandParamTokens(e.message.content);
			if(tokens.length==0){
				Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+((guildData.roleStack)?" currently rewards":" doesn't currently reward")+" stacked roles");
				return;
			}
			if(tokens[0]=="enable" || tokens[0]=="e"){
				guildData.roleStack=true;
				Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+" will now reward stacked roles");
				return;
			}
			if(tokens[0]=="disable" || tokens[0]=="d"){
				guildData.roleStack=false;
				Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+" will not reward stacked roles");
				return;
			}
			Skarm.help(this,e);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	ViewRoleReward: {
		aliases: ["rolerewards"],
		params: [],
		usageChar: "!",
		helpText: "Displays roles rewarded for leveling up",
		ignoreHidden:true,
		execute(bot,e){
			let roles = Guilds.get(e.message.guild.id).rolesTable;
			if(Object.keys(roles).length==0){
				Skarm.sendMessageDelay(e.message.channel,"No roles configured to be rewarded from leveling up in "+e.message.guild.name);
				return;
			}
			let msg = "\n>>> ";
			for(let i in roles){
				msg+=i+"=>\t<@&"+roles[i]+">";
			}
			Skarm.sendMessageDelay(e.message.channel,"Roles rewarded from leveling up in "+e.message.guild.name+msg);
		},
		help(bot, e) {
            Skarm.help(this, e);
        },
	},
	SetRoleReward: {
		aliases: ["setlevelreward","levelreward","reward","slr"],
		params: ["level","@role | unbind"],
		usageChar:"@",
		helpText: "Configures a role reward for reaching a certain level. Only one role can be assigned to be granted at any given level. Current maximum level is: "+Skinner.EXPREQ.length,
		ignoreHidden:true,
		execute(bot, e) {
			if(e.message.guild==null){
				Skarm.sendMessageDelay(e.message.channel, "Error: guild not found.");
				return;
			}
			if (!Guilds.get(e.message.channel.guild_id).hasPermissions(Users.get(e.message.author.id), Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			let pars = commandParamTokens(e.message.content);
			if(pars.length!=2){
				if(pars.length==0){
					let roles = Guilds.get(e.message.guild.id).rolesTable;
					if(Object.keys(roles).length==0){
						Skarm.sendMessageDelay(e.message.channel,"No roles configured to be rewarded from leveling up in "+e.message.guild.name);
						return;
					}
					let msg = "\n>>> ";
					for(let i in roles){
						msg+=i+"=>\t<@&"+roles[i]+">";
					}
					Skarm.sendMessageDelay(e.message.channel,"Roles rewarded from leveling up in "+e.message.guild.name+msg);
					return;
				}
				Skarm.help(this,e);
				return;
			}
			if(!((pars[0]-0)<Skinner.EXPREQ.length && (pars[0]-0)>=0)){
				Skarm.help(this,e);
				return;
			}
			if(pars[1]==="unbind"){
				delete Guilds.get(e.message.guild.id).rolesTable[pars[0]-0];
				Skarm.sendMessageDelay(e.message.channel,"Unbound role attached to level "+pars[0]);
				return;
			}
			pars[1]=pars[1].replace("<","").replace("@","").replace("&","").replace(">","");
			if(pars[1]>0){
				Guilds.get(e.message.guild.id).rolesTable[pars[0]-0]=pars[1];
				Skarm.sendMessageDelay(e.message.channel,"Set level "+pars[0]+" to reward <@&"+pars[1]+">");
				return;
			}
			Skarm.help(bot,e);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	GuildAnnouncementSwitch: {
		aliases: ["announce","levelannounce"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the state of announcing when a user levels up in the guild",
        ignoreHidden: true,
        
        execute(bot, e) {
			if (!Guilds.get(e.message.channel.guild_id).hasPermissions(Users.get(e.message.author.id), Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			Guilds.get(e.message.channel.guild_id).announcesLevels= !Guilds.get(e.message.channel.guild_id).announcesLevels;
			if(Guilds.get(e.message.channel.guild_id).announcesLevels){
				Skarm.sendMessageDelay(e.message.channel,"Level ups will now be announced in this guild");
				return;
			}
			Skarm.sendMessageDelay(e.message.channel,"Level ups will no longer be announced in this guild");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	RoleRefresh: {
		aliases: ["role","refresh","rolerefresh"],
        params: [],
        usageChar: "!",
        helpText: "Refreshes level up role assignments (Role rewards need to be configured for this to do anything useful)",
        ignoreHidden: true,
        
        execute(bot, e) {
			let guile = Guilds.get(e.message.channel.guild_id);
			guile.roleCheck(e.message.member,guile.expTable[e.message.author.id]);
			Skarm.sendMessageDelay(e.message.channel,"Refreshed your roles!");
			return;
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	// special
	Hug: {
        aliases: ["hug"],
        params: ["<victim>"],
        usageChar: "!",
        helpText: "Hugs a target, or defaults to the summoner.",
        ignoreHidden: true,
        
        execute(bot, e) {
			let target = commandParamTokens(e.message.content)[0];
			if(target == null) target = e.message.author.username;
            Skarm.sendMessageDelay(e.message.channel, "_hugs " + target + "_");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Help: {
        aliases: ["help"],
        params: ["[term]"],
        usageChar: "!",
        helpText: "Provides an encyclopedia entry for the specified command. Or alternatively, the bot as a whole.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let cmd = commandParamTokens(e.message.content)[0];
            
            if (!cmd) {
                Skarm.sendMessageDelay(e.message.channel, "Skarm is a Discord bot made by Dragonite#7992 and Master9000#9716. Use the help command with a command name to see the documentation for it! Type either `e!help [command-name]` to get help on a specific command, or `e!help ?` to see a list of all available commands.");
                return;
            }
            
            if (bot.mapping.help[cmd]) {
                bot.mapping.help[cmd].help(bot, e);
                return;
            }
            
            if (bot.mapping.cmd[cmd]) {
                bot.mapping.cmd[cmd].help(bot, e);
                return;
            }
            
            if (cmd === "?") {
                let keys = Object.keys(bot.mapping.unaliased);
                keys.sort();
                let alphabet = [];
                
                for (let i = 0; i < keys.length; i++) {
                    if (alphabet.length == 0 || alphabet[alphabet.length - 1].charAt(0) != keys[i].charAt(0)) {
                        alphabet[alphabet.length] = keys[i];
                    } else {
                        alphabet[alphabet.length - 1] += ", " + keys[i];
                    }
                }
                
                Skarm.sendMessageDelay(e.message.channel, "Available commands: ```" +
                    alphabet.join("\n") + "```\nSome commands have additional aliases.");
                return;
            }
            
            Skarm.sendMessageDelay(e.message.channel, "Command not found: " + cmd + ". Use the help command followed by the name of the command you wish to look up.");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Ping: {
        aliases: ["ping"],
        params: [""],
        usageChar: "!",
        helpText: "Sends a test message to the channel, and then attempts to edit it. Useful for testing the bot's response time.",
        ignoreHidden: true,
        
        execute(bot, e) {
            var timeStart = Date.now();
            // don't use sendMessageDelay - you want this to be instantaneous
            e.message.channel.sendMessage("Testing response time...").then(e => {
                e.edit("Response time: `" + (Date.now() - timeStart) + " ms`");
            });
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Pinned: {
		aliases: ["fetchpinned"],
		params: ["#channel"],
		usageChar: "!",
		helpText: "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out. Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in My sight, shall snuff it.",
		ignoreHidden: true,
        
		execute(bot,e) {
            let tokens = commandParamTokens(e.message.content);
			if (tokens.length != 2) return;
            
            let channel = null;
            let kanal = tokens[0].substring(2, tokens[0].length - 1);
            try {
                channel = Guilds.client.Channels.get(kanal);
            } catch(err) {
                Skarm.sendMessageDelay(e.message.channel, kanal + " is not a valid channel ID");
                return;
            }
            
			if (channel == null) {
				return Skarm.sendMessageDelay(e.message.channel, "failed to find channel id");
			}
            
			channel.fetchPinned().then(ex => {
                e.message.channel.sendMessage("<#" + channel.id + "> has " +
				ex.messages.length + " pinned message" + ((ex.messages.length == 1) ? "" : "s"));
            });
		},
		
		help(bot,e) {
			Skarm.help(this, e);
		},
	},
	
	Drunk: {
        aliases: ["drunk"],
        params: [""],
        usageChar: "!",
        helpText: "States how much bird rum the bot has had to drink",
        ignoreHidden: true,
        
        execute(bot, e) {
			var pints = bot.shanties.drinkCount() / 2;
			Skarm.sendMessageDelay(e.message.channel, "Skarm has had " + pints +
                " pint" + ((pints == 1) ? "s" : "") + " of rum");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Shanties: {
        aliases: ["shanties", "shanty"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Prints a list of the shanties skarm knows and is thus likely to sing while under the influence",
        ignoreHidden: true,
        
        execute(bot, e) {
			let target = commandParamString(e.message.content);
			var names = bot.shanties.names;
			var shanties = "";
			for (let i in names) {
				if (!names[i].includes(target)) continue;
				shanties += names[i] + ", ";
			}
			if (shanties.length == 0) {
				Skarm.sendMessageDelay(e.message.channel, "I can't recall any shanties with that in the title ヽ( ｡ ヮﾟ)ノ");
				return;
			}
			
			Skarm.sendMessageDelay(e.message.channel, "I recall the following shanties:\n" + shanties.substring(0,shanties.trim().length - 1));
			return;
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Stats: {
        aliases: ["bot"],
        params: [""],
        usageChar: "!",
        helpText: "Displays some stats about the bot.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let uptime = process.uptime();
            let uptimeDays = Math.floor(uptime / 86400);
            let uptimeHours = Math.floor((uptime / 3600) % 24);
            let uptimeMinutes = Math.floor((uptime / 60) % 60);
            let uptimeSeconds = Math.floor(uptime % 60);
            let uptimeString = "";
            
            if (uptimeDays > 0) {
                uptimeString = uptimeDays + ((uptimeDays > 1) ? " days, " : " day, ");
            }
            if (uptimeHours > 0) {
                uptimeString += uptimeHours + ((uptimeHouse > 1) ? " hours, " : " hour, ");
            }
            if (uptimeMinutes > 0) {
                uptimeString += uptimeMinutes + ((uptimeMinutes > 1) ? " minutes, " : " minute, ");
            }
            uptimeString += uptimeSeconds + ((uptimeSeconds > 1) ? " seconds" : " second");
            
            Skarm.sendMessageDelay(e.message.channel,
                "***Bot stats, and stuff:***\n```" +
                "Users (probably): " + Object.keys(Users.users).length + "\n" +
                "Memory usage (probably): " + process.memoryUsage().rss / 0x100000 + " MB\n" +
                "Uptime (probably): " + uptimeString + "```"
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    // administrative
    Censor: {
        aliases: ["censor"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the censor in the guild. This command is only usable by users with kicking boots. Hint: if you wish to cause mass pandemonium, be generous with your kicking boots.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        
        execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
            
            if (bot.toggleChannel(bot.channelsCensorHidden, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer run the censor on **" + e.message.channel.name + "**");
            } else {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will run the censor on **" + e.message.channel.name + "**");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Exit: {
        aliases: ["exit","shutdown"],
        params: [],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely. Use this to ensure that data is saved before restarting for maintainance or any other reasons. ",
        ignoreHidden: false,
        perms: Permissions.MOM,
        
        execute(bot, e) {
            //save data before a shutdown
			bot.save(Constants.SaveCodes.EXIT);
			Skarm.log("Shutting down by order of <@" + e.message.author.id + ">");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Game: {
        aliases: ["game"],
        params: ["[name]"],
        usageChar: "@",
        helpText: "Sets Skarm's current game. Omitting the game name will reset it to the spaghetti count. This command is only usable by Skarm's moms.",
        ignoreHidden: false,
        perms: Permissions.MOM,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "Game set to **" +
                bot.setGame(commandParamString(e.message.content)) + "**.");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Hide: {
        aliases: ["hide"],
        params: [],
        usageChar: "@",
        helpText: "Toggles visibility of the bot in the channel this is used in. This command is only usable by users with kicking boots.",
        ignoreHidden: false,
        perms: Permissions.ADMIN,
        
        execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
            
            if (bot.toggleChannel(bot.channelsHidden, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + bot.nick);
            } else {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + bot.nick);
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Munroe: {
        aliases: ["munroe"],
        params: ["cmd"],
        usageChar: "@",
        helpText: "Toggles the periodic posting of new XKCD comics in the channel. This command is only usable by users with kicking boots. The Geneva Convention requires every guild is to have at least one channel dedicated to this.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        
        execute(bot, e) {
            let userData = Users.get(e.message.author.id);
            let guildData = Guilds.get(e.message.guild.id);
			let args = commandParamTokens(e.message.content);
            
            switch (args[0]) {
                case "enable":
                    bot.addChannel(bot.channelsWhoLikeXKCD, e.message.channel_id);
                    Skarm.sendMessageDelay(e.message.channel, "XKCDs will now be sent to **" + e.message.channel.name + "!**");
                    break;
                case "disable":
                    bot.removeChannel(bot.channelsWhoLikeXKCD, e.message.channel_id);
                    Skarm.sendMessageDelay(e.message.channel, "XKCDs will no longer be sent to **" + e.message.channel.name + ".**");
                    break;
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Pin: {
        aliases: ["pin"],
        params: ["query..."],
        usageChar: "@",
        helpText: "Toggles the pinning of messages with the required number of upvote reactions in the channel. This command is only usable by users with kicking boots.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        
        execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
            
            let guild = Guilds.get(e.message.guild.id);
            
            if (guild.togglePinnedChannel(e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will now pin upvotes in **" + e.message.channel.name + "**");
            } else {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer pin upvotes in **" + e.message.channel.name + "**");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Restart: {
        aliases: ["restart","reboot"],
        params: [],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely, but with the exit code to restart operation. Use this to ensure that data is saved before restarting for updates. Note that this will only work if the bot is started from `launcher.bat`, which it always should be.",
        ignoreHidden: false,
        perms: Permissions.MOM,
        
        execute(bot, e) {
            //save memory before a restart 
			bot.save(Constants.SaveCodes.REBOOT);
			Skarm.log("Restarting by order of <@" + e.message.author.id + ">");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Save: {
		aliases: ["save","quicksave","s","f5"],
		params: [],
		usageChar: "@",
		helpText: "Save skarm's data in memory to storage. Saving data will automatically run during a restart or shutdown command",
		ignoreHidden: false,
        perms: Permissions.MOM,
		
		execute(bot, e) {
			bot.save(Constants.SaveCodes.DONOTHING);
			Skarm.sendMessageDelay(e.message.channel, "Data has been saved.");
		},
		
		help(bot, e){
			Skarm.help(this, e);
		},
	},
	SuggestionBlacklist: {
		aliases: ["suggestion-blacklist"],
		params: ["userID"],
		usageChar: "@",
		helpText: "Blacklist a user from submittion suggestions. This command is only usable by Skarm's moms.",
		ignoreHidden: false,
        perms: Permissions.MOM,
		
		execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
            
            let user = commandParamTokens(e.message.content)[0];
            let discordUser = bot.client.Users.get(user);
            
            if (!discordUser) {
                Skarm.sendMessageDelay(e.message.channel, "No user with that ID found.");
                return;
            }
			
			Users.get(user).setSuggestionBlacklist(true);
            Skarm.sendMessageDelay(e.message.channel, "**" + bot.client.Users.get(user).nickMention + "** has been blacklisted from submitting suggestions.");
		},
		
		help(bot, e){
			Skarm.help(this, e);
		},
	},
	SuggestionWhitelist: {
		aliases: ["suggestion-whitelist"],
		params: ["userID"],
		usageChar: "@",
		helpText: "Whitelist a user for submittion suggestions. This command is only usable by Skarm's moms.",
		ignoreHidden: false,
        perms: Permissions.MOM,
		
		execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
            
            let user = commandParamTokens(e.message.content)[1];
            let discordUser = bot.client.Users.get(user);
            
            if (!discordUser) {
                Skarm.sendMessageDelay(e.message.channel, "No user with that ID found.");
                return;
            }
			
			Users.get(user).setSuggestionBlacklist(false);
            Skarm.sendMessageDelay(e.message.channel, "**" + discordUser.nickMention + "** has been whitelisted for submitting suggestions.");
		},
		
		help(bot, e){
			Skarm.help(this, e);
		},
	},
    Welcome: {
        aliases: ["welcome"],
        params: ["enable", "disable", "set <message>"],
        usageChar: "@",
        helpText: "Configure welcome messages for the guild\n"+
		"Usage:\n`e@welcome enable`\n"+
		"`e@welcome set Welcome <newmember>! Please don't be evil!`\n"+
		"`e@welcome set -` removes welcome message from that channel",
        ignoreHidden: true,
        perms: Permissions.ADMIN,
        
        execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
			if(guildData.welcoming===undefined)
				guildData.welcoming=true;
			if(guildData.welcomes===undefined){
				guildData.welcomes = { };
			}
            
            let tokens = commandParamTokens(e.message.content.toLowerCase());
			if(tokens[0]=="enable" || tokens[0]=="e"){
				guildData.welcoming=true;
				Skarm.sendMessageDelay(e.message.channel,"Welcome messages have been enabled. Use e@welcome set to configure welcome messages");
				return;
			}
			if(tokens[0]=="disable" || tokens[0]=="d"){
				guildData.welcoming=false;
				Skarm.sendMessageDelay(e.message.channel,"Welcome messages have been disabled. All messages configured with e@welcome will not be sent");
				return;
			}
			if(tokens[0]=="set" || tokens[0]=="s"){
				let welcome = e.message.content.trim().split(" ");
				welcome.shift();
				welcome.shift();
				welcome = welcome.join(" ");
				if(tokens.length==1){
					Skarm.sendMessageDelay(e.message.channel, "Current welcome message is:\n"+guildData.welcomes[e.message.channel.id]);
					return;
				}
				if(welcome.trim() =="-"){
					delete guildData.welcomes[e.message.channel];
					Skarm.sendMessageDelay(e.message.channel, "Welcome message removed");
					return;
				}
				guildData.welcomes[e.message.channel.id]=welcome;
				Skarm.sendMessageDelay(e.message.channel,"Welcome message set to: "+guildData.welcomes[e.message.channel.id]);
				return;
			}
			
			if(!guildData.welcoming){
				Skarm.sendMessageDelay(e.message.channel, e.message.guild.name + " does not currently send welcome messages. Welcome messages can be turned on with e@welcome enable");
				return;
			}
			let retStr="";
			for(let channel in guildData.welcomes){
				retStr+="<#"+channel+">"+ guildData.welcomes[channel]+"\n";
			}
			if(retStr==""){
				Skarm.sendMessageDelay(e.message.channel,"There are currently no welcome messages in "+e.message.guild.name+". Sending any newly configured messages is currently "+ ((guildData.welcoming)?"enabled":"disabled"));
				return;
			}
			Skarm.sendMessageDelay(e.message.channel,"Current welcome messages in "+e.message.guild.name+":\n"+retStr);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Write: {
        aliases: ["write"],
        params: [],
        usageChar: "@",
        helpText: "Debug command to write the user and guild data to files, unencrypted.",
        ignoreHidden: false,
        perms: Permissions.MOM,
        
        execute(bot, e) {
            var userData = Users.get(e.message.author.id);
            var guildData = Guilds.get(e.message.guild.id);
            
            bot.saveDebug();
            
            Skarm.sendMessageDelay(e.message.channel, "Saved the debug things!");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    // credits
    Credits: {
        aliases: ["credits"],
        params: [""],
        usageChar: "!",
        helpText: "It's literally just the credits. Why do you need help with this?",
        ignoreHidden: true,
        
        execute(bot, e) {
            let version = Math.floor(Math.random() * 0xffffffff);
            Skarm.sendMessageDelay(e.message.channel,
`**Skarm Bot 2**\n
Lead spaghetti chef: Dragonite#7992
Seondary spaghetti chef: ArgoTheNaut#8957
Version: ${version}

Library: Discordie (JavaScript):
<https://qeled.github.io/discordie/#/?_k=m9kij6>

Dragonite:
<https://www.youtube.com/c/dragonitespam>
<https://github.com/DragoniteSpam/SkarmBot>

Argo:
<https://github.com/Master9000>

Extra ideas came from SuperDragonite2172, willofd2011, Cadance and probably other people.

Thanks to basically everyone on the Kingdom of Zeal server for testing this bot thing, as well as all of the people who Argo somehow tricked into worshipping him as their god-king.

Wolfram-Alpha is awesome:
<https://www.npmjs.com/package/node-wolfram>

Random quotes are from Douglas Adams, Terry Pratchett, Arthur C. Clark, Rick Cook, and The Elder Scrolls V: Skyrim.`
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
}