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
        throw "not yet implemented: " + message;
    }
    
    static logError(err) {
        // you can do whatever you want i guess
		console.error(err);
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
    
    static sendMessageDelay(channel, text,tts,obj) {
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
			channel.sendTyping();
			setTimeout(function() {
				channel.sendMessage(text,tts,obj);
			}, Math.random() * 2000 + 1500);
		} catch {
			
			console.log("failed to send message: "+text+" to channel "+channel.id);
		}
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
}

module.exports = Skarm;