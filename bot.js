// lead spaghetti chef: https://github.com/DragoniteSpam
// secondary spaghetti chef: https://github.com/Master9000
"use strict";
// load discordie object
//skarm
const discordie = require("discordie");
const twitch = require('twitch-get-stream')('jm6wh6ctwjg97ljlffp8ds062uzkd7');
const fs=require("fs"), ini=require("ini");
const tempwolfy=require("node-wolfram");
const wolfy=new tempwolfy(fs.readFileSync("..\\wolfram.txt").toString());
const request=require("request");
const os=require('os');


function wikipedia(){
    var query="Chicken";
    var base_url="https://en.wikipedia.org/w/api.php?";
    var api="action=query&format=json&prop=extracts&explaintext=1&exintro=1&callback=?&titles="+query;
    
    //var api="action=opensearch&format=json&search="+query;
    /*request(base_url+api, function(err, response, body){
        if (err){
            console.log("something went wrong");
        } else {
            if (body.includes("\"extract\":")){
                var extract="";
            }
        }
    });*/
    /*jQuery.getJSON(base_url+api, function(data){
        for (var i in data.query.pages) {
            if (data.query.pages.hasOwnProperty(i)){
                var page=data.query.pages[i];
                if (page.extract===undefined){
                    entryWikiExtract[replaceAll(page.title, " ", "").toLowerCase()]="[Wikipedia does not have an article on \""+page.title+".\" How unfortunate.]";
                } else {
                    entryWikiExtract[replaceAll(page.title, " ", "").toLowerCase()]=page.extract.replace(/\n/g, "\n\n");
                }
            }
        }
        fadeOutLoading();
    });*/
}

//wikipedia();

// create the discord client obj
const client = new discordie({autoReconnect:true});
const events = discordie.Events;
// Constants

//channels
const GENERAL="304082726019923978";
const ZEAL_SERVER="304082726019923978"; // theyre the same

const ALGETTY ="311411150611021824";
const SUNS = "321777310057627655";
const NRTKP = "311402910820859914";
const BLACKBIRD="311409240327585802";
const OCEANPALACE="305548986155008000";
const BLACKOMEN="305488106050813954";

const ENHASA = "311478529797914626";
const DREAM = "328372620989038594";
const WOE="311398412610174976";
const MODCHAT="376619800329453570";
const MODLOG="344295609194250250";

//users
const MASTER="162952008712716288";
const ARGO="263474950181093396";
const DRAGONITE="137336478291329024";
const EYAN_ID="304073163669766158";
const PRIMA="425428688830726144"; const TIBERIA = PRIMA;
const SKARMORY="319291086570913806";
const sudoers=[DRAGONITE,MASTER,PRIMA,ARGO,SKARMORY];


//Skarm channels
const PAPASKARM="394225763483779084";
const dataGen = "409856900469882880";
const dataAct = "409860642942615573";
const frmKing = "409868415176802324";
const MEyTA = "409870100385103899";
//roles 
const EARTHBOUND = "305101211072462848";
const ENLIGHTENED = "338043707485978624";
const REDGAOLER="305450620754591756";
const MASAMUNE="305450671992340480";
const PINK = "305450786001911808";
const PINKER = "407725604910399489";


//Files
const EYANQUOTESFILE = "line.txt";

// misc constants

const MAX_LOGGED_LINES=8000;
const BIG_BROTHER_TIMEOUT=10;

// talk odds

var esOddsSkyrim=25;
var esOddsRandomLine=30;
var esOddsRandomPun=4;
var esOddsQuestion=20;

// beverages

var drinkCount=0;
var rootbeerCount=0;

//version 
var version=[];
for(var i=0;i<3+Math.random()*4;i++){
	version.push(Math.floor(1+Math.random()*9));
}



// xkcd

class XKCD {
    constructor(){
        this.channels=[];
        this.latest=2123; // this is the previous comic as of my writing this
        this.latestDate=new Date();
        this.timeout=null;
    }
    
    save(){
        var required={
            channels: this.channels,
            latest: this.latest,
            latestDate: this.latestDate
        };
        
        fs.writeFile(".\\stuff\\xk.cd", JSON.stringify(required), function(err){
            if (err){
                console.log("something bad happened: "+err);
            }
        });
    }
    
    load(){
        if (fs.existsSync(".\\stuff\\xk.cd")){
            var valid = fs.readFileSync(".\\stuff\\xk.cd").toString();//80Z"}
			console.log("Reading xk.cd");
			console.log(valid.substring(valid.length-10));
			if(valid.includes("80Z\"}80Z\"}")){
				console.log("Invalid file, attempting correction");
				valid=valid.replace("80Z\"}80Z\"}","80Z\"}");
			}
            var loaded=JSON.parse(valid);
            if (loaded.channels!==undefined){
                this.channels=loaded.channels;
            }
            
            if (loaded.latest!==undefined){
                this.latest=loaded.latest;
            }
            
            try {
                this.latestDate=new Date(loaded.latestDate);
            } catch (err){
                // an arbitrarily long time ago
                this.latestDate=new Date(2000, 0, 1);
                console.log("bad xkcd date, resetting");
            }
        }
        
        this.schedule();
    }
    
	channelFeed(){
		var chans=client.Channels.toArray();
		for(var i in this.channels){
			var x=false;
			sien("<#"+this.channels[i]+">\t"+this.channels[i]);
			for(var c in chans){
				if(chans[c].id == this.channels[i]){
					x=true;
				}
			}
			if(!x){
				sien("Channel doesn't exist, please purge: "+this.channels[i]);
			}
		}
		sien("Inspected "+chans.length+" channels");
	}
	
    post(){
        utilityURLExists("https://xkcd.com/"+this.latest+"/", this.postSuccessful, { me: this, file: this.latest });
        utilityURLExists("https://xkcd.com/5000/", this.postSuccessful, { me: this, file: 5000 });
        
        clearTimeout(this.timeout);
        this.schedule();
    }
    
    postSuccessful(results, params){
        if (results.statusCode==200){
            params.me.channels.forEach(function(element){
                var channel=client.Channels.get(element);
                if (channel===null){
                    params.me.toggleChannel(element);
                } else {
                    sendMessageDelay("xkcd \#"+params.file+":\nhttps://xkcd.com/"+params.file+"/", channel);
                }
            });
            
            params.me.latest++;
            params.latestDate=new Date();
            params.me.save();
            // check to see if there's more
            setTimeout(function(){
                params.me.post();
            }, 5000);
        }
    }
    
    nextScheduledUpdate(){
        var when=new Date(this.latestDate.toString());
        when.setHours(17);
        when.setMinutes(0);
        when.setSeconds(0);
        
        if (this.latestDate>=when){
            when=when.setTime(when.getTime()+(6*60*60*1000/*21,600,000*/));
        }
        
        return (when-this.latestDate);
    }
    
    schedule(){
        var when=this.nextScheduledUpdate();
        console.log("next xkcd check scheduled for: "+when);
        
        this.timeout=setTimeout(function(){
            // this is slightly redundant but i'm going to leave it this way
            munroe.post();
        }, when);
    }
    
    toggleChannel(channel){
        if (this.channels.includes(channel.id)){
            sendMessageDelay("xkcds will no longer be sent to this channel!", channel);
            this.channels.splice(this.channels.indexOf(channel.id), 1);
        } else {
            sendMessageDelay("xkcds will now be sent to this channel!", channel);
            this.channels.push(channel.id);
        }
        
        this.save();
    }
}

var munroe=new XKCD();
munroe.load();
// Classes

class User {
	constructor(name, discriminator, id){
		this.name=name;
		this.discriminator=discriminator;
        this.id=id;
        
		this.swears=0;
		this.slaps=0;
		this.zeal=0;
		this.toilet=0;
		
		this.silver=0;
		
		this.actions=0;
		this.questions=0;
		this.exclamations=0;
		this.elvia=0;
		
		this.lines=0;
        this.characters=0;
		this.secretWord=0;
		this.secretWordAdd=0;
		
		this.todayMessages=0;
		this.todayViolence=0;
		this.todayWarnings=0;
		this.totalWarnings=0;
		
		this.todayWasWarned=false;
        
        this.refString="";
        this.blockRefString=false;
        this.talkTimer=BIG_BROTHER_TIMEOUT;
        this.pointEligible=true;
        this.points=0;
	}
}

class Shanty {
    constructor(filename){
        this.filename=filename;
        this.lines=[];
        this.linesPerMessage=1;
    }
}

class Condition{
	constructor(tr,act){
		this.trigger=tr;
		this.action=act;
	}
}

// Banned words, and stuff like that
var banned=[
]

var violentVerbs=[
	["kicks", 1],
	["slaps", 1],
	["hits", 1],
	["smacks", 1],
	["destroys", 1],
	["kills", 1],
	["punches", 1],
    ["anthrax", 2],
    ["marijuana", 1],
    ["heroin", 2],
    ["opium", 2],
    ["ketamine", 2],
    ["cocaine", 2],
    ["methamphetamine", 2],
    ["lsd", 2],
    ["republican", 1],
    ["democrat", 1],
    ["communis", 2],
    ["nazi", 3],
    ["fascis", 3]
]

var hotDateResponses=[
	"1999, when Lavos burns the world.",
	"7.5 billion AD, when the Sun engulfs the Earth",
]

var lastDateResponses=[
	"10^98 AD, or whenever the heat death of the universe is currently forecasted to happen",
]

//keep this alphabetized plz
var shanties=[
]

function loadShanty(filename){
    if (fs.existsSync("./shanties/"+filename)){
        var lines=fs.readFileSync("./shanties/"+filename).toString().split('\n');
        var song=new Shanty(filename);
        for (var i=0; i<lines.length; i++){
            if (i==0){
                song.linesPerMessage=parseInt(lines[i]);
                if (isNaN(song.linesPerMessage)){
                    throw "you done goofed in "+filename+" (shanty file must start with the number of lines per message (probably 2 or 4))";
                }
            } else {
                song.lines.push(lines[i]);
            }
        }
        return song;
    }
    return null;
}

// These get cleared every once in a while
var deletionQueue=[];
var deletionQueueLong=[];

// Load up the stats
var stats=ini.parse(fs.readFileSync('stats.ini', 'utf-8'));
var statsGeneral=ini.parse(fs.readFileSync('misc.ini', 'utf-8'));
var userTable={};
var totalBotCommands=0;
var gummyCommandsLast5Minutes=0;
var totalCensoredLines=0;
var dragoniteActive=0;
var masterActive=0;
var kingActive=5;
var messagesThisCycle = 0;
var generallyAnnoying = false;
utilityCreateUserTable();
utilityLoadBotStats();

// assume the stream is online until proven otherwise, that way it doesn't keep
// notifying everyone if it restarts
var streamState=true;
var streamHasNotifiedDate=null;


var senna="";
// caching to limit log rates //49/10/15 todo
var timer1 = setInterval(function(){
	if(senna.length>0 && (senna.length<2000)){
		sms(client.Channels.get("430545618314985504"),senna);
		senna="";
	}else if(senna.length>1999){
		sms(client.Channels.get("430545618314985504"),senna.substring(0,2000));
		senna=senna.substring(2000);
	}
}, 1000);


// There are some things that need doing on a regular basis
var timer15 = setInterval(function(){
	twitchGetIsLive(null);
	twitchSendStatusMessage();
	censorClearDeletionQueue();
}, 15000);
// Change this to be however long it needs to for the knuckleheads to stop spamming the bot
var timer30=setInterval(function(){
    botCanSpeak=true;
}, 30000);

var timer60 = setInterval(function(){
	//censorClearDeletionQueueLong();
	utilitySaveStats(null);
	utilitySaveBotStats();
	botCanSendUserCommands=true;
	/*if(dragoniteActive>0){
		dragoniteActive--;
	}
	if(masterActive>0){
		masterActive--;
	}*/
	generallyAnnoying = false;
	if(kingActive>0){
		kingActive--;
	}
    for (var user in userTable){
        if (userTable[user].refString.length>0){
            userTable[user].talkTimer--;
        }
    }
}, 60000);

var timer5min = setInterval(function(){
	botCanYellAtCandy=true;
	for (var user in userTable){
		userTable[user].todayWasWarned=false;
	}
	var now=new Date();
	if (now.getHours()==4&&now.getMinutes()<10){
		for (var string in userTable){
			var user=userTable[string];
			user.todayMessages=0;
			user.todayViolence=0;
			user.todayWarnings=0;
			if (now.getDay()==0){
				user.totalWarnings--;
				if (user.totalWarnings<0){
					user.totalWarnings=0;
				}
			}
		}
	}
	gummyCommandsLast5Minutes--;
	if (gummyCommandsLast5Minutes<0){
		gummyCommandsLast5Minutes=0;
	}
	fetchPinnedAuto(client.Channels.get(GENERAL));
}, 300000);

