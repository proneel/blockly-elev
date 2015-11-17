var DisplayInit = {

    preLoad : function() {
        game.load.image('tile', 'images/tile.png');
        game.load.image('elev', 'images/elevinside.png');

        game.load.image('upon', 'images/elevupon.png');
        game.load.image('downoff', 'images/elevdownoff.png');
        game.load.image('upoff', 'images/elevupoff.png');
        game.load.image('downon', 'images/elevdownon.png');

        game.load.image('0', 'images/0.png');
        game.load.image('1', 'images/1.png');
        game.load.image('2', 'images/2.png');
        game.load.image('3', 'images/3.png');
        game.load.image('4', 'images/4.png');
        game.load.image('5', 'images/5.png');
        game.load.image('6', 'images/6.png');
        game.load.image('7', 'images/7.png');
        game.load.image('8', 'images/8.png');
        game.load.image('9', 'images/9.png');

        game.load.spritesheet('human', 'images/human.png', 64, 64);
    },

    create : function() {
        //  Creates a blank tilemap
        map = game.add.tilemap();

        //  Add a Tileset image to the map
        map.addTilesetImage('tile');

        //  In this case the map is tilePix-by-tilePix tiles in size and the tiles are tilePix-by-tilePix pixels in size.
        layer1 = map.create('level1', __c_.tilePix, __c_.tilePix, __c_.tilePix, __c_.tilePix);
        //  Resize the world
        layer1.resizeWorld();

        //  Creates a new blank layer and sets the map dimensions.
        layer2 = map.createBlankLayer('level2', __c_.tilePix, __c_.tilePix, __c_.tilePix, __c_.tilePix);

        graphics = game.add.graphics();

        DisplayInit.paintFloors();
        // can initialize only after painting the basic floors, or else doors will be hidden behind
        floorManager.initialize();
        personManager.initialize();
        controller.initialize();
    },

    paintFloors : function() {
        for (floorNumber = 0; floorNumber < __c_.numFloors; ++floorNumber) {
            mainTileToUse = floorNumber%5; //game.rnd.integerInRange(0,7); // there are 8 basic wall shades which are the first 8 tiles in the sheet
            otherTileToUse = floorNumber%4 + 5; //game.rnd.integerInRange(2,17); // game.rnd.integerInRange(8,17); // there are 10 other patterns following the 8 basic wall shades, use one per floor
            for (x = 0; x < __c_.maxX/__c_.tilePix; ++x) {
                for (y = 1; y <= __c_.floorH; ++y) {
                    // use another tile for alternate pattern of random tiles in the middle rows of a floor
                    tileIdx = (floorNumber%2 === 0 && x%2 === 0 && x <= 8 && y == __c_.floorH/2) || (floorNumber%2 === 0 && x%2 == 1 && x <= 8 && y == __c_.floorH/2+1) || (floorNumber%2 == 1 && x%2 === 0 && x <= 8 && y == __c_.floorH/2+1) || (floorNumber%2 == 1 && x%2 == 1 && x <= 8 && y == __c_.floorH/2) ? otherTileToUse : mainTileToUse;
                    map.putTile(tileIdx, x, (__c_.maxY()/__c_.tilePix)-y-floorNumber*__c_.floorH, layer2);
                }
            }

            graphics.lineStyle(4, 0x003300, 1); // thick green rectangle depicting a floor
            graphics.drawRect(2, __c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber+1))+2, __c_.maxX-4, __c_.tilePix*__c_.floorH-4);

            if (floorNumber !== 0) {
                graphics.lineStyle(1, 0xb2b2b2, 1); // grey line dividing floors
                graphics.moveTo(4,__c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber)));
                graphics.lineTo(__c_.maxX-4,__c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber)));
            }

            graphics.lineStyle(6, 0xffffff, 1); // thick green rectangle depicting a floor

            // elevator inside width 130, height 98 and 10 pixels from right end of floor
            elev = game.add.sprite(__c_.maxX-134, __c_.maxY()-(__c_.tilePix*__c_.floorH*(floorNumber+1))+26, 'elev');
        }
    },

    update : function() {
    }

};
