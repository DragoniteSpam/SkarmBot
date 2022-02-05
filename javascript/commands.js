"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Web = require("./web.js");
const os = require("os");
const request = require("request");

const Users = require("./user.js");
const Guilds = require("./guild.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");

let commandParamTokens = function(message) {
    let tokens = message.trim().split(" ");
    for(let i = 0; i < tokens.length; i++){
        if(tokens[i].length === 0){
            tokens.splice(i--,1);
        }
    }
    tokens.shift();
    return tokens;
};
let commandParamString = function(message) {
    let tokens = message.trim().split(" ");
    tokens.shift();
    return tokens.join(" ");
};

let attemptNumParameterFetch = function (message, parameter) {
    // "e!doAThing -parameter NNN -parameter q"
    //  ^------------------------------------^
    if (message.includes(parameter)) {
        // "e!doAThing -parameter NNN -parameter q"
        //             ^-------------------------^
        let dayTemp = message.substring(message.indexOf(parameter));
        //Skarm.spam(`Locked onto parameter \`${parameter}\` as ${dayTemp}`);
        if (dayTemp.includes(" ")) {
            // "e!doAThing -parameter NNN -parameter q"
            //                        ^--------------^
            dayTemp = dayTemp.substring(dayTemp.indexOf(" ") + " ".length);
            //Skarm.spam(`Locked onto parameter \`${parameter}\` as ${dayTemp}`);
            if (dayTemp.includes(" ")) {
                // "e!doAThing -parameter NNN -parameter q"
                //                        ^-^
                dayTemp = dayTemp.substring(0, dayTemp.indexOf(" "));
                //Skarm.spam(`Locked onto parameter \`${parameter}\` as ${dayTemp}`);
            } else {
                //Skarm.spam(`Tail space not found.\n\`${dayTemp}\` from \`${message}\``);
            }
            let resultant = dayTemp.trim() - 0;
            //Skarm.spam(`Output for parameter ${parameter}: \`${resultant}\` or as a string: \`${dayTemp}\` `);
            if (!isNaN(resultant)) return resultant;
            //Skarm.spam(`failed attempt to define parameter ${parameter}: ${dayTemp}\r\n from: ${message}`);

        }
    }
}