var timerHour=setInterval(function(){
	for (var user in userTable){
		userTable[user].pointEligible=true;
	}
}, 3600*1000);

// extra stuff

var myName="SuperSkarm";

var myNick="Skarm";
var meNiks=["binary","metal","spaghetti","droid","ai","papa john","birdbrain","bot"];
var token=null;

var botCanSendUserCommands=true;
var botCanYellAtCandy=true;
var botCanSpeak=true;
var lastTenReactions=[];
var last500General=[];
var last500Action=[];
var last500Dleet=[];
var hasBuggedDracoAboutPins=false;
var currentlySinging=null;
var currentLineSinging=-1;

var DRAGONITE_OBJECT=null;
var ZEAL = null;
var enlightened = null;
var earthbound = null;

var botCanAnnounce = true;

getToken();

client.connect({
	token: token
});
function getToken(){
	token=fs.readFileSync("..\\token.txt").toString();
}

// What happens when you first connect
client.Dispatcher.on(events.GATEWAY_READY, e => {
	console.log("Connected as " + client.User.username+" ("+myNick+"). Yippee!");
	
	twitchGetIsLive(null);
	twitchGetLastStreamDate();
	censorLoadList();
	DRAGONITE_OBJECT=client.Users.get(DRAGONITE);
	ZEAL  = client.Guilds.get(GENERAL);
    processShanties(null);
	fs.readFile("bot.js", function(err, data){
		if(err){
			throw err;
		}
        client.User.setGame({name: "e!help to use "+data.toString().split('\n').length+" lines of spaghetti", type: 0});
	});
});
//what the bot does whenever a message is deleted
client.Dispatcher.on(events.MESSAGE_DELETE, e=> {
	var string="";
	if (e.message!=null){
		if (e.message.channel!=client.Channels.get("344295609194250250")&&e.message.author!=client.User&&!e.message.author.bot){//if the channel isn't modlog and its not from a bot
			if (e.message==null){														//making sure the message isnt broken
				string="<message not cached>"; 
			} else {
				string=e.message.content+" by "+e.message.author.username;
			}
			fs.appendFile("deleted.txt", "Deleted: "+string+"\r\n", (err) => {	//delete log
				if (err){
					throw err;
				}
				sms(client.Channels.get("414291195028570112"), string+ " <#"+ e.message.channel_id +"> was written to deleted.txt."); //skarm server delete log
			});
		}
	}
});

client.Dispatcher.on(events.MESSAGE_REACTION_ADD, e=> {
	if (e.emoji.name=="Upvote"){
		if (e.message!=null&&e.message.channel_id==BLACKBIRD){
			// This is horrible and i should feel horrible about writing it //gohere
			if (lastTenReactions.length>=10){
				lastTenReactions.shift();
			}
			lastTenReactions.push(e.message);
			var count=0;
			for (var i=0; i<lastTenReactions.length; i++){
				if (lastTenReactions[i]==e.message){
					count++;
				}
			}
			
			if (count==3&&!e.message.pinned){
				e.message.pin();
				fetchPinnedSelf(e.message.channel);
			}
		}
	} 
});

client.Dispatcher.on(events.GUILD_MEMBER_ADD, e=> {
	if(e.guild.id != ZEAL_SERVER){
		return "i wonder if this can return strings";
	}
	
	sms(client.Channels.get(GENERAL), e.member.mention + ", Welcome to **The Kingdom of Zeal!** Check out <#305486914910158848> for server info and <#305488106050813954> for announcements!");

});
	
client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e=> {
	if(e.member.guild.id != ZEAL_SERVER){
		return "i wonder if this can return strings";
	}
	if (e.rolesAdded.length>0){
		
		if (e.rolesAdded[0].id=="310639329334657026"){
			woeMessage(e.member);
		}
		sms(client.Channels.get(MODLOG), "Role addition for " + e.member.username);
	}
	if (e.rolesRemoved.length>0){
		sms(client.Channels.get(MODLOG), "Role removal for " + e.member.username);
	}
});

client.Dispatcher.on(events.MESSAGE_UPDATE, e=> {
	if (e.message!=null){
		censor(e.message);
	}
});

// Name changes
client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e=> {
	if (e.member!=null){
		var LOG="428324182728638464";
        if (e.member.nick!=e.previousNick){
            // Either an avatar change or a server nick change
            sms(client.Channels.get(LOG), e.member.username+"@"+e.member.discriminator+": "+e.previousNick+" -> "+e.member.nick);
        }
        
	}
});

client.Dispatcher.on(events.PRESENCE_UPDATE, e=> {
	//console.log("Presence update");
	if (e.guild.id==PAPASKARM){
		var LOG="678456248735367168";
        var logChannel=client.Channels.get(LOG);
        //if ((e.member.status===e.member.previousStatus)&&(e.member.gameName===e.member.previousGameName)){
        //if ((e.user.status===e.user.previousStatus)&&(e.user.gameName===e.user.previousGameName)){
            // Either an avatar change or a server nick change
        
		sms(logChannel, e.user.username+"#"+e.user.discriminator+
		//":\n Nick: "+e.member.nick+
		
		"\n Status: "+e.user.status+
		"\n Prev stat: "+e.user.previousStatus+
		
		"\n Game: "+e.user.gameName+
		"\n Previous Game: "+e.user.previousGameName);
        
        
	}
});

client.Dispatcher.on(events.MESSAGE_CREATE, e=> {
    // special case trolling
    if (e.message.channel.id == "580946892201000960") {
        if (e.message.content.startsWith("4! ")) {
            var content = e.message.content.replace("4! ", "");
            var channel = "580882049641086977";
            if (content.startsWith("+")) {
                var tokens = content.split(" ");
                channel = tokens[0].replace("+", "");
                content = content.replace(tokens[0], "");
            }
            if (content.length > 0) {
                client.Channels.get(channel).sendMessage(content);
            }
        }
    }
	
	if(!adminMode(e)){
	
	// don't do anything in PMs?
	if (e.message.isPrivate){
		return false;
	}
    // ignore messages that mention anyone or anything
    if (e.message.content.toLowerCase().includes("@")){
            return false;
    }
	// Don't do anything in Woe, Mod Chat or Mod Log
	if (e.message.channel.id==WOE||e.message.channel.id==MODLOG){
		if (e.message.content.toLowerCase().startsWith("role ")){
			utilityUpdateEarth(e);
		}
		return false;
	}
	// Don't respond to bot lines
	if (e.message.author.bot){	
		return false;
	}
	}
	
	var author = e.message.author;
    var message=e.message.content.toLowerCase();
    
    // hard-coding gummy stuff
    if (author.id==="199725993416589313"){
        if (message.includes(" ex")){
            e.message.delete();
        }
        if (message.includes("gf")){
            e.message.delete();
        }
    }
    
    // colloquially known as ref strings
    bigBrother(e, author, message);
    
    // idk what the point of this is, tee hee hee
    hourlyPoints(author, message);
    
	var msg = message.split(" ");
	if(!e.message.channel.id==MODCHAT){
		censor(e.message);
	}
	
	// Help
	if (!e.message.deleted){ 
		notifiers(e, message);
		//changes the color of Skarm's mayhem role to absolutely any RGB value
		if (!e.message.deleted){ 
			roleGetter(client.Guilds.get("505240399145861140").roles,"603768145622204442").commit("Skarm's color mayhem role",Math.floor(Math.random()*16777215),false,true);
		}
	
		if(e.message.content.toLowerCase().substring(0,2)=="e!" || adminMode(e)){
			massEffect(e, message, msg);
		}
		//Everything else
		statsMaster9000(e.message);
		statsWillOfD(e.message);
		STATS(e.message);
    
		// Can't be one of your own lines
		if (!utilityMessageWasWrittenByMe(e.message)){
			// Can't respond if you did other miscellaneous things with this line
			if (!REACT(e.message, e.message.author.id)){
				// Can't be from bot chat or mod chat
				if (e.message.channel!=OCEANPALACE && e.message.channel.id!=MODCHAT){
					// Can't mention any people, places, things or ideas
					if (e.message.mentions.length==0&&e.message.mention_roles.length==0&&!e.message.mentions_everyone){
						// Don't start with an Ayana command or a Tatsu command
						if(!e.message.content.startsWith("=")&& !e.message.content.includes("http")&& !e.message.content.startsWith("t!")){
							// There's a 25% chance of recording the message
							if (Math.random()*100<25){
                               addGeneral(e.message);
							}
                     	}
                    }
				}
			}
		}
	}
});


function roleGetter(list,id){
	for(var i in list){
		if(list[i].id==id)
			return list[i];
	}
	return null;
}

function adminMode(e){
	return (e.message.content.startsWith("e@")&&sudo(e));
}
function sudo(e){
	return sudoers.includes(e.message.author.id);
}

function bigBrother(e, author, message){
    var usernameString=authorString(author);
	var user;
	if (usernameString in userTable){
		user=userTable[usernameString];
	} else {
		user=new User(author.username, author.discriminator, author.id);
		userTable[usernameString]=user;
	}
    user.talkTimer=BIG_BROTHER_TIMEOUT;
    
    for (var user in userTable){
        var member=userTable[user];
        if (member.refString.length>0){
            if (message.includes(member.refString)){
                var discordUser=client.Users.get(member.id);
                try {
                    if (member.talkTimer<=0&&canViewChannel(discordUser, e.message.channel)){
                        discordUser.openDM().then(function(dm){
                            var quote=e.message.content+" ("+e.message.author.username+")";
                            dm.sendMessage("Your ref string was mentioned!\n```"+quote+"``` in <#"+e.message.channel_id+">");
                        });
                        member.talkTimer=BIG_BROTHER_TIMEOUT;   // this is so you dont get bombarded by messages if people say your name a lot (gummy)
                    } else {
                        console.log(member.name+" was mentioned, but in a channel they can't view");
                    }
                } catch (e){
                    console.log(user+" can't view the channel they were mentioned in for whatever reason");
                }
            }
        }
    }
}

function canViewChannel(user, channel){
    if (user===null||channel===null){
        return false;
    }
    return user.can(discordie.Permissions.Text.READ_MESSAGES, channel);
}

function hourlyPoints(author, message){
    var usernameString=authorString(author);
    var user;
    if (usernameString in userTable){
        user=userTable[usernameString];
    } else {
        user=new User(author.username, author.discriminator, author.id);
        userTable[usernameString]=user;
    }
    if (user.pointEligible){
        user.points++;
        user.pointEligible=false;
    }
}

function aGF(i,list){
	try{
		sien("attempting "+ list[i].name);
		list[i].channels[0].createInvite({"temporary": false, "xkcdpass": false}).then(function(res){
			sien(list[i].name +", https://discord.gg/"+res.code);
		});
	}catch(err){
		try{
			sien("failed to get invite for "+list[i].name);
		}catch{
			sien("really failed for guild " +i+" of "+list.length); 
		}
	}
}

var effects=[];


effects.push(new Condition("guilds", function(e){var list = client.Guilds.toArray();for (var i in list) {aGF(i,list);}}));
effects.push(new Condition("help says",helpSays));
effects.push(new Condition("help twitch",helpTwitch));
effects.push(new Condition("help lol",helpLol));
effects.push(new Condition("help misc",helpMisc));
effects.push(new Condition("help credits",helpCredits));
effects.push(new Condition("help reactions",helpReactions));
effects.push(new Condition("help mods",helpMods));
effects.push(new Condition("help",helpHelpHelp));
effects.push(new Condition("size",utiliyLineCount));
effects.push(new Condition("sact",utilityActCount));
//effects.push(new Condition("stats",utilityStats));
//effects.push(new Condition("user",utilityUserStats));
effects.push(new Condition("ping",utilityPing));
effects.push(new Condition("hug",utilityHug));
effects.push(new Condition("sandwich",utilitySandwich));
effects.push(new Condition("bot",utilityBotStats));
effects.push(new Condition("kenobi",utilityKenobi));
effects.push(new Condition("game ",utilityGame));
//effects.push(new Condition("silver ",utilitySilver));
effects.push(new Condition("skarm",utilitySkarm));
effects.push(new Condition("suggest",utilitySuggestion));
effects.push(new Condition("xkcd",utilityMunroe));
effects.push(new Condition("test",function (e){sms(e.message.channel,e.message.author.username+" can submit messages: "+userHasKickingBoots(e.message.author, e.message.channel));}));
effects.push(new Condition("live",function (e){twitchGetIsLive(e.message.channel);sms(e.message.channel,"This function has been commented out because it stopped working for no reason back in May 2018. Sorry.");totalBotCommands++;}));
effects.push(new Condition("pinned",utilPins));
effects.push(new Condition("says-add ",add));
effects.push(new Condition("censor",censorCommandSet));
effects.push(new Condition("shanties",processShanties));
effects.push(new Condition("save",utilitySaveStats));
effects.push(new Condition("pink",function(e){utilityPink(e);utilityPinker(e);}));


