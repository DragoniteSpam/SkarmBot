"use strict";
const Skarm = require("./skarm.js");

// I'm hard-coding all of the Zeal stuff becasue I don't 
class Zeal {
    // assume we are connected
    static initialize(client) {
        Zeal.WOE = client.Channels.get("311398412610174976");
    }
    
    static woeMessage(user) {
        sms(Zeal.WOE,
            "Yo, **" + user.username + "!** If you can see this, it probably " +
                " means you were temporarily restricted from using the " +
                "Discord server.  If you are here, you should:\n" +
            "1.  Reread the #northcape--rules.\n" +
            "2.  Patiently wait out your banishment.  Usually a Guru will " +
                " set a reminder for how long they plan to keep you Banished " +
                "here.\n" +
            "3.  Correct your behavior so you don't end up here again. " +
                "Reminder, if you get banned, it will be permanent!\n" +
            "4.  If you need to contact a Guru, please do it here (or via " +
                "private message, I guess).  Refrain from bothering mods " +
                "with trivial nonsense and **DO NOT** contact the King of " +
                "Zeal.\n" +
            "5.  You will still have the ability to read channels throughout " +
                "the duration of your banishment but will be prohibited from " +
                "typing or speaking.\n" +
            "(Note for Gurus:  Please set a reminder when you banish " +
                "somebody with \"t!remind [Unban XYZ] in X hours/days . " +
                "Try to set ban timers for 6 hours, or one day/week/month."
        );
    }
}

module.exports = Zeal;