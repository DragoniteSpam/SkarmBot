"use strict";

class Constants {
    // assume we are connected
    static initialize(client) {
        Constants.DRAGO = client.Users.get("137336478291329024");
        Constants.ARGO = client.Users.get("162952008712716288");
        Constants.CHAN_DELETED = client.Channels.get("414291195028570112");
    }
}

module.exports = Constants;