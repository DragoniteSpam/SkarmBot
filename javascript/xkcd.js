"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");
const Encrypt = require("./encryption.js");

const xkcddb = "..\\skarmData\\xkcd.penguin";

class XKCD {
	constructor(bot, instance) {
		this.bot = bot;
		this.initialize();
		this.interval = null;
		this.schedule();
		this.lock = 0;
		this.instance = instance;
		this.references = JSON.parse(fs.readFileSync(".\\fun\\xkcd-log.json").toString().toLowerCase());
	}

	save() {
		Encrypt.write(xkcddb, JSON.stringify(this.bot.channelsWhoLikeXKCD));
		console.log("Saved XKCD Data");
	}

	initialize() {
		var tis = this;
		Encrypt.read(xkcddb, function (data, filename) {
			tis.bot.channelsWhoLikeXKCD = JSON.parse(data);
			console.log("Initialized " + Object.keys(tis.bot.channelsWhoLikeXKCD).length + " XKCD channels on Instance " + tis.instance);
		});
	}

	poisonPill() {
		clearInterval(this.interval);
	}

	schedule() {
		if (!this.interval) {
			clearInterval(this.interval);
		}
		let tis = this;
		this.interval = setInterval(function(){tis.sweep();}, 1000 * 60 * 60);
	}

	post(channel, id) {
		id = (id || "").toLowerCase();
		if (id.match(/^\d+$/)) {
			Skarm.sendMessageDelay(channel, "https://xkcd.com/" + id + "/");
			return;
		}
		if (id === "") {
			Skarm.sendMessageDelay(channel, "https://xkcd.com/");
			return;
		}
		// the name IDs have already been loaded in lower case
		let results = [];
		for (let i in this.references.alphabetized) {
			let data = this.references.alphabetized[i];
			// is an exact match?
			if (data[0] === id) {
				results = [[data[0], "https://xkcd.com/" + data[1] + "/"]];
				break;
			}
			// is a missal of silos?
			if (data[0].includes(id)) {
				results.push([data[0], "https://xkcd.com/" + data[1] + "/"]);
			}
		}

		if (results.length === 0) {
			Skarm.sendMessageDelay(channel, "I couldn't find any xkcds containing **" + id + "** in the title\nヽ( ｡ ヮﾟ)ノ");
			return;
		}

		if (results.length === 1 && results[0][0] === id) {
			Skarm.sendMessageDelay(channel, results[0][1]);
			return;
		}

		if (results.length > 1) {
			const MAX_RESULTS = 10;
			let overflow = results.length - MAX_RESULTS;
			let printresults = [];
			for (let i = 0; i < Math.min(results.length, MAX_RESULTS); i++) {
				printresults[i] = "**" + results[i][0] + "** <" + results[i][1] + ">";
			}
			let message = "Could not find an exact match for **" + id + "**, try one of these: \n" + printresults.join("\n");
			if (overflow > 0) {
				message += "\n(And " + overflow + " more)";
			}
			Skarm.sendMessageDelay(channel, message);
			return;
		}

		return;
	}

	sweep(n) {
		var d = new Date(); // for now
		var datetext = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
		console.log("Running xkcd.sweep function on Instance " + this.instance + "\tCurrent time: " + datetext);
		let now = new Date();
		if (this.lock < 1 && (n || now.getHours() === 22 && (now.getDay() & 1))) {
			this.lock = 3 + (n ? 10 : 0);
			for (var channel in this.bot.channelsWhoLikeXKCD) {
				this.post(this.bot.client.Channels.get(channel));
			}
			console.log("pushed out xkcds");
		}
	}
}

module.exports = XKCD;