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
        let mapping = {};
        let helpMapping = {};
        
        for (let cmd in commands) {
            for (let alias of commands[cmd].aliases) {
                mapping["e" + commands[cmd].usageChar + alias] = commands[cmd];
                helpMapping[alias] = commands[cmd];
            }
        }
        
        return { cmd: mapping, help: helpMapping };
    }
    
    static addKeywords(keywords) {
        // keywords are similar to commands, but minus the prefix and the
        // documentation
        let mapping = {};
        
        for (let kwd in keywords) {
            for (let alias of keywords[kwd].aliases) {
                mapping[alias] = keywords[kwd];
            }
        }
        
        return mapping;
    }
    
    static commandParamString(message) {
        let tokens = message.trim().split(" ");
        tokens.shift();
        return tokens.join(" ");
    }
}

module.exports = Skarm;