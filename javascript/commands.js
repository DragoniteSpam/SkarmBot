"use strict";
const os = require("os");
const request = require("request");

const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Web = require("./web.js");
const Users = require("./user.js");
const Guilds = require("./guild.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");

const SarGroups = require("./guildClasses/sar.js");

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

Constants.initialize();     // if this line isn't here, local initialization of constants in "effect" fields break

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
        helpText: "Prints out a table of guild activity from the past # days.  If not specified, default is 30 days.  Use the page option to access data outside of the top "+Constants.Tables.MaxTableLength+" members.",
        examples: [
            {command: "e!activity", effect: "Will cause Skarm to report the word and message counts of the top "+Constants.Tables.MaxTableLength+" members over the past 30 days."},
            {command: "e!activity -days 45", effect: "Will cause Skarm to report the word and message counts of the top "+Constants.Tables.MaxTableLength+" members over the past 45 days."},
            {command: "e!activity -page 2", effect: "Will cause Skarm to report the word and message counts of the "+(1+Constants.Tables.MaxTableLength)+"th-"+(2*Constants.Tables.MaxTableLength)+"th most active members over the past 30 days."},
            {command: "e!activity -days 45 -page 2", effect: "Will cause Skarm to report the word and message counts of the "+(1+Constants.Tables.MaxTableLength)+"th-"+(2*Constants.Tables.MaxTableLength)+"th most active members over the past 45 days."}
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let message = commandParamString(e.message.content).toLowerCase();
            let tokens = commandParamTokens(e.message.content);
            let days = attemptNumParameterFetch(message, "-d") || 30;
            let page = attemptNumParameterFetch(message, "-p") - 1 || 0;    //convert page to array index
            let dayImplemented = 1613001600000;                                      // Epoch timestamp of day of implementation
            let pageLength = Constants.Tables.MaxTableLength;

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
                        let dayData = userTableObj.days[day];
                        userReportObj.words += isNaN(dayData.wordCount) ? 0 : dayData.wordCount;            // don't let any NaN mess with the final answer (drop it instead)
                        userReportObj.messages += isNaN(dayData.messageCount)? 0 : dayData.messageCount;
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

            let usersToPrint = [];
            for (let i = 0; i + page * pageLength < table.length && i < pageLength && page >= 0; i++) {
                let idx = i + page * pageLength;

                let userMention = Skarm.getUserMention(bot, table[idx].userID);

                usersToPrint.push({
                    Member:   userMention,
                    Words:    table[idx].words,
                    Messages: table[idx].messages,
                });
            }

            if (page * pageLength > table.length) {
                Skarm.sendMessageDelay(e.message.channel, "Requested page is outside of active member range.  Please try again.");
                return;
            }

            description = Skarm.formatTable(usersToPrint);

            let messageObject = {
                color: Skarm.generateRGB(),
                description: description,
                author: {name: e.message.author.nick},
                title: "Server Activity for the past " + days + " days",
                timestamp: new Date(),
                footer: {text: `Page ${page + 1}/${Math.ceil(table.length / pageLength)}`},
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
    RoleMembers: {
        aliases: ["rolemembers", "rm"],
        params: ["role"],
        usageChar: "!",
        helpText: "Returns a list of members who have all of the roles listed by the arguments of this command.",
        examples: [
            {command: "e!rm @Admins", effect: "Will cause Skarm to list all of the admins that you just pinged."},
            {command: "e!rolemembers bots", effect: "Will cause Skarm to list all of the members with the role `bots` in the server."},
            {command: "e!rolemembers bots, red", effect: "Will cause Skarm to list all of the members that have both the roles `bots` and `red` in the server."},
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let targets = commandParamString(e.message.content.toLowerCase().trim()).replaceAll(" ","").split(",");
            //todo: provide support for multiple roles to filter by
            let guildRoles = e.message.guild.roles;
            let matchingMembers = e.message.guild.members;
            let queryRoleNames = [ ];

            for(let target of targets){
                if(target.length === 0) return Skarm.help(this, e);          //return help text on commands with no arguments
                for(let role of guildRoles){
                    if(role.id.includes(target) || role.name.toLowerCase().includes(target.toLowerCase())){
                        target = role;
                        break;
                    }
                }
                // convert user input to role object

                // target === string --> no role match found
                if(typeof(target)==="string") {
                    Skarm.sendMessageDelay(e.message.channel, `Error: found no role matching: \`${target}\``);
                    return;
                }

                queryRoleNames.push(target.name);

                //filter matching members by that role
                for(let i = 0; i<matchingMembers.length; i++){
                    let member = matchingMembers[i];
                    let memberMatches = false;

                    //check if member has role
                    for(let role of member.roles){
                        if(role.id === target.id) {
                            memberMatches = true;
                            break;
                        }
                    }
                    //remove members that don't match the target list from the matching set
                    if(!memberMatches){
                        matchingMembers.splice(i--,1);
                    }
                }
            }

            if(matchingMembers.length === 0){
                Skarm.sendMessageDelay(e.message.channel, "Found no members with this set of roles.");
                return;
            }

            // convert member objects to member mentions after the query is complete
            for(let i in matchingMembers){
                matchingMembers[i] = matchingMembers[i].mention;
            }

            //format results
            let embedobj = {
                color: Skarm.generateRGB(),
                title: "Members with roles: " + queryRoleNames.join(", "),
                description: matchingMembers.join("\r\n").substring(0,2000),
                timestamp: new Date(),
                footer: {text: "Member Role Query"}
            };
            Skarm.sendMessageDelay(e.message.channel, " ",false, embedobj);
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
    ConfigParrot: {
        aliases: ["configureparrot", "cp"],
        params: ["(various)"],
        usageChar: "@",
        helpText: "Define keywords that will cause Skarm to say different things.",
        examples: [
            {command: "e@cp nickname", effect: "Will list the current keywords that summon Skarm, along with their summoning odds."},
            {command: "e@cp nick", effect: "Will list the current keywords that summon Skarm, along with their summoning odds."},
            {command: "e@cp nickname add birdo", effect: "Will add \"birdo\" as one of Skarm's summoning keywords with an activation rate of 100%."},
            {command: "e@cp nick add birdo", effect: "Will add \"birdo\" as one of Skarm's summoning keywords with an activation rate of 100%."},
            {command: "e@cp nickname set birdo", effect: "Will add \"birdo\" as one of Skarm's summoning keywords with an activation rate of 100%."},
            {command: "e@cp nick set birdo", effect: "Will add \"birdo\" as one of Skarm's summoning keywords with an activation rate of 100%."},
            {command: "e@cp nickname add birdo 50", effect: "Will add \"birdo\" as one of Skarm's summoning keywords, but it will only activate 50% of the time."},
            {command: "e@cp nick add birdo 50", effect: "Will add \"birdo\" as one of Skarm's summoning keywords, but it will only activate 50% of the time."},
            {command: "e@cp nickname set birdo 50", effect: "Will add \"birdo\" as one of Skarm's summoning keywords, but it will only activate 50% of the time."},
            {command: "e@cp nick set birdo 50", effect: "Will add \"birdo\" as one of Skarm's summoning keywords, but it will only activate 50% of the time."},
            {command: "e@cp nickname remove birdo", effect: "Will remove \"birdo\" from the list of Skarm's summoning keywords."},
            {command: "e@cp nick remove birdo", effect: "Will remove \"birdo\" from the list of Skarm's summoning keywords."},
            {command: "e@cp shanty", effect: "Will list the current keywords that invoke shanties, along with their summoning odds."},
            {command: "e@cp shanty add scurvy 5", effect: "Will add \"scurvy\" as one of Skarm's shanty keywords, with an activation rate of 5%."},
            {command: "e@cp shanty set scurvy 5", effect: "Will add \"scurvy\" as one of Skarm's shanty keywords, with an activation rate of 5%."},
            {command: "e@cp shanty remove scurvy", effect: "Will remove \"scurvy\" from the list of Skarm's shanty keywords."},
            {command: "e@cp skyrim", effect: "Will list the current keywords that invokes Skyrim, along with their summoning odds."},
            {command: "e@cp sky", effect: "Will list the current keywords that invokes Skyrim, along with their summoning odds."},
            {command: "e@cp skyrim add monahven 5", effect: "Will add \"monahven\" as one of Skarm's Skyrim keywords, with an activation rate of 5%."},
            {command: "e@cp sky add monahven 5", effect: "Will add \"monahven\" as one of Skarm's Skyrim keywords, with an activation rate of 5%."},
            {command: "e@cp skyrim set monahven 5", effect: "Will add \"monahven\" as one of Skarm's Skyrim keywords, with an activation rate of 5%."},
            {command: "e@cp sky set monahven 5", effect: "Will add \"monahven\" as one of Skarm's Skyrim keywords, with an activation rate of 5%."},
            {command: "e@cp skyrim remove monahven", effect: "Will remove \"monahven\" from the list of Skarm's Skyrim keywords."},
            {command: "e@cp sky remove monahven", effect: "Will remove \"monahven\" from the list of Skarm's Skyrim keywords."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content.toLowerCase());
            let domain = tokens.shift();
            let action = tokens.shift();
            let outputString = "";
            let keyword = "";

            let keywordList = undefined;
            let outputHeader = "";
            let outputVoidMessage = "";
            let outputVoidAddMessage = "";
            let outputAddMessage = "";
            let outputVoidRemoveMessage = "";
            let outputRemoveMessage = "";
            let outputRemoveNotFoundMessage = "";
            let outputInvalidCommandMessage = "";

            switch (domain) {
                case "nick":
                case "nickname":
                    keywordList = guildData.parrotKeywords.nickname.keywords;
                    outputHeader = "**Skarm's summoning keywords:**";
                    outputVoidMessage = "_No summoning keywords defined for *${guildData.name}*_";
                    outputVoidAddMessage = "No summoning keyword specified";
                    outputAddMessage = " has been set as a summoning keyword with an activation rate of ";
                    outputVoidRemoveMessage = "No summoning keyword specified";
                    outputRemoveMessage = " has been removed as a summoning keyword";
                    outputRemoveNotFoundMessage = " is not a summoning keyword";
                    outputInvalidCommandMessage = "_Invalid use of the `ConfigParrot nickname` command_";
                    break;
                case "skyrim":
                case "sky":
                    keywordList = guildData.parrotKeywords.skyrim.keywords;
                    outputHeader = "**Skarm's Skyrim keywords:**";
                    outputVoidMessage = "_No Skyrim keywords defined for *${guildData.name}*_";
                    outputVoidAddMessage = "No Skyrim keyword specified";
                    outputAddMessage = " has been set as a Skyrim keyword with an activation rate of ";
                    outputVoidRemoveMessage = "No Skyrim keyword specified";
                    outputRemoveMessage = " has been removed as a Skyrim keyword";
                    outputRemoveNotFoundMessage = " is not a Skyrim keyword";
                    outputInvalidCommandMessage = "_Invalid use of the `ConfigParrot skyrim` command_";
                    break;
                case "shanty":
                    keywordList = guildData.parrotKeywords.shanties.keywords;
                    outputHeader = "**Skarm's shanty keywords:**";
                    outputVoidMessage = "_No shanty keywords defined for *${guildData.name}*_";
                    outputVoidAddMessage = "No shanty keyword specified";
                    outputAddMessage = " has been set as a shanty keyword with an activation rate of ";
                    outputVoidRemoveMessage = "No shanty keyword specified";
                    outputRemoveMessage = " has been removed as a shanty keyword";
                    outputRemoveNotFoundMessage = " is not a shanty keyword";
                    outputInvalidCommandMessage = "_Invalid use of the `ConfigParrot shanty` command_";
                    break;
                default:
                    outputString = "_Invalid use of the `ConfigParrot` command_";
                    break;
            }

            if (keywordList !== undefined) {
                switch (action) {
                    case undefined:
                        outputString = outputHeader;
                        let list = [];
                        for (let keyword in keywordList)
                            list.push(keyword);
                        
                        if (list.length == 0) {
                            outputString = outputVoidMessage;
                        } else {
                            list.sort();
                            for (let keyword in keywordList)
                                outputString += `\r\n\`${keyword}\`: ${Math.floor(keywordList[keyword] * 100)}%`;
                        }
                        break;
                    case "add":
                    case "set":
                        keyword = tokens.shift();
                        let odds = parseFloat(tokens.shift());

                        if (isNaN(odds)) odds = 100;
                        if (keyword === undefined) {
                            outputString = outputVoidAddMessage;
                        } else {
                            keywordList[keyword] = odds / 100;
                            outputString = `\r\n\`${keyword}\` + outputAddMessage + ${Math.floor(odds)}%`;
                        }
                        break;
                    case "remove":
                        keyword = tokens.shift();

                        if (keyword === undefined) {
                            outputString = outputVoidRemoveMessage;
                        } else {
                            if (keyword in guildSummonKeywords) {
                                delete guildSummonKeywords[keyword];
                                outputString = "`${keyword}`" + outputRemoveMessage;
                            } else {
                                outputString = "`${keyword}`" + outputRemoveNotFoundMessage;
                            }
                        }
                        break;
                    default:
                        outputString = outputInvalidCommandMessage;
                        break;
                }
            }

            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Skarm.generateRGB(),
                author: {name: e.message.author.nick},
                description: outputString,
                timestamp: new Date(),
                footer: {text: "Parrot configuration"}
            });
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
            Seondary spaghetti chef: ArgoTheNaut#9716
            Version: ${version}
            
            Library: Discordie (JavaScript):
            <https://qeled.github.io/discordie/#/?_k=m9kij6>
            
            Dragonite:
            <https://www.youtube.com/c/dragonitespam>
            <https://github.com/DragoniteSpam/SkarmBot>
            
            Argo:
            <https://github.com/ArgoTheNaut>
            
            Extra ideas came from SuperDragonite2172, willofd2011, and probably other people.
            
            Thanks to basically everyone on the Kingdom of Zeal server for testing this bot, as well as all of the people who Argo somehow tricked into worshipping him as their god-king.
            
            Wolfram-Alpha is awesome:
            <https://www.npmjs.com/package/node-wolfram>
            
            Random quotes are from Douglas Adams, Sean Dagher, The Longest Johns, George Carlin, Terry Pratchett, Arthur C. Clark, Rick Cook, and The Elder Scrolls V: Skyrim.`
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
            {command: "e!man activity", effect: "Shows the documentation for usage of `e!activity`"},
            {command: "e?xkcd",         effect: "Shows the documentation for usage of `e!xkcd`"},
        ],
        ignoreHidden: false,
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

            if (bot.mapping.help["e?"+cmd]) {
                bot.mapping.help["e?"+cmd].help(bot, e);
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
        aliases: ["nick", "nickname", "setname"],
        params: ["newName"],
        usageChar: "!",
        helpText: "Set what you want skarm to call you across all servers.\r\nIf no nickname is given, skarm will default to your server nickname. \r\nUse `e!nick -` to remove",
        examples: [
            {command: "e!nick", effect: "Skarm will tell you what your current nickname is set to."},
            {command: "e!nick 27", effect: "Skarm will set your nickname to `27`."},
            {command: "e!setname -", effect: "Skarm will remove your nickname from his records and default to server nickname where possible."}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let newNick = commandParamString(e.message.content);
            if (!newNick.length) {
                Skarm.sendMessageDelay(e.message.channel, `Your current nickname is: ${userData.nickName}`);
                return;
            }
            if (newNick === "-") {
                userData.nickName = undefined;
                Skarm.sendMessageDelay(e.message.channel, `Nickname removed`);
                return;
            }
            userData.nickName = newNick.substring(0, 32); //limits imposed by discord inherited by skarm for the sake of sanity and such things
            Skarm.sendMessageDelay(e.message.channel, `Skarm will now refer to you as "${userData.nickName}"`);
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
        examples: [{command: "e!ping", effect: "Skarm will send a message, and then edit the message to include the time that it took for the event to be registered."}],
        ignoreHidden: false,
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
        examples: [
            {command: "e!shanties", effect: "Skarm will list all the shanties that he knows."},
            {command: "e!shanty joli", effect: "Skarm will list all of the shanties that he knows that contain `joli` in their title"}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
			let target = commandParamString(e.message.content);
			let names = bot.shanties.names;
            let shanties = "";
            for (let name of names) {
				if (name.includes(target))
    				shanties += name + ", ";
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
        examples: [{command: "e!skarm", effect: "Provides the latest forecast."}],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            //shanty counter is intentionally wrong following shanties being buffered on a per-channel basis
            let shanty = Math.floor(Math.random() * 5000) / 100;
            let skyrim = Math.floor((new Date).getDay() * bot.skyrimOddsModifier * 10000) / 100;
            Skarm.sendMessageDelay(e.message.channel, "Current shanty forecast: **" + shanty + "%**\n" +
                "The Elder Scrolls Forecast: **" + skyrim + "%**\n" +
                "Something completely normal: **0%**\n" +
                "Something completely different: **" + (100 - shanty - skyrim) + "%**."
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
        examples: [{command: "e!bot", effect: "Provides the stats."}],
        ignoreHidden: false,
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
                "Host: " + os.hostname() + "\n" +
                "vPID: " + bot.pid + "\n" +
                "Version: " + bot.version + "\n" +
                "Uptime (probably): " + uptimeString + "```"
            );
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Suggest: {
        aliases: ["suggest", "suggestion", "issue", "complain", "bug", "bugreport"],
        params: [""],
        usageChar: "!",
        helpText: "Provides a list to the Github Issues page, where you may complain to your heart's content.",
        examples: [{command: "e!suggest", effect: "Provides the link to the submission page."}],
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
        examples: [
            {command: "e!zipf", effect: "Lists the top 10 most frequent words said in the server."},
            {command: "e!zipf 11", effect: "Lists the 11th through 20th most frequent words said in the server."}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let args = commandParamString(e.message.content);
            if (!args || args.length < 1) args = 1;
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
        examples: [
            {command: "e!google sonder definition", effect: "Provides a link to a search engine query for `sonder definition`"}
        ],
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
        examples: [
            {command: "e!stackoverflow how to center a div inside of a div", effect: "Provides a link to the stack overflow search results for `how to center a div inside of a div`"}
        ],
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
        examples: [
            {command: "e!xkcd ", effect: "Provides a link to the most recent XKCD comic."},
            {command: "e!xkcd 753", effect: "Provides a link to XKCD 753."},
            {command: "e!xkcd compiling", effect: "Provides a link to the xkcd titled `compiling`."},
            {command: "e!xkcd web", effect: "Provides a link for every xkcd containing `web` in its title."}
        ],
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
        aliases: ["alias", "trigger"],
        params: ["add | remove | list | clear"],
        usageChar: "@",
        helpText: "Manage additional names that skarm will respond to.  The scope of these aliases is within the guild in which they are configured.  All aliases are case insensitive.\r\nAdd registers new aliases, Remove or delete get rid of existing aliases.  List provides a complete list of guild-specific aliases.  Clear deletes **ALL** guild-specific aliases.",
        examples: [
            {command: "e@alias add scramble",    effect: "Adds `scramble` as an alias that skarm will respond to."},
            {command: "e@alias list",            effect: "Lists all of the guild-specific aliases that skarm will respond to."},
            {command: "e@alias remove scramble", effect: "Removes `scramble` as an alias that skarm will respond to."},
            {command: "e@alias delete *",        effect: "Removes **ALL** guild-specific aliases that skarm will respond to."},
            {command: "e@alias clear",           effect: "Removes **ALL** guild-specific aliases that skarm will respond to."}
        ],
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
        aliases: ["mod", "knight","mods"],
        params: ["member | clear"],
        usageChar: "@",
        helpText: "Administrator command for appointing and removing moderators.  Moderators can use certain administrative commands. Use `e@mod clear` to remove all moderators (caution is advised).",
        examples: [
            {command: "e@mod",    effect: "Lists all members who have been granted moderator-level access to Skarmbot in this guild."},
            {command: "e@mod @TrustedMember",    effect: "Adds or removes `@TrustedMember` to the moderators list for the guild.  If they are currently on the list, they will be removed.  Otherwise, they will be added."},
            {command: "e@mod clear",    effect: "Removes all moderators from the guild."},
        ],
        ignoreHidden: false,
        perms: Permissions.ADMIN,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let words = commandParamTokens(e.message.content);
            if (!guildData.moderators)
                guildData.moderators = {};
            if (words.length === 0) {
                let list = Object.keys(guildData.moderators);
                if (list.length === 0) {
                    Skarm.sendMessageDelay(e.message.channel, "The administrators have not approved of any mods at this time. Use `e@mod @member` to add someone to the mod list.");
                    return;
                }

                let mods = "";
                for (let i in list) {
                    var mod = Guilds.client.Users.get(list[i]);
                    if (mod != null)
                        mods += mod.username + ", ";
                }
                Skarm.sendMessageDelay(e.message.channel, "The current moderators in this guild are: " + mods.substring(0, mods.length - 2));
                return;
            }

            if (words[0] === "clear" || words[0] === "c") {
                guildData.moderators = {};
                Skarm.sendMessageDelay(e.message.channel, "Removed everyone from the moderators list.");
                return;
            }

            //mention => toggle
            let member = words[0].replace("<", "").replace("@", "").replace("!", "").replace(">", "");

            Skarm.log("Toggling state of: " + member);

            if (member in guildData.moderators) {
                delete guildData.moderators[member];
                Skarm.sendMessageDelay(e.message.channel, "Removed <@" + member + "> from the moderators list.");

            } else {
                guildData.moderators[member] = Date.now();
                Skarm.sendMessageDelay(e.message.channel, "Added <@" + member + "> to the moderators list.");
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
        examples: [
            {command: "e!sudo", effect: "Reports what your current access level is."},
            {command: "e!sudo @GuildMember", effect: "Reports the current access level held by `@GuildMember`."}
        ],
        ignoreHidden: false,
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
            if (permissions === Permissions.SUDO) permNames.push("DEVELOPER");
            
			
            Skarm.sendMessageDelay(e.message.channel, "Current permissions of **" +
                member.name + "** in **" + e.message.guild.name + ":**\n" +
                permNames.join(", ")
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Hide: {
        aliases: ["hide"],
        params: [],
        usageChar: "@",
        helpText: "Toggles visibility of the bot in the channel this is used in. Use of this command requires an access level no less than `moderator`.",
        examples: [
            {command: "e@hide", effect: "Toggles whether or not skarm will cause chaos in reaction to messages in the target channel."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {

            if (guildData.toggleHiddenChannel(e.message.channel.id)) {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + bot.nick);
            } else {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + bot.nick);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Hidden: {
        aliases: ["hidden"],
        params: [],
        usageChar: "@",
        helpText: "Lists *ALL* channels that skarm is ignoring in the server.",
        examples: [
            {command: "e@hidden", effect: "Skarm prints a list of the channels that he's ignoring"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let msgStr = "Hidden channels:\n";
            guildData.getHiddenChannels().map((channel) => {
                msgStr += `<#${channel}>\n`;
            });
            Skarm.sendMessageDelay(e.message.channel, msgStr);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Mayhem: {
        aliases: ["mayhem", "chaos"],
        params: ["[roleID]"],
        usageChar: "@",
        helpText: "Toggles a role to function as a mayhem color. Please use the role ID as to avoid tagging people unnecessarily. If no parameter is specified, a list of the mayhem roles will be printed instead.",
        examples: [
            {command: "e@mayhem", effect: "Will cause Skarm to list all mayhem roles."},
            {command: "e@chaos 412002840815599617", effect: "Will cause skarm to add the role with the ID `412002840815599617` to the mayhem list."}
        ],
        ignoreHidden: false,
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
                // if any invalid roles are in the mayhem list (deleted roles, etc) remove them
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i] === undefined) {
                        roles.splice(i--, 1);
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
    Notify: {
        aliases: ["notify"],
        params: ["#"],
        usageChar: "@",
        helpText: "Toggles the notifications of various information for this channel.  Use without a number input to view current state of channel.",
        examples: [
            {command: "e@notify", effect: "Will cause Skarm to list all available notification settings to toggle."},
            {command: "e@notify 4", effect: "Will cause Skarm to toggle announcing all voice channel join and leave activity in the guild to the channel in which the command was sent."}
        ],
        ignoreHidden: false,
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
                        `2: **${(e.message.channel.id in notifChannels.BAN)               ? "Disable":"Enable"}** ban notifications\n`+
                        `3: **${(e.message.channel.id in notifChannels.NAME_CHANGE)       ? "Disable":"Enable"}** name change notifications\n`+
                        `4: **${(e.message.channel.id in notifChannels.VOICE_CHANNEL)     ? "Disable":"Enable"}** voice channel join/change/leave notifications\n`+
                        `5: **${(e.message.channel.id in notifChannels.XKCD)              ? "Disable":"Enable"}** posting new XKCDs upon their release \n`,
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
        params: ["threshold"],
        usageChar: "@",
        helpText: "Toggles the pinning of messages with the required number of upvote reactions (⬆️) in the channel. This command is only usable by users with kicking boots.",
        examples: [
            {command: "e@pin", effect: "Will report the state of pinning upvoted messages."},
            {command: "e@pin 4", effect: "Will set 4 as the threshold for upvotes in order to pin a message in the channel."},
            {command: "e@pin 0", effect: "Will disable automatically pinning messages with any number of upvotes in the channel."}
        ],
        ignoreHidden: true,
        perms: Permissions.MOD,
		category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content);
            let channel = e.message.channel;

            if(tokens.join("").length > 0) {
                if(!isNaN(tokens[0] - 0)){
                    guildData.setPinnedChannel(channel.id, tokens[0] - 0);
                    Skarm.spam("updating data with " + tokens[0]);
                }else{
                    Skarm.help(this, e);
                }
            }else{
                Skarm.spam(`Params of e@pin: ${tokens}`);
            }

            let threshold = guildData.getPinnedChannelState(channel.id);
            if(threshold){
                Skarm.sendMessageDelay(channel, bot.nick + " will pin messages in **" + e.message.channel.name + `** Once they receive ${threshold} upvotes! (⬆️)`);
            }else{
                Skarm.sendMessageDelay(channel, bot.nick + " will not pin upvoted messages in **" + e.message.channel.name + "**");
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
        helpText: "Configure welcome messages for the guild",
        examples: [
            {command: "e@welcome enable", effect: "Will enable welcome messages being sent when users join."},
            {command: "e@welcome disable", effect: "Will disable welcome messages from being sent when users join."},
            {command: "e@welcome set -", effect: "Will remove the welcome message configured for the channel in which the command is run."},
            {command: "e@welcome set Welcome <newmember>! Please don't be evil!", effect: "Will set the welcome message in the channel to `Welcome @theNewKid! Please don't be evil!`"}
        ],
        ignoreHidden: false,
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
    ConfigureJoinRoles: {
        aliases: ["joinroles", "joinrole", "jr"],
        params: ["add | remove | clear", "@role"],
        usageChar: "@",
        helpText: "Configure a collection of roles to be granted to members upon joining the server",
        examples: [
            {command: "e@joinroles", effect: "Will list the currently configured roles granted for joining."},
            {command: "e@joinroles add @StarterRole", effect: "Will set the role @StarterRole to be awarded to all new members joining the server."},
            {command: "e@joinroles remove @StarterRole", effect: "Will remove the role @StarterRole from the list of roles being awarded to all new members joining the server."},
            {command: "e@joinroles clear", effect: "Will clear the list of roles awarded to all new members joining the server."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content.toLowerCase());
            let guildRoles = e.message.guild.roles;
            let action = tokens.shift();

            if(action==="add" || action==="a"){
                for(let roleToAdd of tokens) {
                    let roleAddable = false;
                    for (let role of guildRoles) {
                        if (roleToAdd.includes(role.id)) {
                            roleAddable = role.id;
                        }
                    }
                    if (roleAddable) guildData.serverJoinRoles[roleAddable] = Date.now();
                }
            }

            if(action==="remove" || action==="rm" || action==="r"){
                for(let roleToRem of tokens) {
                    let removeID = false;
                    for (let role of guildRoles) {
                        if (roleToRem.includes(role.id)) {
                            removeID = role.id;
                        }
                    }
                    delete guildData.serverJoinRoles[removeID];
                }
            }
            if(action==="clear"){
                guildData.serverJoinRoles = { };
            }

            let description = "Roles assigned to new members:\r\n";
            for (let roleID in guildData.serverJoinRoles){
                description += `<@&${roleID}>\r\n`;
            }
            if (Object.keys(guildData.serverJoinRoles).length === 0){
                description = "No roles configured!";
            }

            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Skarm.generateRGB(),
                author: {name: e.message.author.nick},
                description: description,
                timestamp: new Date(),
                footer: {text: e.message.guild.name}
            });
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
        examples: [
            {command: "e@soap", effect: "Will remove the last thing that skarm parroted to chat from his quote archives."}
        ],
        ignoreHidden: false,
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
    ConfigSAR: {
        aliases: ["configsar","csar", "cesar"],
        params: ["[varied]"],
        usageChar: "@",
        helpText: "Configure a collection of roles to be granted to members when they run e!sar\n" +
                    "Complete parameter list: e@csar {add, delete (del), rename (ren), GroupName}",
        examples: [
            {command: "e@csar", effect: "Will list the currently configured role groups."},
            {command: "e@csar add Games", effect: "Will create a group `Games` which contains self-assigned roles."},
            {command: "e@csar delete Games", effect: "Will delete the group `Games` and all of its contents."},
            {command: "e@csar rename Ganes Games", effect: "Will rename the group `Ganes` to `Games`, preserving its contents."},
            {command: "e@csar Games", effect: "Will list all roles available from the SAR group `Games`."},
            {command: "e@csar Games add Terraria", effect: "Will add the role @Terraria to the SAR group `Games`."},
            {command: "e@csar Games add Terraria, Warframe, Factorio", effect: "Will add the roles @Terraria, @Warframe, and @Factorio to the SAR group `Games`."},
            {command: "e@csar Games remove Terraria", effect: "Will remove the role @Terraria from the SAR group `Games`."},
            {command: "e@csar Games remove Terraria, Warframe, Factorio", effect: "Will remove the roles @Terraria, @Warframe, and @Factorio to the SAR group `Games`."},
            {command: "e@csar Games clear", effect: "Will remove all roles from the SAR group `Games`."},
            {command: "e@csar Games max", effect: "Will report the amount of roles from the group `Games` that can be equipped."},
            {command: "e@csar Games max 0", effect: "Will remove the limit for the amount of roles from the group `Games` that can be equipped."},
            {command: "e@csar Games max 2", effect: "Will set the limit for the amount of roles from the group `Games` that can be equipped to 2 roles."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content.toLowerCase());
            let guildRoles = e.message.guild.roles;
            let action = tokens.shift();
            let sarTreeRoot = guildData.selfAssignedRoles;
            let outputString = "";

            let reservedTerms = ["add", "delete", "del", "rename", "ren"];
            let reservedHash = {};
            for (let rt of reservedTerms) reservedHash[rt]=true;

            if(action === undefined){
                outputString = "Available groups: ";
                for(let group in sarTreeRoot){
                    outputString += "`"+group+"`, ";
                }
                outputString=outputString.substring(0,outputString.length-2);
                if (Object.keys(sarTreeRoot).length === 0){
                    outputString = "No self-assigned role groups exist.\nCreate one with `e@csar add YourGroupName`!";
                }
            }

            if(action==="add"){
                for(let groupToAdd of tokens) {
                    if (groupToAdd in reservedHash) continue;
                    if (!(groupToAdd in sarTreeRoot)){
                        sarTreeRoot[groupToAdd] = new SarGroups(guildData.id, groupToAdd);
                        outputString += `Added group: `+groupToAdd+`\n`;
                    }
                }
            }

            if(action==="delete" || action==="del"){
                for(let groupToAdd of tokens) {
                    if (groupToAdd in reservedHash) continue;
                    if (groupToAdd in sarTreeRoot){
                        delete sarTreeRoot[groupToAdd];
                        outputString += `Deleted group: `+groupToAdd+`\n`;
                    } else {
                        outputString += "Group not found: " + groupToAdd + "\n";
                    }
                }
            }

            if(action === "rename" || action === "ren") {
                if(tokens.length !== 2){
                    outputString = `Error: Expected 2 arguments, found ${tokens.length} (\`${tokens.join("`, `")}\`)`;
                }else {
                    let oldName = tokens[0];
                    let newName = tokens[1];
                    if (newName in sarTreeRoot || newName in reservedHash){
                        outputString = "Error: new name already occupied";
                    }else{
                        sarTreeRoot[newName] = sarTreeRoot[oldName];
                        delete sarTreeRoot[oldName];
                        sarTreeRoot[newName].rename(newName);
                        outputString += "renamed group " + oldName + " to " + newName;
                    }
                }
            }

            if(action in sarTreeRoot) {
                let groupStr = action;
                let groupObj = sarTreeRoot[groupStr];
                action = tokens.shift();

                // role actions available

                //list
                if(action === undefined){
                    outputString = "Roles in group " + groupStr + ":\n";
                    for(let roleID of groupObj.getRoles()){
                            outputString += `<@&${roleID}>, `;
                    }
                    outputString = outputString.substring(0,outputString.length-2);

                    if (Object.keys(groupObj).length === 0){
                        outputString = "No self-assigned roles in this group!\nAdd them with `e@csar " + groupStr + " add RoleName`!";
                    }
                }

                // add roles to the group
                if(action==="add"){
                    for(let roleToAdd of tokens) {
                        let roleAddable = false;
                        for (let role of guildRoles) {
                            if (roleToAdd.includes(role.id) || role.name.toLowerCase().includes(roleToAdd)) {
                                roleAddable = role.id;
                            }
                        }
                        if (roleAddable) {
                            if(groupObj.addRoleToGroup(roleAddable)) {
                                outputString += `Added role <@&${roleAddable}> to group ` + groupStr + "\n";
                            }else {
                                outputString += `Role <@&${roleAddable}> was already in group ` + groupStr + "\n";
                            }
                        } else {
                            outputString += "Target `" + roleToAdd + "` not found.\n";
                        }
                    }
                }

                // remove roles from the group
                if(action==="remove") {
                    for (let roleToRem of tokens) {
                        let removeID = false;
                        for (let role of guildRoles) {
                            if (roleToRem.includes(role.id) || role.name.toLowerCase().includes(roleToRem)) {
                                removeID = role.id;
                            }
                        }
                        if (groupObj.removeRoleFromGroup(removeID)) {
                            outputString += `Removed role <@&${removeID}> from group ` + groupStr + "\n";
                        }else{
                            outputString += `Role <@&${removeID}> was not in group ` + groupStr + "\n";
                        }
                    }
                }

                // clear all data from group
                if(action==="clear") {
                    sarTreeRoot[groupStr] = new SarGroups(e.message.guild.id, groupStr);
                    outputString += "Hard reset applied to group: " + groupStr +"\n";
                }

                // max
                if(action === "max") {
                    if(tokens.length) {
                        let newMRC = groupObj.setMax(tokens[0]);
                        if(newMRC)
                            outputString = "Maximum roles for group set to: " + newMRC;
                        else
                            outputString = "Role maximum for group removed";
                    } else {
                        // default: get
                        if (groupObj.max) {
                            outputString = `Maximum number of roles that can be equipped from ${groupStr}: ${groupObj.max}`;
                        } else {
                            outputString = "Unlimited roles can be equipped from group: " + groupStr;
                        }
                    }
                }
            }

            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Skarm.generateRGB(),
                author: {name: e.message.author.nick},
                description: outputString,
                timestamp: new Date(),
                footer: {text: "SAR Configuration"}
            });
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    SAR: {
        aliases: ["sar", "getrole"],
        params: ["group"],
        usageChar: "!",
        helpText: "Equip self-assigned roles.",
        examples: [
            {command: "e!sar", effect: "Will list the available role groups to pick from."},
            {command: "e!sar games", effect: "Will list the available roles in the `games` group."},
        ],
        ignoreHidden: false,
        perms: Permissions.BASE,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            /**
             * Global variables
             */

            let tokens = commandParamTokens(e.message.content.toLowerCase());
            let action = tokens.shift();
            let sarTreeRoot = guildData.selfAssignedRoles;
            let nonEmptyGroups = { };
            let outputString = "Unknown argument";

            /**
             * Functions
             */

            // populate non-empty role groups for user selection
            // this function modifies outputStrings and populates nonEmptyGroups `global` variables
            let populateAvailableGroups = function() {
                let i=0;
                for (let group in sarTreeRoot) {
                    if(sarTreeRoot[group].hasRoles()) {      // check if any roles are in the group
                        outputString += `\`${++i}\`: ${group}\n`;
                        nonEmptyGroups[i] = group;
                    }
                }
                    outputString += "`c`: Cancel\n";
            }

            let selectRoleFromGroup = function(e) {
                let outputString = "";
                // Check cancellation condition
                if(e.message.content.toLowerCase() === "c") {
                    Skarm.sendMessage(e.message.channel, "Cancelled");
                    return;
                }

                // filter invalid input
                if(!(e.message.content in userData.transcientActionStateData[e.message.channel.id].validRoles)){
                    Skarm.sendMessageDelete(e.message.channel, "Error: target role not found. Please try again or `c` to cancel.", undefined, undefined, 60000, e.message.author.id, bot);
                    userData.setActionState(selectRoleFromGroup, e.message.channel.id, 60);
                    return;
                }

                let targetRole = userData.transcientActionStateData[e.message.channel.id].validRoles[e.message.content].role;

                let role;
                for(let guildRole of e.message.guild.roles) {
                    if(guildRole.id === targetRole) {
                        role = guildRole;
                        break;
                    }
                }

                if(!role){
                    Skarm.sendMessageDelete(e.message.channel, "Error: target role not found. Please try again or `c` to cancel.", 60000, e.message.author.id, bot);
                    return;
                }

                let roleDeltas = sarTreeRoot[userData.transcientActionStateData[e.message.channel.id].group].requestRoleToggle(targetRole, e.message.member);

                for(let delta of roleDeltas) {
                    outputString += `${delta.change} role: <@&${delta.role}>\n`;
                }

                Skarm.sendMessage(e.message.channel, " ", false, {
                        color: Skarm.generateRGB(),
                        author: {name: e.message.author.nick},
                        description: outputString,
                        timestamp: new Date(),
                        footer: {text: "SAR"}
                    });

                // delete priors
                userData.deleteTransientMessagePrev(e.message.channel.id);
                e.message.delete();

                // purge remnants, resolving state
                userData.transcientActionStateData[e.message.channel.id] = { };
            }

            let selectGroup = function(channel, messageContent) {
                // handle cancellations first
                if(messageContent.toLowerCase() === "c") {
                    Skarm.sendMessage(channel, "Cancelled");
                    return;
                }

                // filter invalid input
                if (!(messageContent in nonEmptyGroups)) {
                    Skarm.sendMessageDelete(channel, "Error: target group not found. Please try again or `c` to cancel.", undefined, undefined, 60000, e.message.author.id, bot);
                    userData.setActionState(selectGroupHandler, channel.id, 60);
                    return;
                }

                // display roles in selected group
                let group = nonEmptyGroups[messageContent];
                if(!userData.transcientActionStateData[channel.id])
                    userData.transcientActionStateData[channel.id] = { };

                let vr = sarTreeRoot[group].getAvailableRoles(e.message.member);
                userData.transcientActionStateData[channel.id].validRoles = vr; //guildData.printRolesInGroup(group, userData, channel, e.message.member);      // sends message containing available roles, returns those roles as a hashmap of valid entities
                userData.transcientActionStateData[channel.id].group = group;

                // set state to role selection
                userData.setActionState(selectRoleFromGroup, channel.id, 60);

                let outputString = "Available Roles:\n";

                // i - indexed role-action pair, vr - valid roles
                for(let i in vr){
                    outputString += `\`${i}\`: ${vr[i].action} role: <@&${vr[i].role}>\n`;
                }

                outputString += "`c`: Cancel\n";

                Skarm.sendMessage(channel," ",false, {
                        color: Skarm.generateRGB(),
                        description: outputString,
                        timestamp: new Date(),
                        footer: {text: "SAR"}
                    },
                    // Add next-state instruction to delete prior message
                    (message, err) => {
                        userData.transcientActionStateData[channel.id].deleteMessage = message.id;
                    }
                );
            }

            let selectGroupHandler = function(e) {
                selectGroup(e.message.channel, e.message.content);

                // delete priors
                userData.deleteTransientMessagePrev(e.message.channel.id);
                e.message.delete();
            }

            /**
             * Initialization
             */

            outputString = "Available groups: \n";
            populateAvailableGroups();

            /**
             * Case handling
             */


            // Default Case: no arguments
            if(action === undefined){
                let nonEmptyGroupCount = Object.keys(nonEmptyGroups).length;
                switch (nonEmptyGroupCount){
                    case 0:
                        outputString = "No populated self-assigned role groups exist.\nCreate a group with `e@csar add YourGroupName`!\nAdd a role to a group with `e@csar YourGroupName add @Bees`";
                        break;

                    case 1:
                        // autoselect the only group
                        selectGroup(e.message.channel, Object.keys(nonEmptyGroups)[0]);
                        return;

                    default:
                        outputString += "\nSelect a group!";
                        userData.setActionState(selectGroupHandler, e.message.channel.id, 60);
                }
            }

            // Case: action == group Name -> skip a menu
            for(let idx in nonEmptyGroups){
                if(action === nonEmptyGroups[idx]){
                    selectGroup(e.message.channel, idx);
                    return;         // avoids smd end of function
                }
            }
            
            Skarm.sendMessage(e.message.channel, " ", false, {
                    color: Skarm.generateRGB(),
                    author: {name: e.message.author.nick},
                    description: outputString,
                    timestamp: new Date(),
                    footer: {text: "SAR"}
                },
                // Add next-state instruction to delete prior message
                (message, err) => {
                    userData.transcientActionStateData[e.message.channel.id] = {deleteMessage: message.id};
                }
            );
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
        params: ["[<@guild member>]"],
        usageChar: "!",
        helpText: "Reports how much exp a member has with the guild, what level that equates to, how much exp is needed to get to the next level, and the member's position on the guild leaderboard.",
        examples: [
            {command: "e!rank", effect: "Will report how much experience you have."},
            {command: "e!rank @Dragonite", effect: "Will report how much experience `@Dragonite` has."},
        ],
        ignoreHidden: true,
		category: "leveling",

        execute(bot, e, userData, guildData) {
			let target = e.message.author.id;
			let tok = commandParamTokens(e.message.content);
			let outputBase = " ";
			if(tok.length===1){
				let user = guildData.resolveUser(tok[0]);
				if(Array.isArray(user)){
				    outputBase =`Multiple users (${user.length}) identified as potential matches.  Please refine query.`;
				    user = user[0];
                }
				if(!user || !(user.id in guildData.expTable)){
					Skarm.sendMessageDelay(e.message.channel,"Error: this user may have not talked at all or you didn't mention them properly.");
					return;
				}
				target = user.id;
			}

			let user = guildData.expTable[target];
			let exp = user.exp - 0;
			let lvl = user.level;
			let toNextLvl = user.nextLevelEXP - exp;
			let targetEntity = bot.client.Users.get(target);
			let guildMembers = e.message.guild.members;
			let targetNick;
			for(let member of guildMembers){
			    if(member.id === target) targetNick = member.nick;
            }

			//https://discordjs.guide/popular-topics/embeds.html#embed-preview
            e.message.channel.sendMessage(outputBase, false, {
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
        helpText: "Sets how much exp you have in the guild\r\n",
        examples: [
            {command: "e@srank 256",                 effect: "Sets your own experience points to 256.  Enough to achieve level 2!"},
            {command: "e@srank @magikarp#1234 0",    effect: "Sets the experience points of the user @magikarp#1234 to 0"},
            {command: "e@srank @Dragonite#7992 100", effect: "Sets the experience points of the user `@Dragonite#7992` to 100.  Enough to achieve level 1!"},
            {command: "e@srank @Dragonite#7992 -",   effect: "Removes dragonite's record from the exp table.  Future message by dragonite will re-add him to the table."},
        ],
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
    Leaderboard: {
        aliases: ["leaderboard","levels"],
        params: ["start position"],
        usageChar: "!",
        helpText: "Prints out a table of the members with the most experience in the guild.  Use the page option to access data outside of the top "+Constants.Tables.MaxTableLength+" members.",
        examples: [
            {command: "e!leaderboard", effect: "Will cause Skarm to report the experience and ranks of the top 15 guild members."},
            {command: "e!leaderboard "+(Constants.Tables.MaxTableLength+1), effect: "Will cause Skarm to report the word and message counts of the "+(Constants.Tables.MaxTableLength + 1)+"th-"+(2 * Constants.Tables.MaxTableLength)+"th guild members."},
        ],
        ignoreHidden: true,
        category: "leveling",

        execute(bot, e, userData, guildData) {
            let message = commandParamString(e.message.content).toLowerCase();
            let tokens = commandParamTokens(e.message.content);
            let startIndex = (tokens && tokens[0] && tokens[0] > 0) ? tokens[0] - 1 : 0;     // initialize start index to be the place in the table where the leaderboard begins
            let iteratingIdx = startIndex;

            let table = guildData.getExpTable();
            let fullTableLen = table.length;
            table = table.splice(startIndex, Constants.Tables.MaxTableLength);     // extract desired elements
            for(let entry of table) {
                entry.rank = ++iteratingIdx;
                entry.member = Skarm.getUserMention(bot, entry.userID);

            }                              // add rank property to entries
            table = Skarm.formatTable(table, ["rank", "member", "exp", "level"], true);                   // covert array to string

            let messageObject = {
                color: Skarm.generateRGB(),
                description: table,
                author: {name: e.message.author.nick},
                title: `Experience Leaderboard`,
                timestamp: new Date(),
                footer: {text: `Page ${Math.floor(startIndex / Constants.Tables.MaxTableLength) + 1}/${Math.ceil(fullTableLen / Constants.Tables.MaxTableLength)}`},
            };

            Skarm.sendMessageDelete(e.message.channel, " ", false, messageObject, Constants.someBigNumber, e.message.author, bot);
        },

        help(bot,e) {
            Skarm.help(this, e);
        },
    },
    RoleStack: {
		aliases: ["rolestack"],
        params: ["enable | disable"],
        usageChar: "@",
        helpText: "Toggles whether or not to keep previous roles when rewarding a new level up role.",
        examples: [
            {command: "e@rolestack",                 effect: "Reports whether or not skarm currently stacks leveled role rewards."},
            {command: "e@rolestack enable",          effect: "Configures skarm to reward the entire stack of level rewards for the server."},
            {command: "e@rolestack disable",         effect: "Configures skarm to reward only the highest level role reward for the server."},
        ],
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
		helpText: "Displays roles rewarded for leveling up.",
        examples: [
            {command: "e!rolerewards", effect: "Reports the roles that are rewarded for leveling up in this guild."},
        ],
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
        examples: [
            {command: "e@slr",                    effect: "Reports the roles that are rewarded for leveling up in this guild"},
            {command: "e@setlevelreward 2 @lvl2", effect: "Configures skarm to reward the role `@lvl2` for achieving level 2."},
            {command: "e@setlevelreward 2 -",     effect: "Configures skarm to not reward any role for achieving level 2."}
        ],
		ignoreHidden: true,
		category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
			if(e.message.guild === null){
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

			let level = pars[0]-0;
			if(!(level<Skinner.EXPREQ.length && level>=0 && Math.floor(level)===level)){
				Skarm.help(this,e);
				return;
			}
			if(pars[1]==="unbind" || pars[1]==="-"){
				delete Guilds.get(e.message.guild.id).rolesTable[pars[0]-0];
                module.exports.ViewRoleReward.execute(bot, e, userData, guildData);
				return;
			}
			pars[1] = pars[1].replace("<","").replace("@","").replace("&","").replace(">","");
            let allGuildRoles = Guilds.getData(guildData.id).roles;
            for(let role of allGuildRoles){
                if(role.id === pars[1]){
                    Guilds.get(e.message.guild.id).rolesTable[pars[0]-0]=pars[1];
                    module.exports.ViewRoleReward.execute(bot, e, userData, guildData);
                    return;
                }
            }

			Skarm.help(bot,e);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
	},
	GuildAnnouncementSwitch: {
		aliases: ["levelannounce", "announce"],
        params: ["enable | disable"],
        usageChar: "@",
        helpText: "Toggles the state of announcing when a user levels up in the guild",
        examples: [
            {command: "e@announce",         effect: "Reports whether or not skarm announces level-ups in this guild."},
            {command: "e@announce enable",  effect: "Configures skarm to announce level-ups in this guild."},
            {command: "e@announce disable", effect: "Configures skarm to not announce level-ups in this guild."},
        ],
        ignoreHidden: true,
		category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            if (!guildData.hasPermissions(userData, Permissions.MOD)) {
                Skarm.spam("Unauthorized edit detected. Due to finite storage, this incident will not be reported.");
                return;
            }

            let tokens = commandParamTokens(e.message.content.toLowerCase());
            for (let token of tokens) {
                if (token[0] === "e") {
                    guildData.announcesLevels = true;
                }

                if (token[0] === "d") {
                    guildData.announcesLevels = false;
                }
            }

            if (guildData.announcesLevels) {
                Skarm.sendMessageDelay(e.message.channel, "Level ups will be announced in this guild");
                return;
            }
            Skarm.sendMessageDelay(e.message.channel, "Level ups will not be announced in this guild");
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
        examples: [
            {command: "e!refresh", effect: "Forces a refresh of your leveled roles."}
        ],
        ignoreHidden: false,
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
        examples: [
            {command: "e@ird", effect: "Takes the csv file attached to the message and assigns each user in the csv file their associated experience."}
        ],
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
        helpText: "This command configures a role to give buffs for leveling up in the server.",
        examples: [
            {command: "e@cbr set @admin basebuff 2", effect: "Users with the `@admin` role will receive 2 more base exp per message from this role."},
            {command: "e@cbr set @admin bonus 10",   effect: "Users with the `@admin` role will receive up to 10 more bonus exp per message from this role."},
            {command: "e@configurebuffrole get",     effect: "Reports the list of roles with buffs of any kind."},
            {command: "e@cbr get @admin",            effect: "Reports the current buffs affecting the `@admin` role."},
            {command: "e@cbr remove @admin",         effect: "Removes all buffs currently assigned to the `@admin` role."},
            {command: "Base",     effect: "Modifies the minimum exp gained when a qualifying message is sent. Default server value: 15"},
            {command: "Bonus",    effect: "Modifies the random bonus exp gained above the maximum when a qualifying message is sent.  Default server value: 10."},
            {command: "Cooldown", effect: "Reduces the wait time between qualifying messages.  Scaling is linearized. Default server value: 100. Default server cooldown: 60s.  Granting 100 cooldown reduction will cause the effective cooldown to be 60s/(100 (base) + 100 (bonus)) = 30s"},
            {command: "Luck",     effect: "Modifies the probability that a message will get close to the full bonus exp. Default server value: 100. For more info: https://github.com/DragoniteSpam/SkarmBot/blob/master/data/doc/Skarm%20leveling%20luck%20probability.pdf"},
        ],
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
        examples: [
            {command: "e@todo task", effect: "Records task to the todo channel"}
        ],
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
        examples: [
            {command: "e@test", effect: "the test."}
        ],
        ignoreHidden: false,
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
        examples: [
            {command: "e@4 429537000408875008 Instance 4 protocol", effect: "Q"},
            {command: "e@4 429537000408875008", effect: "push an instance of parrot"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let tokens = commandParamTokens(e.message.content);
            if (tokens.length < 1) return Skarm.spam(tokens.length);
            if (tokens.length === 1) {
                //assign the first character of the message to be a valid alias to bypass the parrot requirement for a valid alias to proceed parroting
                let additionalAliases = { };
                additionalAliases[e.message.content[0].toLowerCase()] = 1;
                bot.parrot(e, additionalAliases, bot.client.Channels.get(tokens[0]));       //override the parrot function with the target channel
                return;
            }

            let destination = tokens.splice(0, 1)[0];
            let chan = bot.client.Channels.get(destination);
            if (chan && tokens.join(" ").length > 1) Skarm.sendMessageDelay(chan, tokens.join(" "));
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
        examples: [
            {command: "e@5 429537000408875008 Instance 5 protocol", effect: "Q"},
            {command: "e@5 429537000408875008",                     effect: "ls"},
            {command: "e@5 429537000408875008 -",                   effect: "purge"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            console.log(`Received command: ${e.message.content}`);
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

                // Each \n constitutes its own message, for ease of buffering purposes
                let messages = tokens.join(" ").split("\n");
                for(let message of messages){
                    console.log(`Enqueueing ${message}`)
                    Skarm.queueMessage(Guilds, chan, message);
                }
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
        examples: [
            {command: "e@game", effect: "Resets the game to switch between the normal oscillating states."},
            {command: "e@game We are here to drink your beer", effect: "Sets the game skarm is currently playing to `We are here to drink your beer` indefinitely."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let cps = commandParamString(e.message.content);
            if (cps === undefined || cps === null || cps.length < 1 || cps === "cycle") {
                bot.game = Constants.GameState.AUTOMATIC;
                cps = bot.games[bot.game];
            } else {
                bot.game = Constants.GameState.MANUAL;
            }
            if (cps === "-")
                cps = undefined;

            bot.client.User.setGame({name: cps, type: 0, url: "https://github.com/DragoniteSpam/Skarmbot"});

            Skarm.sendMessageDelay(e.message.channel, "Game set to **" + cps + "**.");

        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    GuildList: {
        aliases: ["guildlist", "gl"],
        params: [""],
        usageChar: "@",
        helpText: "Lists the guilds that skarm is currently in and the owners of each one.",
        examples: [
            {command: "e@gl", effect: "Lists guilds."},
            {command: "e@gl 394225763483779084", effect: "Lists guild members."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let argv = commandParamTokens(e.message.content);
            if(argv.length === 0) {
                let guilds = [];
                bot.client.Guilds.forEach((guild) => {
                    guilds.push({
                        name: guild.name,
                        value: "" +
                            // `Guild ID: ${guild.id}\r\n`+
                            guild.owner.username + "\r\n" +
                            "<@" + guild.owner.id + ">" + "\r\n" +
                            "Members: " + guild.members.length,
                        inline: true,
                        members: guild.members.length
                    });
                    if (guild.owner.username.includes("Deleted User") && guild.members.length < 3) {
                        Skarm.log(`Think about leaving the guild with a deleted owner: ${guild.id}`);
                        // guild.leave();    // keeping this commented out just in case
                    }
                });

                guilds.sort((a, b) => {
                    return b.members - a.members
                });

                let embedobj = {
                    color: Skarm.generateRGB(),
                    title: `Guilds where skarm can be found (${guilds.length})`,
                    description: " ",
                    fields: guilds,
                    timestamp: new Date(),
                    footer: {text: "Guild List Query"}
                };
                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);
            }

            if(argv.length ===1) {
                let guild = bot.client.Guilds.get(argv[0]);
                if(!guild){
                    Skarm.sendMessageDelay(e.message.channel, "Guild not found");
                    return;
                }
                let memberList = [];
                for(let i = 0; i<50 && i<guild.members.length; i++){
                    memberList.push("<@"+guild.members[i].id +">");
                }

                let embedobj = {
                    color: Skarm.generateRGB(),
                    title: `Guild members`,
                    description: memberList.join("\r\n"),
                    timestamp: new Date(),
                    footer: {text: "Guild Member Query"}
                };
                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);

            }
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
        examples: [
            {command: "e@exit", effect: "Save and shut down."},
            {command: "e@exit -nosave", effect: "Shut down without saving."},
            {command: "e@exit 37120",   effect: "Save and shut down the instance of Skarmbot with process ID 37120."},
            {command: "e@exit 37120 -nosave",   effect: "Shut down the instance of Skarmbot with process ID 37120 without saving."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
		category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let savecode = Constants.SaveCodes.EXIT;
            //save data before a shutdown
			let tokens = commandParamTokens(e.message.content.toLowerCase());
			for(let token of tokens){
                if(token === "-nosave" || token === "-ns"){
                    //Skarm.log("Shutting down without saving by order of <@" + e.message.author.id + ">");
                    savecode=(Constants.SaveCodes.NOSAVE);
                }

                //if a process ID number is specified, abort shutdown unless this is your process ID
                if(token < (Constants.processIdMax << Constants.versionOffsetBits) && tokens[i] != bot.pid){
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
        examples: [
            {command: "e@reboot", effect: "Save and reboot."}
        ],ignoreHidden: false,
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
        examples: [
            {command: "e@save", effect: "Saves data."}
        ],
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
        examples: [
            {command: "e@write", effect: "Saves data to `./debug/`."}
        ],
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
    Munroe: {
	    //TODO: double check what isn't useless here
        aliases: ["munroe"],
        params: ["push | lockcheck"],
        usageChar: "@",
        helpText: "This feature has been deprecated to now run through e@notify.  Please use that command instead.",
        examples: [
            {command: "e@munroe push", effect: "Forces a check for the latest xkcd release."}
        ],
        ignoreHidden: true,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let args = commandParamTokens(e.message.content);

            if (args.length === 0) {
                //Skarm.sendMessageDelay(e.message.channel, "XKCDs are " + ((e.message.channel.id in bot.channelsWhoLikeXKCD) ? "" : "not ") +" currently being sent to " + e.message.channel.name + ".");
                Skarm.sendMessageDelay(this.helpText);
                return;
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
                case "push":
                    bot.xkcd.checkForNewXKCDs();
                    break;
                case "lockcheck":
                    Skarm.spam("XKCD lock state: " + bot.xkcd.lock);
                    break;
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
    },
}
