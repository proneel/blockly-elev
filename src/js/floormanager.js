// this object handles all events on floors such as opening and closing elevators, managing the display of up/down button state on a floor
// travel between floors and the display of which floor an elevator is on
var FloorManager = function() {
    this.floorObjects = null; // an array of Floor objects; A Floor object contains the state of doors, sprites etc on a floor
    this.spriteGroup = null; // contains all phaser sprites used on a floor
    this.timer1 = null; // timer callback, callback function, context etc
    this.floorsTraveled = 0; // counter on floors traveled
    this.elevState = ''; // to know if the elevator is open/closed etc

    // initialize all floors, including displays and timer
    this.initialize = function() {
        this.floorObjects = new Array(__c_.numFloors);
        for (i = 0; i < __c_.numFloors; ++i) {
            this.floorObjects[i] = {upCalled:false, downCalled:false, upCalledSprite:null, downCalledSprite:null, elevDoorGraphics:null, elevAtSprite:null };
        }

        this.spriteGroup = game.add.group();
        this.spriteGroup.z = 2; // this is 'lower' than persons so that persons are in foreground and floor artifacts in the background

        // add all event handlers
        this.addListener('elev-called', this.elevCalled);
        this.addListener('elev-arrived', this.elevArrived);
        this.addListener('elev-boarded', this.elevBoarded);

        this._reset();

        // start a timer every n msecs which does actions as required on all persons
        this.stopTimer();
        this.intervalID = window.setInterval(this._processTimer, 12);
    };

    // reset timers, counters, up/down call status etc
    this._reset = function() {
        this.timer1 = null;
        this.floorsTraveled = 0;

        //cycle through each floor
        //initialize the display of the up/down call buttons
        //instantly draw a closed door (not closing door)
        _.each(this.floorObjects, function(fo,i) {
            floorManager.setCallStatus("up", false, i);
            floorManager.setCallStatus("down", false, i);
            floorManager._paintClosedElevator(fo, i);
        });
        // update the floor display sprite on all floors to reflect that the elevator is on the 1st floor
        this._updateFloorNumberDisplay(1);
        this.elevState = '';
    };

    // shutdown the game, in response to a reset button or if the game has ended
    this.shutdown = function() {
        this._reset();
        this.stopTimer();
    };

    // stop the timer, if there is one
    this.stopTimer = function() {
        if (typeof(this.intervalID) != 'undefined' && this.intervalID != null) {
            window.clearInterval(this.intervalID);
            this.intervalID = null;
        }
    };

    // callback for the timer interval set in the game
    this._processTimer = function() {
        t = floorManager.timer1;
        if (t !== null && t.type == 'countdown') { // a countdown timer is fired after n intervals
            if (t.countdown === 0) { // n intervals done
                t.callback(floorManager, t.ctx); // invoke the callback
                if (t.id == floorManager.timer1.id) floorManager.timer1 = null; // null at end of countdown, but only if the timer hasnt been substituted during the call
            } else t.countdown--; // one more interval done
        } else if (t !== null && t.type == 'loop') {
            ret = t.callback(floorManager, t.ctx); // invoke the callback and check the return value
            if (!ret && floorManager.timer1 != null && t.id == floorManager.timer1.id) floorManager.timer1 = null; // if the callback had returned true, it means the callbacks should continue, else false means stop further callbacks (unless the callback changed the timer itself)
        }
    };

    this.getProperty = function(floorNumber, key) {
        return this.floorObjects[floorNumber][key];
    };

    // paint a closed elevator on a given floor
    this._paintClosedElevator = function(floorObject, floorNumber) {
        if (floorObject.elevDoorGraphics === null) floorObject.elevDoorGraphics = game.add.graphics();
        else floorObject.elevDoorGraphics.clear();

        floorObject.elevDoorGraphics.beginFill(0xfff5ee);
        floorObject.elevDoorGraphics.lineStyle(2, 0x000000, 1); // thick black rectangle filled in white, representing a half of the elevator door
        // a perfect closed elevator has 2 doors which are fully halfway each
        floorObject.elevDoorGraphics.drawRect(__c_.maxX-131, __c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber+1))+30, 62, 93);
        floorObject.elevDoorGraphics.drawRect(__c_.maxX-131+64, __c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber+1))+30, 62, 93);
        floorObject.elevDoorGraphics.endFill();
        game.world.bringToTop(floorObject.elevDoorGraphics); // or else this will be hidden behind the elevator sprite
    };

    // paint an opening elevator on a given floor
    this._paintOpeningElevator = function(floorObject, floorNumber, callback) {
        if (floorObject.elevDoorGraphics === null) floorObject.elevDoorGraphics = game.add.graphics();

        // setup a timer callback so that every few milliseconds the elevator door is redrawn from a closed form till it is just a little bit visible
        this.timer1 = {id:_.uniqueId(), type:'loop', ctx:{counter:0, callCounter:0, fo:floorObject, fn:floorNumber, cb:callback}, callback:function(m, ctx) {
            if ((ctx.callCounter++)%2 !== 0) return true; // slow down the opening a bit, dont process every callback

            ctx.fo.elevDoorGraphics.clear();
            ctx.fo.elevDoorGraphics.beginFill(0xfff5ee);
            ctx.fo.elevDoorGraphics.lineStyle(2, 0x000000, 1); // thick black rectangle filled in white, representing a half of the elevator door
            ctx.fo.elevDoorGraphics.drawRect(__c_.maxX-131, __c_.maxY()-(__c_.tilePix*__c_.floorH*(ctx.fn+1))+30, 62-ctx.counter, 93);
            ctx.fo.elevDoorGraphics.drawRect(__c_.maxX-131+64+ctx.counter, __c_.maxY()-(__c_.tilePix*__c_.floorH*(ctx.fn+1))+30, 62-ctx.counter, 93);
            ctx.fo.elevDoorGraphics.endFill();
            game.world.bringToTop(ctx.fo.elevDoorGraphics); // or else this will be hidden behind the elevator sprite
            ctx.counter++;

            if (ctx.counter == 60) {
                if (ctx.cb !== null) ctx.cb(); // invoke the callback at the end of opening the elevator
                return false;
            } else return true; // we need to continue the callbacks
        }};
    };

    // paint a closing elevator on a given floor
    this._paintClosingElevator = function(floorObject, floorNumber, callback) {
        if (floorObject.elevDoorGraphics === null) floorObject.elevDoorGraphics = game.add.graphics();

        // setup a timer callback so that every few milliseconds the elevator door is redrawn from the open form till it is fully closed
        this.timer1 = {id:_.uniqueId(), type:'loop', ctx:{counter:0, callCounter:0, fo:floorObject, fn:floorNumber, cb:callback}, callback:function(m, ctx) {
            if ((ctx.callCounter++)%2 !== 0) return true; // slow down the opening a bit, dont process every callback

            ctx.fo.elevDoorGraphics.clear();
            ctx.fo.elevDoorGraphics.beginFill(0xfff5ee);
            ctx.fo.elevDoorGraphics.lineStyle(2, 0x000000, 1); // thick black rectangle filled in white, representing a half of the elevator door
            ctx.fo.elevDoorGraphics.drawRect(__c_.maxX-131, __c_.maxY()-(__c_.tilePix*__c_.floorH*(ctx.fn+1))+30, 3+ctx.counter, 93);
            ctx.fo.elevDoorGraphics.drawRect(__c_.maxX-131+64+59-ctx.counter, __c_.maxY()-(__c_.tilePix*__c_.floorH*(ctx.fn+1))+30, 3+ctx.counter, 93);
            ctx.fo.elevDoorGraphics.endFill();
            game.world.bringToTop(ctx.fo.elevDoorGraphics); // or else this will be hidden behind the elevator sprite
            ctx.counter++;

            if (ctx.counter == 60) {
                if (ctx.cb !== null) ctx.cb(); // invoke the callback at the end of closing the elevator
                return false;
            } else return true; // we need to continue the callbacks
        }};
    };

    // a person has called the elevator on a given floor with a given direction
    this.setCallStatus = function(direction, newVal, floorNumber) {
        floorObject = this.floorObjects[floorNumber];
        currVal = direction == "up" ? floorObject.upCalled : floorObject.downCalled;

        // redraw the up/down sprite on that floor
        if (currVal != newVal || (direction == "up" && floorObject.upCalledSprite === null) || (direction == "down" && floorObject.downCalledSprite === null)) {
            // delete the current sprite, if any
            sprite = direction == "up" ? floorObject.upCalledSprite : floorObject.downCalledSprite;
            if (sprite !== null) sprite.destroy();

            // recreate the sprites which show the call button
            if (direction == "up") {
                floorObject.upCalled = newVal;
                floorObject.upCalledSprite = game.add.sprite(__c_.maxX-155, __c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber+1))+64, floorObject.upCalled ? 'upon' : 'upoff');
                this.spriteGroup.add(floorObject.upCalledSprite); // add the sprite so it is managed in the group
            } else {
                floorObject.downCalled = newVal;
                floorObject.downCalledSprite = game.add.sprite(__c_.maxX-155, __c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber+1))+76, floorObject.downCalled ? 'downon' : 'downoff');
                this.spriteGroup.add(floorObject.downCalledSprite); // add the sprite so it is managed in the group
            }
        }

        // notify all persons on that floor waiting for the elevator in that direction so they do not go on again to press the call button
        personManager.emit('elev-called', floorNumber, direction);
    };

    // event notifying that the elevator has been called in a given direction on a given floor
    this.elevCalled = function(floorNumber, direction) {
        this.setCallStatus(direction, true, floorNumber);
        controller.emit('elev-called', floorNumber+1, direction); // send an event to the controller that the elevator has been called on this floor
    };

    // event notifying that the elevator has arrived on a given floor but only to pick up travelers in a specified direction
    this.elevArrived = function(_floorNumber, direction) {
        window.console.log('Arrived at floor ' + _floorNumber);
        floorNumber = _floorNumber-1; // this will be invoked from the controller which uses floor numbering starting from 1

        // reset the appropriate call status for that floor
        this.setCallStatus(direction,false, floorNumber);

        // update the floor display sprite on all floors to reflect that the elevator is now on this floor
        this._updateFloorNumberDisplay(_floorNumber);

        // inform people waiting to go in that direction on that floor, so they 'look' at the elevator and collect them for boarding
        personManager.emit('elev-opening', floorNumber, direction);
    };

    // update the floor display sprite on all floors to reflect that the elevator is now on this floor
    this._updateFloorNumberDisplay = function(_floorNumber) {
        _.each(this.floorObjects, function(floorObject,i) {
            if (floorObject.elevAtSprite !== null) floorObject.elevAtSprite.destroy();
            floorObject.elevAtSprite = game.add.sprite(__c_.maxX-155, __c_.maxY()-(__c_.tilePix*__c_.floorH*(i+1))+36, '' + _floorNumber + '');
            floorManager.spriteGroup.add(floorObject.elevAtSprite); // add the sprite so it is managed in the group
        });
    };

    // event callback to indicate that the elevator should be shown as opening on a given floor
    this.openElevator = function(floorNumber) {
        // paint an opening elevator and when opened inform personmanager so it can send people to board or people on board looking to get off can leave
        this.elevState = 'opening';
        // the callback method below will be called after the elevator has been displayed as finally opened
        this._paintOpeningElevator(this.floorObjects[floorNumber], floorNumber, function() {
            window.console.log('elevator opened');
            floorManager.elevState = 'opened';
            personManager.emit('elev-opened', floorNumber); // let person manager know so people can exit the elevator or enter it
        });
    };

    // event callback to indicate that any passengers have boarded the elevator and those exiting at this floor have gotten off
    this.elevBoarded = function(floorNumber, direction) {
        this.elevState = 'closing';
        this._paintClosingElevator(this.floorObjects[floorNumber], floorNumber, function() {
            window.console.log('Elevator boarded at floor ' + floorNumber + ' in direction ' + direction);
            floorManager.elevState = '';
            // once the elevator has closed, people in the elevator can click buttons to request a floor
            personManager.emit('elev-closed', floorNumber);

            // whether or not there are people in the elevator or not and whether they have pressed the request buttons or not, tell the controller that the elevator is now closed
            controller.emit('elev-closed');
        });
    };

    // request from the controller to move the elevator from one floor to another
    this.travelToFloor = function(_fromFloor, _toFloor) {
        // when called from the controller, the floor numbering is 1 greater than how floor manager considers it
        fromFloor = _fromFloor-1;
        toFloor = _toFloor-1;

        // we have been asked to show the elevator moving from one floor to another
        // now increment the floor of the elevator by 1 or -1 (depending on direction) in a timed interval
        // at each floor, change the floor indicator to new floor on all floors
        // also, move the sprite for all persons on the elevator by 1 floor height
        incr = toFloor > fromFloor ? 1 : -1;
        direction = toFloor > fromFloor ? "up" : "down";

        window.console.log('Traveling from ' + fromFloor + ' to ' + toFloor);

        this.elevState = 'traveling';
        // setup a timer callback so the elevator is shown as moving from one floor to another
        this.timer1 = {id:_.uniqueId(), type:'loop', ctx:{callCounter:0, cf:fromFloor, incr:incr, tf:toFloor, dir:direction}, callback:function(m, ctx) {
            if ((ctx.callCounter++)%50 != 49) return true; // move the elevator slowly, dont process every callback

            ctx.cf += ctx.incr;
            m.floorsTraveled++;

            // when we have moved one floor up or down, the display of current floor number needs to be updated on all floors
            _.each(floorManager.floorObjects, function(floorObject,i) {
                if (floorObject.elevAtSprite !== null) floorObject.elevAtSprite.destroy();
                floorObject.elevAtSprite = game.add.sprite(__c_.maxX-155, __c_.maxY()-(__c_.tilePix*__c_.floorH*(i+1))+36, '' + (ctx.cf+1) + ''); // floor number displayed is US convention, 1 for ground floor
                floorManager.spriteGroup.add(floorObject.elevAtSprite);
            });

            if ((ctx.cf == ctx.tf) || (ctx.cf == __c_.numFloors-1 && ctx.incr == 1) || (ctx.cf === 0 && ctx.incr == -1)) {
                // we have reached the top going up or bottom coming down or we have reached the requested floor, just stop the elevator 
                m.elevState = '';
                controller.emit('floor-arrived', ctx.cf+1, ctx.dir);
                return false; // we have reached the destination, no more callbacks required
            }

            controller.emit('interim-floor-arrived', ctx.cf+1); // inform that we are on the way and reached one floor

            return true; // still on our way, continue callbacks
        }};
    };
};

// allow for event processing for this object
FloorManager.prototype = new EventEmitter();

var floorManager = new FloorManager();
