"use strict";

const fs = require("fs");
const Constants = require("./constants.js");
const Permissions = require("./permissions.js");
const discordie = require("discordie");

// Static methods. Static methods everywhere.
class Skarm {
    static log(message) {
        console.log(message);
        Constants.Channels.LOG.sendMessage(message);
    }
    
    static todo(message) {
		console.error(message);
		Constants.Channels.TODO.sendMessage(message);
    }
	
	/**Mass data output stream which can be freely used for spam and during debugging.
    * @param message the message to be sent to the spam channel
    */
	static spam(message) {this.spamBuffer(message);}
	static STDERR(data) {this.spamBuffer(data);  console.error(data);}

    static spamNoBuffer(message) {
        if(message.length>0)
            return Constants.Channels.SPAM.sendMessage(message);
        return null;
    }

    /**
     * concatenating several spam calls into a single sent message to handle rate limits better,
     // one message per 2 seconds will fly under the discord server timeout limit of 6 actions/6 seconds
     // 2000: the count of milliseconds between messages sent and the max character count for a discord message
     * @param message the message to be added to the spam buffer
     */
    static spamBuffer(message){
        if(typeof(message)==="object") message = JSON.stringify(message);
        if(Skarm.spamBufferString === undefined) {
            Skarm.spamBufferString = "";
            Skarm.spamBufferTimer = setInterval(function (){
                Skarm.spamNoBuffer(Skarm.spamBufferString.substring(0,2000));
                Skarm.spamBufferString=Skarm.spamBufferString.substring(2000);
            },2000);
        }
        Skarm.spamBufferString+=message+"\r\n";
    }

    /**
     * standard error output stream which also sends a copy of errors to spam aka #stderr
     * @param err the error object
     */
    static logError(err) {
        console.error(new Date +":\t"+err);
        Skarm.spamBuffer(err);
    }
    
    static isWeekend() {
        let day = Date.now().getDay();
        return (
            day === Constants.Days.SUNDAY ||
            day === Constants.Days.SATURDAY
        );
    }
    
    static isSkyrimDay() {
        return isWeekend();
    }
    
    static isPunDay() {
        let day = Date.now().getDay();
        return (
            day === Constants.Days.MONDAY ||
            day === Constants.Days.TUESDAY
        );
    }

    static sendMessageDelay(channel, text, tts, obj, promiseHandler) {
        if (channel === null) {
            console.log("null channel target with message: " + text);
            return;
        }
        if (typeof (channel) === "string") {
            channel = Constants.client.Channels.get(channel);
        }

        channel.sendTyping();
        setTimeout(function () {
            Skarm.sendMessage(channel, text, tts, obj, promiseHandler);
        }, Math.random() * 2000 + 1500);
    }

    static sendMessage(channel, text,tts,obj, promiseHandler) {
        if (channel === null) {
            console.log("null channel target with message: " + text);
            return;
        }

        if (typeof (channel) === "string") {
            channel = Constants.client.Channels.get(channel);
        }

        if (!Constants.client.User.can(discordie.Permissions.Text.READ_MESSAGES, channel)) {
            this.log("Missing permission to read messages in " + channel.name);
            return;
        }

        if (!Constants.client.User.can(discordie.Permissions.Text.SEND_MESSAGES, channel)) {
            this.log("Missing permission to send message in " + channel.name);
            return;
        }

        try {
            let promise = channel.sendMessage(text, tts, obj);
            if (promiseHandler) promise.then(promiseHandler);
        } catch {
            console.log("failed to send message: " + text + " to channel " + channel.id);
        }
    }