//effects.push(new Condition("",));

effects.push(new Condition("crash",utilityCrash));
effects.push(new Condition("exit",utilityCrash));
effects.push(new Condition("reboot",utilityCrash));

function massEffect(e, message, msg){
    
	for(var i in effects){
		if(e.message.content.substring(2).startsWith(effects[i].trigger)){
			effects[i].action(e);
			totalBotCommands++;
			return i;
		}
		if(adminMode(e)&&e.message.content==="e@test" && i<effects.length-3){
			sien("testing e!"+effects[i].trigger);
			effects[i].action(e);
		}
	}

  
    // Set/remove Big Brother (and do other things with ref strings)
     if (message.startsWith("e!setref")){
        if (hasBigBrotherRank(client.Users.get(e.message.author.id))||e.message.author.id===PRIMA){
            var spl=message.split(" ");
            var user=userTable[authorString(e.message.author)];
            if (spl.length>=2){
                user.refString=spl[1];
                sms(e.message.channel, "**"+user.name+",** your reference string has been set to **"+spl[1]+"**. (You might want to edit your privacy settings to allow DMs from server members.)");
            } else {
                user.refString="";
                sms(e.message.channel, "**"+user.name+",** your reference string has been removed!");
            }
        } else {
            sms(e.message.channel, "**"+e.message.author.username+",** you need to be Red Gaoler or higher to set your reference string!");
        }
    }
    else if (message.startsWith("e!blockref")){
        if (hasBigBrotherRank(client.Users.get(e.message.author.id))||e.message.author.id===PRIMA){
            var user=userTable[authorString(e.message.author)];
            if (user.refString.length>0){
                user.blockRefString=true;
                sms(e.message.channel, "Skarm should no longer say your ref string in regurgitated lines! (Use `e!unblockref` to turn this feature off.)");
            } else {
                sms(e.message.channel, "You have no ref string set! You can set one with `e!setref <word>`.");
            }
        } else {
            sms(e.message.channel, "You can't do this quite yet. Wait for Red Gaoler rank and then you can use that command! (If enough non-Gaolers request this feature it'll probably be enabled later).")
        }
        
    } else if (message.startsWith("e!unblockref")){
        if (hasBigBrotherRank(client.Users.get(e.message.author.id))||e.message.author.id===PRIMA){
            var user=userTable[authorString(e.message.author)];
            if (user.refString.length>0){
                user.blockRefString=false;
                sms(e.message.channel, "Skarm can say your ref string in regurgitated lines again!");
            } else {
                sms(e.message.channel, "You have no ref string set! You can set one with `e!setref <word>`.");
            }
        } else {
            sms(e.message.channel, "You can't do this quite yet. Wait for Red Gaoler rank and then you can use that command! (If enough non-Gaolers request this feature it'll probably be enabled later).")
        }
    }
    // Lol
    if (botCanSendUserCommands){
        if (message=="e!will"){
            annoyWill(e.message.channel);
            totalBotCommands++;
            botCanSendUserCommands=false;
        } else if (message==="e!master"){
            annoyMaster(e.message.channel);
            totalBotCommands++;
            botCanSendUserCommands=false;
        }else if (message=="e!refresh"){
            totalBotCommands++;
            utilityUpdateEarth(e);
            utilityPink(e);
        }else if (message=="e!treason"){
            //("ಠ_ಠ")
            sms(e.message.channel, "God damn it, Squid.");
            totalBotCommands++;
            botCanSendUserCommands=false;
        } else if (message=="e!back"){
            sms(e.message.channel, "\"Back\" count: "+statsGeneral.everything.back);
            totalBotCommands++;
            botCanSendUserCommands=false;
        } else if(message.startsWith("e!google")){
            totalBotCommands++;
            google(e);
        } else if (message.startsWith("e!wolfram")){
            totalBotCommands++;
            wolfram(e);
        } else if (message.startsWith("e!so ")){
            totalBotCommands++;
            stackOverflow(e);
        } else if (message==="e!rainy"){
            totalBotCommands++;
            sms(e.message.channel, "cease!");
        }
        if (lineIsQuestion(message)&&Math.random()*100<esOddsQuestion){
            sendRandomLineGeneral(e.message);
        }/*
        this doesnt work
        else if (lineIsHmm(message)){
            sms(e.message.channel, ":thinking:");
        }*/
	}
}

function /*boolean*/ lineIsQuestion(line){
    var questionwords=[
        "who",
        "what",
        "when",
        "where",
        "why",
        "how",
    ];
    /*
    //most questions in the zelian dialect of english don't end in question marks
    if (!line.endsWith("?")){
        return false;
    }
    */
    
    line=line.toLowerCase();
    
    for (var i=0; i<questionwords.length; i++){
        if (line.startsWith(questionwords[i])){
            return true;
        }
    }
    
    return false;
}

function /*boolean*/ lineIsHmm(line){
    line=line.toLowerCase();
    var hmm=/[H][m]+/g;
    var match=line.match(hmm);
    return match!=null&&line==match[0];
}

function /* boolean*/ utilPins(e){
	var msg=e.message.content.split(" ");
	if(msg[0] != "e!pinned") return false;
	if(msg.length > 1){
		rangePinned(e,msg);
		return true;
	}
	utilityPinned(e.message.channel, e.message.channel);
	return true;
}

function notifiers(e, message){
	
	if (messageAuthorEquals(e.message, EYAN_ID)){
		kingActive = 3;
	}
	if (/*menKing(message) ||*/ message.includes("eyan")/*|| message.includes("zeal")*/){
		if(kingActive < 1){
			sms(client.Channels.get("452566957611548679"), message  +  " from "    +  e.message.author.username +" in <#" +e.message.channel_id +  ">");  
		}
	}
}

function menKing(message){
	if(message.indexOf("king")<0){
		return false;
	}
	if(message.indexOf("king") <2){
		return true;
	}
	if(message.indexOf(" king")>-1){
		return true;
	}
	return false;
}

function sendMessageDelay(string, channel){
	if(channel.isGuildText){
		channel.sendTyping();
	}
	setTimeout(function(){
		sms(channel,string);
	}, Math.random()*2000+1000);
}

/*
 ********************
 *      Roles       *
 ********************
 */
//this is here due to proximity to add for conveniance ;;;;;;
function regularityUpdateEarth(){
	var zelos = ZEAL;
	var enlightened = null;
	var earthbound = null;
	var monarch = null;
	var guru = null;
	var botter = null;
	//enlightened
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == ENLIGHTENED){
			enlightened = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//earthbound
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == EARTHBOUND){
			earthbound = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//monarch
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == "305100692933050368"){
			monarch = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//guru
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == "305100589514227712"){
			guru = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//bot
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == "305111451931115521"){
			botter = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//checks the guild members for the role
	for (var i=0; i<zelos.members.length; i++){
		member = zelos.members[i];
		//ignores staff roles for sanity sake
		if(member.hasRole(guru) || member.hasRole(botter) || member.hasRole(monarch)){}
		else{
			if(member.hasRole(enlightened) && member.hasRole(earthbound)){
				member.unassignRole(earthbound);
			}
			if(!member.hasRole(enlightened) && !member.hasRole(earthbound)){
				member.assignRole(earthbound);
			}
		}
	}
}
//fixes everyone's Earthbinds
function utilityUpdateEarth(e){
	if(e.message.guild.id == ZEAL_SERVER){
		if(e.message.channel.id != MODLOG){
		sms(e.message.channel,"Updating Enlightened...");
		}
		var member = null;
		//assigns zelos to Kingdom of Zeal guild variable
		var zelos = e.message.guild;
		var enlightened = null;
		var earthbound = null;
		var monarch = null;
		var guru = null;
		var botter = null;
		//enlightened
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == ENLIGHTENED){
				enlightened = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//earthbound
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == EARTHBOUND){
				earthbound = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//monarch
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == "305100692933050368"){
				monarch = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//guru
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == "305100589514227712"){
				guru = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//bot
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == "305111451931115521"){
				botter = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//checks the guild members for the role
		for (var i=0; i<zelos.members.length; i++){
			member = zelos.members[i];
			//ignores staff roles for sanity sake
			if(member.hasRole(guru) || member.hasRole(botter) || member.hasRole(monarch)){}
			else{
				if(member.hasRole(enlightened) && member.hasRole(earthbound)){
					member.unassignRole(earthbound);
				}
				if(!member.hasRole(enlightened) && !member.hasRole(earthbound)){
					member.assignRole(earthbound);
				}
			}
		}
	}
	else{
		sms(e.message.channel,"Please use this in zeal for it to work");
		return false;
	}
	if(e.message.channel.id != MODLOG){
		sms(e.message.channel,"Everyone is all set");
	}
	utilityPink(e);
	return true;
}
//fixes everyone's Pinker Nu status
function utilityPink(e){
	var pink = roleGet(PINK);
	var pinker = roleGet(PINKER);
	var enlightened = roleGet(ENLIGHTENED);
	var z = client.Guilds.get(GENERAL);
	var member = null;
	for(var i = 0; i<z.members.length; i++){
		member = z.members[i];
		if(!member.hasRole(enlightened) && member.hasRole(pinker)){
			member.unassignRole(pinker);
			member.assignRole(pink);
        }
		if(!(e.message.content == "e!refresh" || e.message.content.indexOf("role" >-1))){
			sms(e.message.channel,"Pinker Nu is for Enlightened only, sorry. Use !enlightened for help on becoming Enlightened");
		}
	}
}
//toggles Pink/Pinker Nu for the enlightened
function utilityPinker(e){
	var pink = roleGet(PINK);
	var pinker = roleGet(PINKER);
	var enlightened = roleGet(ENLIGHTENED);
	var z = client.Guilds.get(GENERAL);
	var member = null;
	for(var i = 0; i<z.members.length; i++){
		member = z.members[i];
		if(member.id == e.message.author.id){
			if(member.hasRole(enlightened)){
				if(member.hasRole(pink)){
					member.unassignRole(pink);
					member.assignRole(pinker);
					sms(e.message.channel,"You're now even Pinker of a Nu");
					return;
				}
				else if(member.hasRole(pinker)){
					member.unassignRole(pinker);
					member.assignRole(pink);
					sms(e.message.channel,"You're now back to normal nu");
					return;
				}
				else{sms(e.message.channel,"Get to pink nu before using this command");}
			}
			else{
				sms(e.message.channel,"Pinker Nu is for Enlightened only, sorry. Use !enlightened for help on becoming Enlightened");
			}
		return;
		}
	}
}
//returns Object Role from its ID for Zeal
function roleGet(id){
	var zelos = client.Guilds.get(GENERAL);
	for(var i = 0; i<zelos.roles.length; i++)
		if(zelos.roles[i].id == id)
			return zelos.roles[i];
	return null;
}

function userRank(user){
    // user is an IUser, not an IGuildMember, which just makes things confusing
    var member=getMember(user.id);
	if(member.hasRole(roleGet("319745428700790784"))){
		return 10;
	}
	if(member.hasRole(roleGet("305100692933050368"))){
		return 9;
	}
	if(member.hasRole(roleGet("305100589514227712"))){
		return 8;
	}
	if(member.hasRole(roleGet(ENLIGHTENED))){
		return 7;
	}
	if(member.hasRole(roleGet("305450320488562709"))){
		return 1;
	}
    if(member.hasRole(roleGet("305450391573757962"))){
		return 2;
	}
    if(member.hasRole(roleGet("305450528995934229"))){
		return 3;
	}
    if(member.hasRole(roleGet(REDGAOLER))){
		return 4;
	}
    if(member.hasRole(roleGet(MASAMUNE))){
		return 5;
	}
    if(member.hasRole(roleGet(PINK)) || member.hasRole(roleGet(PINKER))){
		return 6;
	} 
	
	return 0;
}

