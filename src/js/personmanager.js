// A Person object represents an individual from the time when they enter the floor to traveling the elevator and then finally exiting the destination floor
// It stores the state of the person (e.g. entering/waiting) as well as the sprite itself which is used to animate and move the sprite
Person = function(fromFloor, toFloor) {
    this.id = personManager.nextPersonId++;
    this.state = 'entering';
    this.onFloor = fromFloor;
    this.targetFloor = toFloor;
    this.direction = fromFloor < toFloor ? "up" : "down";
    this.timer = null;
    this.requestedFloor = false; // has this person pressed the button requesting their floor once they boarded?
    this.anim = null;
};

// manages movement of all persons across floors and into and out of the elevator
var PersonManager = function() {
    this.nextPersonId = 0;
    this.persons = [];
    this.timerClients = []; // persons and person manager may need something done (such as moving X coordinate) when the timer fires
    this.spriteGroup = null;
    this.standingFrames = [2, 13, 39, 52, 58, 84]; // frames showing the person in random standing poses
    this.timer = null; // timers used in PersonManager

    this.initialize = function() {
        this.spriteGroup = game.add.group();
        this.spriteGroup.z = 3;
        this.timerClients.push(this);
        this.timer = null;

        // add all event handlers
        this.addListener('add-person', this.addPerson);
        this.addListener('elev-called', this.elevCalled);
        this.addListener('elev-opening', this.elevOpening);
        this.addListener('elev-opened', this.elevOpened);
        this.addListener('elev-closed', this.elevClosed);

        // start a timer every n msecs which does actions as required on all persons
        this.stopTimer();
        this.intervalID = window.setInterval(this._processTimer, 20);
    };

    this.shutdown = function() {
        this.stopTimer();
        // remove all persons
        _.each(this.persons, function(p) {if (p.sprite !== null) p.sprite.destroy();});
        this.persons = []; // clear out the array
        this.timerClients = [this]; // clear out the array except for this
        this.timer = null; // dont fire any timers for this object either
    };

    // stop the timer when the game is finished or is reset
    this.stopTimer = function() {
        if (typeof(this.intervalID) != 'undefined' && this.intervalID != null) {
            window.clearInterval(this.intervalID);
            this.intervalID = null;
        }
    };

    this._processTimer = function() {
        // process each timer client by checking if they have a timer callback set. If they do, call the callback and keep the callback on/off based on result from the callback function
        _.each(personManager.timerClients, function(p) {
            t = p.timer;
            if (t !== null && t.type == 'countdown') { // a countdown timer is fired after n intervals
                if (t.countdown === 0) { // n intervals done
                    t.callback(p, t.ctx); // invoke the callback
                    if (t.id == p.timer.id) p.timer = null; // null at end of countdown, but only if the timer hasnt been substituted during the call
                } else t.countdown--; // one more interval done
            } else if (t !== null && t.type == 'loop') {
                ret = t.callback(p, t.ctx); // invoke the callback and check the return value
                if (!ret && t.id == p.timer.id) p.timer = null; // if the callback had returned true, it means the callbacks should continue, else false means stop further callbacks (unless the callback changed the timer itself)
            }
        });
    };

    // code that handles a person entering the floor and then 'calling' the elevator
    this._enterAndCall = function(p) {
        if (p.anim !== null) {p.anim.stop(); p.anim = null;}
        p.anim = p.sprite.animations.play('right'); // start playing the move of the person to the right

        // use a timer to also move the X coordinate of the sprite up to the call button
        p.timer = {id:_.uniqueId(), type:'loop', callback:function(p) {
            p.sprite.x++;
            if (p.sprite.x >= __c_.maxX-187) {
                if (p.anim !== null) {p.anim.stop(); p.anim = null;}
                p.anim = p.sprite.animations.play('call'); // start playing the person calling the elevator

                // a bit after starting the call anim, post an event saying the call button has been pressed on this floor
                p.timer = {id:_.uniqueId(), type:'countdown', countdown:50, callback: function(p) {floorManager.emit('elev-called', p.onFloor, p.direction);}};
            }
            return true; // continue playing the callbacks
        }};
    };

    // code that handles a person waiting in a pre-determined spot for the elevator to arrive on the floor
    this._wait = function(p, targetX) {
        if (p.anim !== null) {p.anim.stop(); p.anim = null;}

        // pick a spot where this person should go to, between the X coordinates from screen left upto a little before the elevator, queue up from close to the elevator
        // find locations of other persons who are competing for the space
        otherPx = [];
        _.each(this.persons, function(p1) {if (p1.state == 'waiting' && p1.onFloor == p.onFloor) otherPx.push(p1.waitSpot);});

        p.waitSpot = this._findSpot(0, __c_.maxX-210, otherPx, 'r2l', 64);
        p.state = "waiting"; // will there be a problem if we assign this state before we actually get to the waiting spot?

        // animate the person moving left or right depending on where they current are compared to target waitspot
        if (p.sprite.x > p.waitSpot) p.anim = p.sprite.animations.play('left');
        else p.anim = p.sprite.animations.play('right');

        // use a timer to also move the X coordinate of the sprite up slowly to the decided wait spot
        p.timer = {id:_.uniqueId(), type:'loop', callback:function(p) {
            if (p.sprite.x == p.waitSpot) { // we got where we wanted to be, stop moving
                if (p.anim !== null) {p.anim.stop(); p.anim = null;}
                // choose a random waiting pose for the person to finally be in
                p.sprite.frame = personManager.standingFrames[game.rnd.integerInRange(0,personManager.standingFrames.length)];
                return false; // end the callbacks
            } else p.sprite.x += p.sprite.x < p.waitSpot ? 1 : -1; // keep moving
            return true; // continue playing the callbacks
        }};
    };

    // allocate spots for each person (either to wait on the floor or to stand inside the elevator) such that there is adequate gap between people (just like people have 'personal space' in real life)
    this._findSpot = function(leftX, rightX, otherPx, dir, space) {
        _dir = dir == 'l2r';
        l = leftX;
        r = rightX;

        // generate 3 layers of 'standard' positions to fit people in, from right to left or left to right, leaving the appropriate space as required
        // when generating the next layer, adjust the X coord so that they are in-between people at the previous layer and not directly on top of them
        for (level = 1;level <= 3; ++level) {
            for (x = _dir ? l : r; _dir ? x < r : x > l; x = x + (_dir ? space : -space)) if (_.indexOf(otherPx,Math.floor(x)) == -1) {return Math.floor(x);} // we found an empty spot, return it
            l = leftX + space/Math.pow(2,level);
            r = rightX - space/Math.pow(2,level);
        }

        return game.rnd.integerInRange(leftX,rightX); // none of the standard spots are available, so we are clearly packed in, return a random spot
    };

    // callback to process the event that an elevator has been called on a given floor
    this.elevCalled = function(floorNumber, direction) {
        // an elevator has been called on that floor in that direction
        // send all such people waiting
        _.each(this.persons, function(p) {if (p.onFloor == floorNumber && p.state == 'entering' && p.direction == direction) personManager._wait(p, 100);});
    };

    // callback to process the event that an elevator is opening on a given floor
    this.elevOpening = function(floorNumber, direction) {
        // an elevator is opening on this floor, find all persons on this floor waiting for the elevator in that direction
        // and make them all point to the elevator such that they seem to ready for it to open
        // also look if someone is on the elevator (state == boarded) and this is their targetfloor, then we mark them as gettingoff, so they can be shown to exit the elevator
        found = false;
        _.each(this.persons, function(p) {
            if (p.onFloor == floorNumber && p.state == 'waiting' && p.direction == direction) {
                found = true;
                p.state = 'ready';
                // if they are animating or moving, stop all that
                if (p.anim !== null) {p.anim.stop(); p.anim = null;}
                // 59 is a frame that shows the person looking towards the right (like where the elevator would be) after a random interval
                p.timer = {id:_.uniqueId(), type:'countdown', countdown:game.rnd.integerInRange(5,100), callback:function(p){p.sprite.frame = 59;}};
            }

            // change state of people on the elevator who reached their destination floor from boarded to gettingoff
            if (p.targetFloor == floorNumber && p.state == 'boarded') {
                found = true;
                p.state = 'gettingoff';
            }
        });

        // if someone is going to get on or get off, open the elevator
        if (found) {
            // there may be people on the elevator, we need to move their Y coordinate such that they show up on that floor
            // however, we need to put a small delay or else the sprites will show up before the elevator door starts opening
            this.timer = {id:_.uniqueId(), type:'countdown', countdown:5, callback:function(m) {
                // what is the new Y coordinate of sprites in the elevator
                newY = __c_.maxY() -64 -2 -floorNumber*__c_.floorH*__c_.tilePix;
                // move the Y coordinate of anyone who is in the elevator
                _.each(m.persons, function(p) {if (p.state == 'boarded' || p.state == 'gettingoff') p.sprite.y = newY;});
            }};

            floorManager.openElevator(floorNumber);
        }
    };

    // callback to process the event that an elevator has fully opened on a given floor
    this.elevOpened = function(floorNumber) {
        window.console.log('person-elevator opened');
        game.world.bringToTop(this.spriteGroup); // or else this will be hidden behind the elevator door graphics
        // an elevator has opened on this floor, find all persons on this floor who are in ready state
        // and make them all walk into the elevator
        direction = null; // save the direction so we can send the elevator in that direction once boarding is complete
        
        // create a function which we reuse in the loop, which collects spots on the elevator that have been 'taken'
        pFnSpot = function(p) {
            if (p.state == 'boarding') this.otherPx.push(p.waitSpot); // spot we have allocated to someone boarding
            else if (p.state == 'boarded') this.otherPx.push(p.sprite.x); // spot occupied by someone already in elevator from a previous floor
        };

        // create a function we will reuse in the loop below which handles the movement of the sprite to the elevator
        pFnBoard = function(p) {
            if (p.sprite.x == p.waitSpot) {
                p.anim.stop();
                p.anim = p.sprite.animations.play('enterelev'); // play the anim of the person entering the elevator
                p.timer = {id:_.uniqueId(), type:'countdown', countdown:100, callback:function(p){p.state = 'boarded';}};// change state to boarded after giving time for the animation to end
            } else p.sprite.x++;
            return true;
        };

        // move each of the people waiting for the elevator in that direction to a spot inside the elevator
        for (i = 0, len = this.persons.length; i < len; ++i) {
            p = this.persons[i];
            if (p.onFloor == floorNumber && p.state == 'ready') {
                // pick a spot where this person should go to, between the X coordinates of the elevator left and right
                // find locations of other persons who are competing for the space inside the elevator
                otherPx = [];
                _.each(this.persons, pFnSpot, {otherPx:otherPx});
                p.waitSpot = this._findSpot(__c_.maxX-145, __c_.maxX-50, otherPx, 'l2r', 30);

                p.state = 'boarding';
                direction = p.direction; // can take any person's direction since they will board only if the elevator is in their direction
                p.anim = p.sprite.animations.play('right'); // start playing the move of the person to the right since all waiting people will be to the left of the elevator

                // use a timer to also move the X coordinate of the sprite up to the elevator, but some slow, some fast
                p.timer = {id:_.uniqueId(), type:'loop', callback:pFnBoard};
            }
        }

        // also for all persons who are getting off, animate them so they come out and leave the floor
        _.each(this.persons, function(p) {
            if (p.state == 'gettingoff') personManager._exitElevator(p);
        });

        // check to see if all persons have boarded
        this.timer = {id:_.uniqueId(), type:'loop', callback:function(m) {
            for (i = 0, len = m.persons.length; i < len; ++i) {
                p = m.persons[i];
                if ((p.onFloor == floorNumber && p.state == 'boarding') || p.state == 'gettingoff') return true; // there is someone who is still boarding or getting off
            }
            // no one is in boarding or getting off state, lets close the elevator and start moving in the direction
            floorManager.emit('elev-boarded', floorNumber, direction);
            return false;
        }};
    };

    // callback to process the event that an elevator has fully closed on a given floor
    this.elevClosed = function(floorNumber, direction) {
        // the elevator has closed
        // each person who has boarded will then press the unique floor they want, but only if they havent already pressed it before (TODO: randomize order in which they want to press)
        floorsWanted = [];
        _.each(this.persons, function(p) {
            if (p.state == 'boarded') {
                if (!p.requestedFloor) { // a person who boarded on a previous floor shouldn't press the floor request button again just because the elevator stopped to pick someone up on an intermediate floor
                    floorsWanted.push(p.targetFloor);
                    p.requestedFloor = true;
                }
            }
        });

        if (floorsWanted.length > 0) _.each(_.uniq(floorsWanted), function(floor) {controller.emit('floor-requested', floor+1);}); // tell the controller each of the floor requests
    };

    // have this person exit the elevator
    this._exitElevator = function(p) {
        p.anim = p.sprite.animations.play('leaveelev'); // play the anim of the person leaving the elevator
        p.timer = {id:_.uniqueId(), type:'countdown', countdown:100, callback:this._leaveFloor};// leave the floor after giving 2 secs for the previous animation to end
    };

    // have this person leave the floor
    this._leaveFloor = function(p) {
        p.anim = p.sprite.animations.play('left'); // start playing the move of the person to the left (to exit the floor)
        // use a timer to also move the X coordinate of the sprite out the floor by moving left, at a random speed, some fast some slow
        p.timer = {id:_.uniqueId(), type:'loop', callback:function(p) {
            if (game.rnd.integerInRange(0,99) > 70) return true; // dont move the sprite (randomly)

            p.sprite.x--;
            if (p.sprite.x <= __c_.maxX-187) {
                p.state = 'exited'; // now that they are past the call button, we can treat the person as exited
            }

            if (p.sprite.x <= -50) { // they have left the floor
                // remove animation for this person and delete the sprite
                if (p.anim !== null) {p.anim.stop(); p.anim = null;}
                p.sprite.destroy();
                return false; // end the callbacks
            }
            return true; // continue callbacks
        }};
    };

    // add a person to the game
    this.addPerson = function(fromFloor, toFloor) {
        p = new Person(fromFloor, toFloor);
        this.persons.push(p);
        this.timerClients.push(p); // manage timers for this person

        // the 'virtual' representation of the person in the game is the sprite of a human
        p.sprite = game.add.sprite(-60, __c_.maxY() -64 -2 -fromFloor*__c_.floorH*__c_.tilePix, 'human', 26);
        this.spriteGroup.add(p.sprite);

        // specify which frames of the human sprite represent what type of animation, such as moving to the right, left, entering an elevator etc
        p.sprite.animations.add('right', [143, 144, 145, 146, 147, 148, 149, 150], 10, true);
        p.sprite.animations.add('left', [117, 118, 119, 120, 121, 122, 123, 124], 10, true);
        p.sprite.animations.add('call', [156, 157, 158, 159, 160, 161, 156], 5 );
        p.sprite.animations.add('enterelev', [104, 105, 106, 107, 108, 109, 110, 111, 112, 26], 5);
        p.sprite.animations.add('leaveelev', [130, 131, 132, 133, 134, 135, 136, 137, 138, 13], 5);

        // check if the call button has already been pressed for that direction
        // if so, just enter and wait, else go to press the button
        if (floorManager.getProperty(fromFloor, p.direction + 'Called')){
            this._wait(p, 100);
        }
        else this._enterAndCall(p);
    };
};

// allow for event processing for this object
PersonManager.prototype = new EventEmitter();

var personManager = new PersonManager();
