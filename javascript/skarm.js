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

    static sendMessageDelay(channel, text, tts, obj) {
        if (channel === null) {
            console.log("null channel target with message: "+text);
            return;
        }

        if (typeof(channel) === "string") {
            channel = Constants.client.Channels.get(channel);
        }

        if (!channel.isPrivate) {
            if (!Constants.client.User.can(discordie.Permissions.Text.READ_MESSAGES,channel)) {
                this.log("Missing permission to read messages in " + channel.name);
                return;
            }

            if (!Constants.client.User.can(discordie.Permissions.Text.SEND_MESSAGES,channel)) {
                this.log("Missing permission to send message in " + channel.name);
                return;
            }
        }

        try {
            channel.sendTyping();
            setTimeout(function() {
                channel.sendMessage(text, tts, obj);
            }, Math.random() * 2000 + 1500);
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
     * @param timer the millisecond count between the time the message arrives in the discord server and when it is deleted.
     * @param senderID The ID of the author of the message who will be able to delete the message prematurely if they so choose.
     * @param skarmbotObject a reference to the skarmbot.js object in order to update the toBeDeletedCache mapping of MessageID to senderID which will be created for the duration of the message's existence.
     */
    static sendMessageDelete(channel, text,tts,obj,timer,senderID,skarmbotObject) {
        if(channel==null){
            console.log("null channel target with message: "+text);
            return;
        }
        if(!Constants.client.User.can(discordie.Permissions.Text.READ_MESSAGES,channel)){
            this.log("Missing permission to read messages in " + channel.name);
            return;
        }
        if(!Constants.client.User.can(discordie.Permissions.Text.SEND_MESSAGES,channel)){
            this.log("Missing permission to send message in " + channel.name);
            return;
        }

        try{
            //Skarm.logError("Sending async message");
            channel.sendMessage(text,tts,obj).then((message => {
                //Skarm.logError("Async to be deleted message sent");
                message.addReaction("\u274c");
                var timeout = setTimeout(() => {
                    delete skarmbotObject.toBeDeletedCache[message.id];
                    try {
                        message.delete();
                    }catch (e) {
                        //message was probably deleted by means of reaction.
                        return Skarm.logError(JSON.stringify(e));
                    }
                },timer);
                skarmbotObject.toBeDeletedCache[message.id]={senderID:senderID,self:false,timeout:timeout};
            }));
        } catch {
            console.error("failed to send message: [REDACTED] to channel "+channel.id);
        }
    }

    static queueMessage(Guilds,channel, message, tts, obj){
        Guilds.get(channel.guild_id).queueMessage(channel,message,tts,obj);
    }

    static help(cmd, e) {
        let helpString = "Documentation:\n```";
        let paramString = "";
        // the parameter string is shown after each command alias
        for (let param of cmd.params) {
            paramString += param + " ";
        }
        // each alias is shown
        for (let alias of cmd.aliases) {
            helpString += "e" + cmd.usageChar + alias + " " + paramString + "\n";
        }
        // lastly, the actual help text
        helpString = helpString.trim() + "```\n" + cmd.helpText;
        
        if (cmd.helpExamples) {
            for (let example of cmd.helpExamples) {
                helpString += example + "\n";
            }
        }
        
        Skarm.sendMessageDelay(e.message.channel, helpString);
    }
    
    
    static erroneousCommandHelpPlease(channel, cmd) {
        this.sendMessageDelay(channel, "Not the correct usage for this command! " +
            "Consult the help documentation (`e!help " + cmd.aliases[0] + "`) for " +
            "information on how to use it.");
    }
    
    static addCommands(commands) {
        // this function takes an object of Command objects and adds them to a
        // hash table (JS object); each alias of each command is added. It
        // returns one object for the general commands, and another for the
        // Help commands (without the bot prefix).
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
                helpMapping[alias] = cmdData;
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
}

module.exports = Skarm;