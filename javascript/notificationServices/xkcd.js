"use strict";
const fs = require("fs");
const request = require("request");

const Skarm = require("./skarm.js");
const Encrypt = require("./encryption.js");
const Guild = require("./guild.js");
const Constants = require("./constants.js");


const xkcddb = "..\\skarmData\\xkcd.penguin";
const xkcdlib = "..\\skarmData\\xkcd-log.penguin";

class XKCD {
	constructor(bot) {
		this.bot = bot;
		this.initialize();
		this.interval = null;
		this.lock = 0;
		this.enabled = true;
		this.discoveryDelay_ms = 1000 * 60 * 15; // delay between when a new XKCD is discovered and when it is posted in channels
		this.pollingInterval_ms = 1000 * 60 * 30;  // how often skarm pokes xkcd.com for new comics
		try {
			this.references = JSON.parse(fs.readFileSync(xkcdlib).toString().toLowerCase());
			this.schedule();
		} catch (e) {
			this.enabled = false;
			this.references = { };
			console.log("Could not initialize the XKCD log.");
		}
	}

	initialize() {this.enabled = true;}

	save() {
		if (!this.enabled) return;
		Encrypt.write(xkcddb, JSON.stringify(this.bot.channelsWhoLikeXKCD));
		fs.writeFileSync(xkcdlib,JSON.stringify(this.references));
		console.log("Saved XKCD Data");
	}

	poisonPill() {
		clearInterval(this.interval);
	}

	schedule() {
		if (!this.enabled) return;
		if (this.interval) {clearInterval(this.interval);}
		let tis = this;
		this.interval = setInterval(function(){tis.checkForNewXKCDs();}, tis.pollingInterval_ms);
	}

	checkForNewXKCDs() {
		if (!this.enabled) return;
		let tis = this;
		let newXkcdId = this.references.ordered.length;

		let params={
			timeout: 2000,
			followAllRedirects: true,
			uri: "https://xkcd.com/"+newXkcdId+"/ ",
		};

		//Skarm.spam("Requesting: "+JSON.stringify(params));
		request.get(params, function(error, response, body){
			//Skarm.spam(JSON.stringify(response));return;
			if(!response) return Skarm.spam("Failed to receive a response object when attempting to request "+JSON.stringify(params));
			if(response.statusCode!==200) return;
			if (!error){
				let startTarget="<title>";
				let arguo=body.indexOf(startTarget);
				let title = body.substring(arguo+startTarget.length);
				title = title.substring(0,title.indexOf("<"));
				title = title.replace("xkcd: ","");
				tis.references.ordered.push(title);
				tis.references.alphabetized.push([title,newXkcdId]);
				tis.references.alphabetized.sort((a, b) => {return (a[0] > b[0]) ? 1 : -1;});
				for(let guild in Guild.guilds) {
					setTimeout(()=>{
						Guild.guilds[guild].notify(tis.bot.client, Constants.Notifications.XKCD, params.uri);
					}, tis.discoveryDelay_ms);
				}
				tis.bot.save(Constants.SaveCodes.DONOTHING);
			}
		});
	}

	post(channel, id) {
		if (!this.enabled) return;
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
			//console.log(`Searching for ${id} in ${data[0]}`);
			if(data[0].includes("xkcd: "))data[0]=data[0].replace("xkcd: ","");	//correct any artifacts that were imported in the form "xkcd: title"
			if (data[0].includes(id)) {
				results.push([data[0], "https://xkcd.com/" + data[1] + "/"]);
			}
		}

		if (results.length === 0) {
			Skarm.sendMessageDelay(channel, "I couldn't find any xkcds containing **" + id + "** in the title\nヽ( ｡ ヮﾟ)ノ");
			return;
		}

		if (results.length === 1) {
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
}

module.exports = XKCD;