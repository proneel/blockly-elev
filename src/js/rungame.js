var RunGame = {
    //_requests: [[0,2],[0,2],[],[0,2],[],[0,2],[],[0,2],[],[0,2],[],[0,3],[],[0,4],[],[0,1]],
    //_requests: [[0,2],[],[],[2,3],[],[0,2]],
    //_requests: [[0,2],[0,3],[0,4]],
    //_requests: [[0,4],[0,3],[0,2]],
    //_requests: [[0,4],[0,3],[0,2],[0,1],[0,2],[0,3],[0,4],[0,2],[0,1],[1,4],[0,3],[2,4],[0,4],[0,1],[3,4],[0,2],[2,4],[0,3]],
    //_requests: [[4,0],[4,3],[4,2],[4,1],[4,2],[4,3],[3,4],[4,2],[2,1],[1,4],[4,3],[2,4],[2,4],[0,1],[3,4],[0,2],[2,4],[0,3]],
    //_requests: [[4,0],[0,3],[4,2],[3,1],[4,2],[2,3],[3,4],[],[4,2],[2,1],[1,4],[4,3],[2,4],[2,4],[0,1],[3,4],[0,2],[2,4],[0,3]],
    //_requests: [[0,3],[1,2],[1,4],[1,4],[1,0],[3,4]],
    //_requests: [[0,2],[4,1],[0,4],[2,3],[4,1],[1,3],[2,4],[1,2],[1,0],[2,4]],
    //_requests: [[0,4]],
    _requests : [
                 [[0,4]],
                 [[1,4]],
                ],

    gameStatus : null,

    init : function() {
        RunGame.requests = RunGame._requests[__level-1].slice(0); // make a copy of the request and use it. Pick the one according to the level of the game.
        RunGame.add(RunGame.requests.shift());
        // start a timer every 3 secs which adds persons, if any and once everyone is added, changes to validate if the elevator is actually moving people or not
        RunGame.intervalID = window.setInterval(RunGame._addPersons, 3000);
    },

    shutdown : function() {
        if (typeof(RunGame.intervalID) != 'undefined' && RunGame.intervalID != null) {
            window.clearInterval(RunGame.intervalID);
            RunGame.intervalID = null;
        }
        RunGame.gameStatus = null;
    },

    _addPersons : function() {
        // if we still have requests, dont bother validating the elevator yet
        item = RunGame.requests.shift();
        if (typeof(item) == 'undefined') {
            // no more calls needed to add persons
            window.clearInterval(RunGame.intervalID);
            // start validating if the game is working instead
            RunGame.intervalID = window.setInterval(RunGame._validateWorking, 5000);
        }
        else RunGame.add(item);
    },

    _validateWorking : function() {
        newGameStatus = '';
        // create a string which captures the state and position of all persons who have not exited and the number of floors traveled by the elevator
        // in every 5 seconds there should have been atleast some movements in the game, either the elevator should have moved a floor or a person moved towards or away from the elevator or changed their state (e.g. boarding to boarded)
        // the 5 second calculus is for closing and moving the elevator (for elevator movement), for 2 second animation of entering or exiting the elevator with no X coord change (for a person) 
        _.each(personManager.persons, function(p) {
            if (p.state != 'exited') {
                newGameStatus = newGameStatus + p.state + ',' + p.sprite.x + ';';
            }
        });

        // if all persons have exited, we ended the game successfully
        if (newGameStatus === '') RunGame.endGame(true, floorManager.floorsTraveled);
        else {
            newGameStatus = floorManager.floorsTraveled + ',' + floorManager.doorState + ';' + newGameStatus; // prefix it with the floors traveled and whether the elevator door is opening or closing to get the current status
            window.console.log(newGameStatus);
            if (RunGame.gameStatus !== null && RunGame.gameStatus == newGameStatus) RunGame.endGame(false); // the elevator controls arent working :(
            else RunGame.gameStatus = newGameStatus; // the status changed, so something is still moving
        }
    },

    endGame : function(how, travel) {
        if (how) controller.endGame(true, 'Great job!! You moved everyone in ' + travel + ' steps.');
        else controller.endGame(false, 'Too bad :( ... better luck next time!');
    },

    add : function(item) {
        if(item.length != 2) return;
        personManager.emit('add-person', item[0], item[1]);
    }
};
