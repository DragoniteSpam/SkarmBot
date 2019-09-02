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
}

module.exports = Skarm;