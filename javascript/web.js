"use strict";
// load discordie object
//skarm
const fs = require("fs");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

module.exports = {    
    google: function(bot, e, query) {
        Skarm.sendMessageDelay(
            e.message.channel,
            "https://www.ecosia.org/search?q=" + query.replaceAll(" ", "+")
        );
    },
    
    stackOverflow: function(bot, e, query) {
        if (e.message.author === Constants.Users.MASTER ||
                e.message.author === Constants.Users.ARGO
            ){
            Skarm.sendMessageDelay(e.message.channel, "do it yourself");
            return;
        }
        
        Skarm.sendMessageDelay(e.message.channel, "<" +
            "https://stackoverflow.com/search?q=" + query.replaceAll(" ", "+") +
            ">"
        );
    },
}