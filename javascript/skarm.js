"use strict";
const fs = require("fs");

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
    
    static sendMessageDelay(channel, text) {
        channel.sendTyping();
        setTimeout(function() {
            channel.sendMessage(text);
        }, Math.random() * 2000 + 1000);
    }
    
    static help(cmd, e) {
        let cmdString = "";
        let paramString = "";
        // the parameter string is shown after each command alias
        for (var param of cmd.params) {
            paramString += param + " ";
        }
        // each alias is shown
        for (var cmdData of cmd.commands) {
            cmdString += "e" + cmd.usageChar + " " + paramString + "\n";
        }
        // lastly, the actual help text
        cmdString += "\n```" + cmd.helpText + "```";
        
        sendMessageDelay(e.message.channel, cmdString);
    }
    
}

module.exports = Skarm;