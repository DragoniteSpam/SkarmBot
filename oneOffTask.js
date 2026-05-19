// lead spaghetti chef: https://github.com/DragoniteSpam
// secondary spaghetti chef: https://github.com/ArgoTheNaut
"use strict";

// don't touch this stuff - unless you want to, i guess
const discordie = require("discordie");
const fs = require("fs");
const request = require("request");
const { spawn } = require("child_process");
// discord things
const client = new discordie({ autoReconnect: true });
const events = discordie.Events;

// we made these
const Skarm = require("./javascript/skarm.js");
const SkarmBot = require("./javascript/skarmbot.js");
const Encrypt = require("./javascript/encryption.js");
const Constants = require("./javascript/constants.js");
const Users = require("./javascript/user.js");
const Guilds = require("./javascript/guild.js");
const { ShantyCollection } = require('./javascript/shanties.js');

// i'm in?
var target = "../token.txt";
const token = fs.readFileSync(target).toString();

// javascript
String.prototype.replaceAll = function (search, replacement) {
	return this.replace(new RegExp(search, "g"), replacement);
};

Constants.initialize();

client.connect({ token: token });

let uptimeController = {
	connectTime: 0,
	disconnectTime: 0
};

let bot;

// try to put all of the actual event code in skarmbot.js to keep this main
// file clean
client.Dispatcher.on(events.GATEWAY_READY, async (e) => {
	if (bot) {
		uptimeController.connectTime = Date.now();
		Skarm.log("Came back online after " + (uptimeController.connectTime - uptimeController.disconnectTime) / 1000 + " seconds down");
		return;
	}
	Constants.initializeDynamics(client, process);

	Encrypt.initialize();
	let s = new ShantyCollection(); // needs to be done for guilds to load
	Users.initialize(client);
	await Guilds.initialize(client);
	console.log("Connected as " + client.User.username + ". Yippee!\n");
	main();
});


client.Dispatcher.on(events.DISCONNECTED, e => {
	console.error("Network Error: disconnected at " + (new Date()).toString());
	uptimeController.disconnectTime = Date.now();
});



/**
 * Enter one-off task instructions here
 */
async function main() {
    // clear this random example
    let messages = await client.Channels.get("asdf").fetchMessages(10);
    let reactors = await msg.fetchReactions(emoji, client);
    let members = client.Guilds.get("asdf").members;

    membersToPrune.map(async (member) => {
        await member.unassignRole(role);
    });

	process.exit();
}
