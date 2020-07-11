"use strict";
const fs = require("fs");
const Constants = require("./constants.js");

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
    }
    
    static isWeekend() {
        let day = Date.now().getDay();
        return (
            day == Constants.Days.SUNDAY ||
            day == Constants.Days.SATURDAY
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
    
    static sendMessageDelay(channel, text) {
        channel.sendTyping();
        setTimeout(function() {
            channel.sendMessage(text);
        }, Math.random() * 2000 + 1000);
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
    
    static addCommands(commands) {
        // this function takes an object of Command objects and adds them to a
        // hash table (JS object); each alias of each command is added. It
        // returns one object for the general commands, and another for the
        // Help commands (without the bot prefix).
        let mapping = { };
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
            for (let alias of cmdData.aliases) {
                mapping["e" + cmdData.usageChar + alias] = cmdData;
                helpMapping[alias] = cmdData;
            }
        }
        
        if (badData.length > 0) {
            throw "Could not add commands:\n" + badData.join("\n");
        }
        
        return { cmd: mapping, help: helpMapping };
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
}

module.exports = Skarm;