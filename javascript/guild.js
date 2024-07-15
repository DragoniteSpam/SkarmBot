"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Permissions = require("./permissions.js");
const Skinner = require("./skinnerbox.js");
const Users = require("./user.js");
const { ShantyCollection, Shanty, ShantyIterator } = require("./shanties.js");

const SarGroups = require("./guildClasses/sar.js");
const Parrot = require("./guildClasses/parrot.js");
const AutoPin = require("./guildClasses/autopin.js");


const guilddb = "../skarmData/guilds.penguin";

const MIN_LINES = 40;

let defaultLines = ["please stand by"];

let messageIsAction = function(message) {
    if (message.startsWith("_") && message.endsWith("_")) return true;
    if (message.startsWith("*") && message.endsWith("*")) return true;
    return false;
};

fs.readFile("data/dynamicQuotes/dna/quotes.txt", function(err, data) {
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
    };
    if (guild.notificationChannels.ASYNC_HANDLER === undefined) guild.notificationChannels.ASYNC_HANDLER = {};
    guild.comicChannels ??= { };
    if (guild.notificationChannels.XKCD) {
        guild.comicChannels["XKCD"] = guild.notificationChannels["XKCD"];
        delete guild.notificationChannels["XKCD"];
    };

    if (guild.activityTable === undefined) guild.activityTable = [ ];
    if (guild.flexActivityTable === undefined) {
        guild.flexActivityTable = {};
        for(let i in guild.activityTable){
            let prevObj = guild.activityTable[i];
            guild.flexActivityTable[prevObj.userID] = {
                days: {},
                totalWordCount:0,
                totalMessageCount:1
            };

            for(let day in prevObj.days){
                guild.flexActivityTable[prevObj.userID].totalWordCount += prevObj.days[day];
                guild.flexActivityTable[prevObj.userID].days[day]= {wordCount:prevObj.days[day], messageCount: 1};
            }

        }
    }
    if (guild.hiddenChannels === undefined) {guild.hiddenChannels = {};}
    if (guild.zipfMap === undefined) {guild.zipfMap = { };}
    if (guild.expBuffRoles === undefined) {guild.expBuffRoles = { };}
    if (guild.serverJoinRoles === undefined) guild.serverJoinRoles = { };
    if (guild.selfAssignedRoles === undefined) guild.selfAssignedRoles = { };
    guild.parrot ??= new Parrot(guild.id);
    guild.autoPin ??= new AutoPin(guild.id);
    guild.shantyIterator = new ShantyIterator(guild.shantyIterator);
    guild.deceptiveMarkdownLinkAlert ??= true;
};