    /**
     * Sends a message then deletes the message after a predefined time interval or upon reaction from the user who prompted the message or a moderator+.
     * @param channel the guild channel where the message will be sent.
     * @param text the content of the message
     * @param tts virtually useless parameter. Pay no regard.
     * @param obj Support for messages sent as embeds.
     * @param timerMS the millisecond count between the time the message arrives in the discord server and when it is deleted (default 24 hours).
     * @param senderID The ID of the author of the message who will be able to delete the message prematurely if they so choose.
     * @param skarmbotObject a reference to the skarmbot.js object in order to update the toBeDeletedCache mapping of MessageID to senderID which will be created for the duration of the message's existence.
     */
    static sendMessageDelete(channel, text, tts, obj, timerMS = 1000 * 60 * 60 * 24, senderID, skarmbotObject) {
        if (channel == null) {
            console.log("null channel target with message: " + text);
            return;
        }
        if (!Constants.client.User.can(discordie.Permissions.Text.READ_MESSAGES, channel)) {
            this.log("Missing permission to read messages in " + channel.name);
            return;
        }
        if (!Constants.client.User.can(discordie.Permissions.Text.SEND_MESSAGES, channel)) {
            this.log("Missing permission to send message in " + channel.name);
            return;
        }

        try {
            //Skarm.logError("Sending async message");
            channel.sendMessage(text, tts, obj).then((message => {
                //Skarm.logError("Async to be deleted message sent");
                message.addReaction("\u274c");
                var timeout = setTimeout(() => {
                    delete skarmbotObject.toBeDeletedCache[message.id];
                    try {
                        message.delete();
                    } catch (e) {
                        //message was probably deleted by means of reaction.
                        return Skarm.logError(JSON.stringify(e));
                    }
                }, timerMS);
                skarmbotObject.toBeDeletedCache[message.id] = {senderID: senderID, self: false, timeout: timeout};
            }));
        } catch {
            console.error("failed to send message: [REDACTED] to channel " + channel.id);
        }
    }

    static queueMessage(Guilds,channel, message, tts, obj){
        Guilds.get(channel.guild_id).queueMessage(channel,message,tts,obj);
    }

    static help(cmd, e) {
        // the parameters available for this function
        let paramString = " ";
        for (let param of cmd.params) {
            paramString += param + " ";
        }

        let fields = [{name: "Aliases", value: cmd.aliases.join(", "), inline: true}];
        if (cmd.examples) {
            fields.push({name: "\u200B", value: "\u200B", inline: false});
            for (let example of cmd.examples) {
                fields.push({name: example.command, value: example.effect, inline: false});
            }
        }

        //https://discordjs.guide/popular-topics/embeds.html#embed-preview
        Skarm.sendMessageDelay(e.message.channel, " ",false, {
            color: Skarm.generateRGB(),
            //author: Constants.self,
            timestamp: new Date(),
            title: "Command usage: e" + cmd.usageChar + cmd.aliases[0] + paramString,
            description: cmd.helpText,
            fields: fields,
            footer: {
                text: "Skarmbot command support",
                icon_url: Constants.self.avatarURL,
            }
        });
    }
    
    
    static erroneousCommandHelpPlease(channel, cmd) {
        this.sendMessageDelay(channel, "Not the correct usage for this command! " +
            "Consult the help documentation (`e!help " + cmd.aliases[0] + "`) for " +
            "information on how to use it.");
    }

    /** this function takes an object of Command objects and adds them to a
     * hash table (JS object); each alias of each command is added. It
     * returns one object for the general commands, and another for the
     * Help commands (without the bot prefix).
     */
    static addCommands(commands) {
        let mapping = { };
        let raw = { };
        let helpMapping = { };
        let badData = [ ];
        
        for (let cmd in commands) {
            let cmdData = commands[cmd];
            if (!Array.isArray(cmdData.aliases)) {
                badData.push("Some command has no aliases (we'd tell you what it is, but it literally doesn't have a name");
                continue;
            }
            if (!Array.isArray(cmdData.params)) {
                badData.push(cmdData.aliases[0] + " has no parameter list");
                continue;
            }
            if (typeof(cmdData.usageChar) !== "string") {
                badData.push(cmdData.aliases[0] + " has no usage character");
                continue;
            }
            if (typeof(cmdData.helpText) !== "string") {
                badData.push(cmdData.aliases[0] + " has no help text");
                continue;
            }
            if (typeof(cmdData.execute) !== "function") {
                badData.push(cmdData.aliases[0] + " has no execution function");
                continue;
            }
            if (typeof(cmdData.help) !== "function") {
                badData.push(cmdData.aliases[0] + " has no help function");
                continue;
            }
            if (cmdData.ignoreHidden === undefined) {
                badData.push(cmdData.aliases[0] + " has no ignoreHidden property");
                continue;
            }
            if (cmdData.perms === undefined) {
                cmdData.perms = Permissions.BASE;
            }
            for (let alias of cmdData.aliases) {
                mapping["e" + cmdData.usageChar + alias] = cmdData;
                helpMapping["e" + "?" + alias] = cmdData;
            }
            // this is without the e and the usage char
            raw[cmdData.aliases[0]] = cmdData;
        }
        
        if (badData.length > 0) {
            throw "Could not add commands:\n" + badData.join("\n");
        }
        
        return { cmd: mapping, help: helpMapping, unaliased: raw };
    }
    
