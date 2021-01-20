"use strict";

// these aren't actually constants, since JS doesn't allow us to have nice
// things, but they're in capital letters so if you try to modify any of them
// I'm going to come to your house and whack you with a spoon.
class Constants {
    // assume we are connected
    static initialize(client) {
        //the dev team user objects
        Constants.Moms = {
            DRAGO: client.Users.get("137336478291329024"),
            TIBERIA: client.Users.get("425428688830726144"),
            MASTER: client.Users.get("162952008712716288"),
            ARGO: client.Users.get("263474950181093396"),
        }

        //the bot's own ID
		Constants.ID = client.User.id;

		//access to the client object
        Constants.client=client;

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

        //channel objects for skarm's base server which are accessible to all skarm tokens
        Constants.Channels = {
            LOG:            client.Channels.get("430545618314985504"), // #stdout
            DELETED:        client.Channels.get("414291195028570112"),
            TODO:      		client.Channels.get("766054985443311677"),
			SPAM: 			client.Channels.get("678456248735367168"), // #stderr
        };

        //operation codes for when skarm is saving data, restarting, or shutting down
		Constants.SaveCodes = {
			NOSAVE: 		42,
			DONOTHING:		-1,
			EXIT:			0,
			REBOOT:			69,
		};

		//Various subtle modifiers for the behavior of parrot
        Constants.Vars = {
            LEARN_MESSAGE_ODDS: 0.3,
            SIMILAR_MESSAGE_ATTEMPTS: 5,
            SIMILAR_MESSAGE_KEYWORDS: 3,
            LOG_CAPACITY: 6000,
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

        console.log("Initialized constants...");
    }
}

module.exports = Constants;