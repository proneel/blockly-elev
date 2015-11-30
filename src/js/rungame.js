// object that handles the generation of persons at time intervals to test if the blockly code is functioning as required
var RunGame = {
    // add the data for persons entering various floors and exiting at other floors, one entry for each level
    _requests : [
                 [[0,4]],
                 [[1,4]],
                 [[0,4],[],[],[],[],[1,0]],
                 [[0,4],[0,2]],
                 [[0,4],[0,2]],
                 [[0,4],[3,4]],
                 [[0,4],[3,1]],
                 [[4,0],[0,3],[4,2],[3,1],[4,2],[2,3],[3,4],[],[4,2],[2,1],[1,4],[4,3],[2,4],[2,4],[0,1],[3,4],[0,2],[2,4],[0,3]],
                ],

    gameStatus : null, // a string which maintains the state of elevators on a floor and state and location of each person. Used to figure out if the code is 'doing anything'

    // initialize the game, mainly the timer
    init : function() {
        RunGame.requests = RunGame._requests[__level-1].slice(0); // make a copy of the request and use it. Pick the one according to the level of the game.
        RunGame.add(RunGame.requests.shift());
        // start a timer every 3 secs which adds persons, if any and once everyone is added, changes to validate if the elevator is actually moving people or not
        RunGame.intervalID = window.setInterval(RunGame._addPersons, 3000);
    },

    // shutdown the game, mainly the timer
    shutdown : function() {
        if (typeof(RunGame.intervalID) != 'undefined' && RunGame.intervalID != null) {
            window.clearInterval(RunGame.intervalID);
            RunGame.intervalID = null;
        }
        RunGame.gameStatus = null;
    },

    // timer callback function, add a person if configured
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

    // timer callback function, all persons have been added, is the code now working?
    // to check if the code is working, we keep a status of the game (person state and location, elevator location and state, floors traveled etc)
    // if the state is the same between 2 calls of this callback, we know the game is 'stationary', so the game code has failed
    // if all persons have exited however, we know the code has successfully transfered people to their destinations
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

    // if we ended the game, did we do it successfully (all persons moved) or failed (people still stuck on their floors)?
    endGame : function(how, travel) {
        if (how) controller.endGame(true, 'You moved everyone in ' + travel + ' steps.');
        else controller.endGame(false, 'Better luck next time!');
    },

    add : function(item) {
        if(item.length != 2) return;
        personManager.emit('add-person', item[0], item[1]);
    }
};
