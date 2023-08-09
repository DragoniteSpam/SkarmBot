"use strict";
const fs = require("fs");
const request = require("request");

const Skarm = require("../skarm.js");
const Encrypt = require("../encryption.js");
const Constants = require("../constants.js");
const ComicNotifier = require("./_comic_base_class.js");

class XKCD extends ComicNotifier {
	length () {
		return this.comicArchive.ordered.length;
	}

	createComicArchive () {
		return {
			ordered: [],
			alphabetized: []
		};
	}

	poll () {
		if (!this.enabled) return;
		let tis = this;
		let newXkcdId = this.comicArchive.ordered.length;

		let params={
			timeout: 2000,
			followAllRedirects: true,
			uri: "https://xkcd.com/"+newXkcdId+"/ ",
		};

		//Skarm.spam("Requesting: "+JSON.stringify(params));
		request.get(params, function(error, response, body){
			//Skarm.spam(JSON.stringify(response));return;
			if(!response) return Skarm.spam("Failed to receive a response object when attempting to request "+JSON.stringify(params));
			if(response.statusCode !== 200) return;
			if (!error){
				let startTarget="<title>";
				let arguo=body.indexOf(startTarget);
				let title = body.substring(arguo+startTarget.length);
				title = title.substring(0,title.indexOf("<"));
				title = title.replace("xkcd: ","");
				tis.comicArchive.ordered.push(title);
				tis.comicArchive.alphabetized.push([title,newXkcdId]);
				tis.comicArchive.alphabetized.sort((a, b) => {return (a[0] > b[0]) ? 1 : -1;});
				tis.publishRelease(params.uri);
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
		for (let i in this.comicArchive.alphabetized) {
			let data = this.comicArchive.alphabetized[i];
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
