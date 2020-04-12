"use strict";

// these aren't actually constants, since JS doesn't allow us to have nice
// things, but they're in capital letters so if you try to modify any of them
// I'm going to come to your house and whack you with a spoon.
class Constants {
    // assume we are connected
    static initialize(client) {
        Constants.Users = {
            DRAGO: client.Users.get("137336478291329024"),
            TIBERIA: client.Users.get("425428688830726144"),
            MASTER: client.Users.get("162952008712716288"),
            ARGO: client.Users.get("263474950181093396"),
        }
        
        Constants.Days = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
        };
        
        Constants.Channels = {
            LOG: client.Channels.get("430545618314985504"),
            DELETED: client.Channels.get("414291195028570112"),
        };
        
        Constants.Vars = {
            LEARN_MESSAGE_ODDS: 0.3,
            SIMILAR_MESSAGE_ATTEMPTS: 5,
            SIMILAR_MESSAGE_KEYWORDS: 3,
            LOG_CAPACITY: 6000,
        };
        
        console.log("Initialized constants...");
    }
}

module.exports = Constants;