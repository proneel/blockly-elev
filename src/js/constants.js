var __c_ = {
    maxX : 480, // width of the panel showing the floor and the elevators
    numFloors : 5, // number of floors in this game
    floorH : 4, // floors are 4 tiles high
    tilePix : 32, // tile width and height (square)
    maxY : function() {
        return this.floorH*this.tilePix*this.numFloors; // total height of game
    }
};
