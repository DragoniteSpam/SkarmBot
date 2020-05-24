// lead spaghetti chef: https://github.com/DragoniteSpam
// secondary spaghetti chef: https://github.com/Master9000
"use strict";

// don't touch this stuff - unless you want to, i guess
const discordie = require("discordie");
const fs = require("fs");
const request = require("request");
// discord things
const client = new discordie({autoReconnect:true});
const events = discordie.Events;

// we made these
const Skarm = require("./javascript/skarm.js");
const SkarmBot = require("./javascript/skarmbot.js");
const XKCD = require("./javascript/xkcd.js");
const Encrypt = require("./javascript/encryption.js");
const Constants = require("./javascript/constants.js");
const Users = require("./javascript/user.js");
const Guilds = require("./javascript/guild.js");

// i'm in?
const token = fs.readFileSync("..\\descrution.txt").toString();

// javascript
String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, "g"), '+');
};

client.connect({
	token: token
});

let bot;

client.Dispatcher.on(events.GATEWAY_READY, e => {
    bot = new SkarmBot(client);
    Constants.initialize(client);
    Encrypt.initialize();
    Users.initialize(client);
    Guilds.initialize(client);
	Skarm.log("Connected as " + client.User.username + ". Yippee!\n");
    client.User.setGame({
            name: getSpaghetti() + " lines of spaghetti",
            type: 0,
    });
});

// after GATEWAY_READY (becasue it's got to initalize so many different things)
// try to put all of the actual event code in skarmbot.js to keep this main
// file clean
client.Dispatcher.on(events.MESSAGE_DELETE, e => {
	bot.OnMessageDelete(e);
});

client.Dispatcher.on(events.MESSAGE_REACTION_ADD, e => {
    bot.OnMessageReactionAdd(e);
});

client.Dispatcher.on(events.MESSAGE_CREATE, e => {
    bot.OnMessageCreate(e);
});

client.Dispatcher.on(events.GUILD_MEMBER_ADD, e=> {
    bot.OnMemberAdd(e);
});
client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e=> {
	bot.OnMemberUpdate(e);
});
// javascript devs would be happier if you did this with promises and async.
// i can't say i care enough to deal with promises and async.
function getSpaghetti() {
    let lines = 0;
    let files = fs.readdirSync("./javascript/");
    for (let i in files) {
        lines = lines + lineCount("./javascript/" + files[i]);
    }
    return lines + lineCount("./bot.js");
}

function lineCount(file) {
    return fs.readFileSync(file).toString().split("\n").length;
}

let timer5min = setInterval(function() {
	Guilds.save();
    Users.save();
}, 300000);