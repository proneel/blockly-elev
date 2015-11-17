var __c_ = {
    maxX : 480,
    numFloors : 5,
    floorH : 4, // floors are 4 tiles high
    tilePix : 32, // tile width and height (square)
    maxY : function() {
        return this.floorH*this.tilePix*this.numFloors; // total height of game
    }
};
