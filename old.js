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
const DRAGONITE="137336478291329024";
const EYAN_ID="304073163669766158";
const PRIMA="425428688830726144"; const TIBERIA = PRIMA;
//Skarm channels
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

// misc constants

const MAX_LOGGED_LINES=8000;
const BIG_BROTHER_TIMEOUT=10;

// Classes

class User {
	constructor(name, discriminator, id){
		this.name=name;
		this.discriminator=discriminator;
        this.id=id;

		this.silver=0;

		this.lines=0;
        this.characters=0;
		this.secretWord=0;
		this.secretWordAdd=0;
		
		this.todayMessages=0;
		this.todayViolence=0;
		this.todayWarnings=0;
		this.totalWarnings=0;
		
		this.todayWasWarned=false;
        
        this.talkTimer=BIG_BROTHER_TIMEOUT;
        this.pointEligible=true;
        this.points=0;
	}
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

client.Dispatcher.on(events.MESSAGE_CREATE, e=> {
    // special case trolling
    if (e.message.channel.id == "580946892201000960") {
        if (e.message.content.startsWith("4! ")) {
            var content = e.message.content.replace("4! ", "");
            // 4chan general: 580882049641086977
            // skarm general: 394225765077745665
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
	
	var author = e.message.author;
    var message=e.message.content.toLowerCase();
    
    // idk what the point of this is, tee hee hee
    hourlyPoints(author, message);
    
	var msg = message.split(" ");
	// Help
	if (!e.message.deleted){ 
		notifiers(e, message);
		massEffect(e, message, msg);
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

function massEffect(e, message, msg){
    if (message == "e!guilds") {
		var list = client.Guilds.toArray();
		for (var i in list) {
			aGF(i,list);
        }       
    }else if (message=="e!size"){
        utiliyLineCount(e);
        totalBotCommands++;
    } else if (message=="e!sact"){
        utilityActCount(e);
        totalBotCommands++;
    }else if (utilPins(e, msg)){
        totalBotCommands++;
    } else if (message.startsWith("e!game ")){
        utilityGame(e);
    } else if (message.startsWith("e!silver ")){
        utilitySilver(e);
    } else if (message.startsWith("e!skarm")){
        utilitySkarm(e);
    } else if (message.startsWith("e!suggest")){
        utilitySuggestion(e);
    } else if (message.startsWith("e!xkcd")){
        utilityMunroe(e);
    // Quote
    } else if (message.startsWith("e!says-add ")){
        totalBotCommands++;
        add(e.message);
    } else if (message=="e!test"){
        sms(e.message.channel,e.message.author.username+" can submit messages: "+userHasKickingBoots(e.message.author, e.message.channel));
        totalBotCommands++;
    }
    // Pictures
    /*} else if (message=="e!waifu"){
        waifuSend(e.message.channel);
        totalBotCommands++;
    } else if (message=="e!cat"){
        catSend(e.message.channel);
        totalBotCommands++;
    }*/
    
    // Censor functions
    else if (message.startsWith("e!censor")){
        censorCommandSet(e.message);
    // More misc. functions
    } else if (message==="e!crash"){
        utilityCrash(e);
    } else if (message==="e!shanties"){
        processShanties();
    }
    // Lol
    if (botCanSendUserCommands){
        if (message == "!pink"){
            totalBotCommands++;
            utilityPink(e);
            utilityPinker(e);
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
        } else if (message==="e!rainy"){
            totalBotCommands++;
            sms(e.message.channel, "cease!");
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

/*
 ********************
 *      Quotes      *
 ********************
 */

// Checks to see if the user is allowed to submit messages to the bot
function userHasKickingBoots(author, channel){
	return author.can(discordie.Permissions.General.KICK_MEMBERS, channel);
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
		}
	}
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
			silverString=silverString+"**"+e.message.mentions[i].username+"** now has **"+user.silver+"** silver!\n";
		}
	}
	if (silverString.length>0){
		sms(e.message.channel,silverString);
		return true;
	}
	
	return false;
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
		if (authorEquals(author, "304073163669766158")){   //304073163669766158 = eyan
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

function censorCommandSet(message){
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
                fs.appendFile("suggestion-blacklist.txt", e.message.mentions[i].id+"\r\n", (err)=>{
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
	fs.readFile("suggestion-blacklist.txt", function(err, data){
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
	if (userHasKickingBoots(e.message.author, e.message.channel)){
        var game={name: e.message.content.replace("e!game ", ""), type: 0};
		client.User.setGame(game);
        
		sms(e.message.channel,"New game: "+e.message.content.replace("e!game ", ""));
	} else {
		sms(e.message.channel,"You don't have permission to do that!");
	}
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

// Utility that prints out the number of lines in the bot's learned database.
function utiliyLineCount(e){
	var lines;
	fs.readFile("line.txt", function(err, data){
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

// Is a message an action?
function utilityIsAction(string){
	var first=string.substring(0,1);
	if (first!="*"&&first!="_"){
		return false;
	}
	return string.endsWith(first);
}
function utilityMunroe(e) {
    var command = e.message.content.split(" ");
    if (command.length == 1) {
        munroe.toggleChannel(e.message.channel);
    } else {
        switch (command[1]) {
            case "now":
                munroe.post();
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