// lead spaghetti chef: https://github.com/DragoniteSpam
// secondary spaghetti chef: https://github.com/Master9000
"use strict";

// don't touch this stuff - unless you want to, i guess
const discordie = require("discordie");
const fs = require("fs");
const tempwolfy = require("node-wolfram");
const wolfy = new tempwolfy(fs.readFileSync("..\\wolfram.txt").toString());
const request = require("request");
// discord things
const client = new discordie({autoReconnect:true});
const events = discordie.Events;

// we made these
const Skarm = require("./javascript/skarm.js");
const Bot = new (require("./javascript/skarmbot.js"))();
const { ShantyCollection, Shanty } = require("./javascript/shanties.js");
const XKCD = require("./javascript/xkcd.js");
const Constants = require("./javascript/constants.js");

console.log(Constants);

// i'm in?
const token = fs.readFileSync("..\\descrution.txt").toString();

client.connect({
	token: token
});

let shanties;

client.Dispatcher.on(events.GATEWAY_READY, e => {
	Skarm.log("Connected as " + client.User.username + ". Yippee!\n");
    shanties = new ShantyCollection();
    Constants.initialize(client);
    //shanties.load("ragnar-the-red.shanty");
    client.User.setGame({name: "drago please count my lines of spaghetti", type: 0});
});

// after GATEWAY_READY (becasue it's got to initalize so many different things) try to put all
// of the actual event code in skarmbot.js to keep this main file clean
client.Dispatcher.on(events.MESSAGE_DELETE, e=> {
	Bot.OnMessageDelete(e);
});

client.Dispatcher.on(events.MESSAGE_REACTION_ADD, e=> {
    Bot.OnMessageReactionAdd(e);
});
