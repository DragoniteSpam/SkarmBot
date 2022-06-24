"use strict";
const fs = require("fs");
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Permissions = require("../permissions.js");
const Skinner = require("../skinnerbox.js");
const Users = require("../user.js");

let linkVariables = function (sarGroup) {
    if(sarGroup.roles === undefined) sarGroup.roles = { };
}

let linkFunctions = function (sarGroup){
    sarGroup.addRoleToGroup = function(roleID){
        if(roleID in this.roles)
            return false;
        this.roles[roleID] = true;
        return true;
    };

    sarGroup.removeRoleFromGroup = function(roleID){
        if(!roleID in this.roles)
            return false;
        delete this.roles[roleID];
        return true;
    };

    sarGroup.rename = function(newGroupName) {
        sarGroup.name = newGroupName;
    };

    sarGroup.requestRoleToggle = function(roleID, iGuildMember){

    };

    /**
     * @returns an array of roles
     */
    sarGroup.getRoles = function () {
        return Object.keys(sarGroup.roles);
    }

    /**
     * Accepts any number input, casts to a natural number
     * quantity of roles that can be equipped from the group.
     *
     * @param newMax the amount of roles that can be equipped
     *          simultaneously from the group
     * @returns {number} the amount that has been set in memory
     */
    sarGroup.setMax = function (newMax) {
        sarGroup.max = Math.max(0, Math.floor(newMax - 0));
        return sarGroup.max;
    }
}


class SarGroup {
    constructor(guildId, groupName, max= 0) {
        this.name = groupName;
        this.guildId = guildId; // the GUID of the guild

        /**
         * the maximum number of roles that any member can equip from the guild.
         * special case max = 0:
         *   unlimited roles
         * special case max = 1:
         *   requesting one role removes currently equipped roles in the group from the user
        */
        this.max = 0;

        // the IDs of the roles that can be equipped from the group.
        this.roles = { };

        SarGroup.initialize(this);
    }

    static initialize(sarGroup){
        linkVariables(sarGroup);
        linkFunctions(sarGroup);
    }
}

module.exports = SarGroup;