"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

const Users = require("./user.js");
const Guilds = require("./guild.js");

module.exports = {
    NOT_IN_GUILD:           0x0000,
    RESTIRCTED:             0x0001,
    BASE:                   0x0002,
    MOD:                    0x0004,
    ADMIN:                  0x0008,
    SUDO:                   0xfffe,
};