function hasBigBrotherRank(user){
    return (userRank(user)>=4);
}

function getMember(id){
    var zelos=ZEAL;
	for(var i = 0; i<zelos.members.length; i++){
		if(zelos.members[i].id == id){
			return zelos.members[i];
        }
    }
	sien("something broke in func getMember(id)");
}


/*
 ********************
 *      Quotes      *
 ********************
 */
 
//adds Eyan's quotes to his log 
function add(e){
	var message = e.message;
	if(message.guild.id != ZEAL_SERVER){
		sms(message.channel,"Please contact the Kingdom of Zeal staff to use this feature https://discord.gg/WFAMf42");
		return false;
	}
	var msg=message.content.toLowerCase().replace("e!says-add ", "").replace(/\r?\n|\r/, " ");
	for (var i=0; i<banned.length; i++){
		if (msg.includes(banned[i][0].toLowerCase())){
			sms(message.channel,"Please do not add profanity to the quote log. Thank.");
			return false;
		}
	}
	//master also go here
	sms(client.Channels.get("409868415176802324"),message.content.substring(10));  //writes the line to Skarm's server mirror of the database
	saveLine(message, EYANQUOTESFILE, msg);
}

//adds a message to skarm's response database if its not from Eyan
function addGeneral(message){
    //single server development precondition
    //if(message.guild.id != ZEAL_SERVER){	
	var msg=message.content.toLowerCase();
	//preconditions: message between 4 and 250 characters
	if (msg.length<4||msg.length>250){
		return false;
	}
	for (var i=0; i<banned.length; i++){
		if (msg.includes(banned[i][0].toLowerCase())){
			return false;
		}
	}
	//appends normal lines into the general log	
	if (!utilityIsAction(msg)){
			sms(client.Channels.get("409856900469882880"),msg+" "+message.guild.name);// +", https://discord.gg/"+res.code);
		fs.appendFile(getServerLineFile(message), msg+"\r\n", (err)=>{
			if (err){
				throw err;
			}
		});																							
		//appends action lines to the action log instead 
	} else {
		sms(client.Channels.get("409860642942615573"),msg);	//writes the line to Skarm's server mirror of the database
		fs.appendFile(getServerActionFile(message), msg+"\r\n", (err)=>{
			if (err){
				throw err;
			}
		});
	}
}

// Checks to see if the user is allowed to submit messages to the bot
function userHasKickingBoots(author, channel){
	return author.can(discordie.Permissions.General.KICK_MEMBERS, channel);
}
// Send a random line
function sendRandomLine(message){
    fs.appendFile("./output/skarmlog.txt", message.content+"\r\n", (err) => {
        if (err){
            throw err;
        }
    });
	sendRandomFileLine(EYANQUOTESFILE, message.channel);
}

function sendRandomLineSkyrim(message){
    fs.appendFile("./output/skarmlog.txt", message.content+"\r\n", (err) => {
        if (err){
            throw err;
        }
    });
    var file;
    do {
        file="./skyrim/output"+Math.floor(Math.random()*50)+".skyrim";
    } while (!fs.existsSync(file));
	sendRandomFileLine(file, message.channel);
}

function sendRandomLinePun(message){
    fs.appendFile("./output/skarmlog.txt", message.content+"\r\n", (err) => {
        if (err){
            throw err;
        }
    });
	sendRandomFileLine("puns.txt", message.channel);
}

function sendRandomLineGeneral(message){
    fs.appendFile("./output/skarmlog.txt", message.content+"\r\n", (err) => {
        if (err){
            throw err;
        }
    });
	sendRandomFileLine(getServerLineFile(message), message.channel);
}

function sendRandomLineGeneralAction(message){
    fs.appendFile("./output/skarmlog.txt", message.content+"\r\n", (err) => {
        if (err){
            throw err;
        }
    });
	sendRandomFileLine(getServerActionFile(message), message.channel);
}
// Saves a line to the line file
function saveLine(message, filename, string){
	if (userHasKickingBoots(message.author, message.channel)){
		fs.appendFile(filename, string+"\r\n", (err) => {
			if (err){
				throw err;
			}
			console.log(string+" was written to "+filename+".");
		});
		sien("Added!");
	} else {
		sms(message.channel,message.author.username+": you don't have permission to add quotes. Sorry.");
	}
}
//in response to e!kenobi, prints out a 4x4 emotes image of him, example image of output: https://cdn.discordapp.com/attachments/305548986155008000/424078792382873611/unknown.png
function utilityKenobi(e){
	if(e.message.channel==client.Channels.get(ZEAL_SERVER))
		return;
	
	
	sms(e.message.channel,">>> <:0x0:422896537925058560><:1x0:422896539204059136><:2x0:422896538831028244><:3x0:422896538159808512>\n<:0x1:422896538025590784><:1x1:422896539157921802><:2x1:422896538939818006><:3x1:422896538210009089>\n<:0x2:422896537966739457><:1x2:422896538776502273><:2x2:422896539044806656><:3x2:422896538197688331>\n<:0x3:422896538415529993><:1x3:422896538776371220><:2x3:422896539019640833><:3x3:422896538973634561>");
	e.message.delete();
}

// Pulls a random line from the text file
function sendRandomFileLine(filename, channel){
	var lines;
	fs.readFile(filename, function(err, data){
		if(err){
			sms(channel,"No quotes in that file!");
		} else {
			lines = data.toString().split('\n');
			var line="";
			do {
                // This is bad and I should feel bad (makes drago's name pop up more often in conversation)
                for (var i=0; i<5; i++){
                    line=lines[Math.floor(Math.random()*lines.length)];
                    if (line.toLowerCase().includes("drago")){
                        break;
                    }
                }
                // This is also bad and I should feel bad.
                for (var usernameString in userTable){
                    var user=userTable[usernameString];
                    if (user.refString.length>0&&user.blockRefString){
                        if (line.includes(user.refString)){
                            line="";
                        }
                    }
                }
			} while (line.length<2);
            fs.appendFile("./output/skarmlog.txt", "    "+line+"\r\n", (err) => {
                if (err){
                    throw err;
                }
            });
			sms(channel, line.toLowerCase());
            // Pruning
            if (lines.length>MAX_LOGGED_LINES){
                var freshArray=[];
                for (var i=0; i<lines.length; i++){
                    if (Math.random()*100>20){
                        freshArray.push(lines[i]);
                    }
                }
                // "deleted" log channel
                sms(channel,"***"+(lines.length-freshArray.length)+" lines pruned from "+filename+"!***");
                fs.unlinkSync(filename);
                for (var i=0; i<freshArray.length; i++){
                    fs.appendFile(filename, freshArray[i]+"\n", (err)=>{
                        if (err){
                            throw err;
                        }
                    });
                }
            }
		}
	})
}

function processShanties(e){
    shanties=[];
	fs.readFile("./shanties/shanties.log", function(err, data){
		if(err){
			throw err;
		} else {
			var names=data.toString().split('\n');
			for (var i=0; i<names.length; i++){
                var song=loadShanty(names[i].trim());
                if (song!=null){
                    shanties.push(song)
                }
            }
			sien("Shanties updated");
		}
	})
}


/*
 ********************
 *   Twitch Stuff   *
 ********************
 */

// Checks if Zeal is online. If he's gone online, it sends an announcement.
function twitchSendStatusMessage(){
	/*if (streamState){
		if (streamHasNotifiedDate==null||twitch12HoursElapsed(new Date(), streamHasNotifiedDate)){
			streamHasNotifiedDate=new Date();
			fs.writeFile("./stuff/streamDate.txt", streamHasNotifiedDate);
			var channel=client.Channels.get("305488106050813954");
			if (channel!=null){
				sms(channel,"@everyone Zeal has gone online! \n https://www.twitch.tv/kingofzeal");
			}
		}
	}*/
}

function twitch12HoursElapsed(newDate, oldDate){
	var seconds=(newDate-oldDate)/1000;
	var minutes=seconds/60;
	var hours=minutes/60;
	return (hours>12);
}

// I'm sure there's a better way to do this.
function twitchGetIsLive(channel){
	/*twitch.get('kingofzeal').then(function(streams) {
		if (channel!=null){
			sms(channel,"Zeal is live!\n https://www.twitch.tv/kingofzeal");
		}
		streamState=true;
	}).catch(function(error) {
		if (channel!=null){
			sms(channel,"Zeal is not live /:");
		}
		streamState=false;
	});*/
	// can't simply return a value here because this is an asyncrhonous function ლ(ಠ益ಠლ)
}

function twitchGetLastStreamDate(){
	fs.readFile("./stuff/streamDate.txt", function(err, data){
		if(err){
			
		} else {
			var date = data.toString().trim();
			if (date===""){
				console.log("Date file is . . . empty?");
				streamHasNotifiedDate=null;
			} else {
				streamHasNotifiedDate=new Date(date);
			}
		}
	})
}

/*
 ********************
 *     Lol Stuff    *
 ********************
 */

// Stuff he says.
function annoyDragonite(channel){
	 var responses=["You rang?"];
		// add more responses down here
	sms(channel,responses[Math.floor(Math.random()*responses.length)]);
}

// Stats printout.
function annoyWill(channel){
	var lol=stats.WillOfD.lol;
	var xd=stats.WillOfD.xd;
	var w=stats.WillOfD.w;
	var messages=stats.WillOfD.messages;
	if (messages==0){
		sms(channel,"\\*\\*\\*Will has not recorded any messages yet.\\*\\*\\*");
	} else {
		sms(channel,"```Percentage of WillOfD's messages that contain \"lol:\""+(100*lol/messages).toFixed(2)+"%\n"+
			"Percentage of WillOfD's messages that contain \"XD:\" "+(100*xd/messages).toFixed(2)+"%\n"+
			"Percentage of WillOfD's messages that contain \"^w^:\" "+(100*w/messages).toFixed(2)+"%\n\n"+
			"WillOfD's total messages: "+messages+"```");
	}
}

// Another stats printout.
function annoyMaster(channel){
	var balance=stats.Master.balance;
	var treason=stats.Master.treason;
	var hello=stats.Master.hello;
    var explo=stats.Master.explo;
	var messages=stats.Master.messages;
	if (messages==0){
		sms(channel,"\\*\\*\\*Master has not recorded any messages yet. Somehow.\\*\\*\\*");
	} else {
		sms(channel,"```Percentage of Master9000's messages that contain \"balance:\" "+(100*balance/messages).toFixed(2)+"%\n"+
			"Percentage of Master9000's messages that contain \"treason:\" "+(100*treason/messages).toFixed(2)+"%\n"+
			"Percentage of Master9000's messages that contain \"hello:\" "+(100*hello/messages).toFixed(2)+"%\n"+
            "Percentage of Master9000's messages that contain \"explo[A-Za-z0-9]*:\" \n\n"+
			"Master9000's total messages: "+messages+"```");
	}
}

// Various salts.
function annoyDeci(channel){
	 var responses=["2 Na + Cl(2) → 2 NaCl",
		"NaOH (aq) + HCl (aq) → NaCl(aq) + H(2)O (l)"];
	sms(channel,responses[Math.floor(Math.random()*responses.length)]);
}

function annoyCandyman(channel){
	sms(channel,"Watch your language ಠ_ಠ");
}



/*
 ********************
 *       Stats      *
 ********************
 */

// Because Master is a butthead
function statsMaster9000(message){
    if (messageAuthorEquals(message, MASTER)){
        var text=message.content.toLowerCase();
        if (text.includes("treason")){
            stats.Master.treason++;
        }
        if (text.includes("balance")){
            stats.Master.balance++;
            if (Math.random()<0.45){
                sms(message.channel, "ಠ_ಠ");
            }
        }
        if (text.includes("hello there")){
            stats.Master.hello++;
        }
        if (text.includes("explo")){
            stats.Master.explo++;
        }
        stats.Master.messages++;
        fs.writeFileSync('stats.ini', ini.stringify(stats));
    }
}

// Because I swear she says this in every single message (sometimes both).
function statsWillOfD(message){
	if (messageAuthorEquals(message, "113084295958044672")){
		var text=message.content.toLowerCase();
		if (text.includes("lol")){
			stats.WillOfD.lol++;
		}
		if (text.includes("xd")){
			stats.WillOfD.xd++;
		}
		if (text.includes("^w^")){
			stats.WillOfD.w++;
		}
		stats.WillOfD.messages++;
		fs.writeFileSync('stats.ini', ini.stringify(stats));
	}
}

function saveStatsGeneral(){
	fs.writeFileSync("misc.ini", ini.stringify(statsGeneral));
}

