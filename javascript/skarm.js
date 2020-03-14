"use strict";
const fs = require("fs");
const Constants = require("./Constants.js");

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

// Static methods. Static methods everywhere.
class Skarm {
    static log(message) {
        console.log(message);
    }
    
    static todo(message) {
        throw "not yet implemented: " + message;
    }
    
    static logError(err) {
        // you can do whatever you want i guess
    }
    
    static isWeekend() {
        let day = Date.now().getDay();
        return (day == SUNDAY || day == SATURDAY);
    }
    
    static isSkyrimDay() {
        return isWeekend();
    }
    
    static isPunDay() {
        let day = Date.now().getDay();
        return (day == MONDAY || day == TUESDAY);
    }
    
    static isGod(user) {
        return (user == Constants.DRAGO || user == Constants.TIBERIA || user == Constants.ARGO || user == Constants.MASTER);
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
        // this function takes an array of Command objects and adds them to a
        // hash table (JS object); each alias of each command is added. It
        // returns one object for the general commands, and another for the
        // Help commands (without the bot prefix).
        let mapping = {};
        let helpMapping = {};
        
        for (let cmd of commands) {
            for (let alias of cmd.aliases) {
                mapping["e" + cmd.usageChar + alias] = cmd;
                helpMapping[alias] = cmd;
            }
        }
        
        return { cmd: mapping, help: helpMapping };
    }
    
    static commandParamString(message) {
        let tokens = message.trim().split(" ");
        tokens.shift();
        return tokens.join(" ");
    }
}

module.exports = Skarm;