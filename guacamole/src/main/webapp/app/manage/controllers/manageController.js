/*
 * Copyright (C) 2014 Glyptodon LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * The controller for the administration page.
 */
angular.module('manage').controller('manageController', ['$scope', '$injector', 
        function manageController($scope, $injector) {

    // Required types
    var PermissionSet   = $injector.get('PermissionSet');
    var ConnectionGroup = $injector.get('ConnectionGroup');

    // Required services
    var connectionGroupService      = $injector.get('connectionGroupService');
    var connectionGroupEditModal    = $injector.get('connectionGroupEditModal');
    var userEditModal               = $injector.get('userEditModal');
    var protocolService             = $injector.get('protocolService');
    var userService                 = $injector.get('userService');
    
    // Set status to loading until we have all the connections, groups, and users have loaded
    $scope.loadingUsers         = true;
    $scope.loadingConnections   = true;
    
    $scope.basicPermissionsLoaded.then(function basicPermissionsHaveBeenLoaded() {

        // Retrieve all users for whom we have UPDATE permission
        connectionGroupService.getConnectionGroupTree(ConnectionGroup.ROOT_IDENTIFIER, PermissionSet.ObjectPermissionType.UPDATE)
        .success(function connectionGroupReceived(rootGroup) {
            $scope.rootGroup = rootGroup;
            $scope.loadingConnections = false; 
        });

        // Retrieve all users for whom we have UPDATE permission
        userService.getUsers(PermissionSet.ObjectPermissionType.UPDATE)
        .success(function usersReceived(users) {
            $scope.users = users;
            $scope.loadingUsers = false; 
        });

    });
    
    $scope.protocols = {};
    
    // Get the protocol information from the server and copy it into the scope
    protocolService.getProtocols().success(function fetchProtocols(protocols) {
        $scope.protocols = protocols;
    });

    // Expose object edit functions to group list template
    $scope.groupListContext = {
    
        /**
         * Open a modal to edit the given connection.
         *  
         * @param {Connection} connection
         *     The connection to edit.
         */
        editConnection : function editConnection(connection) {
            connectionEditModal.activate({
                connection : connection, 
                protocols  : $scope.protocols,
                rootGroup  : $scope.rootGroup
            });
        },

        /**
         * Open a modal to edit the given connection group.
         *  
         * @param {ConnectionGroup} connectionGroup
         *     The connection group to edit.
         */
        editConnectionGroup : function editConnectionGroup(connectionGroup) {
            connectionGroupEditModal.activate({
                connectionGroup : connectionGroup, 
                rootGroup       : $scope.rootGroup
            });
        }

    };
    
    /**
     * Open a modal to create a new connection.
     */
    $scope.newConnection = function newConnection() {
        connectionEditModal.activate(
        {
            connection : {}, 
            protocols  : $scope.protocols,
            rootGroup  : $scope.rootGroup
        });
    };
    
    /**
     * Open a modal to create a new connection group.
     */
    $scope.newConnectionGroup = function newConnectionGroup() {
        connectionGroupEditModal.activate(
        {
            connectionGroup : {}, 
            rootGroup       : $scope.rootGroup
        });
    };
    
    // Remove the user from the current list of users
    function removeUser(user) {
        for(var i = 0; i < $scope.users.length; i++) {
            if($scope.users[i].username === user.username) {
                $scope.users.splice(i, 1);
                break;
            }
        }
    }
    
    /**
     * Open a modal to edit the user.
     *  
     * @param {object} user The user to edit.
     */
    $scope.editUser = function editUser(user) {
        userEditModal.activate(
        {
            user            : user, 
            rootGroup       : $scope.rootGroup,
            removeUser      : removeUser
        });
    };
    
    $scope.newUsername = "";
    
    /**
     * Open a modal to edit the user.
     *  
     * @param {object} user The user to edit.
     */
    $scope.newUser = function newUser() {
        if($scope.newUsername) {
            var newUser = {
                username: $scope.newUsername
            };
            
            userService.createUser(newUser).success(function addUserToList() {
                $scope.users.push(newUser);
            });
            
            $scope.newUsername = "";
        }
    };
    
}]);