function STATS(message){
	var string=message.content.toLowerCase();
	var usernameString=authorString(message.author);
	var user;
	if (usernameString in userTable){
		user=userTable[usernameString];
	} else {
		user=new User(message.author.username, message.author.discriminator, message.author.id);
		userTable[usernameString]=user;
	}
	user.lines++;
    user.todayMessages++;
    user.characters=user.characters+message.content.length;
	
	if (string.includes("slap")&&utilityIsAction(string)){
		user.slaps++;
	}
	if (string.includes("eyan")||string.includes("zeal")){
		user.zeal++;
	}
	if (string.includes("toilet")){
		user.toilet++;
	}
	if (utilityIsAction(string)){
		user.actions++;
	}
	if (string.endsWith("?")){
		user.questions++;
	}
	if (string.endsWith("!")){
		user.exclamations++;
	}
	if (string.toLowerCase().includes("elvia")){
		user.elvia++;
	}
    // violence, etc. checker
    for (var i=0; i<violentVerbs.length; i++){
        if (string.includes(violentVerbs[i][0])){
            user.todayViolence=user.todayViolence+violentVerbs[i][1];
            if (!user.todayWasWarned&&user.todayWarnings<5){
                // can send a warning?
                if (user.todayMessages>5&&user.todayViolence/user.todayMessages>0.06){//a56
					if(message.guild.id == ZEAL_SERVER){
						user.todayWasWarned=true;
						user.todayWarnings++;
						// alert
						DRAGONITE_OBJECT.openDM().then(function(dm){
							dm.sendMessage(message.author.username+" is being a wee bit questionable in <#"+message.channel_id+">. Have a word with them, maybe?");
							dm.sendMessage("Message: ```"+string+"```");
						});
						// Alert 
						sms(client.Channels.get("344295609194250250"), message.author.username+" is being a wee bit questionable in <#"+message.channel_id+">. Have a word with them, maybe?\n"+
							"\tOffending message: ```"+string+"```");
					}else{
						sien(message.author.username+" is being a wee bit questionable in <#"+message.channel_id+">. Have a word with them, maybe?\n"+
							"\tOffending message: ```"+string+"```");
					}
				}
            }
        }
    }
	if (botCanSendUserCommands){
		if (string.includes("is back")||string.includes("has returned")||string.includes("m back")){
			statsGeneral.everything.back++;
			botCanSendUserCommands=false;
			saveStatsGeneral();
		}
	}
}

function utilityBotStats(e){
	var uptime=process.uptime();
	var uptimeDays=Math.floor(uptime/(60*60*24));
	var uptimeHours=Math.floor((uptime%(60*60*24))/3600);
	var uptimeMinutes=Math.floor((uptime%3600)/60);
	var uptimeSeconds=Math.floor(uptime%60);
	var memory=process.memoryUsage();
	
	var string="";
	string="Users, probably: "+Object.keys(userTable).length+"\n";
	string=string+"Memory usage, probably: "+memory.rss/(1024*1024)+" MB\n";
	string=string+"Uptime, probably: "+uptimeDays+" days, "+uptimeHours+" hours, "+uptimeMinutes+" minutes, "+uptimeSeconds+" seconds\n";
	string=string+"Commands recieved since we started caring: "+totalBotCommands+"\n";
	string=string+"Lines censored since we started caring: "+totalCensoredLines+"\n";
	string=string+"Messages sent this cycle: " + messagesThisCycle+ "\n";
	string+="hostname: "+ os.hostname() +"\n";
	if (e.message.author.id==MASTER){
		string=string+"Heap usage: shove it up your @$$, Magus"
	}
	
	
	sms(e.message.channel,"Bot stats, and stuff:\n```"+string+"```");
}

function utilitySilver(e){
	var silverString="";
	for (var i=0; i<e.message.mentions.length; i++){
		if (e.message.mentions[i].id==e.message.author.id){
			sms(e.message.channel,"_whacks **"+e.message.author.username+"** with a broom handle_");
			return false;
		}
		var usernameString=authorString(e.message.mentions[i]);
		if (usernameString in userTable){
			var user=userTable[usernameString];
			user.silver++;
			utilitySaveStats(null);
			silverString=silverString+"**"+e.message.mentions[i].username+"** now has **"+user.silver+"** silver!\n";
		}
	}
	if (silverString.length>0){
		sms(e.message.channel,silverString);
		return true;
	}
	
	return false;
}

function utilitySkarm(e){
    sms(e.message.channel, "odds of skyrim: "+esOddsSkyrim+"%\n"+
        "odds of puns: "+esOddsRandomPun+"%\n"+
        "odds of something else: "+esOddsRandomLine+"%\n"+
        "odds of something relatively normal: whatever's left*\n\n"+
        "* these odds are actually wrong");
	return false;
}

function utilityCrash(e){
    if (sudo(e)){
        fs.appendFile("./output/crashes.txt", e.message.author.username+" crashed the bot on "+new Date()+"\r\n", function(err) {
            if(err) {
                throw err;
            }
			if(e.message.content.split(" ")[1]=="-f"){
				sms(e.message.channel,"Force exiting");
				process.exit(9);
			}
			process.exit(0);
            //console.log("The file was saved!");
        }); 
        return true;
    } else {
        sms(e.message.channel,"User is not in the sudoers file. This incident will be reported.");
		sien("User tried to restart bot: <@"+e.message.author.id+">");
        return false;
    }
}


/*
 ********************
 *     Reactions    *
 ********************
 */
function helloThere(message){
	if(generallyAnnoying){
		sms(message.channel, "GENERAL REPOSTI");
		return true;
	}
	
	var gleen = "<:greenlightsaberyx:422559631030878209>";
	var green =  "<:greenlightsaberyx:422559630741340171>";
	var brue= "<:bluelightsaberyx:422558517589704704>";
	var blue = "<:bluelightsaberyx:422558517287845889>";
	var head = "<:skarmhead:422560671574523904>";
	var blank = "<:background:448285187550347275>";
	if(message.author.username == "Master9000"){
		sendMessageDelay("MASTER JEDI" + "\nYou are a bold one.\n" + 
		randomLeft() + randomLeft() + head + randomRight() + randomRight() +"\n" +
		randomLeft() + randomLeft() + blank + randomRight() + randomRight() +"\n" + 
		randomLeft() + randomLeft() + blank + randomRight() + randomRight() +"\n", message.channel);
		generallyAnnoying = true;
		return true;
	}
	if(Math.random()<.25){
		sendMessageDelay("GENERAL KENOBI \nYou are a **bold one.**\n<:bluelightsaberyx:422558517287845889> <:greenlightsaberyx:422559631030878209>  <:skarmhead:422560671574523904>   <:bluelightsaberyx:422558517589704704> <:greenlightsaberyx:422559630741340171>", message.channel);
	}else{
		var nick = "";
		if(message.author.username == "SuperDragonite2172"){
			nick = "general Draco";
		}else if(message.author.username == "SquidofBaconator"){
			nick = "general Squid";
		}else if(message.author.username == "Neon Strike Kitty"){
				nick = "general Ida";
		}else if(message.author.username == "KingofZeal"){
			nick = "King Eyan";
		}else if(message.author.username == "SuperGummying"){
			nick = "private gummy";
			}else if(message.author.username == "Kireina"){
			nick = "general Panda";
		}else if(message.author.username == "Wolverale12"){
			nick = "general wolverale";
		}else if(message.author.username == "FLUBS"){
			nick = "specific Luigi";
		}else{
			nick = "general " +message.author.username;
		}
		sendMessageDelay(nick.toUpperCase() + "\nYou are a bold one.\n" + randomLeft()+ randomLeft() + head + randomRight() + randomRight(), message.channel);
	}
	generallyAnnoying = true;
	sien("This should be true now " + generallyAnnoying);
	return true;
}

