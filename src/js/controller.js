// The Controller handles the interaction between the game itself and the invocations to and from the blockly code
// For example, when elevatorCalled is invoked as a result of a Person calling the elevator, the blockly event is called
// so the 'coder' can determine what to do in this case (e.g. queueing the call). The utility methods offered to the
// blockly caller, such as queue management are also provided by the controller
var Controller = function() {

    this.calls = []; // elevator call queue (persons calling the elevator when they arrive at the door)
    this.requests = []; // elevator move request queue (persons pressing the button to ask the elevator to go to that floor)
    
    this.initialize = function() {
        // setup event emitter callbacks
        this.addListener('elev-called', this.elevatorCalled);
        this.addListener('floor-requested', this.floorRequested);
        this.addListener('elev-closed', this.elevClosed); // elevator closed, if there were persons just boarded in there, floor-requested would have been raised just before
        this.addListener('floor-arrived', this.floorArrived);
        this.addListener('interim-floor-arrived', this.interimFloorArrived);

        this.atFloor = 1; // initialize elevator to be on 1st floor
        floorManager.emit('elev-arrived', this.atFloor, "up"); // elevator is on the 1st floor, ready to go up although no one is probably there to board yet
    };

    // shutdown the game, in response to a reset button or if the game has ended
    this.shutdown = function() {
        this.requests = [];
        this.calls = [];
    };

    // event callback for when a Person asks for an elevator on a specific floor and to go up or down (direction)
    this.elevatorCalled = function(floor, direction) {
        window.console.log('Elevator called on floor ' + floor + ' in direction ' + direction);
        var isIdle = this.call_count() == 0 && this.request_count() == 0;
        this.store_call(floor, direction); // save the call in the queue
        this._eventElevatorCalled(floor, this.atFloor, isIdle); // call the blockly function coded by the 'coder'
    };

    // event callback for when a Person presses a floor button when inside the elevator
    this.floorRequested = function(floor) {
        window.console.log('Request to go to floor ' + floor);
        if (__level == 2 || __level == 3) this.store_request(floor);
        this._eventFloorRequested(floor); // call the blockly function coded by the 'coder'
    };

    this.interimFloorArrived = function(floor) {
        window.console.log('Elevator arrived interim on floor ' + floor + ' in direction ' + direction);
        this.atFloor = floor;
    };

    // event callback for when an elevator arrives at a particular floor
    this.floorArrived = function(floor, direction) {
        window.console.log('Elevator arrived on floor ' + floor + ' in direction ' + direction);
        direction = floor > this.atFloor ? "up" : "down";
        this.atFloor = floor;
        if (__level == 1) floorManager.emit('elev-arrived', this.atFloor, direction); // notify the floor manager so doors can be opened
        else this._eventFloorArrived(floor, direction); // call the blockly function coded by the 'coder'
    };

    // event callback for when an elevator door is closed and decisions have to be made on where to go next
    this.elevClosed = function() {
        window.console.log('Elevator closed with or without people already inside');
        this.requests = _.without(this.requests, this.atFloor);
        if (__level != 1 && __level != 2 && __level != 3) {
            dir = "";
            if (this.request_count() > 0) dir = (this.next_requested_floor() > this.atFloor) ? "up" : "down";
            this._eventElevClosed(this.atFloor, dir); // call the blockly function coded by the 'coder'
        }
    };

    // queue this call
    this.store_call = function(floor, direction) {
        if (this.validateFloor(floor, 'storeCall') && this.validateDirection(direction, 'storeCall')) this.calls.push({floor:floor, direction:direction});
    };

    // remove the call from the queue
    this.clear_call = function(floor, direction) {
        first = true;
        if (this.validateFloor(floor, 'clearCall') && this.validateDirection(direction, 'clearCall')) this.calls = _.reject(this.calls, function(c) {
            // remove only the oldest queued call for this floor and direction combo
            if (c.floor == floor && c.direction == direction) {
                ret = first ? true : false;
                first = false;
                return ret;
            };
            return false;
        }, this);
    };

    // queue this request
    this.store_request = function(floor) {
        if (this.validateFloor(floor, 'storeRequest')) this.requests.push(floor);
    };

    // call available to blockly 'coders' to open the elevator
    this.open_elevator = function(direction) {
        // we automatically choose the direction of the lift, for simple cases
        if (__level != 8) {
            if (this.request_count(this.atFloor) > 0) direction = 'up'; // doesnt matter which we set it to, if we came here because of a request, just open the elevator
            if (direction == null) direction = this.get_call_direction(this.atFloor); // else we may have have come here because someone called and if so, open here
        }
        if (this.validateDirection(direction, 'openElevator')) floorManager.emit('elev-arrived', this.atFloor, direction); // notify floor manager to show the opening of the elevator
    };

    // call available to blockly 'coders' to go to a particular floor
    this.go_to_floor = function(floor) {
        if (floor == this.atFloor) this.endGame(false, new ElevException('You are already at that desired floor, so cannot go there!'));
        else if (floorManager.elevState != '') this.endGame(false, new ElevException('You requested the elevator to go to a floor when it is busy with another request, perhaps you need to \'queue\' your requests?'));
        else if (this.validateFloor(floor, 'goToFloor')) {
            this.clear_call(this.atFloor, floor > this.atFloor? "up" : "down"); // we clear any queued calls from the current floor
            floorManager.travelToFloor(this.atFloor, floor); // tell the floor manager to travel
        }
    };

    // call available to blockly 'coders' to get the count of requests queued, either across all floors, or just on one specific floor
    this.request_count = function(floor) {
        if (typeof(floor) == 'undefined') return this.requests.length; // count of requests across all floors
        else {
            if (this.validateFloor(floor, 'requestCount')) return this.requests.length - _.without(this.requests, floor).length; // count of requests on this floor
        }
    };

    // call available to blockly 'coders' to get the count of calls queued, either across all floors, or just on one specific floor or on one floor in a given direction
    this.call_count = function(floor, direction) {
        if (typeof(floor) == 'undefined') return this.calls.length; // count of calls across all floors and in all directions
        else {
            if (this.validateFloor(floor, 'callCount')) {
                if (typeof(direction) == 'undefined') return _.where(this.calls,{floor:floor}).length; // count of calls on this floor in any direction
                else {
                    if (this.validateDirection(direction, 'callCount')) return _.where(this.calls,{floor:floor, direction:direction}).length; // count of calls on this floor in specific direction
                }
            }
        }
    };

    // call available to blockly 'coders' to get the direction of the oldest queued call on a given floor
    this.get_call_direction = function(floor) {
        if (this.validateFloor(floor, 'getCallDirection')) {
            callObj = _.findWhere(this.calls, {floor:floor});
            if (typeof(callObj) == 'undefined') this.endGame(false, new ElevException('Elevator not called on floor ' + floor + ', getCallDirection cannot return a result'));
            else return callObj.direction;
        }
    };

    // call available to blockly 'coders' to get the floor of the oldest call
    this.get_call_floor = function() {
        if (this.calls.length === 0) this.endGame(false, new ElevException('No active calls for the elevator, getCallFloor cannot return a result'));
        else return this.calls[0].floor;
    };

    // call available to blockly 'coders' to get another floor request from queue
    this.next_requested_floor = function() {
        if (this.requests.length === 0) this.endGame(false, new ElevException('No active requests for floors made in the elevator, nextRequestedFloor cannot return a result'));
        else return this.requests[0];
    };

    this.validateFloor = function(floor, fname) {
        if (typeof(floor) != 'number' || floor < 1 || floor > __c_.numFloors) {
            this.endGame(false, new ElevException('Invalid value of floor in ' + fname));
            return false;
        }
        return true; // all ok
    };

    this.validateDirection = function(direction, fname) {
        if (typeof(direction) != 'string' || (direction != 'up' && direction != 'down')) {
            this.endGame(false, new ElevException('Invalid value of direction in ' + fname));
            return false;
        }
        return true; // all ok
    };
    

    // invoked in case of a reset or end of the game
    this.shutdownAll = function() {
        this.shutdown();
        RunGame.shutdown();
        personManager.shutdown();
        floorManager.shutdown();
    };

    // invoked to setup the game for a run with blockly
    this.initializeAll = function() {
        DisplayInit.paintFloors();
        floorManager.initialize();
        personManager.initialize();
        controller.initialize();
    };

    // called to end the game either because we transferred all persons (success) or we couldn't (failure) or made an invalid call or with invalid data
    this.endGame = function(isSuccess, o) {
        this.shutdownAll();

        if (isSuccess == true) {
            picoModal('<div class="popup">Congratulations!</div> <div class="popup">' + o + '</div>').show(); // success message
        } else if (o instanceof ElevException) {
            picoModal('<div class="popup">Sorry, your code had an error :(</div> <div class="popup">' + o.reason + '</div>').show(); // failed because of a validation error
        } else {
            picoModal('<div class="popup">Sorry, but you didn\'t move all the persons to their destinations :(</div> <div class="popup">' + o + '</div>').show(); // failed because all persons weren't moved
        }

        __turnOnRun(); // turn on the Run button and turn off the reset button

        // reinitialize so we can start a new game again
        this.initializeAll();
    };

};

// allow for event processing for this object
Controller.prototype = new EventEmitter();

var controller = new Controller();

var ElevException = function(r) {
    this.reason = r;
};
