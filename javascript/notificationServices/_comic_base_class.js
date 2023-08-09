const Skarm = require("../skarm.js");
const Guild = require("../guild.js");
const Constants = require("../constants.js");

class ComicNotifier {
    constructor(bot) {
		this.bot = bot;
		this.interval = null;
		this.enabled = true;
		this.setSignature();
		this.initialize();   // override this.initialize instead of the constructor itself
		this.setTimePattern();
		this.schedule();
    }

	setSignature () {
		// automatic constant tracking the class of an object
		// this method should not be overwritten
		this.signature = this.constructor.name;
	}

    setTimePattern () {
		// This is set in a separate function to allow for easy inheritence overrides
		this.discoveryDelay_ms = 1000 * 60 * 15; // delay between when a new comic is discovered and when it is posted in channels
		this.pollingInterval_ms = 1000 * 60 * 30;  // how often skarm pokes the source feed for new comics
	}

	initialize () {
		// This should be overriden by extending classes to make any necessary one-time initializations
		;
	}

	save () {
		// This should be overriden by extending classes to save any necessary database files on a scheduled cadence
		;
	}

	poisonPill () {
		// Destroy any artifacts of the object that will not cease operation from garbage collection
		clearInterval(this.interval);
	}

	schedule () {
		// Creates the interval-based scanner to poll the website for new releases
		if (!this.enabled) return;
		if (this.interval) {clearInterval(this.interval);}
		let tis = this;
		this.interval = setInterval(function(){tis.poll();}, tis.pollingInterval_ms);
	}

	poll () {
		// Implements the necessary web requesting and handling to find new releases.
		// This should always be overriden by extending classes to implement core behavior.
		// Once the desired data is retrieved, it should be sent to publishRelease() for publication to channels.
	}

	get (comicID) {
		// If possible, run a query on an existing collection of comics to look for any matches.
		// Should return a list of links to potential matches.
	}

	publishRelease (publishingData) {
		let tis = this;
		for(let guild in Guild.guilds) {
			setTimeout(()=>{
				// console.log("Notifying guild", guild, "of new release:", publishingData);
				Guild.guilds[guild].comicNotify(tis.bot.client, tis.signature, publishingData);
			}, tis.discoveryDelay_ms);
		}
		tis.bot.save(Constants.SaveCodes.DONOTHING);
	}

	post (channel, comicID) {
		let results = this.get(comicID);
		if (results.length === 0) {
			Skarm.sendMessageDelay(channel, "I couldn't find any comics matchin **" + id + "** \nヽ( ｡ ヮﾟ)ノ");
			return;
		}

		if (results.length === 1) {
			Skarm.sendMessageDelay(channel, results[0]);
			return;
		}

		if (results.length > 1) {
			const MAX_RESULTS = 10;
			let overflow = results.length - MAX_RESULTS;
			let printresults = [];
			for (let i = 0; i < Math.min(results.length, MAX_RESULTS); i++) {
				printresults[i] = "<" + results[i] + ">";
			}
			let message = "Could not find an exact match for **" + id + "**, try one of these: \n" + printresults.join("\n");
			if (overflow > 0) {
				message += "\n(And " + overflow + " more)";
			}
			Skarm.sendMessageDelay(channel, message);
			return;
		}
	}
}

module.exports = ComicNotifier;