function randomLeft(){
	var colors = ["<:redlightsaberyx:455820731775844367>","<:greenlightsaberyx:422559631030878209>","<:bluelightsaberyx:422558517287845889>","<:Purplelightsaberymx:455819615440732171>"];
	return colors[Math.floor(Math.random() * colors.length)];
}
function randomRight(){
	var colors =["<:redlightsaberyx:455820732228698122>","<:greenlightsaberyx:422559630741340171>","<:bluelightsaberyx:422558517589704704>","<:Purplelightsaberyx:455819615071633422>"];
	return colors[Math.floor(Math.random() * colors.length)];	
}
function REACT(message, id){
	//banned from reactions rip
	var botReactionBlacklist=[
	]
	for (var i=0; i<botReactionBlacklist.length; i++){
		if (messageAuthorEquals(message, botReactionBlacklist[i])){
			return false;
		}
	}
	/*
	 * Specific reactions
	 */
	 if(message.author.id=="214587785510780929" && Math.random()*100<2){
		sms(message.channel, "Bella go learn to drive");	
	 }
	 
	//Hello There 
	if(message.content.toLowerCase().includes("hello") && message.content.toLowerCase().includes("there")&& (Math.random()<.95 || message.author.username == "KingofZeal")){
		return helloThere(message);
    }
	//Thanos did nothing wrong
	if(message.content.toLowerCase() == "perfectly balanced"){
		sms(message.channel,"As all things should be");
		return true;
	}
	//gratitude
	if(message.content.toLowerCase() == "thanks skarm" && Math.random() < .4){
		sms(message.channel,"Anytime");
	}
	//today's date
	if(message.content.includes("dating today") && Math.random() <.75){
		sms(message.channel,timeConverter(Date.now()));
		return true;
	}
	//who to ship
	/*if(message.content.includes("ship") && (Math.random() <.05 ||(id == "199725993416589313" && Math.random() < .2))){
		sms(message.channel,getShanty());
	}*/
	// getting a date
	if (!utilityIsAction(message.content)){
		if (message.content.includes("hot date")&&Math.random()<0.25){
			sms(message.channel,hotDateResponses[Math.floor(Math.random()*hotDateResponses.length)]);
		} else if (message.content.includes("last date")&&Math.random()<0.25){
			sms(message.channel,lastDateResponses[Math.floor(Math.random()*lastDateResponses.length)]);
		} else if (message.content.includes("get a date")&&Math.random()<0.75){
			var mm=Math.floor(Math.random()*11)+1;
			var dd=Math.floor(Math.random()*27)+1;
			var yy=Math.floor(Math.random()*2500)+1;
			sendMessageDelay(mm+"/"+dd+"/"+yy, message.channel);
			return true;
		}
	}
	if(message.content.indexOf("general")>-1 || message.content.indexOf("hello there") > -1){
		generallyAnnoying = true;
	}
	// Free hugs
	if (utilityIsAction(message.content)&&!utilityMessageWasWrittenByMe(message)){
		var newString=replaceAll(message.content, "_", "");
		newString=replaceAll(newString, "*", "");
		newString=replaceAll(newString, "@", "");
		if (newString.startsWith("hugs")){
			if (Math.random()*100<60){
				var target=newString.replace("hugs ", "");
				sendMessageDelay("_hugs "+target+", also_", message.channel);
				return true;
			}
		}
	} else if (message.content.toLowerCase().endsWith("i need a hug")){
		sendMessageDelay("_hugs "+message.author.nickMention+"_", message.channel);
		return true;
	} else if (message.content.toLowerCase().endsWith("hug me")){
		sendMessageDelay("_hugs "+message.author.nickMention+"_", message.channel);
		return true;
	}
	//knife dragon
	if (message.content.toLowerCase() == "operation knife dragon"){
        sendMessageDelay("_stabs dragonite_", message.channel);
    }
	// cookies
	if (message.content.toLowerCase().includes("cookie")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<10){
			sendMessageDelay("_steals cookies_", message.channel);
			console.log("Cookies have been stolen from "+message.author.username+".");
			return true;
		}
	}
	// sandwich
	if (message.content.toLowerCase().includes("sandwich")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<10){
			sendMessageDelay("_steals sandwich_", message.channel);
			console.log("Sandwich has been stolen from "+message.author.username+".");
			return true;
		}
	} else if (message.content.toLowerCase().includes("sandvich")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<20){
			sendMessageDelay("_steals sandvich_", message.channel);
			console.log("Sandvich has been stolen from "+message.author.username+".");
			return true;
		}
	// america
	} else if (message.content.toLowerCase().includes("america")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<10){
			sendMessageDelay("SKITTY YEAH!", message.channel);
			console.log("Skitty yeah.");
			return true;
		}
	}
	// onii-chan
	if (messageAuthorEquals(message, "191299047896776704")){
		if (message.content.toLowerCase().includes("onii-chan")&&Math.random()*100<35){
			sendMessageDelay("ლ(ಠ益ಠლ)", message.channel);
			console.log("Pimaster has discovered the oniichan reaction.");
			return true;
		}
	}
	// PUNish[ment]
	if (message.content.includes("PUNish")&&Math.random()*100<45){
		sendMessageDelay("ლ(ಠ益ಠლ)", message.channel);
		console.log("Punishment has been doled out.");
		return true;
	}
	// Noms
	if (utilityIsAction(message.content)&&message.content.includes("noms")&&(Math.random()*100<5 || message.content.includes("catch23animalman"))){
		if (id=="178655272796028928" || message.content.includes("catch23animalman")){
            sendMessageDelay("*underlines Animal\_ Man\_*", message.channel);
			if(message.content.includes("catch23animalman")){
                message.delete();
			}
		}
		else{
		sendMessageDelay("_noms "+message.author.username+"_", message.channel);
		}
		return true;
	}
	//back from work the ninnies
	if (message.content.includes("back from work") && id == "319638082867691521" && Math.random() < .05){
		sendMessageDelay("get back to work", message.channel);
		return true;
	}
	//birdbrain
	if ((message.content.toLowerCase().includes("debugs")||message.content.toLowerCase().includes("bird brain"))&&Math.random()*100<705){
		sendMessageDelay("debugs mean more rebooting", message.channel);
		return true;
	}
	
	//star wars cont.
	if(message.content.toLowerCase().includes("droid") && message.content.toLowerCase().includes("attack") && message.content.toLowerCase().includes("wooki")){
		sms("it is critical that we send an attack group there immediately", message.channel);
		sendMessageDelay("it is a system we cannot afford to lose", message.channel);
		return true;
	}

	/*
	 * Generic reactions
	 */
	 
	var verbsPain=[
		"slaps",
		"stabs",
		"kills",
		"murders",
		"beats",
		"kicks",
		"punches",
		"pinches",
	]
	
	var verbsUncomfortable=[
		"pets",
		"buys",
		"sells",
	]
	
	var verbsGratitude=[
		"chooses",
	]
	
	var verbsOhNo=[
		"breaks",
	]
	 
	 if (utilityIsAction(message.content)){
		var words=replaceAll(message.content, "_", "").split(" ");
		if (words.length>1){
			if (words[1].toLowerCase()==myNick.toLowerCase()||(words.length>2&&words[2].toLowerCase()==myNick.toLowerCase())){
				if (verbsPain.indexOf(words[0])>-1){
					sms(message.channel,"Ow . . .").then(e => censorMessageDeletionQueueLong(e));;
					botCanSendUserCommands=false;
					return true;
				}
				if(verbsUncomfortable.indexOf(words[0])>-1){
					sms(message.channel,"_beats "+message.author.nickMention+" over the head with a spatula_").then(e => censorMessageDeletionQueueLong(e));;
					botCanSendUserCommands=false;
					return true;
				}
				if (verbsGratitude.indexOf(words[0])>-1){
					sms(message.channel,"_hugs "+message.author.nickMention+"_").then(e => censorMessageDeletionQueueLong(e));;
					botCanSendUserCommands=false;
					return true; 
				}
				if (verbsOhNo.indexOf(words[0])>-1){
					sms(message.channel,"ヽ( ｡ ヮﾟ)ノ").then(e => censorMessageDeletionQueueLong(e));
					botCanSendUserCommands=false;
					return true; 
				}
			}
		}
	}
	 
	/*
	 * EyanSays
	 */
	 
	if(
		(message.content.toLowerCase().includes(" "+myNick.toLowerCase())|| otherMentions(message.content)* Math.random() >.9
		||message.content.toLowerCase().startsWith(myNick.toLowerCase()))
		&&(message.content.match(new RegExp(" ", "g"))||[]).length>2&&botCanSpeak 
		|| (message.content.toLowerCase().includes("skram!") && message.author.id ==MASTER)){
		botCanSpeak=false;
		message.channel.sendTyping();
		setTimeout(function(){
            if (currentLineSinging>-1){
                sms(message.channel, getShantyBlock(currentlySinging, currentLineSinging));
                setTimeout(function(){
                    currentLineSinging=-1;
                }, 15000*60);
            } else {
                if (Math.random()*100<2.5||message.channel.id=="411716622101774337"){
                    currentlySinging=shanties[Math.floor(Math.random()*shanties.length)];
                    sms(message.channel, getShantyBlock(currentlySinging, 0));
                    setTimeout(function(){
                        currentLineSinging=-1;
                    }, 5000*60);
                } else if (utilityIsAction(message.content)){
                    sendRandomLineGeneralAction(message);
                } else {
                    if (Math.random()*100<esOddsSkyrim&&isWeekend()){
                        sendRandomLineSkyrim(message);
                    } else if (Math.random()*100<esOddsRandomLine){
                        sendRandomLine(message);
                    } else if (Math.random()*100<esOddsRandomPun){
                        sendRandomLinePun(message);
                    } else {
                        sendRandomLineGeneral(message);
                    }
                }
            }
		}, Math.random()*2000+1000);
		return true;
	}
	return false;
}
//TODO
//returns the amount of alternate nicknames for skarm are contained in the message
function otherMentions(message){//return 0;
    
	var sum=0;
	for(var i in meNiks){
		if(message.toLowerCase().includes(meNiks[i])){
			sum++;
		}
	}
	return sum;
}

function getShantyBlock(song, start){
    var block="";
    for (currentLineSinging=start; currentLineSinging<song.linesPerMessage+start; currentLineSinging++){
        try {
            if (currentLineSinging<song.lines.length){
                block=block+song.lines[currentLineSinging]+"\n";
            } else {
                currentLineSinging=-1;
                break;
            }
        } catch (error){
            DRAGONITE_OBJECT.openDM().then(function(dm){
                dm.sendMessage("Oh no, something went wrong in my shanty block again:");
                dm.sendMessage("```"+error.toString()+"```");
            });
        }
    }
    if (currentLineSinging==song.lines.length){
        currentLineSinging=-1;
    }
    return block;
}


/*
 ********************
 *      Censor      *
 ********************
 */

// Basic censor. Built around string.includes. Not recommended for serious use.
function censor(message){
	if (message.channel!=client.Channels.get("311402910820859914")&&	// meme chat
		message.channel!=client.Channels.get("311398412610174976")&&	// woe
		message.author!=client.User){									// can't censor itself
			censorText(message.content, message.channel, message.author, message, "");
	}
}
// The actual censor
function censorText(text, channel, author, message, redactMessage){
	var newMessage=censorRemoveRegionalIndicators(text.toLowerCase());
	var toDelete=-1;
	var bannedCount=0;
	for (var i=0; i<banned.length; i++){
		if (newMessage.includes(banned[i][0])){
			bannedCount+=(newMessage.match(new RegExp(banned[i][0], "g"))||[]).length;
			if (redactMessage.length==0){
				newMessage=replaceAll(newMessage, banned[i][0], banned[i][2]);
			} else {
				newMessage=redactMessage;
			}
			toDelete=i;
		}
	}
	if (toDelete>-1){
		if (newMessage.length>320){
			newMessage=newMessage.slice(0, 320)+"...";
		}
		var canTextReplace=true;
		var swearReplacementBlacklist=[ //the list of people blacklisted by ID
			[ 
			   "263474950181093396" //putting m9k's testing alt in here to avoid a bug just in case
			]
		]
		if (authorEquals(author, EYAN_ID)){
			sms(client.Channels.get("418138620952707082"),"May have said " + newMessage);
			return false;
		}
		for (var i=0; i<swearReplacementBlacklist.length; i++){
			if (authorEquals(author, swearReplacementBlacklist[i])){
				canTextReplace=false;
			}
		}
		if (bannedCount>(message.content.split(" ").length+1)*0.3){ //if the censored message is over 30% censored words, counted by spaces, don't send a replacement message
			canTextReplace=false;
		}
		if (canTextReplace){
			sms(channel,banned[toDelete][1]+"\n`"+author.username+": "+newMessage+"`").then(e => censorMessageDeletionQueueLong(e));
			if (messageAuthorEquals(message, "247163799960944640")){  //this part is for candy's special reactions
				annoyCandyman(message.channel);				    //^
				botCanYellAtCandy=false;					   //^
			}
		} else {
			console.log("Was caught in the censor: "+author.username+": "+newMessage);
		}
		censorUpdateSwearTable(author);  //the censor now updates the super secret table of swears (the one that master has an unfair advantage on probably)
		totalCensoredLines++;			 //censored line counter
		message.delete();		     	 //needs more comments
		return true;				 //it did get censored
	}
	return false; //message is clean and checks otu
}
// Adds a message to the short-term deletion log.
function censorMessageDeletionQueue(message){
	deletionQueue.push(message);
}
// Clears the short-term deletion log.
function censorClearDeletionQueue(){
	for (var i=0; i<deletionQueue.length; i++){
		deletionQueue[i].delete();
	}
	deletionQueue=[];
}
// Adds a message to the long-term deletion log.
function censorMessageDeletionQueueLong(message){
	deletionQueueLong.push(message);
}
// Clears the long-term deletion log.
function censorClearDeletionQueueLong(){
	for (var i=0; i<deletionQueueLong.length; i++){
		deletionQueueLong[i].delete();
	}
	deletionQueueLong=[];
}
// Updates the swear table, and saves it
function censorUpdateSwearTable(user){
	var n=authorString(user);
	if (!(n in userTable)){
		userTable[n]=new User(user.username, user.discriminator, user.id);
		userTable[n].swears=1;
	} else {
		userTable[n].swears++;
	}
	utilitySaveStats(null);
}
// Converts "regional indicator" letters to regular leters.
function censorRemoveRegionalIndicators(text){
	var newString="";
	var continueNext=false;
	for (var i=0; i<text.length; i++){
		var character=text.charCodeAt(i);
		if (character==55356){
			continue;
		}
		if (continueNext){
			continueNext=false;
			continue;
		}
		if (character>=56806&&character<=56831){
			character=character-(56806-97);
			continueNext=true;
		}
		newString=newString+String.fromCharCode(character);
	}
	return newString;
}

function censorCommandSet(e){
	var message = e.message;
	if (userHasKickingBoots(message.author, message.channel)){
		var command=message.content.replace("e!censor", "").split(" ");
		if (command[0]===""||command[0]==="-help"){
			sms(message.channel,"Note that only people with kicking boots can access these commands and they're best used in moderation channels only.\n\n"+
										"```e!censor-add <phrase>,<instruction>,<replacement>\n"+
										"e!censor-add-help\n"+
										"e!censor-remove <phrase>\n"+
										"e!censor-remove-help\n"+
										"e!censor-all\n"+
										"e!censor-all-help```");
		} else if (command[0]==="-add"){
			if(message.guild.id != ZEAL_SERVER){
				sms(message.channel,"Zeal exclusive command");
				return false;
			}
			var input="";
			for (var i=1; i<command.length; i++){
				input=input+command[i];
				if (i<command.length-1){
					input=input+" ";
				}
			}
			var csv=input.split(",");
			if (csv.length<3){
				sms(message.channel,"Incorrect usage; refer to `e!censor-help` for more details`");
				return false;
			}
			console.log(csv);
			var prospective=csv[0];
			var exists=false;
			var index=0;
			for (var i=0; i<banned.length; i++){
				if (banned[i][0].toLowerCase()===prospective.toLowerCase()){
					exists=true;
					index=i;
					break;
				}
			}
			if (exists){
				sms(message.channel,"That word or phrase already exists in the censor list. Updating it instead!");
				banned[index][0]=prospective;
				banned[index][1]=csv[1];
				banned[index][2]=csv[2];
			} else {
				index=banned.length;
				sms(message.channel,"Added that to the censor list!");
				banned.push(["", "", ""]);
				banned[index][0]=prospective;
				banned[index][1]=csv[1];
				banned[index][2]=csv[2];
			}
			censorSaveList();
		} else if (command[0]==="-add-help"){
				sms(message.channel,"```e!censor-add <phrase>,<instruction>,<replacement>```"+
										"Adds a message to the censor.\n"+
										"	`<phrase>` is the text to ban. If it's already part of the censor it'll be updated instead.\n"+
										"	`<instruction>` is the warning message sent, i.e. \"potty mouth!\"\n"+
										"	`<replacement>` is the text the bad word is replaced with, i.e. \"SKITTY\"");
		} else if (command[0]==="-remove"){
			if(message.guild.id != ZEAL_SERVER){
				sms(message.channel,"Zeal exclusive command");
				return false;
			}
			var input="";
			for (var i=1; i<command.length; i++){
				input=input+command[i];
				if (i<command.length-1){
					input=input+" ";
				}
			}
			var exists=false;
			var index=0;
			for (var i=0; i<banned.length; i++){
				if (banned[i][0].toLowerCase()===input.toLowerCase()){
					exists=true;
					index=i;
					break;
				}
			}
			if (exists){
				sms(message.channel,"Removed from the censor!");
				banned.splice(index, 1);
				censorSaveList();
			} else {
				sms(message.channel,"That isn't part of the censor!");
			}
		} else if (command[0]==="-remove-help"){
				sms(message.channel,"```e!censor-remove <phrase>```"+
										"Removes `phrase` from the censor.\n");
		} else if (command[0]==="-all"){
			//message.author.openDM().then(function(dm){
			client.Users.get(message.author.id).openDM().then(function(dm){
                dm.uploadFile("swears.csv", "swears.csv", "Banned words in the server");
			});
			sms(message.channel,"Sent you a thing (hopefully)!");
		} else if (command[0]==="-all-help"){
			sms(message.channel,"```e!censor-all```"+
										"Sends you a list of all the banned words as a PM (I'd spit them out here except the list can be quite long, and in any case the bot would censor itself anyway.)");
		}
	}
	return true;
}

