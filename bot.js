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
const Platform = require("./javascript/platform.js");

// i'm in?
var target = "../descrution.txt";
if(process.argv.length>2 && process.argv[2]==="beta")
	target="../token.txt";
const token = fs.readFileSync(target).toString();

// javascript
String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, "g"), replacement);
};

client.connect({
	token: token
});

let bot;
//last Connection, last Disconnect
let uptimeController= [0,0];

// try to put all of the actual event code in skarmbot.js to keep this main
// file clean
client.Dispatcher.on(events.GATEWAY_READY, e => {
	if(bot){
		uptimeController[0]=Date.now();
		Skarm.log("Came back online after "+(uptimeController[0]-uptimeController[1])/1000 +" seconds down");
		return;
	}

	let dataPuller = Platform.pullData();
    Constants.initialize(client);
    Encrypt.initialize();
	dataPuller.on('exit', (code) => {
		console.log("Pulled in skarmData.\nGit revision count: "+code);
		Users.initialize(client);
		Guilds.initialize(client);
		bot = new SkarmBot(client,code);
		Skarm.log("Connected as " + client.User.username + ". Yippee!\n");
	});
	dataPuller.on("error",(err)=>{console.error(err);});
	dataPuller.on("message",(message) => {console.log(message);});
});

client.Dispatcher.on(events.PRESENCE_UPDATE, e => {
	if(bot)
		setTimeout(()=>{bot.OnPresenceUpdate(e);},20);
});

client.Dispatcher.on(events.PRESENCE_MEMBER_INFO_UPDATE, e => {
	if(bot)
		bot.OnPresenceMemberUpdate(e);
});

client.Dispatcher.on(events.MESSAGE_CREATE, e => {
	if(bot)
		bot.OnMessageCreate(e);
});

client.Dispatcher.on(events.MESSAGE_DELETE, e => {
	if(bot)
		bot.OnMessageDelete(e);
});

client.Dispatcher.on(events.MESSAGE_REACTION_ADD, e => {
	if(bot)
		bot.OnMessageReactionAdd(e);
});


client.Dispatcher.on(events.GUILD_MEMBER_ADD, e => {
	if(bot)
		bot.OnMemberAdd(e);
});

client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e => {
	if(bot)
		bot.OnMemberUpdate(e);
});

client.Dispatcher.on(events.GUILD_MEMBER_REMOVE, e => {
	if(bot)
		bot.OnMemberRemove(e);
});


client.Dispatcher.on(events.GUILD_BAN_ADD, e => {
	if(bot)
		bot.OnGuildBanAdd(e);
});

client.Dispatcher.on(events.GUILD_BAN_REMOVE, e => {
	if(bot)
		bot.OnGuildBanRemove(e);
});


//During a channel switch: Leave event will always be sent before the join event.
// This delta time may be of as little as <1ms.
// Because of this, these packets may be expected to arrive out of order.
// 20ms async period suggested for any channel state switching.

client.Dispatcher.on(events.VOICE_CHANNEL_JOIN, e => {
	if(bot)
		bot.OnVoiceChannelJoin(e);
});

client.Dispatcher.on(events.VOICE_CHANNEL_LEAVE, e => {
	if(bot)
		bot.OnVoiceChannelLeave(e);
});


client.Dispatcher.on(events.DISCONNECTED, e => {
	console.error("Network Error: disconnected at " + (new Date()).toString());
	uptimeController[1]=Date.now();
});
