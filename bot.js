// lead spaghetti chef: https://github.com/DragoniteSpam
// secondary spaghetti chef: https://github.com/Master9000
"use strict";

// don't touch this stuff - unless you want to, i guess
const discordie = require("discordie");
const fs = require("fs");
const request = require("request");
const { spawn } = require("child_process");
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
var target = "..\\descrution.txt";
if(process.argv.length>2 && process.argv[2]=="beta")
	target="..\\token.txt";
const token = fs.readFileSync(target).toString();

// javascript
String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, "g"), '+');
};

client.connect({
	token: token
});

let bot;

//last Connection, last Disconnect
let uptimeController= [0,0];

client.Dispatcher.on(events.GATEWAY_READY, e => {
    bot = new SkarmBot(client);
	let dataPuller = spawn('cmd.exe', ['/c', 'pullData.bat']);
    Constants.initialize(client);
    Encrypt.initialize();
	dataPuller.on('exit', (code) => {
		console.log("Pulled in skarmData");
		Users.initialize(client);
		Guilds.initialize(client);
	});
	Skarm.log("Connected as " + client.User.username + ". Yippee!\n");
    bot.setGame();
	uptimeController[0]=Date.now();
	if(uptimeController[1]>0){
		Skarm.log("Came back online after "+(uptimeController[0]-uptimeController[1])/1000 +" seconds down");
	}
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

client.Dispatcher.on(events.GUILD_MEMBER_ADD, e => {
    bot.OnMemberAdd(e);
});

client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e => {
	bot.OnMemberUpdate(e);
});


client.Dispatcher.on(events.DISCONNECTED, e => {
	console.log("Error: disconnected at " + (new Date()).toString());
	uptimeController[1]=Date.now();
});