function censorSaveList(){
	var saveString="";
	for (var i=0; i<banned.length; i++){
		saveString=saveString+banned[i][0]+","+banned[i][1]+","+banned[i][2]+"\r\n";
	}
	fs.writeFile("swears.csv", saveString, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function censorLoadList(){
	var lines;
	fs.readFile("swears.csv", function(err, data){
		if(err){
			throw err;
		}
		lines = data.toString().split('\n');
		banned=[];
		for (var i=0; i<lines.length; i++){
			var csv=lines[i].split(",");
			if (csv.length>=3){
				banned.push([csv[0], csv[1], csv[2]]);
			}
		}
	});
}



/*
 ********************
 *     Utilities    *
 ********************
 */

function utilitySuggestion(e){
    if (e.message.content.startsWith("e!suggest-blacklist ")){
        if (e.message.author.id===DRAGONITE){
            for (var i=0; i<e.message.mentions.length; i++){
                fs.appendFile("./stuff/suggestion-blacklist.txt", e.message.mentions[i].id+"\r\n", (err)=>{
                    if (err){
                        throw err;
                    }
                });
                sms(e.message.channel, "Blacklisted "+e.message.mentions.length+" users!");
            }
        } else {
            sms(e.message.channel, "yeah about that");
        }
        return false;
    }
	var blacklisted;
	fs.readFile("./stuff/suggestion-blacklist.txt", function(err, data){
		if(err){
			throw err;
		}
		blacklisted=data.toString().split('\n');
        for (var i=0; i<blacklisted.length; i++){
            console.log(blacklisted[i]+" | "+e.message.author.id);
            if (blacklisted[i].trim()===e.message.author.id){
                sms(e.message.channel, e.message.author.username+", you have been blacklisted from submitting feature requests through Skarm. "+
                    "This is probably because you previously submitted a large quantity of stupid, pointless, annoying messages and didn't realize "+
                    "that someone actually had to read them all.\nIf you feel like this was done unfairly, contact the bot author.");
                return false;
            }
        }
        DRAGONITE_OBJECT.openDM().then(function(dm){
            dm.sendMessage(e.message.author.username+" has a suggestion for you:\n```"+e.message.content.replace("e!suggest ", "")+"```");
            sms(e.message.channel, "Submitted!");
        });
        return true;
	});
}

// Sets the currently playing game
function utilityGame(e){
	if (sudo(e)){
        var game={name: e.message.content.replace("e!game ", ""), type: 0};
		client.User.setGame(game);
        
		sms(e.message.channel,"New game: "+e.message.content.replace("e!game ", ""));
	} else {
		sms(e.message.channel,"You don't have permission to do that!");
	}
}


function utilityHug(e){
	var target=e.message.content.replace("e!hug ", "");
	if (target.startsWith("e!hug")){
		target=e.message.author.username;
	}
	sms(e.message.channel,"_hugs "+target+"_");
}

function utilitySandwich(e){
	var target=e.message.content.toLowerCase().replace("e!sandwich ", "");
	if (target.startsWith("e!sandwich")){
		target=e.message.author.username;
	}
	sms(e.message.channel,"_gives a sandwich to "+target+"_");
}
// Loads in the stored values from the swear table.
function utilityCreateUserTable(){
    var obj;
    fs.readdir("./users/", (err, files) => {
        files.forEach(file => {
            fs.readFile("./users/"+file, 'utf8', function (err, data){
                if (err){
                    console.log(err);
                }
                try {
                    obj=JSON.parse(data);
                    if (typeof obj.characters==="undefined"){
                        obj.characters=0;
                    }
                    if (typeof obj.todayMessages==="undefined"){
                        obj.todayMessages=0;
                    }
                    userTable[obj.id]=obj;
                } catch (e){
                    console.log("bad user file: "+file);
                }
            });
        });
    });
}

function utilitySaveBotStats(){
	var saveString=totalBotCommands+","+totalCensoredLines;
	fs.writeFile("botstats.csv", saveString, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function utilityLoadBotStats(){
	var line;
	fs.readFile("botstats.csv", function(err, data){
		if(err){
			throw err;
		}
		line=data.toString();
		var spl=line.split(",");
		switch (spl.length){
			case 2:
				totalBotCommands=Number(spl[0]);
				totalCensoredLines=Number(spl[1]);
			case 0:
				break;
		}
	});
}
 // Saves all of the stats
 //e only exists as a common root for Mass Effect
 function utilitySaveStats(e){
	var saveString="";
	for (var n in userTable){
        var json=JSON.stringify(userTable[n]);
        fs.writeFile("./users/"+userTable[n].id+".zeal", json, function(err){
            if (err){
                console.log(err);
            }
        });
    }
 }
// Utility that prints out the number of lines in the bot's learned database.
function utiliyLineCount(e){
	var lines;
	fs.readFile(EYANQUOTESFILE, function(err, data){
		if(err){
			sms(e.message.channel,"Something blew up. Oh noes! @Dragonite#7992");
			throw err;
		}
		lines = data.toString().split('\n');
		sms(e.message.channel,lines.length+" lines in "+myNick+"'s quote log.");
	})
}

function utilityActCount(e){
	var lines;
	fs.readFile(getServerActionFile(e.message), function(err, data){
		if(err){
			sms(e.message.channel,"Something blew up. Oh noes! @Dragonite#7992");
			throw err;
		}
		lines = data.toString().split('\n');
		sms(e.message.channel,lines.length+" lines in "+myNick+"'s General quote log.");
	})
}

function getServerLineFile(message){
    return "logs/"+message.guild.id+".general.txt";
}

function getServerActionFile(message){
    return "logs/"+message.guild.id+".action.txt";
}

// Prints out the high score table for the censor
function utilityStats(e){
	var statsString="SOME INANE STATS THAT DRAGONITE COLLECTS";
	var highscoreList=__createDefaultHighScoreList();
	statsString+=utilityAppendHR();		// Slaps
	highscoreList.sort(function(a, b){
		return b.slaps-a.slaps;
	});
	statsString+=highscoreList[0].name+" was rather slap happy, dishing out a solid backhand "+highscoreList[0].slaps+" times.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].slaps, highscoreList[1].slaps)+", using the move "+highscoreList[1].slaps+" times.";
	statsString+=utilityAppendHR();		// Toilets
	highscoreList.sort(function(a, b){
		return b.toilet-a.toilet;
	});
	statsString+=highscoreList[0].name+" has a rather peculiar obsession with toilets, saying the word "+highscoreList[0].toilet+" times.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].toilet, highscoreList[1].toilet)+", with "+highscoreList[1].toilet+" in total.";
	statsString+=utilityAppendHR();		// Zeal
	highscoreList.sort(function(a, b){
		return b.zeal-a.zeal;
	});
	statsString+=highscoreList[0].name+" was eager to proclaim their love for the King, saying his name a whopping "+highscoreList[0].zeal+" times.\n";
	statsString+=highscoreList[1].name+" was also "+utilityZealString()+", with "+highscoreList[1].zeal+" references to the King.";
	statsString+=utilityAppendHR();		// Actions
	highscoreList.sort(function(a, b){
		return b.actions-a.actions;
	});
	statsString+=highscoreList[0].name+" greatly enjoyed role playing, writing "+highscoreList[0].actions+" lines as actions.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].actions, highscoreList[1].actions)+", with "+highscoreList[1].actions+" in total.";
	statsString+=utilityAppendHR();		// Questions
	highscoreList.sort(function(a, b){
		return b.questions-a.questions;
	});
	statsString+=highscoreList[0].name+" has an insatiable thirst for knowledge, "+highscoreList[0].questions+" questions in total.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].questions, highscoreList[1].questions)+", with "+highscoreList[1].questions+" all told.";
	statsString+=utilityAppendHR();		// Exclamations
	highscoreList.sort(function(a, b){
		return b.exclamations-a.exclamations;
	});
	statsString+="People probably wish "+highscoreList[0].name+" would pipe down a bit, after hearing them shout "+highscoreList[0].exclamations+" times!\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].exclamations, highscoreList[1].exclamations)+", raising their voice on "+highscoreList[1].exclamations+" occasions.";
	statsString+=utilityAppendHR();		// Lines
	highscoreList.sort(function(a, b){
		return b.lines-a.lines;
	});
	statsString+=highscoreList[0].name+" talks a bit too much, writing "+highscoreList[0].lines+" total lines since joining the server.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].lines, highscoreList[1].lines)+", with "+highscoreList[1].lines+" of the things.";
	//statsString+="\n\n*Note that this only counts stats collected while Dragonite's computer was turnd on.";
	sms(e.message.channel,"```"+statsString+"```");
}

function utilityUserStats(e){
    /*characters counted is after 12:50 AM 22 October 2018 UTC*/
    sms(e.message.channel, "_Dragonite was too lazy to properly implement this. If you want to use it, you should probably go bother him about fixing it._");
}
	
function utilityComparisonString(a, b){
	var f=b/a;
	var responses;
	if (f>0.9){
		responses=["a close second", "right there", "vying for the honor", "right on their heels", "in close competition"];
	} else if (f>0.5){
		responses=["not far too behind", "making an effort", "up and coming", "within sight"];
	} else {
		responses=["nowhere in sight", "not trying very hard", "only mildly interested"];
	}
	return responses[Math.floor(Math.random()*responses.length)];
}

function utilityZealString(){
	var responses=["enthralled by the royalty", "in awe"]
	return responses[Math.floor(Math.random()*responses.length)];
}
// Dumps all of the people in the userTable without sorting it.
function __createDefaultHighScoreList(){
	var list=[];
	for (var o in userTable){
		if (userTable[o].name.length>0){
			var user=userTable[o];
			if (user.name!="Tatsumaki"&&user.discriminator!=8792){
				list.push(userTable[o]);
			}
		}
	}
	return list;
}
// append a long line of dashes
function utilityAppendHR(){
	return "\n-----------------\n";
}
// Master wants to play ping pong.
function utilityPing(e){
	var now=Date.now();
	sms(e.message.channel,"Ping Pong Pun").then(e => utilityPingTimeElapsed(e, now));
	console.log("Pinged the bot, blah, blah.");
}
// Is a message an action?
function utilityIsAction(string){
	var first=string.substring(0,1);
	if (first!="*"&&first!="_"){
		return false;
	}
	return string.endsWith(first);
}
// Follow-up for utilityPing
function utilityPingTimeElapsed(message, now){
	var n=Date.now()-now;
	message.edit(message.content+": `"+n+" ms`");
}
// Mentions the bot?
function utilityMentionsMe(message){
	for (var i=0; i<message.mentions.length; i++){
		if (message.mentions[i].username==client.User.username&&message.mentions[i].discriminator==client.User.discriminator){
			return true;
		}
	}
	return false;
}

function utilityMessageWasWrittenByMe(message){
	return message.author.username==client.User.username&&message.author.discriminator==client.User.discriminator;
}
// Utility that dumps all of the messages in a server.
function utilityDumpServer(e){
	console.log("***"+e.message.channel.name+"***");
	fetchMessagesEx(e.message.channel, 500000);
}
// fetch more messages just like Discord client does
function fetchMessagesEx(channel, left) {
  // message cache is sorted on insertion
  // channel.messages[0] will get oldest message
  var before = channel.messages[0];
  return channel.fetchMessages(Math.min(left, 100), before)
         .then(e => onFetch(e, channel, left));
}
// What to do when you fetch a batch of messages.
function onFetch(e, channel, left) {
	if (!e.messages.length){
		return Promise.resolve();
	}
	left -= e.messages.length;
	console.log(`Received ${e.messages.length}, left: ${left}`);
	sien(`Received ${e.messages.length}, left: ${left}`);
	for (var i=0; i<e.messages.length; i++){
		var message=e.messages[i];
		/////////
		//STATS(message);
		/////////
		var str=message.author.username+":\t"+e.messages[i].content+"\r\n"
		if(message.author.username == "SquidofBaconator"){
			fs.appendFile("squidspam.txt", str, (err) => {
				if (err){
					throw err;
				}
			});
		}
	}
	if (left <= 0){
		return Promise.resolve();
	}
	return fetchMessagesEx(channel, left);
}

function utilityPinned(ey, canalside){
	fotchPinned(ey, canalside);
}

function fotchPinned(channel, retchannel){
	return channel.fetchPinned().then(e => onFetchPinned(e, retchannel));
}

function onFetchPinned(e, channel){
	sms(channel, e.messages.length+" pinned messages");
}

function fetchPinnedSelf(channel){
	if (channel==null){
		return -1;
	}
	return channel.fetchPinned().then(e => onFetchPinnedSelf(e, channel));
}

function onFetchPinnedSelf(e, channel){
	if (e.messages.length==50){
		if (!hasBuggedDracoAboutPins){
			sms(channel,"Hey! You've hit the pin limit for this channel! <@!218843275824463872> , you'd better do something about that.");
			hasBuggedDracoAboutPins=true;
		}
	} else {
		hasBuggedDracoAboutPins=false;
	}
}

function fetchPinnedAuto(channel){
	if (channel==null){
		return -1;
	}
	return channel.fetchPinned().then(e => onFetchPinnedAuto(e, channel));
}

function onFetchPinnedAuto(e, channel){
	if (e.messages.length==50){
		if (!hasBuggedDracoAboutPins){
			sms(channel,"Hey! You've hit the pin limit for this channel! <@!218843275824463872> , you'd better do something about that.");
			hasBuggedDracoAboutPins=true;
		}
	} else {
		hasBuggedDracoAboutPins=false;
	}
}
// Checks to see if a message was written by a certain perosn.
function messageAuthorEquals(message, id){
	return authorEquals(message.author, id);
}

function authorEquals(author, id){
	return author.id==id;
}

function authorString(user){
	//return user.username+"#"+user.discriminator;
    return user.id;
}
// Because for some inane reason JavaScript does not include this on its own. Inefficient.
function replaceAll(string, toReplace, newString){
	var t=string;
	while (t.includes(toReplace)){
		t=t.replace(toReplace, newString);
	}
	return t;
}

function utilityMunroe(e){
    var command=e.message.content.split(" ");
    if (command.length==1){
        return munroe.toggleChannel(e.message.channel);
    }
	if(command[1]>0){
		return sms(e.message.channel,"https://xkcd.com/"+command[1]);
	}else{
        switch (command[1]){
            case "now":
                munroe.post();
                break;
			case "list":
				console.log("list called");
				munroe.channelFeed();
				break;
            default:
                sendMessageDelay("usage: `e!xkcd [now]`", e.message.channel);
                break;
        }
    }
}

function utilityURLExists(path, callback, callbackParams){
    var params={
        uri: path,
        timeout: 2000,
        followAllRedirects: true
    };
    
    request.get(params, function(error, response, body){
        if (!error){
            callback(response, callbackParams);
        }
    });
}

/*
 ********************
 *       Help       *
 ********************
 */

//Prints an introduction to the bot
function helpHelpHelp(e){
	var message=myNick+" is a Discord bot for the Kingdom/Harem of Zeal. There's a few things it does. "+
		"Type one of the following to learn more:\n\n"+
		"e!help Says\n"+
		"e!help Twitch\n"+
		"e!help Lol\n"+
		"e!help Misc\n"+
		"e!help Reactions\n"+
		"e!help Mods\n\n"+
		"e!help Credits\n\n"+
		"All commands are case insensitive.";
	sms(e.message.channel,"```"+message+"```");
}
//Introduction to quotes
function helpSays(e){
	/*var message=myName+"\n\n"+
		myNick + " is a deep learning AI that is well on its way to global conquest. " + 
		"The original function of "+myNick+" (then \"EyanSays\") was to "+
		"store all of the weird things that the King of Zeal says during "+
		"his Twitch streams, but it's kind of ballooned from there. Anyway, "+
		"people with kicking boots can add quotes with \"e!says-add <message>\"."+
		"To grab a random quote out of the archive, type "+myNick+". "+
		"Use \"e!size\" to see how many of Eyan's lines have been recorded, \"e!sgen\" for general lines (theres a ton), and \"e!sact\" for action lines.\n\n"+
		"If the King of Zeal says something you think is worthy of being added to the archive, ask "+
		"someone with kicking boots to do it for you."+
		"If you're not sure if you have kicking boots or not, you can check with \"e!test\" (but you "+
		"probably don't).";*/
	var message="Something something conversation bot. Say `"+myNick+"` to get started.";
	sms(e.message.channel, ">>> "+message);
}
//Introduction to Twitch
function helpTwitch(e){
	var message="Twitch Stuff\n\n"+
		/*myNick+" will monitor the state of Zeal's Twitch stream, and can notify the server "+
		"when he goes live. If you want to find out if he's live or not, type \"e!live\" and "+myNick+" "+
		"will inform you."*/
        "At one point in time Skarm was able to inform everyone when Zeal went live on Twitch. Unfortunately that stopped working magically for no reason and we don't know why so we commented it out.";
	sms(e.message.channel,">>> "+message+"");
}
// Introduction to Lol
function helpLol(e){
	/*var message="Poking fun at people\n\n"+
		myNick+" has a few commands for messing with people. Currently available are:\n\n"+
		"e!will\n"+
        "e!master\n"+
		"\n"+
		"Exactly how to get your own command is a secret.";*/
	var message="I don't remember what the total list of joke commands is and I'm too lazy to look them all up";
	sms(e.message.channel,">>> "+message+"");
}
// Introduction to Misc
function helpMisc(e){
	/*var message="Miscellaneous Stuff\n\n"+
		myNick+" can do a few other things, too.\n\n"+
		"e!ping\n"+
		"e!stats\n"+
		"e!hug\n"+
		"e!sandwich\n"+
		"e!bot\n"+
		"e!pinned (optionally also input a channel to check) \n"+
		"e!game <game>\n"+
		"e!treason\n"+
		"e!back";*/
    var message="I don't remember what the total list of misc commands is and I'm too lazy to look them all up";
	sms(e.message.channel,">>> "+message+"");
}
// Moderation panels
function helpMods(e){
	var prefix="~~The mods are beyond help~~";
	/*var message="Anyway . . . if you have kicking boots, there are a few control panels you can access. "+
		"(Or at least there's one important control panel at the moment, more may be added in the future.)\n"+
		"e!censor\n"+
		"e!refresh\n";*/
    var message="I don't remember what the total list of mod commands are and I'm too lazy to look them all up";
	sms(e.message.channel, prefix+">>> "+message+"");
}
// Reactionary stuff
function helpReactions(e){
	var message=myNick+" can and sometimes will react to certain lines in the chat."+
		"I'm not telling you what these reactions are or how to trigger them, because "+
		"it'll be funnier when people discover them on their own.";
	sms(e.message.channel,">>> "+message+"");
}

function getVersion(){
	var v = "";
	for(var i in version){
		v+=version[i]+".";
	}
	return v+Math.floor(Math.random()*1000);
	
}
// Credits, obviously
function helpCredits(e){
	var message="Credits\n\n"+
		"***"+myName+"***\n\n"+
		"Lead spaghetti chef: Dragonite#7992\n"+
        "Seondary spaghetti chef: <@162952008712716288>\n"+
		"Version:" +getVersion() +"\n"+
		"Library: Discordie (shut up)\n"+
		"https://www.youtube.com/c/dragonitespam \n"+
        "https://github.com/DragoniteSpam/SkarmBot \n"+
		"Extra ideas came from SuperDragonite2172, willofd, Cadance and probably other people.\n\n"+
		"Thanks to basically everyone on the Kingdom of Zeal server for testing this thing.\n\n"+
        "Wolfram-Alpha is awesome: https://www.npmjs.com/package/node-wolfram";
	sms(e.message.channel,">>> "+message+"");
}

function woeMessage(user){
	sms(client.Channels.get(WOE), "Yo, **"+user.username+"!** If you can see this, it probably means you were temporarily restricted from using the Discord server.  If you are here, you should:\n"+
		"1.  Reread the #northcape--rules.\n"+
		"2.  Patiently wait out your banishment.  Usually a Guru will set a reminder for how long they plan to keep you Banished here.\n"+
		"3.  Correct your behavior so you don't end up here again.  Reminder, if you get banned, it will be PERMANENT!\n"+
		"4.  If you need to contact a Guru, please do it here (or via PM, I guess).  Refrain from bothering mods with trivial nonsense and **DO NOT** contact the King of Zeal.\n"+
		"5.  You will still have the ability to read channels throughout the duration of your banishment but will be prohibited from typing or speaking.\n"+
		"Note for Gurus:  Please set a reminder when you banish somebody with \"t!remind [Unban XYZ] in X hours/days .  Try to set ban timers for 6 hours, or one day/week/month.");
}

function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp -14400);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = month + ' ' + date + ',' + year;
	return time;
}

function exactTime(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
	//var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = /*months[*/a.getMonth()/*]*/;
	var date = a.getDate();
	var hour = a.getHours()-4;
	var last = "";
		if(hour > 12){
			hour -= 12;
			last = "PM";
		}
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = year +'/'+ month + '/' + date + ',' + hour + ':' + min + ':' + sec + " " + last;
	return time;
}


//send the message to the channel tostring in Skarm's server
function sien(message){senna+= message +"\n";}
//route all channel.send messages through this one for ease of fixing issues
function sms(channel, message){
	try{
		messagesThisCycle++;
		return channel.sendMessage(message);
	}
	catch(err){
		//no idea what goes here but its here
		console.log("Failed to send message\t"+message+" to " +channel.id);
		return null;
	}
}

function rangePinned(e, msg){				
	utilityPinned(client.Channels.get(msg[1].substring(2,msg[1].length-1)),e.message.channel);
}

//
function google(e){
	var f = e.message.content.substring(8).split(" ");
	var ret = "http://google.com/search?q=";
	for(var a =0; a<f.length; a++){
		ret+= f[a] + "+";
	}
	sms(e.message.channel,ret);	
}

function stackOverflow(e){
    if (e.message.author==MASTER){
        sms(e.message.channel, "do it yourself");
        return false;
    }
	var f = e.message.content.replace("e!so ", "").split(" ");
	var query = "https://stackoverflow.com/search?q=";
	for(var a =0; a<f.length; a++){
		query+= f[a] + "+";
	}
	sms(e.message.channel, query);	
}

function wolfram(e){
	var f = e.message.content.replace("e!wolfram ", "").split(" ");
	var query = "";
	for(var a =0; a<f.length; a++){
		query=query+f[a] + " ";
	}
    wolfy.query(query, function(err, result){
        if (err){
            console.log(err);
            sms(e.message.channel, "Something broke :(");
        } else {
            var display="";
            if (result===undefined){
                display="welp, that search didn't go as planned";
            } else if (result.queryresult.pod===undefined){
                display="(something broke)";
            } else {
                console.log("\n\n"+result+"\n\n");
                for(var a=0; a<result.queryresult.pod.length; a++){
                    var pod = result.queryresult.pod[a];
                    display=display+pod.$.title+": \n";
                    for(var b=0; b<pod.subpod.length; b++){
                        var subpod = pod.subpod[b];
                        for(var c=0; c<subpod.plaintext.length; c++){
                            var text = subpod.plaintext[c];
                            display=display+'\t'+text+"\n";
                        }
                    }
                }
            }
            sms(e.message.channel, "```"+display+"```");
        }
    });
}

function isWeekend(){
    var day=new Date(Date.now()).getDay();
    return (day==6)||(day==0);
}










/**
*	All things that debugger should test for
*/

module.exports={
	effects,
	Condition
}