    static addKeywords(keywords) {
        // keywords are similar to commands, but minus the prefix and the
        // documentation
        let mapping = { };
        
        for (let kwd in keywords) {
            for (let alias of keywords[kwd].aliases) {
                mapping[alias] = keywords[kwd];
                //Skarm.spam(`Initialized ${alias} -> ${kwd}`);
            }
        }
        
        return mapping;
    }

    static generateRGB(){
        let h = Math.random() * 360;
        let s = Math.random() * 0.25 + 0.75;
        let v = Math.random() * 0.25 + 0.75;
        let c = v * s;
        let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        let m = v - c;
        let r = 1, b = 1, g = 1;
        switch (Math.floor(h / 60)) {
            case 0: r = c; g = x; b = 0; break;
            case 1: r = x; g = c; b = 0; break;
            case 2: r = 0; g = c; b = x; break;
            case 3: r = 0; g = x; b = c; break;
            case 4: r = x; g = 0; b = c; break;
            case 5: r = c; g = 0; b = x; break;
        }
        r = Math.floor((r + m) * 255);
        g = Math.floor((g + m) * 255);
        b = Math.floor((b + m) * 255);
        // I don't know if discord wants the color to be in BGR
        // or RGB order, but in this case it doesn't actually matter
        return Math.floor(r | (g << 8) | (b << 16));
    }

    static getRandomMapKey(map){
        let keyArray = Object.keys(map);
        return keyArray[Math.floor(Math.random()*keyArray.length)];
    }
    static getRandomMapVal(map){
        let keyArray = Object.keys(map);
        return map[keyArray[Math.floor(Math.random()*keyArray.length)]];
    }

    /**
     * Expected data format: A single coma-separated string with '\n' newline characters
     * Handling of quotation marks: purge all quotation marks
     * @param data
     *
     * @return array of objects
     */
    static parseCSV(data){
        while(data.includes('"')){
            data = data.replaceAll('"', '');
            data = data.replaceAll('\r', '');
        }
        let lines = data.split('\n');

        let parsedData = [];

        //form structure
        let fields = lines[0].split(',');

        for(let i = 1; i<lines.length; i++){
            let datum = {};
            let dataValues = lines[i].split(',');
            for(let j in fields){
                datum[fields[j]] = dataValues[j];
            }
            parsedData.push(datum);
        }
        return parsedData;
    }

