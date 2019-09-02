"use strict";
// load discordie object
//skarm
const fs = require("fs");
const wolfy = new(require("node-wolfram"))(fs.readFileSync("../wolfram.txt").toString());

const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

class Web {
    constructor(client) {
        this.client = client;
    }
    
    static wolfy(bot, e) {
        let query = e.message.content.replace("e!wolfy ", "");
        
        wolfy.query(query, function(err, result) {
            if (err) {
                Skarm.log(err);
                sms(e.message.channel, "(Something broke)");
            } else {
                let display = "";
                if (result === undefined){
                    display = "Welp, that search didn't go as planned.";
                } else if (result.queryresult.pod === undefined){
                    display = "Wolfy doesn't know the answer to that one. Dang it, wolfy.";
                } else {
                    for (let i = 0; i < result.queryresult.pod.length; i++) {
                        let pod = result.queryresult.pod[i];
                        display = display + pod.$.title + ": \n";
                        for (let j = 0; j < pod.subpod.length; j++) {
                            var subpod = pod.subpod[j];
                            for (let k = 0; k < subpod.plaintext.length; k++) {
                                display = display + '\t' + subpod.plaintext[k] + "\n";
                            }
                        }
                    }
                }
                Skarm.sendMessageDelay(e.message.channel, ">>> " + display);
            }
        });
    }
    
    static google(bot, e) {
        let message = e.message.content;
        Skarm.sendMessageDelay(e.message.channel, "http://google.com/search?q=" + message.replace("e!google", "").replaceAll(" ", "+"));
    }
}

module.exports = Web;