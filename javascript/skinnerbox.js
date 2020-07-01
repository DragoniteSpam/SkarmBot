"use strict";
const Skarm = require("./skarm.js");

module.exports = {
    const EXP_OFFSET: 100,
    const EXP_SCALE: 50,
    const EXP_BASE: 1.6,
    
    getLevel: function(exp) {
        return Math.log(Math.max((exp - EXP_OFFSET), 1) / EXP_SCALE) / Math.log(EXP_BASE);
    },
    
    getMinEXP: function(level) {
        return EXP_SCALE * Math.pow(level, EXP_BASE) + EXP_OFFSET;
    },
};