var Controller = function() {

    this.calls = [];
    this.requests = [];
    
    this.initialize = function() {
        this.addListener('elev-called', this.elevatorCalled);
        this.addListener('floor-requested', this.floorRequested);
        this.addListener('elev-closed', this.elevClosed); // elevator closed, if there were persons just boarded in there, floor-requested would have been raised just before
        this.addListener('floor-arrived', this.floorArrived);
        this.addListener('interim-floor-arrived', this.interimFloorArrived);

        this.atFloor = 1;
        floorManager.emit('elev-arrived', this.atFloor, "up"); // elevator is on the 1st floor, ready to go up although no one is probably there to board yet
    };

    this.shutdown = function() {
    };

    this.elevatorCalled = function(floor, direction) {
        window.console.log('Elevator called on floor ' + floor + ' in direction ' + direction);
        this._eventElevatorCalled(floor, this.atFloor, direction);
    };

    this.floorRequested = function(floor) {
        window.console.log('Request to go to floor ' + floor);
        this._eventFloorRequested(floor);
    };

    this.interimFloorArrived = function(floor) {
        window.console.log('Elevator arrived interim on floor ' + floor + ' in direction ' + direction);
        this.atFloor = floor;
    };

    this.floorArrived = function(floor, direction) {
        window.console.log('Elevator arrived on floor ' + floor + ' in direction ' + direction);
        direction = floor > this.atFloor ? "up" : "down";
        this.atFloor = floor;
        this._eventFloorArrived(floor, direction);
    };

    this.elevClosed = function() {
        window.console.log('Elevator closed with or without people already inside');
        this.requests = _.without(this.requests, this.atFloor);
        this._eventElevClosed(this.atFloor);
    };

    this.store_call = function(floor, direction) {
        this.validateFloor(floor, 'storeCall');
        this.validateDirection(direction, 'storeCall');
        this.calls.push({floor:floor, direction:direction});
    };

    this.clear_call = function(floor, direction) {
        this.validateFloor(floor, 'clearCall');
        this.validateDirection(direction, 'clearCall');
        this.calls = _.reject(this.calls, function(c) {return c.floor == floor && c.direction == direction;}, this);
    };

    this.store_request = function(floor) {
        this.validateFloor(floor, 'storeRequest');
        this.requests.push(floor);
    };

    this.open_elevator = function(floor, direction) {
        this.validateFloor(floor, 'openElevator');
        this.validateDirection(direction, 'openElevator');
        floorManager.emit('elev-arrived', floor, direction);
    };

    this.go_to_floor = function(floor) {
        this.validateFloor(floor, 'goToFloor');
        floorManager.travelToFloor(this.atFloor, floor);
    };

    this.request_count = function(floor) {
        if (typeof(floor) == 'undefined') return this.requests.length; // count of requests across all floors
        else {
            this.validateFloor(floor, 'requestCount');
            return this.requests.length - _.without(this.requests, floor).length; // count of requests on this floor
        }
    };

    this.call_count = function(floor, direction) {
        if (typeof(floor) == 'undefined') return this.calls.length; // count of calls across all floors and in all directions
        else {
            this.validateFloor(floor, 'callCount');
            if (typeof(direction) == 'undefined') return _.where(this.calls,{floor:floor}).length; // count of calls on this floor in any direction
            else {
                this.validateDirection(direction, 'callCount');
                return _.where(this.calls,{floor:floor, direction:direction}).length; // count of calls on this floor in specific direction
            }
        }
    };

    this.get_call_direction = function(floor) {
        this.validateFloor(floor, 'getCallDirection');
        callObj = _.findWhere(this.calls, {floor:floor});
        if (callObj == 'undefined') this.endGame(false, new ElevException('Elevator not called on floor ' + floor + ', getCallDirection cannot return a result'));;
        return callObj.direction;
    };

    this.get_call_floor = function() {
        if (this.calls.length === 0) this.endGame(false, new ElevException('No active calls for the elevator, getCallFloor cannot return a result'));
        return this.calls[0].floor;
    };

    this.next_requested_floor = function() {
        if (this.requests.length === 0) this.endGame(false, new ElevException('No active requests for floors made in the elevator, nextRequestedFloor cannot return a result'));
        return this.requests[0];
    };

    this.validateFloor = function(floor, fname) {
        if (typeof(floor) != 'number' || floor < 1 || floor > __c_.numFloors) this.endGame(false, new ElevException('Invalid value of floor in ' + fname));
    };

    this.validateDirection = function(direction, fname) {
        if (typeof(direction) != 'string' || (direction != 'up' && direction != 'down')) this.endGame(false, new ElevException('Invalid value of direction in ' + fname));
    };

    this.endGame = function(isSuccess, o) {
        this.shutdown();
        RunGame.shutdown();
        personManager.shutdown();
        floorManager.shutdown();

        if (isSuccess == true) {
            alert(o); // success message
        } else if (o instanceof ElevException) {
            alert("Sorry, your code had an error :( - " + o.reason); // failed because of a validation error
        } else {
            alert(o); // fail message
        }
    };

};

// allow for event processing for this object
Controller.prototype = new EventEmitter();

var controller = new Controller();

var ElevException = function(r) {
    this.reason = r;
};
