const fs = require("fs");
const Skarm = require("../skarm.js");
const Guild = require("../guild.js");
const Constants = require("../constants.js");

class ComicNotifier {
    constructor(bot) {
		Constants.initialize();
		this.bot = bot;
		this.interval = null;
		this.enabled = true;
		this.setSignature();
		this.comicArchivePath = "..\\skarmData\\" + this.signature + ".penguin";

		this.initialize();   // override this.initialize instead of the constructor itself
		this.loadComics();
		this.setTimePattern();
		this.schedule();
    }

	loadComics () {
		try {
			this.comicArchive = JSON.parse(fs.readFileSync(this.comicArchivePath).toString());
			console.log("Loaded in", this.length(), this.signature, "comics.");
		} catch (e) {
			// this.enabled = false;
			this.comicArchive = this.createComicArchive();
			console.log("Could not initialize the " + this.signature + " archive.", this.comicArchivePath, e);
		}
	}

	length () {
		// Returns the number of comics currently in the collection
		if(Array.isArray(this.comicArchive)){
			return this.comicArchive.length;
		} else {
			return Object.keys(this.comicArchive).length;
		}
	}

	createComicArchive () {
		// The data structure to store comics
		return [];
	}

	setSignature () {
		// automatic constant tracking the class of an object
		// this method should not be overwritten
		this.signature = this.constructor.name;
	}

    setTimePattern () {
		// This is set in a separate function to allow for easy inheritence overrides
		this.discoveryDelay_ms  = Constants.Time.MINUTES * 15; // delay between when a new comic is discovered and when it is posted in channels
		this.pollingInterval_ms = Constants.Time.MINUTES * 30;  // how often skarm pokes the source feed for new comics
	}

	initialize () {
		// This should be overriden by extending classes to make any necessary one-time initializations
		;
	}

	save () {
		if (!this.enabled) return;
		fs.writeFileSync(this.comicArchivePath, JSON.stringify(this.comicArchive));
		console.log("Saved " + this.signature + " Data");
	}

	poisonPill () {
		// Destroy any artifacts of the object that will not cease operation from garbage collection
		clearInterval(this.interval);
	}

	schedule () {
		// Creates the interval-based scanner to poll the website for new releases
		if (!this.enabled) {
			Skarm.spam("Service is not enabled:", this.signature);
			return;
		}
		if (this.interval) {clearInterval(this.interval);}
		let tis = this;
		this.interval = setInterval(() =>{tis._poll();}, tis.pollingInterval_ms);
		Skarm.spam("Scheduled comic:", this.signature, "at interval (ms):", tis.pollingInterval_ms);
	}

	_poll () {
		console.log("Polling comic:", this.signature);
		Skarm.spam("Polling comic:", this.signature); 
		this.poll();
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
				console.log("Notifying guild", guild, "of new release:", publishingData);
				Guild.guilds[guild].comicSubscriptions.notify(tis.bot.client, tis.signature, publishingData);
			}, tis.discoveryDelay_ms);
		}
		tis.save(Constants.SaveCodes.DONOTHING);
	}

	post (channel, comicID) {
		let results = this.get(comicID);
		if (results.length === 0) {
			Skarm.sendMessageDelay(channel, "I couldn't find any comics matching **" + id + "** \nヽ( ｡ ヮﾟ)ノ");
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