// since de/serialized objects don't keep their functions
const linkFunctions = function(guild) {
    for(let groupName in guild.selfAssignedRoles){
        SarGroups.initialize(guild.selfAssignedRoles[groupName]);
    }

    guild.parrot ??= new Parrot(guild.id);
    Parrot.initialize(guild.parrot);
    AutoPin.initialize(guild.autoPin);

    guild.resolveUser = function(userid) {
        /**
        * Fetch the IUser object(s) representing a user in the current server
        * Examples:
        *      guild.resolveMember("137336478291329024")
        *          -> IUser { id: "137336478291329024", username: "dragonite", ... }
        *      guild.resolveMember("drago")
        *          -> [ IUser { id: "137336478291329024", username: "dragonite", ... } ]
        * @param {string} userid The id, server nickname, or Discord username of the member you want to look up
        * @returns An IUser corresponding to the userid it's an ID or Discord username, or an array of users if more than one user matches the userid if it's a server nickname
        */
        let members = this.resolveMember(userid);
        if (members === null) return null;
        if (Array.isArray(members)) {
            for (let i = 0; i < members.length; i++) {
                members[i] = Guild.client.Users.get(members[i].id);
            }
            return members;
        }
        return Guild.client.Users.get(members.id);
    };

    guild.resolveMember = function(userid) {
        /**
        * Fetch the IGuildMember object(s) representing a user in the current server
        * Examples:
        *      guild.resolveMember("137336478291329024")
        *          -> IGuildMember { id: "137336478291329024", nick: "drago", ... }
        *      guild.resolveMember("drago")
        *          -> [ IGuildMember { id: "137336478291329024", nick: "drago", ... } ]
        * @param {string} userid The id, server nickname, or Discord username of the member you want to look up
        * @returns An IGuildMember corresponding to the userid if it's an ID or Discord username, or an array of members if more than one member matches the userid if it's a server nickname
        */
        userid = Skarm.extractUser(userid);    // clean up data
        let server = Guild.client.Guilds.get(this.id);
        let members = server.members;
        for (let member of members) {
            if (member.id === userid) return member;
            if (member.username.toLowerCase() === userid) return member;
        }

        let potential = [];
        for (let member of members) {
            if (member.username && member.username.toLowerCase().includes(userid) || member.nick && member.nick.toLowerCase().includes(userid)) {
                potential.push(member);
            }
        }
        if (potential.length === 0) return null;
        if (potential.length === 1) return potential[0];
        return potential;
    };

    guild.botCanEditRole = function(roleID, botAccount) {
        let apiGuildData = Guild.getData(this.id);

        let targetRole;
        for (let role of apiGuildData.roles){
            if (role.id === roleID){
                targetRole = role;
                break;
            }
        }
        if (!targetRole) return false;

        let guildBotMember = botAccount.memberOf(apiGuildData);
        let guildPermissions = guildBotMember.permissionsFor(apiGuildData);

        if (!guildPermissions.General.MANAGE_ROLES) {
            Skarm.spam(`I don't have permission to manage roles in ${this.id}. (mayhem)`);
            return false;
        }

        let skarmRank = 0;
        for (let role of guildBotMember.roles) {
            skarmRank = Math.max(skarmRank, role.position);
        }

        return targetRole.position <= skarmRank;
    }

    //functions executed after every message

    guild.executeMayhem = function(botAccount) {
        let apiGuildData = Guild.getData(this.id);
        for (let roleID in this.mayhemRoles) {
            if(!this.mayhemRoles[roleID]) continue;             //double check to not toggle disabled mayhem roles
            for (let i = 0; i < apiGuildData.roles.length; i++) {
                let roleData = apiGuildData.roles[i];
                if (roleData.id === roleID && guild.botCanEditRole(roleID, botAccount)) {
                    try {
                        let output = Skarm.generateRGBWeighted();
                        roleData.commit(roleData.name, output, roleData.hoist, roleData.mentionable);
                    } catch (e) {
                        console.error(e);
                        // if you dont have permission to mess with the role, don't i guess
                    }
                }
            }
        }
    };

    /**
     *
     * @param userId: the ID of the user to compare against the guild
     * @return Number: the amount of users that have equal or more EXP in the guild than the input user ID
     */
    guild.getUserRank = function(userId){
        let rank = 0;
        let referenceExp = this.expTable[userId].exp;
        for(let id in this.expTable){
            let user = this.expTable[id];
            if(user.exp >= referenceExp) rank++;
        }
        return rank;
    };

    guild.updateEXP = function(e) {
        if (!this.expTable) {
            this.expTable = { };
        }

        let author = e.message.author;

        let baseExpGain = 15;
        let maxBonusExp = 10;
        let cooldownReduction = 100;
        let cooldownTime = 60 * 1000 * cooldownReduction;
        let baseLuck = 100;
        let luck = baseLuck;

        //factor in buffs after base stats
        let roles = e.message.member.roles;
        for(let role of roles){
            if(role.id in guild.expBuffRoles){
                baseExpGain       += guild.expBuffRoles[role.id].baseBuff - 0;
                maxBonusExp       += guild.expBuffRoles[role.id].bonusBuff - 0;
                cooldownReduction += guild.expBuffRoles[role.id].cooldownBuff - 0;
                luck              += guild.expBuffRoles[role.id].luckBuff - 0;
            }
        }

        cooldownTime = cooldownTime / cooldownReduction;

        if(author.id in this.expTable) {
            if (this.expTable[author.id].lastMessage + cooldownTime >= Date.now()) return;
        }else {
            this.expTable[author.id] = {
                exp: 0,                                   //num: current exp
                level: 0,                                 //num: level
                nextLevelEXP: Skinner.getMinEXP(0),  //num: exp needed to level up
                lastMessage: undefined,                   //num: timestamp
            };
        }

        let userEXPData = this.expTable[author.id];

        //catch the bug that you don't expect to exist
        if(isNaN(userEXPData.exp)) userEXPData.exp = 0;

        let bonusStrengthMod = Math.pow(Math.random(), baseLuck/luck);   // sqrt(x) where x<1 increases the value of x. baseLuck <= luck -> minor probability buff that is never completely trivial

        //+1 due to the value being rounded down.  Math.random() will never generate 1.0 so 0-10 are equally likely at 1/11 odds each
        userEXPData.exp -= 0;   //cast to Number
        userEXPData.exp += baseExpGain + Math.floor((maxBonusExp + 1) * bonusStrengthMod);
        userEXPData.lastMessage = Date.now();

        // level up?
        let oldLevel = userEXPData.level;
        userEXPData.level = Skinner.getLevel(userEXPData.exp);
        if(userEXPData.exp >= userEXPData.nextLevelEXP || isNaN(userEXPData.nextLevelEXP) || oldLevel !== userEXPData.level) {
            userEXPData.nextLevelEXP = Skinner.getMinEXP(userEXPData.level);

            //set to >1 in case of level 0 role or for a hidden "point of trust" level
            if(this.announcesLevels)
                e.message.channel.sendMessage("Level up! " + e.message.member.nickMention+ " is now **Level " + userEXPData.level + ".**");

            //assign level up roles if appropriate
            if (!this.rolesTable) {
                this.rolesTable = { };
            }

            this.roleCheck(e.message.member, userEXPData);
        }
    };

    /**
     * Returns a sorted array of user experience objects with the following properties:
     * exp: Num
     * level: Num
     * nextLevelEXP: Num
     * lastMessage: Num
     * userID: String User GUID
     * The most active member of the guild will be the first entry in the array
     */
    guild.getExpTable = function() {
        let memberObjList = [ ];
        let members = Object.keys(this.expTable);
        for (let member of members){
            let obj = this.expTable[member];
            obj.userID = member;                // Add property User ID to each object before publishing it
            memberObjList.push(this.expTable[member]);
        }
        memberObjList.sort((a,b) => {return b.exp - a.exp});
        return memberObjList;
    };

    /**
     * Modify a property of an exp buffing role or delete a role from the list.
     *  @Param0 channel: where status feedback should be reported
     *
     *  @Param1 Action list: GET, SET, REMOVE
     *
     *  Get - returns the current value.  Modifier is ignored.
     *  Set - overrides the current value or adds the role to the table.
     *  Remove - removes the entire role from the table, leaving no recoverable record.
     *
     *  @Param2 Role: ID
     *  The ID of the role in the guild. Validation that the role ID is valid is left to the function caller.
     *
     *  @Param3 Stat list: baseBuff, bonusBuff, cooldownBuff, luckBuff
     *  The four keys associated with any role in the table that can be modified
     *
     *  @Param4 modifier: Number >= 0
     *  The strength of the modifier.  Must be a non-negative number between 0 and 1,000
     *
     */
    guild.modifyExpBuffRoles = function(channel, action, role, stat, modifier) {
        let UPPER_MODIFIER_LIMIT = 1000;
        let LOWER_MODIFIER_LIMIT = 0;

        action = action.toLowerCase().trim();
        if(action === "get"){
            if(role in guild.expBuffRoles){
                guild.reportExpBuffRole(channel, role);
            }else{
                Skarm.sendMessageDelay(channel, `No buffs configured for this role.`);
            }
            return;
        }

        if(action === "set"){
            if(stat === undefined){
                Skarm.sendMessageDelay(channel, "Error: The status to be modified was not properly acquired.");
                return;
            }
            if(isNaN(modifier) || modifier < LOWER_MODIFIER_LIMIT || modifier > UPPER_MODIFIER_LIMIT){
                Skarm.sendMessageDelay(channel, `Error: expected a number between ${LOWER_MODIFIER_LIMIT} and ${UPPER_MODIFIER_LIMIT}. Found: ${modifier}`);
                return;
            }

            if(!(role in guild.expBuffRoles)){  //create the role entry if it isn't present
                guild.expBuffRoles[role] = {
                    baseBuff:     0,
                    bonusBuff:    0,
                    cooldownBuff: 0,
                    luckBuff:     0
                };
            }
            guild.expBuffRoles[role][stat] = modifier;
            let allZero = (modifier === 0);                         //check if role should be removed from table
            for(let key of Object.keys(guild.expBuffRoles[role])){
                if(guild.expBuffRoles[role][key] > 0){
                    allZero = false;
                    break;
                }
            }
            if(allZero){
                action = "remove";
            }else{
                guild.reportExpBuffRole(channel, role);
                return;
            }
        }

        if(action === "remove"){
            delete guild.expBuffRoles[role];
            Skarm.sendMessageDelay(channel, "Role buffs removed.");
            return;
        }

        Skarm.sendMessageDelay(channel, `Error: invalid action: ${action}`);
    };

    /**
     * Sends an embedded message detailing the current buffs applied by a given role
     */
    guild.reportExpBuffRole = function(channel, roleID){
        let buffs = guild.expBuffRoles[roleID];
        let fields = [{name: `Buffed role`, value: `<@&${roleID}>`, inline: false}];
        for(let b of Object.keys(buffs)){
            fields.push({name: b, value: buffs[b], inline:true});
        }

        channel.sendMessage(" ", false, {
            color: Skarm.generateRGB(),
            timestamp: new Date(),
            fields: fields,
            footer: {
            },
        });
    }

    guild.updateActivity = function(e) {
        let day = Date.now();
        let wordCount = e.message.content.replaceAll("  "," ").replaceAll("\r\n","\n").replaceAll("\n\n","\n").replaceAll("\n"," ").split(" ").length;
        day -= day % (24* 60* 60* 1000);
        if(e.message.author.id in guild.flexActivityTable) {
            let memberActivityObject = guild.flexActivityTable[e.message.author.id];
            if (day in memberActivityObject.days) {
                memberActivityObject.days[day].wordCount += wordCount;
                if(isNaN(memberActivityObject.days[day].wordCount)) {
                    Skarm.spam(`Found a NaN day for ${e.message.author.id}, attempting automatic repair. Incoming message length: ${wordCount}`);
                    memberActivityObject.days[day].wordCount = wordCount;
                }
                memberActivityObject.days[day].messageCount++;
            } else {
                memberActivityObject.days[day] = {wordCount: wordCount, messageCount: 1};
            }
            memberActivityObject.totalWordCount += wordCount;
            memberActivityObject.totalMessageCount++;
            return;
        }


        guild.flexActivityTable[e.message.author.id] = {
            days: {
                day: {
                    wordsCount:wordCount,
                    messageCount:1,
                }
            },
            totalMessageCount:1,
            totalWordCount:wordCount
        };

    };

    guild.appendZipfData = function (content) {
        //Skarm.spam(`Received content: ${content}`);
        //filter sentence structure
        content = content.toLowerCase();


        //purge special characters
        let replaceWithSpaceChars  = '.,/\r\n:()<>@"`#$%^&*_+={}[]\\|?!;';
        for(let i in replaceWithSpaceChars){
            let repl = replaceWithSpaceChars[i];
            while(content.includes(repl)){
                content = content.replace(repl," ");
            }
        }

        while(content.includes("  ")){
            content = content.replace("  "," ");
        }


        let words = content.split(" ");

        //Skarm.spam(`Generated array: ${words}`);

        for(let i in words){
            let word = words[i];



            //filter word structure
            if(word.includes("http"))   continue;
            if(word.includes("="))      continue;
            if(word[0] === "-")         continue;
            if(word[0] === "!")         continue;
            if(word.length > 1 && word[1] === "!")         continue;

            if(!(word in guild.zipfMap))
                guild.zipfMap[word] = 0;
            guild.zipfMap[word]++;
        }

        if ("" in guild.zipfMap){
            delete guild.zipfMap[""];
        }


    };

    //functions corresponding to commands
    guild.soap = function () {
        if(this.lastSendLine) delete this.lines[this.lastSendLine];
        this.lastSendLine = undefined;
    };

    guild.soapText = function() {
        this.lines = { };
        this.lastSendLine = undefined;
    };

    guild.soapActions = function() {
        this.actions = { };
        this.lastSendLine = undefined;
    };

    guild.toggleMayhem = function(id) {
        this.mayhemRoles[id] = this.mayhemRoles[id] ? undefined : id;
        return !!this.mayhemRoles[id];
    };

    guild.sendWoeMessage = function() {
        // for best results, the woe message should be formatted something like:
        // "Yo, {user.username}! If you can see this, it means you've been
        // restricted from using the server."
        Skarm.sendMessageDelay(this.woe.channel, this.woe.message);
    };

    guild.getLineCount = function() {
        return Object.keys(this.lines).length;
    };

    guild.getZipfSubset = function (startIndex){
        let uniqueWordCount = Object.keys(guild.zipfMap).length;
        if(!isFinite(startIndex)){
            return `Inappropriate input parameter: \`${startIndex}\`. Expected a number 1 - ${uniqueWordCount}`;
        }else{
            startIndex = startIndex-0;
        }

        //convert hashmap to array
        let zipfArray = [ ];
        for(let word in guild.zipfMap){
            zipfArray.push({word:word, occurrences:guild.zipfMap[word]});
        }
        zipfArray.sort((a,b) => {return b.occurrences - a.occurrences});

        let maxZipfWordLen = 0;
        let maxZipfIdxLen = 0;

        let idxAlignFlag = "%iaf";
        let freqAlignFlag = "%faf";
        let includedWords = [];

        let printData = ["Frequency of values starting at " + startIndex + "```"];
        for(let i = -1; i<9 && startIndex+i < zipfArray.length; i++){
            let wordObj = zipfArray[startIndex+i];
            includedWords.push(wordObj);
            maxZipfWordLen = Math.max(maxZipfWordLen, wordObj.word.length);
            let pushString = ""+(1+startIndex+i) + ":" + idxAlignFlag + wordObj.word + freqAlignFlag+" - " + wordObj.occurrences + "";
            printData.push(pushString);
            maxZipfIdxLen = Math.max(maxZipfIdxLen, pushString.indexOf(":"));
        }

        //Skarm.spam(`maxZipfWordLen: ${maxZipfWordLen}`);

        for(let i in printData){
            let lineText = printData[i];
            if(lineText.includes(freqAlignFlag)){
                let replacementString = "";
                let spaceBufferWidth = 2 + maxZipfWordLen -  includedWords[i-1].word.length;
                //Skarm.spam(`Assigning ${spaceBufferWidth} spaces for ${lineText}`);
                for(let j=0; j<spaceBufferWidth; j++){
                    replacementString+= " ";
                }
                while(replacementString.includes("    "))
                    replacementString = replacementString.replace("    ","\t");
                lineText = lineText.replace(freqAlignFlag,replacementString)
            }

            let indexEndFlag = ":";
            let idxAlignText = "  ";
            if(lineText.includes(indexEndFlag)){
                if(lineText.indexOf(":") < maxZipfIdxLen)
                    idxAlignText+= " ";
                lineText = lineText.replace(idxAlignFlag, idxAlignText);
            }

            printData[i] = lineText;
        }

        printData.push("```");
        return printData.join("\r\n");
    }

    guild.assignNewMemberRoles = function (member, discord_guild, bot){
        let validRoles = discord_guild.roles.map(role=>role.id);
        let roleList = Object.keys(guild.serverJoinRoles)
            .filter(role => validRoles.includes(role))
            .filter(role => guild.botCanEditRole(role, bot))
        ;

        // debugging spam    
        Skarm.spam("Joining member role list:", roleList);
        Skarm.spam("All valid role IDs:", validRoles);

        if(roleList.length === 0){
            return new Promise((resolve, reject) => {
                resolve();  // instantly returns
            })
        }

        return member.setRoles(roleList);  // returns the promise from the parent object
    }

    //functions that are subroutines of parrot
    guild.pruneActions = function() {
        let keys = Object.keys(this.actions);
        if (keys.length <= Constants.Vars.LOG_CAPACITY) {
            return;
        }

        for (let i = 0; i < keys.length; i+=2) {
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

        let keys = Object.keys(this.actions);
        // if there are no stored messages, use the default log instead
        if (keys.length < MIN_LINES) {
            // console.log(`Guild has less action lines (${keys.length}) than minimum (${MIN_LINES})`);
            return guild.parrot.getRandomLine(e.message.content, guild);
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

    guild.learnAction = function(e) {
        let message = e.message.content;
        message = message.substring(1, message.length - 1).toLowerCase();
        this.actions[message] = true;
        this.pruneActions();
    };

	guild.pruneLines = function() {
        let keys = Object.keys(this.lines);
        if (keys.length <= Constants.Vars.LOG_CAPACITY) {
            return;
        }

        for (let i = 0; i < keys.length; i+=2) {
            delete this.lines[keys[i]];
        }
    };

    guild.queueMessage = function(channel,message,tts,object){
        if(message.replaceAll("\r","").length === 0 && !object) return;        // don't enqueue empty messages -- no message and no object
        if(!this.channelBuffer){
            this.channelBuffer = { };
        }
        if(channel.id in this.channelBuffer){
            this.channelBuffer[channel.id].push({_1: message, _2:tts, _3: object});
        }else{
            this.channelBuffer[channel.id]=[{_1: message, _2:tts, _3: object}];
        }
    };

    //utilities

	guild.getRandomLine = function(e) {
        if (messageIsAction(e.message.content)) return this.getRandomAction(e);

        // handle the queue message buffer for e@5
        // console.log("checking the buffer...");
        if(typeof(this.channelBuffer)==="undefined") {
            // console.log(`redefining channel buffer: ${JSON.stringify(this.channelBuffer)}`);
            this.channelBuffer = { };
        }

        //check channel buffer for any enqueued messages first
        if(e.message.channel.id in this.channelBuffer) {
            if (this.channelBuffer[e.message.channel.id].length > 0) {
                return this.channelBuffer[e.message.channel.id].shift()._1;
            }
        }

        return guild.parrot.getRandomLine(e.message.content, guild);
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


	guild.getPinnedChannelState = function (channelID){
	    return this.channelsPinUpvotes[channelID];
    };

	guild.setPinnedChannel = function(channelID, threshold) {
        if (!this.channelsPinUpvotes) this.channelsPinUpvotes = { };
        this.channelsPinUpvotes[channelID] = threshold;
        return this.channelsPinUpvotes[channelID];
    };

	guild.roleCheck = function(member, userEXPData) {
		if(Object.keys(guild.rolesTable).length === 0) return;

		if(userEXPData === undefined){
		    return
        }

		//give users the role achieved at their level or the next one available bellow it
        let i = userEXPData.level;
		for (i; i >= 0; i--) {              //move down the roles table until you hit a level with an associated role
			if (i in this.rolesTable) {     //hit the first rewarded role
				member.assignRole(this.rolesTable[i]);      //assign the role for that level
                if (!this.roleStack) {                      //if the guild is configured to only keep the highest level reward, drop the lower level roles
                    setTimeout(() => {
                        let keepRoleLevel = i--;
                        for (i; i >= 0; i--) {                  //move down the list and purge any other lower-level roles
                            if(i in this.rolesTable){
                                if(this.rolesTable[i] !== this.rolesTable[keepRoleLevel]){
                                    member.unassignRole(this.rolesTable[i]);
                                }
                            }
                        }
                    }, 500);

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
                Skarm.sendMessageDelay(client.Channels.get(channelID), " ", false, {
                    color: Constants.Colors.RED,
                    description: `**${user.username}** has left the server. (${user.id})`,
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
                    description: `**${member.username}** has joined the server. (${member.id})`,
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
                    description: `**${member.username}** has been banned from the server. (${member.id})`,
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
                    description: `**${member.username}** has been unbanned from the server. (${member.id})`,
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
                let dsc = `**${member.username}** has joined the voice channel. **${eventObject.channel.name}**`;
                if(guild.notificationChannels.ASYNC_HANDLER[member.id]===eventObject.channelId){
                    //console.log(`Previous state is equal to current state: ${guild.notificationChannels.ASYNC_HANDLER[member.id]}`);
                    return 2;
                }else {
                    if (guild.notificationChannels.ASYNC_HANDLER[member.id] != null) {
                        dsc = `**${member.username}** has switched from **${client.Channels.get(guild.notificationChannels.ASYNC_HANDLER[member.id]).name}** to **${client.Channels.get(eventObject.channelId).name}**`;
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
                let dsc = `**${member.username}** has left the voice channel. **${eventObject.channel.name}**`;

                if (eventObject.newChannelId != null) {
                    if(guild.notificationChannels.ASYNC_HANDLER[member.id]===eventObject.newChannelId){
                        return 2;
                    }else{
                        if(!guild.notificationChannels.ASYNC_HANDLER[member.id]){
                            Skarm.logError("User channel swap data was lost during downtime.");
                        }else {
                            dsc = `**${member.username}** has switched from **${client.Channels.get(guild.notificationChannels.ASYNC_HANDLER[member.id]).name}** to **${client.Channels.get(eventObject.newChannelId).name}**`;
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
            console.log(eventObject);
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
            Users.get(eventObject.user.id).previousName = undefined;   // clear field after use
            Skarm.logError(`Might be sending out name change notification out to guild: ${JSON.stringify(guild.id)}\n Notification channel list: ${JSON.stringify(guild.notificationChannels)}`);
            console.log(eventObject);
            Skarm.spam("Notification of name change: "+oldName +" -> " + JSON.stringify(eventObject.user));
            if(oldName===undefined){// && !guild.hasPermissions(eventObject.user,Permissions.MOM)){
                Skarm.logError(`scratch that. ${eventObject.user.name} was not detected to have changed names`);
                return 3;
            }
            for (let channelID in guild.notificationChannels.NAME_CHANGE) {
                let dsc = `**${oldName}** is now known as **${member.username}**!  (<@${member.id}>)`;
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

        Skarm.STDERR(`UNKNOWN NOTIFICATION ${notification}`);
    };

    guild.comicNotify = function(client, comicClass, publishingData) {
        console.log("Comic channels for guild:", guild.id, guild.comicChannels);
        guild.comicChannels[comicClass] ??= { };
        for (let channelID in guild.comicChannels[comicClass]) {
            Skarm.spam(`Sending ${comicClass} message to <#${channelID}>`);
            Skarm.sendMessageDelay(client.Channels.get(channelID), publishingData);
        }
        return 0;
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
            if(((day-0) + 365*24*60*60*1000)<Date.now()){
                //keep activity data for 1 year
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

	guild.toggleHiddenChannel = function (channelID) {
        this.hiddenChannels[channelID] = !this.hiddenChannels[channelID];
        return this.hiddenChannels[channelID];
    };

	guild.getHiddenChannels = function () {
	    let trulyHidden = [];
	    for(let channel in this.hiddenChannels){
	        if(this.hiddenChannels[channel])
	            trulyHidden.push(channel);
	        else
	            delete this.hiddenChannels[channel];
        }
	    return trulyHidden;
    }
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

        /**
         * Channels which will be ignored by parrot and other later responses in the message creation reaction sequence
         * @type {{channelID -> boolean}}
         */
        this.hiddenChannels = { };
        
		this.rolesTable = { };
		this.roleStack = false;

        /**
         * A hashmap with an arbitrarily large collection of keys being guild member
         * GUIDs and values for each key being of the following format:
         * {
         *  exp: 0 (default)
         *  level: 0 (default)
         *  nextLevelEXP: 0
         *  lastMessage: Date.now() (default initialized when user entry in table is created)
         * }
         */
		this.expTable = { };

		this.boostTable = { };
		this.moderators = { };
		this.announcesLevels=false;

		this.aliases = { };  //Other names that skarm will respond to, changed through the Alias command

		//[{userID: String -> {Date:Long -> wordCount:Int},totalWords -> Int}]
		this.activityTable = [];
        /**
         *
         *  All properties should update per-message.  All days older than a year should be purged from the days hashtable.
         * {userID:String ->
         *      // A collection of the count of how many words and messages were sent for a given day for a given user.
         *      days:{
         *          date:Long (floored to GMT day)-> {
         *              wordCount:Int,
         *              messageCount:Int
         *          }
         *      },
         *      totalMessageCount:Int,
         *      totalWordCount:Int
         *  }
         *
         */
		this.flexActivityTable = { };

        /**
         * Experience gain buffing roles
         * @Key: guild role by ID
         * Value: {
         * @Value1:    baseBuff        (exp / message base)
         * @Value2:    bonusBuff       (exp / message potential bonus at random)
         * @Value3:    cooldownBuff    (time interval between messages being eligible for EXP)
         * @Value4:    luckBuff        (probability of getting a roll closer to 1 than 0)
         * }
         *
         */
        this.expBuffRoles = { };

		this.channelBuffer = { };
        /**
         * The collection of channels which have been opted by the moderators to receive various notifications:
         * The contents of each inner object are of the form {channel:String -> timestamp:Float}
         * timestamp correlates to when the value was added to the hashset.
         * @type {{NAME_CHANGE: {}, KICK_BAN: {}, VOICE_CHANNEL: {}, MEMBER_LEAVE: {}}}
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
        };

        /**
         * The collection of channels which have been selected 
         *   by the moderators to receive various notifications about comics.
         * Content structure:
         *      this.comicChannels["XKCD"] = { }
         *      this.comicChannels["XKCD"]["CHANNEL_ID"] = Date.now()  // the time that the channel was added to the collection
         * 
         * All comics are dynamically loaded in from the ComicsCollection object.
         */
        this.comicChannels = { };

        /**
         * A set of IDs associated with roles in the guild that are assigned upon joining the server.
         * @Key: role ID
         * @value: timestamp when the role was added
         */
		this.serverJoinRoles = { };


        /**
         * Role hive root.  Structure:
         * Key[string]: role group object (e.g. "games of interest")
         *
         * e.g. this.selfAssignedRoles = {
         *     "Games": Class SarGroup(guild, "Games"),
         *     "Sports": Class SarGroup(guild, "Sports"),
         * }
         */
		this.selfAssignedRoles = { };


        /**
         * A hash map of words that have been observed to occur in the server.  Maps a word string to a
         * @type [string]word -> [int]instances
         */
		this.zipfMap = { };

		this.welcoming = true;
		this.welcomes = { };
		
		this.lastSendLine = undefined;
		
		Guild.add(this);
        
        linkVariables(this);
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
            JSON.stringify(Guild.guilds, null, 3),
            "utf8",
            function(err) {
                if (err) console.log("something went wrong: " + err);
            }
        );
    }
}

module.exports = Guild;