// noinspection JSUnusedLocalSymbols
module.exports = {
    /** 
	*	general
	*/
	Drago: {
        aliases: ["drago", "dragonite"],
        params: [],
        usageChar: "!",
        helpText: "reminds the bot author to get some sunshine once in a while",
        examples: [
            {command: "e!drago", effect: "Instructs the lead spaghetti chef to acquire vitamin D."}
        ],
        ignoreHidden: true,
		category: "general",
		
        execute(bot, e, userData, guildData) {
            Skarm.sendMessageDelay(e.message.channel, "go play outside dragonite");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Hug: {
        aliases: ["hug"],
        params: ["<victim>"],
        usageChar: "!",
        helpText: "Hugs a target, or defaults to the summoner.",
        examples: [
            {command: "e!hug", effect: "Will cause Skarm to hug whoever invoked the command."},
            {command: "e!hug Dragonite#7992", effect: "Will cause Skarm to hug the user named Dragonite#7992."}
        ],
        ignoreHidden: true,
		category: "general",

        execute(bot, e, userData, guildData) {
			let target = commandParamTokens(e.message.content)[0];
			if(target == null) target = e.message.author.username;
            Skarm.sendMessageDelay(e.message.channel, "_hugs " + target + "_");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Pinned: {
		aliases: ["fetchpinned", "pinned"],
		params: ["#channel"],
		usageChar: "!",
		helpText: "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out. Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in My sight, shall snuff it.",
        examples: [
            {command: "e!pinned", effect: "Will cause Skarm to report the amount of pinned messages in the channel that it is run in."},
            {command: "e!fetchpinned #general", effect: "Will cause Skarm to report the amount of pinned messages in the channel #general."}
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content);

            let channel,targetChannelID;
			if (tokens.length === 0) {
			    channel = e.message.channel;
			    targetChannelID=channel.id;
            } else {
                channel = null;
                targetChannelID = tokens[0].substring(2, tokens[0].length - 1);
                try {
                    channel = bot.client.Channels.get(targetChannelID);
                } catch (err) {
                    Skarm.sendMessageDelay(e.message.channel, targetChannelID + " is not a valid channel ID");
                    return;
                }
            }
            
			if (channel === null) {
				return Skarm.sendMessageDelay(e.message.channel, "failed to find channel id");
			}
            
			channel.fetchPinned().then(ex => {
                Skarm.sendMessageDelay(e.message.channel,"<#" + targetChannelID + "> has " + ex.messages.length + " pinned message" + ((ex.messages.length === 1) ? "" : "s"));
            });
		},
		
		help(bot,e) {
			Skarm.help(this, e);
		},
	},
	Summon: {
        aliases: ["summon", "summons"],
        params: ["add|remove|list", "term"],
        usageChar: "!",
        helpText: "Skarm can be asked to send you notifications for messages with certain keywords (often your username, or other topics you like to know about - for example, \"Wooloo\" or \"programming\"). You can add, remove, or list your summons." +
            "\nMessages that skarm sends containing your summons will be deleted after 15 seconds (30 seconds for e!summons list) or immediately by clicking \u274c.",
        examples: [
            {
                command: "e!summons add jeff",
                effect: "Will cause Skarm to notify you whenever `jeff` appears in a message."
            },
            {
                command: "e!summons add skarmory skarmbot skram skarm",
                effect: "Will cause Skarm to notify you if any of the four terms listed appear in a messasge."
            },
            {
                command: "e!summons remove jeff",
                effect: "Will stop Skarm from notifying you whenever `jeff` appears in a message."
            },
            {
                command: "e!summon list",
                effect: "Will cause Skarm to report the list of terms that you will be notified about."
            }
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let params = commandParamTokens(e.message.content.toLowerCase());
            let action = params[0];
            let term;
            if (params.length) {
                term = params[1];
            } else {
                term = "";
            }
            let returnString = "";
            if (action === "add") {
                for (let i = 1; i < params.length; i++) {
                    if (userData.addSummon(params[i].replace(",", ""))) {
                        returnString += "**" + params[i] + "** is now a summon for " + e.message.author.username + "!\n";
                    } else {
                        returnString += "Could not add the term " + params[i] + " as a summon. (Has it already been added?)\n";
                    }
                }
                Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 15000, e.message.author.id, bot);
                return;
            }
            if (action === "remove") {
                for (let i = 1; i < params.length; i++) {
                    if (userData.removeSummon(params[i].replace(",", ""))) {
                        returnString += "**" + params[i] + "** is no longer a summon for " + e.message.author.username + "!\n";
                    } else {
                        returnString += "Could not remove the term " + params[i] + " as a summon. (Does it exist in the summon list?)\n";
                    }
                }
                Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 15000, e.message.author.id, bot);
                return;
            }
            if (action === "list") {
                let summonString = userData.listSummons(term);
                if (summonString.length === 0) {
                    returnString += "**" + e.message.author.username + "**, you currently have no summons!";
                } else {
                    returnString += "**" + e.message.author.username + "**, your current summons are:\n```" + summonString + "```";
                }
                Skarm.sendMessageDelete(e.message.channel, returnString, false, null, 30000, e.message.author.id, bot);
                return;
            }
            Skarm.erroneousCommandHelpPlease(e.message.channel, this);
        },
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Activity: {
        aliases: ["activity","activitytable"],
        params: ["-days # -page #"],
        usageChar: "!",
        helpText: "Prints out a table of guild activity from the past # days.  If not specified, default is 30 days.  Use the page option to access data outside of the top 10 members.",
        examples: [
            {command: "e!activity", effect: "Will cause Skarm to report the word and message counts of the top 10 members over the past 30 days."},
            {command: "e!activity -days 45", effect: "Will cause Skarm to report the word and message counts of the top 10 members over the past 45 days."},
            {command: "e!activity -page 2", effect: "Will cause Skarm to report the word and message counts of the 11th-20th most active members over the past 30 days."},
            {command: "e!activity -days 45 -page 2", effect: "Will cause Skarm to report the word and message counts of the 11th-20th most active members over the past 45 days."}
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let message = commandParamString(e.message.content).toLowerCase();
            let tokens = commandParamTokens(e.message.content);
            let days = attemptNumParameterFetch(message, "-d") || 30;
            let page = attemptNumParameterFetch(message, "-p") - 1 || 0;    //convert page to array index
            let dayImplemented = 1613001600000;                                      //Date of implementation

            if (isNaN(page)) {
                Skarm.sendMessageDelay(e.message.channel, "Expected page input as an integer. e.g.: `e!activity 2`");
                return;
            }
            //Skarm.logError(page);
            let guild = guildData;
            let table = guild.flexActivityTable;


            let cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
            if (cutoffDate < dayImplemented) {
                days = Math.ceil((Date.now() - dayImplemented) / (24 * 60 * 60 * 1000));
                cutoffDate = dayImplemented;
            }
            Skarm.spam("Cutoff date: " + new Date(cutoffDate) + " | raw: " + cutoffDate);


            //assemble user object table for the report
            let usersList = [];
            for (let userID in table) {
                let userTableObj = table[userID];
                let userReportObj = {userID: userID, words: 0, messages: 0};
                if (days < 0 || days > 365) {
                    userReportObj.words = userTableObj.totalWordCount;
                    userReportObj.messages = userTableObj.totalMessageCount;
                } else {
                    for (let day in table[userID].days) {
                        if (day < cutoffDate) continue; //we can't break here because data in hash table is not strictly ordered
                        if (day < dayImplemented) {  //hard cutoff for data at the date of implementation
                            delete table[userID].days[day];
                            continue;
                        }
                        userReportObj.words += userTableObj.days[day].wordCount;
                        userReportObj.messages += userTableObj.days[day].messageCount;
                    }
                }
                usersList.push(userReportObj);
            }
            usersList.sort((a, b) => {
                return b.words - a.words
            });

            table = usersList;
            let spacer = "\t";
            let description = ["```", "Member" + spacer + "Words " + spacer + "Messages"];

            let fields = [];
            for (let i = 0; i + page * 10 < table.length && i < 10 && page >= 0; i++) {
                let idx = i + page * 10;
                let user = bot.client.Users.get(table[idx].userID);

                let userMention;
                try {
                    userMention = `${user.username.replaceAll("`", "'")}#${user.discriminator}`;
                } catch (e) {
                    userMention = `<@${table[idx].userID}>`;
                }
                description.push(`${userMention}${spacer}${table[idx].words}${spacer}${table[idx].messages}`);
                fields.push({
                    name: userMention,
                    value: "words: " + table[idx].words + ", 💬:" + table[idx].messages,
                    inline: true
                });
            }
            description.push("```");
            if (page * 10 > table.length) {
                Skarm.sendMessageDelay(e.message.channel, "Requested page is outside of active member range.  Please try again.");
                return;
            }

            //format description to look nice
            while (description.join("").includes(spacer)) {
                let maxSpace = 0;                           //maximum distance between start of line and spacer

                //evaluate max distance to spacer
                for (let d in description) {
                    let line = description[d];
                    if (line.includes("```")) continue;        //ignore upper and lower bounds
                    let firstComponentDist = line.split(spacer)[0].length;
                    maxSpace = Math.max(maxSpace, firstComponentDist);
                }

                //add space to each sector in place of the spacer
                for (let d in description) {
                    let line = description[d];
                    if (line.includes("```")) continue;        //ignore upper and lower bounds
                    let firstComponentDist = line.split(spacer)[0].length;
                    let newSpacer = " ";                        //always provide a minimum padding of 1 space
                    for (let i = firstComponentDist; i < maxSpace; i++) {
                        newSpacer += " ";
                    }
                    description[d] = line.replace(spacer, newSpacer);
                }

            }

            let messageObject = {
                color: Skarm.generateRGB(),
                description: description.join("\r\n"),
                author: {name: e.message.author.nick},
                title: "Server Activity for the past " + days + " days",
                timestamp: new Date(),
                // fields: fields,
                footer: {text: `Page ${page + 1}/${Math.ceil(table.length / 10)}`},
            };

            Skarm.sendMessageDelete(e.message.channel, " ", false, messageObject, 1 << 20, e.message.author, bot);
        },

        help(bot,e) {
            Skarm.help(this, e);
        },
    },
    RoleFrequency: {
        aliases: ["rolefrequency","rf"],
        params: ["count"],
        usageChar: "!",
        helpText: "Prints out a table of the most frequently appearing roles in the server.  Use parameter count, to specify the amount of roles to include in the table.",
        examples: [
            {command: "e!rolefrequency", effect: "Will cause Skarm to report the most frequent roles in the guild."},
            {command: "e!rf 3", effect: "Will cause Skarm to report the top 3 most frequent roels in the guild."}
        ],
        ignoreHidden: true,
        category: "general",
        //todo: specify only works in guilds
        execute(bot, e, userData, guildData) {
            let param = commandParamTokens(e.message.content);
            let tableUpperBound = Infinity;
            if(param.length){
                tableUpperBound = Number(param[0]);
            }
            let guild = e.message.guild;

            //harvest counts from member list
            let members = guild.members;
            let roleFreq = { };
            for(let member of members){
                for(let role of member.roles){
                    if(!(role.id in roleFreq)){
                        roleFreq[role.id] = 0;
                    }
                    roleFreq[role.id]++;
                }
            }

            let roleFreqArray = [ ];
            //convert to array and sort by frequency
            for(let roleID of Object.keys(roleFreq)){
                roleFreqArray.push({
                    id: roleID,
                    freq: roleFreq[roleID],
                });
            }

            roleFreqArray.sort((a,b) => {return b.freq - a.freq});

            //print results
            let printFields = [ ];
            tableUpperBound = Math.min(tableUpperBound, roleFreqArray.length);
            for(let i = 0; i < tableUpperBound; i++){
                printFields.push({name: roleFreqArray[i].freq, value: " <@&"+roleFreqArray[i].id+">", inline: true});
            }

            e.message.channel.sendMessage(" ", false, {
                color: Skarm.generateRGB(),
                timestamp: new Date(),
                title: "Most frequent roles in "+e.message.guild.name,
                fields: printFields,
                footer: {
                    text: e.message.guild.name+ " top " + tableUpperBound,
                },
            });

        },

        help(bot,e) {
            Skarm.help(this, e);
        },
    },
    Roll: {
        aliases: ["roll"],
        params: ["#d# + #"],
        usageChar: "!",
        helpText: "Roll up to 64 dice with a max value of up to 1000 per die!",
        examples: [
            {command: "e!roll 20", effect: "Will cause Skarm to roll `1d20` and report the outcome."},
            {command: "e!roll d20", effect: "Will cause Skarm to roll `1d20` and report the outcome."},
            {command: "e!roll 4d20", effect: "Will cause Skarm to roll `4d20` and report the outcome."},
            {command: "e!roll 20 + 1", effect: "Will cause Skarm to roll `1d20 + 1` and report the outcome."},
            {command: "e!roll d20 + 1", effect: "Will cause Skarm to roll `1d20 + 1` and report the outcome."},
            {command: "e!roll 3d20 + 9", effect: "Will cause Skarm to roll `3d20 + 9` and report the outcome."},
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let message = commandParamString(e.message.content.toLowerCase());
            if (message.includes("+")) message = message.replace("+", " + ").replaceAll("  ", " ");
            let tokens = message.split(" ");

            if (tokens.length < 1 || tokens.join("").length === 0) {
                this.help(bot, e);
                return;
            }

            let dPointIndex = tokens[0].indexOf("d");

            let dieMagnitude = tokens[0].substring(dPointIndex + 1) - 0;
            let dieCount = 1;

            if (dPointIndex > 0) {
                dieCount = tokens[0].substring(0, dPointIndex) - 0;
            }

            dieCount = Math.min(0x40, dieCount);             //prevent user-end exploits
            dieMagnitude = Math.min(1000, dieMagnitude);     //prevent user-end exploits

            //Skarm.spam(`dieCount: ${dieCount}, dieMag: ${dieMagnitude}`);

            let rollValues = [];
            let rollAccumulator = 0;
            if (tokens.length > 1 && message.includes("+")) {
                let i = 1;
                while (i < tokens.length) {
                    if (tokens[i++].includes("+")) {
                        //Skarm.spam(`Found + at token ${i} of ${tokens.length}: ${tokens[i-1]}`);
                        break;
                    }
                }
                rollAccumulator = (i < tokens.length) ? tokens[i] - 0 : 0;
                //Skarm.spam(`Roll Accumulator: ${rollAccumulator}`);
            }

            let baseValue = rollAccumulator;

            for (let i = 0; i < dieCount; i++) {
                let rollValue = 1 + Math.floor(dieMagnitude * Math.random());
                rollAccumulator += rollValue;
                rollValues.push(rollValue);
            }

            if (baseValue > 0) {              //append base value to end of addition array
                rollValues.push(baseValue);
            }

            Skarm.sendMessageDelay(e.message.channel, `${rollValues.join(" + ")} = **${rollAccumulator}**`);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    UnixToDate: {
        aliases: ["unixtodate", "utd", "time"],
        params: ["#"],
        usageChar: "!",
        helpText: "Converts a unix timestamp to a date",
        examples: [
            {
                command: "e!time",
                effect: "Prints the current unix timestamp."
            },
            {
                command: "e!utd 1640000000000",
                effect: "Prints the human-readable time described by the unix timestamp given in the command."
            }
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e) {
            let tokens = commandParamTokens(e.message.content);

            //no input -> you get the current time
            if (tokens.join("").length === 0) {
                Skarm.sendMessageDelay(e.message.channel, Date.now());
                return;
            }
            Skarm.sendMessageDelay(e.message.channel, new Date(tokens[0] - 0));
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },


    /**
	*	meta
	*/
	Actions: {
        aliases: ["action", "actions", "actioncount"],
        params: [],
        usageChar: "!",
        helpText: "Returns the number of actions in Skarm's log for the current server.",
        examples: [{command: "e!action", effect: "Reports the amount of action lines recorded for this server."}],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let guild = e.message.guild;
            Skarm.sendMessageDelay(e.message.channel, "Actions known for **" +
                guild.name + "**: " + Guilds.get(guild.id).getActionCount());
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Credits: {
        aliases: ["credits"],
        params: [""],
        usageChar: "!",
        helpText: "It's literally just the credits. Why do you need help with this?",
        examples: [{command: "e!credits", effect: "Shows the credits."}],
        ignoreHidden: true,
		category: "meta",

        execute(bot, e, userData, guildData) {
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
	/*

    Drunk: {
        aliases: ["drunk"],
        params: [""],
        usageChar: "!",
        helpText: "States how much bird rum the bot has had to drink",
        ignoreHidden: true,
        category: "meta",
        
        execute(bot, e) {
			var pints = bot.shanties.drinkCount() / 2;
			Skarm.sendMessageDelay(e.message.channel, "Skarm has had " + pints +
                " pint" + ((pints === 1) ? "s" : "") + " of rum");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	 */
	Help: {
        aliases: ["help", "man", "?"],
        params: ["[term]"],
        usageChar: "!",
        helpText: "Skarm is a Discord bot made by <@137336478291329024> and <@162952008712716288>.\r\n" +   /*unfortunately, "Constants.Moms.Drago.mention" could not be used due to not being initialized yet*/
            "Use the help command with a command name to see the documentation for it!\r\n" +
            "Type either `e!help [command-name]` to get help on a specific command, or `e!help` to see a list of all available commands.\r\n",
        examples: [
            {command: "e!help",         effect: "Shows all available commands to run"},
            {command: "e!help help",    effect: "Shows the documentation for usage of `e!help` (hey, this is it!)"},
            {command: "e!?",            effect: "Shows the documentation for usage of `e!help` (hey, this is it!)"},
            {command: "e!man activity", effect: "Shows the documentation for usage of `e!activity`"}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let cmd = commandParamTokens(e.message.content)[0];
            if (e.message.content === "e!?")
                cmd = "?";

            if (cmd === "?") {
                Skarm.help(this, e);
                return;
            }

            if (!cmd) {
                let guildData = Guilds.get(e.message.channel.guild_id);
                let userData = Users.get(e.message.author.id);
                let categories = {};

                for (let key in bot.mapping.unaliased) {
                    if (bot.mapping.unaliased[key].usageChar === "!" || guildData.hasPermissions(userData, bot.mapping.unaliased[key].perms)) {
                        let cat = bot.mapping.unaliased[key].category;
                        if (cat in categories) {
                            categories[cat].push(key);
                        } else {
                            categories[cat] = [key];
                        }
                    }
                }

                let alphabet = [];
                for (let sets in categories) {
                    categories[sets].sort();
                    alphabet.push({name: sets, value: categories[sets].join(", ")});
                }
                let embedobj = {
                    color: Skarm.generateRGB(),
                    title: "Commands",
                    timestamp: new Date(),
                    fields: alphabet,
                    footer: {text: e.message.member.nick || e.message.author.username + " | "}
                };

                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);//"Available commands: ```" + alphabet.join("\n\n") + "```\nSome commands have additional aliases.");
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

            Skarm.sendMessageDelay(e.message.channel, "Command not found: " + cmd + ". Use the help command followed by the name of the command you wish to look up.");
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
        examples: [{
            command: "e!lines",
            effect: "Reports the amount of general message lines recorded for parroting in this server."
        }],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let guild = e.message.guild;
            Skarm.sendMessageDelay(e.message.channel, "Lines known for **" +
                guild.name + "**: " + Guilds.get(guild.id).getLineCount());
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Nick: {
        aliases: ["nick","nickname","name","setname"],
        params: ["newName"],
        usageChar: "!",
        helpText: "Set what you want skarm to call you across all servers.\r\nIf no nickname is given, skarm will default to your server nickname. \r\nUse `e!nick -` to remove",
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let newNick = commandParamString(e.message.content);
            if(!newNick.length) {
                Skarm.sendMessageDelay(e.message.channel,`Your current nickname is: ${userData.nickName}`);
                return;
            }
            if(newNick === "-"){
                userData.nickName = undefined;
                Skarm.sendMessageDelay(e.message.channel,`Nickname removed`);
                return;
            }
            userData.nickName = newNick.substring(0,32); //limits imposed by discord inherited by skarm for the sake of sanity and such things
            Skarm.sendMessageDelay(e.message.channel,`Skarm will now refer to you as "${userData.nickName}"`);
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
        category: "meta",

        execute(bot, e, userData, guildData) {
            let timeStart = Date.now();
            // don't use sendMessageDelay - you want this to be instantaneous
            e.message.channel.sendMessage("Testing response time...").then(e => {
                e.edit("Response time: `" + (Date.now() - timeStart) + " ms`");
            });
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
        category: "meta",

        execute(bot, e, userData, guildData) {
			let target = commandParamString(e.message.content);
			let names = bot.shanties.names;
            let shanties = "";
            for (let i in names) {
				if (names[i].includes(target))
    				shanties += names[i] + ", ";
			}
			if (shanties.length === 0) {
				Skarm.sendMessageDelay(e.message.channel, "I can't recall any shanties with that in the title ヽ( ｡ ヮﾟ)ノ");
				return;
			}
			
			Skarm.sendMessageDelay(e.message.channel, "I recall the following shanties:\n" + shanties.substring(0,shanties.trim().length - 1));
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
        category: "meta",

        execute(bot, e, userData, guildData) {
            //shanty counter is intentionally wrong following shanties being buffered on a per-channel basis
			let shanty = Math.floor(Math.random()*5000)/100;
			let skyrim=Math.floor((new Date).getDay()*bot.skyrimOddsModifier*10000)/100;
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
	Stats: {
        aliases: ["bot"],
        params: [""],
        usageChar: "!",
        helpText: "Displays some stats about the bot.",
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
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
                uptimeString += uptimeHours + ((uptimeHours > 1) ? " hours, " : " hour, ");
            }
            if (uptimeMinutes > 0) {
                uptimeString += uptimeMinutes + ((uptimeMinutes > 1) ? " minutes, " : " minute, ");
            }
            uptimeString += uptimeSeconds + ((uptimeSeconds > 1) ? " seconds" : " second");
            
            Skarm.sendMessageDelay(e.message.channel,
                "***Bot stats, and stuff:***\n```" +
                "Users (probably): " + Object.keys(Users.users).length + "\n" +
                "Memory usage (probably): " + process.memoryUsage().rss / 0x100000 + " MB\n" +
				"Host: "+os.hostname()+"\n"+
                "vPID: "+bot.pid+"\n"+
                "Version: "+bot.version+"\n"+
                "Uptime (probably): " + uptimeString + "```"
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Suggest: {
        aliases: ["suggest", "suggestion"],
        params: [""],
        usageChar: "!",
        helpText: "Provides a list to the Github Issues page, where you may complain to your heart's content.",
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            Skarm.sendMessageDelay(e.message.channel, "You may submit your questions and complaints here: https://github.com/DragoniteSpam/SkarmBot/issues");
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Zipf: {
        aliases: ["zipf"],
        params: ["<startIndex>"],
        usageChar: "!",
        helpText: "Queries a list of words sent in the server by their relative frequencies. Optional integer parameter for offsetting the 10 displayed words.",
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let args = commandParamString(e.message.content);
            if(!args || args.length < 1) args = 1;
            Skarm.sendMessageDelay(e.message.channel, guildData.getZipfSubset(args));
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },


    /**
	*	web
	*/
	Google: {
        aliases: ["google", "cosia"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns the results of a web search of the specified query. The `cosia` alias is an acceptable usage of punning.",
        ignoreHidden: true,
        category: "web",

        execute(bot, e, userData, guildData) {
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
        category: "web",

        execute(bot, e, userData, guildData) {
            Web.stackOverflow(bot, e, commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    //Unsecure
    // Wolfy: {
    //     aliases: ["wolfram", "wolfy"],
    //     params: ["query..."],
    //     usageChar: "!",
    //     helpText: "Returns a Wolfram|Alpha API request for the given query.",
    //     ignoreHidden: true,
	// 	category: "web",
    //
    //     execute(bot, e, userData, guildData) {
    //         Web.wolfy(bot, e, commandParamString(e.message.content));
    //     },
    //
    //     help(bot, e) {
    //         Skarm.help(this, e);
    //     },
    // },

    XKCD: {
        aliases: ["xkcd"],
        params: ["[id]"],
        usageChar: "!",
        helpText: "Returns the XKCD with the specified ID; if no ID is specified, it will return the latest strip instead. ID may be an index or a strip name.",
        ignoreHidden: true,
		category: "web",

        execute(bot, e, userData, guildData) {
            bot.xkcd.post(e.message.channel, commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    
	
	/**
	*administrative
	*/
    Alias: {
        aliases: ["alias"],
        params: ["add, remove, list, clear"],
        usageChar: "@",
        helpText: "Manage additional names that skarm will respond to.  The scope of these aliases is within the guild in which they are configured.  All names are case insensitive.\r\nAdd registers new aliases, Remove or delete get rid of existing aliases.  List provides a complete list of guild-specific aliases.  Clear **purges all** guild-specific aliases.   \r\nUsage:  `e@alias add scramble`, `e@alias list`, `e@alias remove scramble`, `e@alias delete *`, `e@alias clear`",
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let words=commandParamTokens(e.message.content.toLowerCase());
            if(!guildData.aliases) guildData.aliases={ };
            if(words.length===0) {Skarm.help(this, e);return;}
            let action = words.shift();
            let alias = words.join(" ");
            let guildAliases = Object.keys(guildData.aliases).map(str => "`"+str+"`");
            //expunges all existing guild-specific aliases
            function clear(){
                Skarm.sendMessageDelay(e.message.channel, `Purging all existing aliases.  Removed aliases: ${Object.keys(guildData.aliases).join(", ")}`);
                guildData.aliases = { };
            }

            switch(action){
                case "list":
                case "ls":
                case "l":
                    if(guildAliases.length)
                        Skarm.sendMessageDelay(e.message.channel,`Skarm currently responds to the following aliases in this guild: ${guildAliases.join(", ")}`);
                    else
                        Skarm.sendMessageDelay(e.message.channel,`Skarm currently has no special aliases in this guild.`);
                    break;

                case "add":
                case "a":
                    if(words.length === 0){
                        Skarm.sendMessageDelay(e.message.channel, "Error: expected alias to add");
                    }else{
                        guildData.aliases[words.join(" ")]=1;
                        Skarm.sendMessageDelay(e.message.channel,`Added alias ${alias}`);
                        if(words.join(" ").length < 3)
                            Skarm.sendMessageDelay(e.message.channel,`Warning: the added alias is short and may potentially cause a massive quantity of responses.  Please verify that the change you just made is indeed desired.`);
                    }
                    break;

                case "remove":
                case "rem":
                case "r":
                case "delete":
                case "del":
                case "d":
                    if(words.length === 0){
                        Skarm.sendMessageDelay(e.message.channel, "Error: expected alias to remove");
                    }else {
                        if(alias === "*"){
                            return clear();
                        }
                        if (alias in guildData.aliases) {
                            delete guildData.aliases[alias];
                            Skarm.sendMessageDelay(e.message.channel, `Removed alias ${alias}`);
                        }else{
                            Skarm.sendMessageDelay(e.message.channel, `Alias ${alias} did not exist for this guild.`);
                        }
                    }
                    break;

                case "clear":
                    clear()
                    break;
                default:
                    Skarm.help(this, e);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Knight: {
        aliases: ["mod", "knight"],
        params: ["member | clear"],
        usageChar: "@",
        helpText: "Administrator command for appointing and removing moderators. Use `e@mod clear` to remove all moderators (caution is advised).",
        ignoreHidden: true,
        perms: Permissions.ADMIN,
        category: "administrative",

        execute(bot, e, userData, guildData) {
			let words=commandParamTokens(e.message.content);
			if(!guildData.moderators)
				guildData.moderators={ };
			if(words.length===0){
				let list = Object.keys(guildData.moderators);
				if(list.length===0){
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
			
			if(words[0]==="clear" || words[0]==="c"){
				guildData.moderators={};
				Skarm.sendMessageDelay(e.message.channel,"Removed everyone from the moderators list.");
			}
			
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
	Sudo: {
        aliases: ["sudo", "su"],
        params: ["mention"],
        usageChar: "!",
        helpText: "Shows the user's access level (pleb, moderator, admin, Mom, etc).",
        ignoreHidden: true,
        category: "administrative",

        execute(bot, e, userData, guildData) {
			let words=commandParamTokens(e.message.content);

            
			
			let member;
			if(words.length===1){
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
            if (permissions === Permissions.SUDO) permNames.push("MOM");
            
			
            Skarm.sendMessageDelay(e.message.channel, "Current permissions of **" +
                member.name + "** in **" + e.message.guild.name + ":**\n" +
                permNames.join(", ")
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Censor: {
        aliases: ["censor"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the censor in the guild. This command is only usable by users with kicking boots. Hint: if you wish to cause mass pandemonium, be generous with your kicking boots.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            
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
	Hide: {
        aliases: ["hide"],
        params: [],
        usageChar: "@",
        helpText: "Toggles visibility of the bot in the channel this is used in. This command is only usable by users with kicking boots.",
        ignoreHidden: false,
        perms: Permissions.ADMIN,
		category: "administrative",

        execute(bot, e, userData, guildData) {
            
            if (guildData.toggleHiddenChannel(bot.channelsHidden, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + bot.nick);
            } else {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + bot.nick);
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Mayhem: {
        aliases: ["mayhem", "chaos"],
        params: ["[role]"],
        usageChar: "@",
        helpText: "Toggles a role to function as a mayhem color. Please use the role ID as to avoid tagging people unnecessarily. If no parameter is specified, a list of the mayhem roles will be printed instead.",
        ignoreHidden: true,
        perms: Permissions.MOD,
		category: "administrative",

        execute(bot, e, userData, guildData) {
			let args = commandParamTokens(e.message.content);
			
            if (args.length === 0) {
				var roles = Object.keys(guildData.mayhemRoles);
                for (let i = 0; i < roles.length; i++) {
                    let found = false;
                    for (let role of e.message.guild.roles) {
                        if (role.id === roles[i] && guildData.mayhemRoles[roles[i]]) {
                            roles[i] = role.name;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        guildData.toggleMayhem(roles[i]);
                        roles[i] = undefined;
                    }
                }
                // if any invalid roles are in the mayhem list (deleted roles,
                // etc) remove them
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i] === undefined) {
                        roles.splice(i, 1);
                    }
                }
                roles.sort();
                if (roles.length === 0) {
                    Skarm.sendMessageDelay(e.message.channel, "No mayhem roles have been set up yet!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "**Current mayhem roles:**\n" + roles.join(", "));
                }
				return;
			}
			
            let roleData = undefined;
            for (let role of e.message.guild.roles) {
                if (role.id === args[0]) {
                    roleData = role;
                    break;
                }
            }
            
            if (!roleData) {
                Skarm.sendMessageDelay(e.message.channel, "Invalid role ID specified (be sure to use the role's ID instead of the @ tag, because people find being pinged to be very annoying)");
                return;
            }
            
            if (guildData.toggleMayhem(args[0])) {
                Skarm.sendMessageDelay(e.message.channel, "**" + roleData.name + "** has been added as a mayhem color");
            } else {
                Skarm.sendMessageDelay(e.message.channel, "**" + roleData.name + "** has been removed as a mayhem color");
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
        helpText: "This feature has been deprecated to now run through e@notify.  Please use that command instead.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let args = commandParamTokens(e.message.content);

            if (args.length === 0) {
                //Skarm.sendMessageDelay(e.message.channel, "XKCDs are " + ((e.message.channel.id in bot.channelsWhoLikeXKCD) ? "" : "not ") +" currently being sent to " + e.message.channel.name + ".");
                Skarm.sendMessageDelay(this.helpText);
                return;
            }

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

            let leave = true;
            for (let mom in Constants.Moms) {
                if (Constants.Moms[mom].id === e.message.author.id){
                    leave = false;
                }
            }

            if (leave) return;

            // noinspection FallThroughInSwitchStatementJS
            switch (args[0]) {
                case "dump":
                    Skarm.log(JSON.stringify(bot.channelsWhoLikeXKCD));
                    break;
                case "push":
                    bot.xkcd.checkForNewXKCDs();
                    break;
                case "lockcheck":
                    Skarm.log(bot.xkcd.lock);
                    break;
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Notify: {
        aliases: ["notify"],
        params: ["#"],
        usageChar: "@",
        helpText: "Toggles the notifications of various information for this channel.  Use without a number input to view current state of channel.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let notifChannels = guildData.notificationChannels;
            let args = commandParamTokens(e.message.content.toLowerCase());

            if (args.length === 0) {
                Skarm.sendMessageDelay(e.message.channel, " ",false,{
                    color: Constants.Colors.BLUE,
                    author: {name: e.message.author.nick},
                    description: `Configure notification settings for <#${e.message.channel.id}>:\r\n\r\n`+
                        `1: **${(e.message.channel.id in notifChannels.MEMBER_JOIN_LEAVE) ? "Disable":"Enable"}** member join/leave notifications\n`+
                        `2: **${(e.message.channel.id in notifChannels.BAN) ? "Disable":"Enable"}** ban notifications\n`+
                        `3: **${(e.message.channel.id in notifChannels.NAME_CHANGE) ? "Disable":"Enable"}** name change notifications\n`+
                        `4: **${(e.message.channel.id in notifChannels.VOICE_CHANNEL) ? "Disable":"Enable"}** voice channel join/change/leave notifications\n`+
                        `5: **${(e.message.channel.id in notifChannels.XKCD) ? "Disable":"Enable"}** posting new XKCDs upon their release \n`,
                    timestamp: new Date(),
                });
                return;
            }

            switch (args[0]) {
                case "join":
                case "leave":
                case "1":
                    if (e.message.channel.id in notifChannels.MEMBER_JOIN_LEAVE) {
                        delete notifChannels.MEMBER_JOIN_LEAVE[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Member join/leave notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.MEMBER_JOIN_LEAVE[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Member join/leave notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "ban":
                case "2":
                    if (e.message.channel.id in notifChannels.BAN) {
                        delete notifChannels.BAN[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Member ban notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.BAN[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Member ban notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "name":
                case "3":
                    if (e.message.channel.id in notifChannels.NAME_CHANGE) {
                        delete notifChannels.NAME_CHANGE[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Member name change notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.NAME_CHANGE[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Member name change notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "voice":
                case "vox":
                case "4":
                    if (e.message.channel.id in notifChannels.VOICE_CHANNEL) {
                        delete notifChannels.VOICE_CHANNEL[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "Voice channel activity notifications will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.VOICE_CHANNEL[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "Voice channel activity notifications will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "xkcd":
                case "5":
                    if (e.message.channel.id in notifChannels.XKCD) {
                        delete notifChannels.XKCD[e.message.channel.id];
                        Skarm.sendMessageDelay(e.message.channel, "New XKCDs will no longer be sent to **" + e.message.channel.name + "!**");
                    }else{
                        notifChannels.XKCD[e.message.channel.id] = Date.now();
                        Skarm.sendMessageDelay(e.message.channel, "New XKCDs will now be sent to **" + e.message.channel.name + "!**");
                    }
                    break;
                case "debug":
                    Skarm.spam(JSON.stringify(notifChannels));
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
		category: "administrative",

        execute(bot, e, userData, guildData) {
            
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
	Welcome: {
        aliases: ["welcome"],
        params: ["enable", "disable", "set <message>"],
        usageChar: "@",
        helpText: "Configure welcome messages for the guild\n"+
		"Usage:\n`e@welcome enable`\n"+
		"`e@welcome set Welcome <newmember>! Please don't be evil!`\n"+
		"`e@welcome set -` removes welcome message from that channel",
        ignoreHidden: true,
        perms: Permissions.MOD,
		category: "administrative",

        execute(bot, e, userData, guildData) {
			if(guildData.welcoming===undefined)
				guildData.welcoming=true;
			if(guildData.welcomes===undefined){
				guildData.welcomes = { };
			}
            
            let tokens = commandParamTokens(e.message.content.toLowerCase());
			if(tokens[0]==="enable" || tokens[0]==="e"){
				guildData.welcoming=true;
				Skarm.sendMessageDelay(e.message.channel,"Welcome messages have been enabled. Use e@welcome set to configure welcome messages");
				return;
			}
			if(tokens[0]==="disable" || tokens[0]==="d"){
				guildData.welcoming=false;
				Skarm.sendMessageDelay(e.message.channel,"Welcome messages have been disabled. All messages configured with e@welcome will not be sent");
				return;
			}
			if(tokens[0]==="set" || tokens[0]==="s"){
				let welcome = e.message.content.trim().split(" ");
				welcome.shift();
				welcome.shift();
				welcome = welcome.join(" ");
				if(tokens.length===1){
					Skarm.sendMessageDelay(e.message.channel, "Current welcome message is:\n"+guildData.welcomes[e.message.channel.id]);
					return;
				}
				if(welcome.trim() ==="-"){
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
			if(retStr===""){
				Skarm.sendMessageDelay(e.message.channel,"There are currently no welcome messages in "+e.message.guild.name+". Sending any newly configured messages is currently "+ ((guildData.welcoming)?"enabled":"disabled"));
				return;
			}
			Skarm.sendMessageDelay(e.message.channel,"Current welcome messages in "+e.message.guild.name+":\n"+retStr);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Soap: {
        aliases: ["soap"],
        params: [],
        usageChar: "@",
        helpText: "Wash skarm's mouth out with soap if he picked up potty language from chat.",
        ignoreHidden: true,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            guildData.soap();
			Skarm.sendMessageDelay(e.message.channel,"sorry...");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },

	
	/**
	*	leveling
	*/
	Rank: {
		aliases: ["level","rank"],
        params: ["<optionally mention a guild member>"],
        usageChar: "!",
        helpText: "returns how much exp you have in the guild",
        ignoreHidden: true,
		category: "leveling",

        execute(bot, e, userData, guildData) {
			let target = e.message.author.id;
			let tok =commandParamTokens(e.message.content);
			if(tok.length===1){
				tok = tok[0].replace("<","").replace("@","").replace(">","").replace("!","");
				if(!(tok in guildData.expTable)){
					Skarm.sendMessageDelay(e.message.channel,"Error: this user may have not talked at all or you didn't mention them properly.");
					return;
				}
				target = tok;
			}
			let user = guildData.expTable[target];
			let exp = user.exp - 0;
			let lvl = user.level;
			let toNextLvl = user.nextLevelEXP-exp;
			let targetEntity = bot.client.Users.get(target);
			let guildMembers = e.message.guild.members;
			let targetNick;
			for(let member of guildMembers){
			    if(member.id === target) targetNick = member.nick;
            }

			//https://discordjs.guide/popular-topics/embeds.html#embed-preview
            e.message.channel.sendMessage(" ", false, {
                color: Skarm.generateRGB(),
                author: {name: Users.get(target).nickName || targetNick || targetEntity.username || target},
                timestamp: new Date(),
                fields: [
                    {name: "Total EXP",         value: exp,                           inline: true},
                    {name: "Level",             value: lvl,                           inline: true},
                    {name: "Rank",              value: guildData.getUserRank(target), inline: true},
                    {name: "EXP to next level", value: toNextLvl,                     inline: true}
                ],
                footer: {
                    text: Users.get(target).nickName,
                    icon_url: ((targetEntity) ? targetEntity.staticAvatarURL :"https://i.imgur.com/ICK2lr1.jpeg")
                },
            });
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	SRank: {
		aliases: ["srank","slevel"],
        params: ["<@targetID>, exp"],
        usageChar: "@",
        helpText: "Sets how much exp you have in the guild\r\n" +
            "Example 0: `e@srank 256` sets your own experience points to 256.  Enough to achieve level 2!\r\n" +
            "Example 1: `e@srank @magikarp#1234 0` sets the experience points of the user @magikarp#1234 to 0\r\n" +
            "Example 2: `e@srank @Dragonite#7992 100` sets the experience points of the user `@Dragonite#7992` to 100.  Enough to achieve level 1!\r\n" +
            "Example 3: `e@srank @Dragonite#7992 -` removes dragonite's record from the exp table.  Future message by dragonite will re-add him to the table.",
        ignoreHidden: true,
		category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            let param = commandParamTokens(e.message.content);
            let targetTerms = ["<@", ">", "!"];
		    let target;
		    let newExp;

		    //dont mess up the data if no input params are given or too many are given
		    if(param.length === 0 || param.length > 2){
                Skarm.help(this,e);
		        return;
            }

		    if(param.length === 1){
                newExp = param[0];
            }

            if(param.length === 2) {
                let p0 = param.shift();
                if(p0.includes(targetTerms[0])){    //target first
                    target = p0;
                    newExp = param[0];
                }else{                              //exp first
                    newExp = p0;
                    target = param[0];
                }
                for(let tt of targetTerms){
                    target = target.replace(tt,"");
                }
            }

            if (!guildData.hasPermissions(userData, Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}

			//if no target is specified, assume self-targetted
			target = target || e.message.author.id;
			let user = guildData.expTable[target];
			if(user) {
			    if(newExp === "-"){
                    delete guildData.expTable[target];
                    Skarm.sendMessageDelay(e.message.channel, "User data purged.");
                }else {
                    if (!isNaN(newExp - 0))
                        user.exp = newExp;
                    user.level = Skinner.getLevel(user.exp);
                    user.nextLevelEXP = Skinner.getMinEXP(user.level);
                    Skarm.sendMessageDelay(e.message.channel, "New rank data for <@"+ (target)+">\n>>> New total EXP: " + user.exp + "\nEXP required to go for next level: " + (user.nextLevelEXP - user.exp) + "\nCurrent level: " + user.level);
                    let guildMembers = e.message.guild.members;
                    for(let member of guildMembers){
                        if(member.id === target){
                            guildData.roleCheck(member, user);
                        }
                    }
                }
            }else{
			    Skarm.sendMessageDelay(e.message.channel, `Failed to find guild record for user with ID ${target}`);
            }
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
		category: "leveling",
        perms: Permissions.MOD,


        execute(bot, e, userData, guildData) {
			if (!guildData.hasPermissions(userData, Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			let tokens = commandParamTokens(e.message.content);
			if(tokens.length===0){
				Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+((guildData.roleStack)?" currently rewards":" doesn't currently reward")+" stacked roles");
				return;
			}
			if(tokens[0]==="enable" || tokens[0]==="e"){
				guildData.roleStack=true;
				Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+" will now reward stacked roles");
				return;
			}
			if(tokens[0]==="disable" || tokens[0]==="d"){
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
		aliases: ["rolerewards","rr"],
		params: [],
		usageChar: "!",
		helpText: "Displays roles rewarded for leveling up",
		ignoreHidden:true,
		category: "leveling",

        execute(bot, e, userData, guildData) {
			let roles = guildData.rolesTable;
			if(Object.keys(roles).length===0){
				Skarm.sendMessageDelay(e.message.channel,"No roles configured to be rewarded from leveling up in "+e.message.guild.name);
				return;
			}

			let fields = [];
			for(let i in roles){
				fields.push({name: "Level " + i, value: "<@&"+roles[i]+">", inline: true});
			}

            e.message.channel.sendMessage(" ", false, {
                color: Skarm.generateRGB(),
                timestamp: new Date(),
                title: "Roles rewarded from leveling up in "+e.message.guild.name,
                fields: fields,
                footer: {
                    text: e.message.guild.name,
                },
            });

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
		category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
			if(e.message.guild==null){
				Skarm.sendMessageDelay(e.message.channel, "Error: guild not found.");
				return;
			}
			if (!Guilds.get(e.message.channel.guild_id).hasPermissions(Users.get(e.message.author.id), Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			let pars = commandParamTokens(e.message.content);
			if(pars.length!==2){
				if(pars.length===0){
				    module.exports.ViewRoleReward.execute(bot,e,userData,guildData);
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
			pars[1] = pars[1].replace("<","").replace("@","").replace("&","").replace(">","");
			if(pars[1] > 0){
				Guilds.get(e.message.guild.id).rolesTable[pars[0]-0]=pars[1];
				module.exports.ViewRoleReward.execute(bot, e, userData, guildData);
				//Skarm.sendMessageDelay(e.message.channel,"Set level "+pars[0]+" to reward <@&"+pars[1]+">");
				return;
			}
			Skarm.help(bot,e);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	GuildAnnouncementSwitch: {
		aliases: ["levelannounce","announce"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the state of announcing when a user levels up in the guild",
        ignoreHidden: true,
		category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
			if (!guildData.hasPermissions(userData, Permissions.MOD)) {
				Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
				return;
			}
			guildData.announcesLevels= !guildData.announcesLevels;
			if(guildData.announcesLevels){
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
        aliases: ["rolerefresh","role","refresh"],
        params: [],
        usageChar: "!",
        helpText: "Refreshes level up role assignments (Role rewards need to be configured for this to do anything useful)",
        ignoreHidden: true,
        category: "leveling",

        execute(bot, e, userData, guildData) {
            guildData.roleCheck(e.message.member, guildData.expTable[e.message.author.id]);
            Skarm.sendMessageDelay(e.message.channel,"Refreshed your roles!");
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    ImportRankData: {
        aliases: ["importrankdata", "ird"],
        params: [],
        usageChar: "@",
        helpText: "This command takes a single input csv attachment and sets the experience values of all usernames in the guild that appear in the csv file to the exp values on the csv file." +
            "  Expected CSV format of header: " + `"username","level","exp","msgs"`,
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            let channel = e.message.channel;
            let attachments = e.message.attachments;
            console.log(JSON.stringify(attachments));
            if(attachments.length === 1){
                Skarm.sendMessageDelay(channel, `Processing file :\`${attachments[0].filename}\``);
                let params = {
                    timeout: 2000,
                    followAllRedirects: true,
                    uri: attachments[0].url,
                };

                request.get(params, (error, response, body) => {
                    if(error || response.statusCode !== 200){
                        Skarm.sendMessageDelay(channel, `Uh-oh, something went wrong.  I got the error code: ${response.statusCode}\n ${JSON.stringify(error)}`);
                        return;
                    }
                    let lines = body.split("\n");
                    let expectedHeader = `"username","level","exp","msgs"`;
                    if(!lines[0].includes(expectedHeader)){
                        Skarm.sendMessageDelay(channel, `Error in header formatting.  \nExpected: \`${expectedHeader}\`\nFound:\`${lines[0]}\``);
                        return;
                    }

                    let newUserData = Skarm.parseCSV(body);

                    //client acquire all guild members
                    let guildMembers = e.message.guild.members;

                    //compare names and set EXP values
                    for(let member of guildMembers){
                        for(let newUserDatum of newUserData){
                            if(member.username === newUserDatum.username){
                                if(!(member.id in guildData.expTable)){
                                    Skarm.spam(`Failed to find user ${member.username} ID: ${member.id} in the guild database.`);
                                    continue;
                                }
                                Skarm.spam(`Setting user \`${member.username}\`'s EXP to \`${newUserDatum.exp}\`.  Previous EXP: ${guildData.expTable[member.id].exp}`);
                                guildData.expTable[member.id].exp = newUserDatum.exp-0;
                            }
                        }
                    }

                    //console.log(`Parsed CSV: ${JSON.stringify(newUserData)}`);
                });

            }else{
                Skarm.sendMessageDelay(channel, "Error: expected exactly 1 attached file.  Found: " + e.message.attachments.length);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    ConfigBuffRole:{
	    aliases: ["configurebuffrole", "configbuff", "buffconfig", "buffconf", "cbr"],
        params: ["[action (get,set,remove)]", "[role(ping or id)]", "[stat(base,bonus,cooldown,luck)]", "[modifier(num 0 - 1000)]"],
        usageChar: "@",
        helpText: "This command configures a role to give buffs for leveling up in the server.\r\n" +
            "Example 1: `e@cbr set @admin basebuff 2` users with the `@admin` role will receive 2 more base exp per message. \r\n" +
            "Example 2: `e@cbr get @admin` reports the current buffs affecting the `@admin` role. \r\n" +
            "Example 3: `e@cbr get` reports the list of roles who have buffs of any kind. \r\n" +
            "Example 4: `e@cbr remove @admin` removes all buffs currently assigned to the `@admin` role.\r\n\r\n" +
            "Base: modifies the minimum exp gained when a qualifying message is sent. Default server value: 15\r\n" +
            "Bonus: modifies the random bonus exp gained above the maximum when a qualifying message is sent.  Default server value: 10\r\n" +
            "Cooldown: reduces the wait time between qualifying messages.  Scaling is linearized. Default server value: 100. Default server cooldown: 60s.  Granting 100 cooldown reduction will cause the effective cooldown to be 60s/(100 (base) + 100 (bonus)) = 30s\r\n" +
            "Luck: modifies the probability that a message will get close to the full bonus exp. Default server value: 100.",
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData){
            let statAliases = {         //map alias to its definition
                baseBuff: "baseBuff",
                base:     "baseBuff",
                bonus:     "bonusBuff",
                bonusBuff: "bonusBuff",
                cooldownBuff: "cooldownBuff",
                cooldown:     "cooldownBuff",
                cd:           "cooldownBuff",
                luckBuff: "luckBuff",
                luck:     "luckBuff",
                lb:       "luckBuff"
            };
            let actionWords = ["get", "set", "remove"];
	        let content = e.message.content.toLowerCase();
	        let tokens = commandParamTokens(content);
	        let channel = e.message.channel;

	        //at least one parameter required for the role to work properly
	        if(tokens.length < 1) return this.help(bot, e);

	        let action, role, stat, modifier;

	        //determine action
	        for(let actionWord of actionWords){
	            for(let t in tokens){
	                if(tokens[t].includes(actionWord)){
	                    action = actionWord;
	                    tokens.splice(t,1); //remove the token from the array
                        break;
                    }
                }
            }

	        if(tokens.length === 0){
	            if(action === "get"){
                    // return list of roles that exist in the guild buff list
	                let buffedRoles = Object.keys(guildData.expBuffRoles);
                    let roles = [ ];
			        for(let i in buffedRoles){
			        	roles.push("<@&"+buffedRoles[i]+">");
			        }
                    if(roles.length) {
                        e.message.channel.sendMessage(" ", false, {
                            color: Skarm.generateRGB(),
                            timestamp: new Date(),
                            //title: ,
                            fields: [
                                {name: "Roles with buffs", value: roles.join("\r\n")}
                            ],
                            footer: {
                                text: e.message.guild.name,
                            },
                        });
                    }else{
                        Skarm.sendMessageDelay(channel, "No roles in the server have been configured with buffs");
                    }
                    return;
                }else {
                    return this.help(bot, e);           //not enough arguments
                }
            }

            //acquire role
	        let roles = e.message.guild.roles;
	        for(let t = 0; t < tokens.length; t++){
	            for(let guildRole of roles){
	                if(tokens[t].includes(guildRole.id)){   //must be ping or ID of role for this to work
	                    role = guildRole.id;
	                    tokens.splice(t,1);     //remove token from array
                        t = tokens.length;                //break out of both loops
                        break;
                    }
                }
            }


	        //acquire stat and modifier if they must be set
	        if(action === "set"){
	            // acquire stat
                for(let t = 0; t < tokens.length; t++){
                    if(tokens[t] in statAliases){
                        stat = statAliases[tokens[t]];
                        tokens.splice(t,1);
                        break;
                    }
                }

                // acquire modifier
                for(let t = 0; t < tokens.length; t++){
                    if(tokens[t] > -1){
                        modifier = tokens[t];
                        tokens.splice(t,1);
                        break;
                    }
                }
            }

	        if(role === undefined) {
	            Skarm.sendMessageDelay(channel, "Error: failed to find the role to apply action to.");
	            return;
            }
	        guildData.modifyExpBuffRoles(channel, action, role, stat, modifier);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },


    /**
	*	infrastructure
	*/

    /*
     * {    color: 0x3498db,    author: {name: "author name"},    title: "This is an embed",    url: "http://google.com",    timestamp: "2016-11-13T03:43:32.127Z",    fields: [{name: "some field", value: "some value"}],    footer: {text: "footer text"}  }
     */
	Todo: {
        aliases: ["todo"],
        params: ["create the todo command"],
        usageChar: "@",
        helpText: "Logs to the todo list for the dev team",
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            Skarm.todo(commandParamString(e.message.content));
        },

        help(bot, e) {
			Skarm.help(this, e);
		},
    },
    Test: {
        aliases: ["test"],
        params: ["<test>"],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        ignoreHidden: true,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens =commandParamTokens(e.message.content);
            if(tokens.length===0) {
                e.message.channel.sendMessage("running test...", false, {
                    color: Skarm.generateRGB(),
                    author: {name: e.message.author.nick},
                    description: "Skarmory is brought to you by node js, github, Discord, and by viewers like you. Thank you.\r\n-PBS",
                    title: "This is an embed",
                    url: "http://xkcd.com/303",
                    timestamp: new Date(),
                    fields: [{name: "G", value: "And now"}, {name: "R", value: "for something"}, {
                        name: "E",
                        value: "completely"
                    }, {name: "P", value: "different"}],
                    footer: {text: "bottom text"}
                });
            }
            if(tokens[0]==="delete"){
                tokens.shift();
                const timeout = 15000;
                Skarm.sendMessageDelete(e.message.channel,`Testing delete message timeout ${timeout}\n`+tokens.join(" "),false,null,timeout,e.message.author.id,bot);
            }
            if(tokens[0]==="param"){
                let msg = commandParamString(e.message.content.toLowerCase());
                Skarm.sendMessageDelay(e.message.channel,"Looking for -date");
                let d = attemptNumParameterFetch(msg, "-d");
                Skarm.sendMessageDelay(e.message.channel,`Found data: ${d}`); // of length ${d.length}
            }
            if(tokens[0]==="das"){
                Skarm.spam(Guilds.get(e.message.channel.guild.id).flexActivityTable);
            }
            if(tokens[0]==="constants"){
                Skarm.spam(Constants.Lightsabers.Hilts);
            }
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
    },
    Fourchan: {
        aliases: ["4"],
        params: ["id", "t..."],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        ignoreHidden: true,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content);
            if (tokens.length < 2) return Skarm.spam(tokens.length);

            let destination = tokens.splice(0, 1)[0];
            let chan = bot.client.Channels.get(destination);
            if (chan) Skarm.sendMessageDelay(chan, tokens.join(" "));
            else Skarm.spam(`<@${e.message.author.id}> hey, this message failed to send, probably because ${destination} resolved to null`);
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
    },
    Fivechan: {
        aliases: ["5"],
        params: ["id", "t..."],
        usageChar: "@",
        helpText: "Hey, what are you doing here?!",
        ignoreHidden: true,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content);
            if (tokens.length < 1) return;
            let destination = tokens.splice(0, 1)[0];
            let srcChannel = e.message.channel;
            let chan = bot.client.Channels.get(destination);
            if (chan) {

                if (tokens.length < 1) {
                    Skarm.sendMessageDelay(srcChannel, JSON.stringify(Guilds.get(chan.guild_id).channelBuffer[chan.id]));
                    return;
                }
                if (tokens.join("") === "-") {
                    Guilds.get(chan.guild_id).channelBuffer[chan.id] = { };
                    return Skarm.sendMessageDelay(e.message.channel, "cleared");
                }
                Skarm.queueMessage(Guilds, chan, tokens.join(" "));
            }
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
    },
    Game: {
        aliases: ["game"],
        params: ["[name]"],
        usageChar: "@",
        helpText: "Sets Skarm's current game. Omitting the game name will reset it to the spaghetti count.",
        ignoreHidden: false,
        perms: Permissions.MOM,
		category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let cps = commandParamString(e.message.content);
            if(cps===undefined ||cps===null || cps.length<1 || cps==="cycle") {
                bot.game = 0;
                cps=bot.games[bot.game];
            }else{
                bot.game=-1;
            }
            if(cps==="-")
                cps=undefined;

            bot.client.User.setGame({name:cps,type: 0,url:"https://github.com/DragoniteSpam/Skarmbot"});

            Skarm.sendMessageDelay(e.message.channel, "Game set to **" + cps + "**.");

        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Exit: {
        aliases: ["exit","shutdown"],
        params: ["-nosave", "vPID"],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely. Use this to ensure that data is saved before restarting for maintainance or any other reasons. Use the extension -nosave to prevent commiting to skarmData.",
        ignoreHidden: false,
        perms: Permissions.MOM,
		category: "infrastructure",


        execute(bot, e, userData, guildData) {
            let savecode = Constants.SaveCodes.EXIT;
            //save data before a shutdown
			let tok = commandParamTokens(e.message.content.toLowerCase());
			for(let i in tok){
                if(tok[i] === "-nosave" || tok[i]=== "-ns"){
                    //Skarm.log("Shutting down without saving by order of <@" + e.message.author.id + ">");
                    savecode=(Constants.SaveCodes.NOSAVE);
                }
                if(tok[i]-0 <1040 && tok[i]-0 !== bot.pid){
                    return;
                }
            }
			bot.save(savecode);
			Skarm.log("Shutting down by order of <@" + e.message.author.id + ">");
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
		category: "infrastructure",

        execute(bot, e, userData, guildData) {
            Skarm.log("Restarting by order of <@" + e.message.author.id + ">");
            //save memory before a restart
			bot.save(Constants.SaveCodes.REBOOT);
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
		category: "infrastructure",

        execute(bot, e, userData, guildData) {
			bot.save(Constants.SaveCodes.DONOTHING);
			Skarm.sendMessageDelay(e.message.channel, "Data has been saved.");
		},
		
		help(bot, e){
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
		category: "infrastructure",

        execute(bot, e, userData, guildData) {
            bot.saveDebug();
            
            Skarm.sendMessageDelay(e.message.channel, "Saved the debug things!");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
}