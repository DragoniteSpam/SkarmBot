"use strict";
const fs = require("fs");
const request = require("request");
const parseString = require('xml2js').parseString;
const Skarm = require("../skarm.js");
const Encrypt = require("../encryption.js");
const Constants = require("../constants.js");
const ComicNotifier = require("./_comic_base_class.js");

class WorkChronicles extends ComicNotifier {
	setTimePattern() {
		// This is set in a separate function to allow for easy inheritence overrides
		this.discoveryDelay_ms = 0; // delay between when a new comic is discovered and when it is posted in channels
		this.pollingInterval_ms = 30 * Constants.Time.HOURS;  // how often skarm pokes the source feed for new comics
	}

	poll() {
		if (!this.enabled) return;
		let tis = this;

		let target = `https://workchronicles.substack.com/api/v1/archive?sort=new&search=&offset=0&limit=50`;
		console.log("Executing fetch on target", target);
		fetch(target, {
			"body": null,
			"method": "GET"
		}).then((response) => {
			return response.json();
		}).then((comics) => {
			// fail gracefully in the event of a network error
			if (!comics) {
				Skarm.spam("Failed to retrieve comics array from work chronicles");
				return;
			}

			// seek out the new ones from the response
			comics = comics.filter(c => c.title.includes("(comic)"));
			console.log("Received", comics.length, "results from", target);
			for (let fullComicObj of comics) {

				// reduce the object down to just these properties for saving
				let { title, slug, post_date, canonical_url, cover_image } = fullComicObj;
				let smallC = { title, slug, post_date, canonical_url, cover_image };

				// check if we already have an entry with that slug
				let existingC = tis.comicArchive.filter(entry => entry.slug === smallC.slug);
				if (existingC.length > 0) continue; // don't republish existing comics
				console.log("Found new comic:", smallC);

				// add the comic to the collection
				tis.comicArchive.push(smallC);

				// make sure things remain sorted by publication date
				tis.comicArchive.sort((a, b) => {
					let ad = (new Date(a.post_date)).getTime();
					let bd = (new Date(b.post_date)).getTime();
					let comparison = ad - bd;
					console.log("Comparing", ad, bd, "-->", comparison);
					return comparison;
				});

				// publish
				tis.publishRelease(cover_image);

				// perish
				// that is, only publish one comic per polling cycle to not spam channels
				break;
			}
		});
	}

	post(channel, id) {
		if (!this.enabled) return;
		if (!id && id != 0) {
			Skarm.sendMessageDelay(channel, "No comic specified");
			console.log("empty ID field");
			Skarm.spam("empty ID field");
			return;
		}

		if (Math.floor(id) in this.comicArchive) {
			Skarm.sendMessageDelay(channel, this.comicArchive[id].cover_image);
			return;
		} else {
			console.log("ID", id, "was not in the comic archive", Object.keys(this), Object.keys(this.comicArchive));
		}

		let results = [];

		// todo: name-based matching


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