    static lightsaber = {
        /**
         * Replaces a random left-leaning hilt with a left-leaning lightsaber.
         * @param message
         */
        insertLeft:function(message,layers){
            let indexes = [];
            let temp = message.replaceAll(Constants.Lightsabers.Hilts.Left, "_");
            for(let i = 0;i<temp.length;i++){
                if(temp[i]==="_"){
                    indexes.push(i);
                }
            }
            if(indexes.length){
                let modificationIndex = indexes[Math.floor(indexes.length*Math.random())];
                temp = temp.substring(0,modificationIndex) +
                    Skarm.getRandomMapVal(Constants.Lightsabers.Left) +
                    temp.substring(modificationIndex+1);
                temp = temp.replaceAll("_",Constants.Lightsabers.Hilts.Left);
                if(indexes.length > 2 && layers){
                    //Skarm.spam("More than 2 indexes of saber.  Recursing...");
                    return Skarm.lightsaber.insertLeft(temp,--layers);
                }
                return temp;
            }else{
                return message;
            }
        },

        /**
         * Replaces a random left-leaning hilt with a left-leaning lightsaber.
         * @param message
         */
        insertRight:function(message,layers){
            let indexes = [];
            let temp = message.replaceAll(Constants.Lightsabers.Hilts.Right, "_");
            for(let i = 0;i<temp.length;i++){
                if(temp[i]==="_"){
                    indexes.push(i);
                }
            }

            if(indexes.length){
                let modificationIndex = indexes[Math.floor(indexes.length*Math.random())];
                temp = temp.substring(0,modificationIndex) +
                    Skarm.getRandomMapVal(Constants.Lightsabers.Right) +
                    temp.substring(modificationIndex+1);
                temp = temp.replaceAll("_",Constants.Lightsabers.Hilts.Right);
                if(indexes.length>2 && layers){
                    //Skarm.spam("More than 2 indexes of saber.  Recursing...");
                    return Skarm.lightsaber.insertRight(temp,--layers);
                }
                return temp;
            }else{
                return message;
            }
        },
    }

    /**
     * Converts a data table to a string that can be sent in a discord message
     * @param table - array of objects
     * @param fields - array of properties of the table that should be displayed.  If not specified, all properties are appended
     * @return tableString - string containing specified information
     */
    static formatTable = function (table, fields, capitalizeTableKeys) {
        // input formatting
        if(fields === undefined) fields = Object.keys(table[0]);    // if the fields parameter isn't specified, display all properties of the table's objects

        // internal constants
        const space = " ";
        const nl = "\r\n";

        //initialize tableEntries array
        let tableEntries = [];      // array of strings that will become the final output
        let tableHeader = "";       // header that will be prepended to the final output
        for(let _ in table){
            tableEntries.push("");                          // initialize all entires as empty strings
        }

        // append each field to the table
        for(let field of fields){
            // optionally capitalize the first letter of each word for the table header
            let fieldName = field;
            if(capitalizeTableKeys){
                let fn_bits = fieldName.split(" ");
                for (let i in fn_bits){
                    let bit = fn_bits[i];
                    fn_bits[i] = bit[0].toUpperCase() + bit.substring(1);
                }
                fieldName = fn_bits.join(" ");
            }
            tableHeader += fieldName;                                           // add new field to header
            let maxEntryLen = tableHeader.length;                               // set length of header as initial min length due to this entry
            // add next property to table data
            for(let i in table){
                tableEntries[i] += table[i][field];                             // add new property
                maxEntryLen = Math.max(maxEntryLen, tableEntries[i].length);    // track biggest string length
            }

            // append spaces until all entries are at max length
            maxEntryLen += 2;                                                   // add 2 as the minimum amount of spaces to append even for the longest entry to ensure space between fields
            while(tableHeader.length < maxEntryLen) tableHeader += space;       // add space buffer to table header
            for(let i in table){
                while(tableEntries[i].length < maxEntryLen) tableEntries[i] += space;   // add space buffer to each table entry
            }
        }

        // get rid of any loose spaces after the final table entry
        for(let i in table){
            tableEntries[i] = tableEntries[i].trim();
        }

        return "```" + nl + tableHeader+ nl+ tableEntries.join("\r\n") + nl +"```";   // return the table formatted as a string
    }

    /**
     * Input: user ID
     * Output: string mention of the user to the best of Skarm's ability
     */
    static getUserMention = function (bot, userID) {
        let userMention;
        try {
            let user = bot.client.Users.get(userID);
            userMention = `${user.username.replaceAll("`", "'")}#${user.discriminator}`;
        } catch (e) {
            userMention = `<@${userID}>`;
        }
        return userMention;
    }
}

module.exports = Skarm;
