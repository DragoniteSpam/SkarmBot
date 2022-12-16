"use strict";

// these aren't actually constants, since JS doesn't allow us to have nice
// things, but they're in capital letters so if you try to modify any of them
// I'm going to come to your house and whack you with a spoon.
class Constants {
    // safe to run even when not yet connected
    static initialize(){
        Constants.Tables = {
            MaxTableLength: 15              // maximum amount of objects to print in a table
        }

        //Weekdays with sunday at 0 and working up from there
        Constants.Days = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
        };

        //Currently playing game states
        Constants.GameState = {
            AUTOMATIC: 0,
            MANUAL:   -1,
        };

        Constants.someBigNumber = 1 << 20;    // arbitrary large number
        Constants.GuidLength = "137336478291329024".length;

        //operation codes for when skarm is saving data, restarting, or shutting down
        Constants.SaveCodes = {
            NOSAVE:     42,
            DONOTHING:  -1,
            EXIT:	    0,
            REBOOT:	    69,
        };

        Constants.processIdMax      = 0x400;
        Constants.versionOffsetBits = 0x006;

        //Various subtle modifiers for the behavior of parrot
        Constants.Vars = {
            LEARN_MESSAGE_ODDS:         0.3,
            SIMILAR_MESSAGE_ATTEMPTS:   5,
            SIMILAR_MESSAGE_KEYWORDS:   3,
            LOG_CAPACITY:               6000,
            USER_OFFSET_MOD:            10000,                           // Do not set this value to any multiple of 2 less than 1<<12.  https://discord.com/developers/docs/reference#snowflake-ids-in-pagination
        };

        //Notifications emitted to guilds upon certain events
        Constants.Notifications = {
            NAME_CHANGE:    0x0001,
            NICK_CHANGE:    0x0002,
            BAN:            0x0004,
            BAN_REMOVE:     0x0008,
            VOICE_JOIN:     0x0010,
            VOICE_SWITCH:   0x0020,
            VOICE_LEAVE:    0x0040,
            MEMBER_JOIN:    0x0080,
            MEMBER_LEAVE:   0x0100,
            ROLE_CHANGE:    0x0200,
            XKCD:           0x0400,
        };

        //The standard RGB color palette skarm uses in embedded messages
        Constants.Colors = {
            RED:    0xff6666,
            GREEN:  0x66ff66,
            BLUE:   0x6666ff,
        };

        //All lightsaber emotes pulled from the skarm server
        Constants.Lightsabers = {
            Left: {
                red:    "<:redlightsaberyx:455820731775844367>",
                green:  "<:greenlightsaberyx:422559631030878209>",
                blue:   "<:bluelightsaberyx:422558517287845889>",
                purple: "<:Purplelightsaberymx:455819615440732171>"
            },
            Right: {
                red:    "<:redlightsaberyx:455820732228698122>",
                green:  "<:greenlightsaberyx:422559630741340171>",
                blue:   "<:bluelightsaberyx:422558517589704704>",
                purple: "<:Purplelightsaberyx:455819615071633422>"
            },
            Hilts: {
                Left:   "<:leftHilt:813564796049948712>",
                Right:  "<:rightHilt:813564796044705822>"
            },
            Head:       "<:skarmhead:422560671574523904>",
            Blank:      "<:background:448285187550347275>",
        }

        // Control constants for shanty behavior
        Constants.Shanties = {
            linesPerMessage: 2,
        }
    }

    // assume we are connected
    static initializeDynamics(client, p) {      //p = process
        //the dev team user objects
        Constants.Moms = {
            DRAGO:   client.Users.get("137336478291329024"),
            TIBERIA: client.Users.get("425428688830726144"),
            MASTER:  client.Users.get("162952008712716288"),
            ARGO:    client.Users.get("263474950181093396"),
        }

        Constants.client = client;            //access to the client object
        Constants.self = client.User;         //the bot's user object
        Constants.ID = client.User.id;        //the bot's own ID

        //channel objects for skarm's base server which are accessible to all skarm tokens
        Constants.Channels = {
            LOG:        client.Channels.get("430545618314985504"), // #stdout
            DELETED:    client.Channels.get("414291195028570112"),
            TODO:       client.Channels.get("766054985443311677"),
			SPAM: 	    client.Channels.get("678456248735367168"), // #stderr
            SAVELOG:    client.Channels.get("1052777938480791572"),
        };

        //the absolute path of the repository, formatted like "C:\Users\argo\Documents\GitHub\SkarmBot\"
        Constants.skarmRootPath = p.argv[1].substring(0, process.argv[1].lastIndexOf("\\") + "\\".length);
        console.log("Initialized root path to: ", Constants.skarmRootPath);

        console.log("Initialized constants...");
    }
}

module.exports = Constants;