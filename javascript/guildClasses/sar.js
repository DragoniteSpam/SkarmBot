/**
 * Self-Assigned Roles
 *
 * This module implements the Self-Assigned Role Group class.
 *
 * Self-Assigned roles can be equipped by any member by using the relevant commands
 * Future support for reaction-based 
 */

"use strict";
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

    /**
     * returns array of deltas: [
     * {roleID1, added},
     * {roleD2, removed}
     * ]
     */
    sarGroup.requestRoleToggle = function(roleID, iGuildMember) {
        let deltas = [];
        let userGuildRoles = iGuildMember.roles;
        let allGuildRoles = iGuildMember.guild.roles;

        // handle toggle case (max = 1) (accept string "1" or num 1 (==))
        if (sarGroup.max === 1) {
            let roleShouldBeAssigned = true;
            // purge all roles in group for user
            for (let i = 0; i < userGuildRoles.length; i++) {
                for (let groupRole in sarGroup.roles) {
                    if (userGuildRoles[i].id === groupRole) {
                        let delta = {
                            change: "Removed",
                            role:   groupRole,
                        };
                        if (userGuildRoles[i].id === roleID) {
                            roleShouldBeAssigned = false;
                            // delta.change = "Added";
                        }
                        userGuildRoles.splice(i--, 1);  // remove role from list
                        deltas.push(delta);
                    }
                }
            }

            if (roleShouldBeAssigned) {
                let j = 0;

                // cast to ID
                for (let i = 0; i < userGuildRoles.length; i++) {userGuildRoles[i] = userGuildRoles[i].id;}

                for (let i in allGuildRoles) {
                    if (allGuildRoles[i].id === roleID) {
                        userGuildRoles.splice(j, 0, roleID);
                        deltas.push({
                                change: "Added",
                                role: roleID,
                            });
                        break;
                    }
                    if (userGuildRoles.length > j && allGuildRoles[i].id === userGuildRoles[j]) {
                        j++;
                    }
                }
            }

            iGuildMember.setRoles(userGuildRoles);
            return deltas;
        }

        // toggle role based on user input
        // if the user already has the role, remove it
        for (let userRole of userGuildRoles) {
            if (userRole.id === roleID) {
                iGuildMember.unassignRole(roleID);
                return [{
                    change: "Removed",
                    role:   roleID,
                }];
            }
        }

        // otherwise, add the role to the user
        iGuildMember.assignRole(roleID);
        return [{
            change: "Added",
            role:   roleID,
        }];
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

    /**
     * @returns {boolean} whether or not
     *   there are roles in this group that can be equipped
     */
    sarGroup.hasRoles = function () {
        return !!Object.keys(this.roles).length;
    }

    /**
     * Returns a list of role IDs and corresponding actions
     * that can be taken for each role
     *
     * @param iGuildMember
     * @returns (idxKey) -> {
     *     role: GUID
     *     action: {"Remove", "Equip", "Switch to"}
     * }
     */
    sarGroup.getAvailableRoles = function (iGuildMember) {
        let userHasRole = function(roleID){
            for(let role of iGuildMember.roles){
                if(role.id === roleID) return true;
            }
            return false;
        }

        let i = 0;
        let returnHash = { };

        switch(sarGroup.max){
            case undefined:
            case 0:
                i = 0;
                for(let role in sarGroup.roles){
                    returnHash[++i] = {
                        role: role,
                        action: (userHasRole(role) ? "Remove" : "Equip"),
                    };
                }
                break;

            //
            // check which role from the group the user has
            // provide available options as switch-outs
            case 1:
                // check if the user already has a role equipped from the group
                let userOwnedRole;
                for(let role in sarGroup.roles) {
                    if(userHasRole(role)){
                        userOwnedRole = role;
                    }
                }

                // add available roles and action for each role
                i = 0;
                for(let role in sarGroup.roles) {
                    returnHash[++i] = {
                        role: role,
                        action: (userOwnedRole) ? (userOwnedRole === role ? "Remove" : "Switch to") : ("Equip"),
                    };
                }
                break;

            //  count how many roles in the group the user has
            //  provide available options
            default:
                let userRoleCount = 0;
                for(let role in sarGroup.roles) {
                    if(userHasRole(role)){
                        userRoleCount++;
                    }
                }

                i = 0;
                for(let role in sarGroup.roles){
                    if(userRoleCount < sarGroup.max || userHasRole(role)) {
                        returnHash[++i] = {
                            role: role,
                            action: (userHasRole(role) ? "Remove" : "Equip"),
                        };
                    }
                }
                break;
        }

        return returnHash;
    }

    sarGroup.getGroupName = function(){
        return sarGroup.name;
    };


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