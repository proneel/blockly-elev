// Object that manages the blockly block definition and the javascript code generated when those blocks are used
var ElevGame = {
    // Main Blockly workspace.
    workspace : null,

    // load all custom functions available to the user of this game
    loadBlocks : function(level) {
        // storeRequest helps a blockly coder store a request in queue
        Blockly.Blocks['storeRequest'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::storeRequest_name'));
                this.appendValueInput("floor").setCheck("Number");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                this.setTooltip(__t('blocks::storeRequest_tip'));
            }
        };

        // openElevator helps a blockly coder open the elevator to let out a passenger or let in a passenger on a floor
        Blockly.Blocks['openElevator'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::openElevator_name'));
                if (level == 8) {
                    this.appendValueInput("direction");
                }
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                if (level != 8) this.setTooltip(__t('blocks::openElevator_tipS'));
                else this.setTooltip(__t('blocks::openElevator_tip'));
            }
        };

        // goToFloor helps a blockly coder send the elevator to a specific floor
        Blockly.Blocks['goToFloor'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::goToFloor_name'));
                this.appendValueInput("floor").setCheck("Number");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                this.setTooltip(__t('blocks::goToFloor_tip'));
            }
        };

        // getCallDirection helps a blockly coder get the direction (up/down) of a call on a given floor
        Blockly.Blocks['getCallDirection'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::getCallDirection_name'));
                this.appendValueInput("floor").setCheck("Number");
                this.setOutput(true, "String");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                this.setTooltip(__t('blocks::getCallDirection_tip'));
            }
        };

        // nextRequestedFloor helps a blockly coder get the next floor that a person may have requested from inside the elevator
        Blockly.Blocks['nextRequestedFloor'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::nextRequestedFloor_name'));
                this.setOutput(true, "Number");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                this.setTooltip(__t('blocks::nextRequestedFloor_tip'));
            }
        };

        // getCallFloor helps a blockly coder get the oldest called floor from the queue
        Blockly.Blocks['getCallFloor'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::getCallFloor_name'));
                this.setOutput(true, "Number");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                this.setTooltip(__t('blocks::getCallFloor_tip'));
            }
        };

        // request_queue_not_empty helps a blockly coder handle 'if' conditions based on whether there are requests in the queue to process or not
        Blockly.Blocks['request_queue_not_empty'] = {
            init: function() {
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::request_queue_not_empty_name'));
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::request_queue_not_empty_tip'));
            }
        };

        // request_queue_not_empty_curr_floor helps a blockly coder handle 'if' conditions based on whether there are requests in the queue to process or not, specific to the current floor the elevator is on
        Blockly.Blocks['request_queue_not_empty_curr_floor'] = {
            init: function() {
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::request_queue_not_empty_curr_floor_name'));
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::request_queue_not_empty_curr_floor_tip'));
            }
        };

        // a simple 'if' condition that can be used by a blockly coder to process a condition based on the direction of the elevator (up/down)
        Blockly.Blocks['dir_choice'] = {
            init: function() {
                var DIRECTION = [['up','up'], ['down', 'down']];
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::dir_choice_name'))
                    .appendField(new Blockly.FieldDropdown(DIRECTION), 'DIR');
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::dir_choice_tip'));
            }
        };

        // a simple 'if' condition that can be used by a blockly coder to process a condition based on whether there are travelers inside the elevator at this time
        // and destined for any floor, or that specific floor, or any but that specific floor
        Blockly.Blocks['elev_req_condn'] = {
            init: function() {
                var REQCONDN = [['no travelers','no'], ['travelers to any floor', 'any'], ['travelers to this floor', 'floor'], ['travelers to other floors', 'other']];
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::elev_req_condn_name'))
                    .appendField(new Blockly.FieldDropdown(REQCONDN), 'REQ');
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::elev_req_condn_tip'));
            }
        };

        // a simple 'if' condition that can be used by a blockly coder to process a condition based on whether there are active calls for the elevator
        // on any floor, on the current floor or in the current floor and specifically in the travel direction of the elevator
        Blockly.Blocks['call_req_condn'] = {
            init: function() {
                var CALLCONDN = [['no calls','no'], ['call on any floor', 'any'], ['call on this floor', 'floor'], ['call on this floor in travel direction', 'dir']];
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::call_req_condn_name'))
                    .appendField(new Blockly.FieldDropdown(CALLCONDN), 'CALL');
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::call_req_condn_tip'));
            }
        };

        // simply make a call to a proxy function which will call the controller to actually store the request
        Blockly.JavaScript['storeRequest'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'storeRequest(' + value_floor + ');\n';
            return code;
        };

        // simply make a call to a proxy function which will call the controller to open the elevator
        Blockly.JavaScript['openElevator'] = function(block) {
            var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || '';
            return 'openElevator(' + value_direction + ');\n';
        };

        // simply make a call to a proxy function which will call the controller to go to a specific floor
        Blockly.JavaScript['goToFloor'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'goToFloor(' + value_floor + ');\n';
            return code;
        };

        // simply make a call to a proxy function which will call the controller to get the call direction of the elevator on a specific floor
        Blockly.JavaScript['getCallDirection'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'getCallDirection(' + value_floor + ')';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        // simply make a call to a proxy function which will call the controller to get the next requested floor from the queue
        Blockly.JavaScript['nextRequestedFloor'] = function(block) {
            var code = 'nextRequestedFloor()';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        // simply check the size of the request queue
        Blockly.JavaScript['request_queue_not_empty'] = function(block) {
            var code = 'requestCount() > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        // simply check the size of the request queue for this specific floor
        Blockly.JavaScript['request_queue_not_empty_curr_floor'] = function(block) {
            var code = 'requestCount(floor) > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        // simply check if the direction is as desired
        Blockly.JavaScript['dir_choice'] = function(block) {
            var argument = block.getFieldValue('DIR');
            var code = 'direction == \'' + argument + '\'';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        // simply check counts of requests based on the floor (or generically)
        Blockly.JavaScript['elev_req_condn'] = function(block) {
            var argument = block.getFieldValue('REQ');
            var code = "";
            if (argument == 'no') code = 'requestCount() == 0';
            else if (argument == 'any') code = 'requestCount() > 0';
            else if (argument == 'floor') code = 'requestCount(floor) > 0';
            else if (argument == 'other') code = 'requestCount(floor) != requestCount()';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        // simply check counts of queued calls based on the floor (and/or direction)
        Blockly.JavaScript['call_req_condn'] = function(block) {
            var argument = block.getFieldValue('CALL');
            var code = "";
            if (argument == 'no') code = 'callCount() == 0';
            else if (argument == 'any') code = 'callCount() > 0';
            else if (argument == 'floor') code = 'callCount(floor) > 0';
            else if (argument == 'dir') code = 'callCount(floor, direction) > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        // simply make a call to a proxy function which will call the controller to get the next call from the queue
        Blockly.JavaScript['getCallFloor'] = function(block) {
            var code = 'getCallFloor()';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

    },

    // the javascript generated from the blockly code does not have the right hooks in place to invoke the controller methods
    // generate those hooks and add it to the code that is sent for execution
    // also the controller needs to be initialized and RunGame needs to start adding persons to floors to kick things off
    modifyCodeBeforeExec : function(code) {
        code = code.concat("\nstoreCall = function(floor, direction) {controller.store_call(floor,direction);}");
        code = code.concat("\nstoreRequest = function(floor) {controller.store_request(floor);}");
        code = code.concat("\nopenElevator = function(direction) {controller.open_elevator(direction);}");
        code = code.concat("\ngoToFloor = function(floor) {controller.go_to_floor(floor);}");
        code = code.concat("\nrequestCount = function(floor) {return controller.request_count(floor);}");
        code = code.concat("\ncallCount = function(floor, direction) {return controller.call_count(floor, direction);}");
        code = code.concat("\ngetCallDirection = function(floor) {return controller.get_call_direction(floor);}");
        code = code.concat("\ngetCallFloor = function() {return controller.get_call_floor();}");
        code = code.concat("\nnextRequestedFloor = function() {return controller.next_requested_floor();}");
        code = code.concat("\nclearCall = function(floor, direction) {controller.clear_call(floor, direction);}");
        code = code.concat("\ncontroller._eventElevatorCalled = elevator_called;");
        code = code.concat("\ncontroller._eventFloorRequested = floor_requested;");
        if (__level != 1) code = code.concat("\ncontroller._eventFloorArrived = floor_arrived;");
        if (__level != 1 && __level != 2 && __level != 3) code = code.concat("\ncontroller._eventElevClosed = elevator_door_closed;");
        code = code.concat("\ncontroller.initializeAll();");
        code = code.concat("\nRunGame.init();");

        return code;
    },

    // get the generated javascript from Blockly workspace to show it
    showCode : function() {
        var code_ = Blockly.JavaScript.workspaceToCode(ElevGame.workspace);
        window.alert(code_);
    },

    // get the generated xml from Blockly workspace to show it
    showXML : function() {
        var xml = Blockly.Xml.workspaceToDom(ElevGame.workspace);
        var xml_text = Blockly.Xml.domToText(xml);
        window.alert(xml_text);
    },

    // callback on reset button click
    reset : function() {
        controller.shutdownAll();
    },

    // execute the blockly (plus modified for hooks) code, this is the callback from the Run Code button click
    runJS : function() {
        var code = Blockly.JavaScript.workspaceToCode(ElevGame.workspace);
        try {
            code = ElevGame.modifyCodeBeforeExec(code);
            eval(code);
        } catch (e) {
            /* TODO: fix i18n alert(MSG['badCode'].replace('%1', e));*/
            alert(e);
        }
    },

    // Initialize Blockly and the game.  Called on page load.
    initBlockly : function() {
        ElevGame.loadBlocks(__level); // load our custom functions

        // load the toolbox XML delivered from the server, the one for the appropriate level
        nanoajax.ajax({url:'res/toolbox' + __level + '.xml'}, function (code, responseText) {
            ElevGame.workspace = Blockly.inject('blocklyDiv', {media: 'media/', toolbox: Blockly.Xml.textToDom(responseText), scrollbars : true});

            // load the startBlocks XML delivered from the server
            nanoajax.ajax({url:'res/startBlocks' + __level + '.xml'}, function (code, responseText) {Blockly.Xml.domToWorkspace(ElevGame.workspace,Blockly.Xml.textToDom(responseText));});
        });
    }
};
