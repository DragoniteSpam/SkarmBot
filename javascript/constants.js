"use strict";

// these aren't actually constants, since JS doesn't allow us to have nice
// things, but they're in capital letters so if you try to modify any of them
// I'm going to come to your house and whack you with a spoon.
class Constants {
    // assume we are connected
    static initialize(client) {
        Constants.DRAGO = client.Users.get("137336478291329024");
        Constants.TIBERIA = client.Users.get("425428688830726144");
        Constants.MASTER = client.Users.get("162952008712716288");
        Constants.ARGO = client.Users.get("263474950181093396");
        Constants.CHAN_DELETED = client.Channels.get("414291195028570112");
        
        Constants.SUNDAY = 0;
        Constants.MONDAY = 1;
        Constants.TUESDAY = 2;
        Constants.WEDNESDAY = 3;
        Constants.THURSDAY = 4;
        Constants.FRIDAY = 5;
        Constants.SATURDAY = 6;
    }
}

module.exports = Constants;