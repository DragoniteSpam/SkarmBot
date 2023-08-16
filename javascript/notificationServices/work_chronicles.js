"use strict";
const fs = require("fs");
const request = require("request");
const parseString = require('xml2js').parseString;
const Skarm = require("../skarm.js");
const Encrypt = require("../encryption.js");
const Constants = require("../constants.js");
const ComicNotifier = require("./_comic_base_class.js");

class WorkChronicles extends ComicNotifier {
	setTimePattern () {
		// This is set in a separate function to allow for easy inheritence overrides
		this.discoveryDelay_ms = 0; // delay between when a new comic is discovered and when it is posted in channels
		this.pollingInterval_ms = 1000 * 60 * 30;  // how often skarm pokes the source feed for new comics
	}

	poll () {
		if (!this.enabled) return;
		let tis = this;

		let params={
			timeout: 2000,
			followAllRedirects: true,
			uri: "https://workchronicles.com/feed/",
		};

		//Skarm.spam("Requesting: "+JSON.stringify(params));
		request.get(params, function(error, response, body){
			// Skarm.spam(JSON.stringify(response));return;
			if(!response) return Skarm.spam("Failed to receive a response object when attempting to request "+JSON.stringify(params));
			if(response.statusCode !== 200) return;
			if (error) {
				console.log(error);
				return;
			}
			parseString(response.body, (err, res) => {
				let entries = res.rss.channel[0].item;
				let rssComics = entries.map((ent) => {return {title: ent.title[0], link: ent.link[0]}});
				console.log(rssComics);
				for(let comic of rssComics){
					if(tis.comicArchive[comic.title]) continue;
					tis.comicArchive[comic.title] = comic.link;
					Skarm.spam("Found new Work Chronicle not in the feed:", comic);
					tis.publishRelease(comic.link);
				}
			});
			// console.log(response.body);
			// Skarm.spam(JSON.stringify(response.body));
			return;
		});
	}

	post(channel, id) {
		if (!this.enabled) return;
		id = id || "";

		if (id === "") {
			Skarm.sendMessageDelay(channel, "No comic specified");
			return;
		}

		let results = [];

		for(let reference in this.comicArchive){
			// halt on exact matches
			if (reference === id) {
				results = [{reference:reference, link: this.comicArchive[reference]}];
				break;
			}

			if (reference.includes(id)) {
				results.push({reference:reference, link: this.comicArchive[reference]});
			}
		}

		if (results.length === 0) {
			Skarm.sendMessageDelay(channel, "I couldn't find any work chronicles containing **" + id + "** in the title\nヽ( ｡ ヮﾟ)ノ");
			return;
		}

		if (results.length === 1) {
			Skarm.sendMessageDelay(channel, results[0].link);
			return;
		}

		if (results.length > 1) {
			const MAX_RESULTS = 10;
			let overflow = results.length - MAX_RESULTS;
			let printresults = [];
			for (let i = 0; i < Math.min(results.length, MAX_RESULTS); i++) {
				printresults[i] = "**" + results[i].reference + "** <" + results[i].link + ">";
			}
			let message = "Could not find an exact match for **" + id + "**, try one of these: \n" + printresults.join("\n");
			if (overflow > 0) {
				message += "\n(And " + overflow + " more)";
			}
			Skarm.sendMessageDelay(channel, message);
		}
	}
}

module.exports = WorkChronicles;

/**
 * Powershell script for regenerating the archive in the event of a catastrophic loss:
 * 
```
$collection = 1..22 | foreach {
    $r = Invoke-WebRequest -UseBasicParsing  "https://workchronicles.com/comics/page/$_/"
    $r.Content.Split("<") | where {$_ -like "*data-a2a-title*"} | foreach {[xml]"<$_</div>"} | foreach div
}

$a = @{}
$collection | foreach {$a[$_.'data-a2a-title'] = $_.'data-a2a-url'}
$a | ConvertTo-Json | Set-Content .\WorkChronicles.penguin
```
 */
