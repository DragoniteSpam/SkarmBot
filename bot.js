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
const Shanties = require("./javascript/shanties.js");

// i'm in?
const token = fs.readFileSync("..\\descrution.txt").toString();

client.connect({
	token: token
});

client.Dispatcher.on(events.GATEWAY_READY, e => {
	console.log("Connected as " + client.User.username + ". Yippee!");
});