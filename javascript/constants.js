"use strict";

class Constants {
    // assume we are connected
    static initialize(client) {
        Constants.DRAGO = client.Users.get("137336478291329024");
        Constants.TIBERIA = client.Users.get("425428688830726144");
        Constants.MASTER = client.Users.get("162952008712716288");
        Constants.ARGO = client.Users.get("263474950181093396");
        Constants.CHAN_DELETED = client.Channels.get("414291195028570112");
    }
}

module.exports = Constants;