/**
 * Create a namespace for the game itself.
 */
var ElevGame = {
    // Main Blockly workspace.
    workspace : null,

    // load all custom functions available to the user of this game
    loadBlocks : function(level) {
        Blockly.Blocks['storeCall'] = {
            init: function() {
                this.appendDummyInput().appendField("storeCall");
                this.appendValueInput("floor").setCheck("Number");
                this.appendValueInput("direction");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(65);
                this.setTooltip('storeCall');
            }
        };

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

        Blockly.Blocks['openElevator'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::openElevator_name'));
                if (level != 1 && level != 2 && level != 3 && level != 4 && level != 5 && level != 6 && level != 7) {
                    this.appendValueInput("direction");
                }
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                if (level == 1 || level == 2 || level == 3 || level == 4 || level == 5 || level == 6 || level == 7) this.setTooltip(__t('blocks::openElevator_tipS'));
                else this.setTooltip(__t('blocks::openElevator_tip'));
            }
        };

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

        Blockly.Blocks['requestCount'] = {
            init: function() {
                this.appendDummyInput().appendField(__t('blocks::requestCount_name'));
                if (level != 4) this.appendValueInput("floor").setCheck("Number");
                this.setOutput(true, "Number");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(120);
                if (level == 4) this.setTooltip(__t('blocks::requestCount_tipS'));
                else this.setTooltip(__t('blocks::requestCount_tip'));
            }
        };

        Blockly.Blocks['callCount'] = {
            init: function() {
                this.appendDummyInput().appendField("callCount");
                this.appendValueInput("floor").setCheck("Number");
                this.appendValueInput("direction");
                this.setOutput(true, "Number");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(65);
                this.setTooltip('callCount');
            }
        };

        Blockly.Blocks['getCallDirection'] = {
            init: function() {
                this.appendDummyInput().appendField("getCallDirection");
                this.appendValueInput("floor").setCheck("Number");
                this.setOutput(true, "String");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(65);
                this.setTooltip('getCallDirection');
            }
        };

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

        Blockly.Blocks['clearCall'] = {
            init: function() {
                this.appendDummyInput().appendField("clearCall");
                this.appendValueInput("floor").setCheck("Number");
                this.appendValueInput("direction");
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(65);
                this.setTooltip('clearCall');
            }
        };

        Blockly.Blocks['request_queue_not_empty'] = {
            init: function() {
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::request_queue_not_empty_name'));
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::request_queue_not_empty_tip'));
            }
        };

        Blockly.Blocks['request_queue_not_empty_curr_floor'] = {
            init: function() {
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::request_queue_not_empty_curr_floor_name'));
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::request_queue_not_empty_curr_floor_tip'));
            }
        };

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

        Blockly.Blocks['elev_req_condn'] = {
            init: function() {
                var REQCONDN = [['no travelers','no'], ['travelers to any floor', 'any'], ['travelers to this floor', 'floor']];
                this.setColour(60);
                this.appendDummyInput()
                    .appendField(__t('blocks::elev_req_condn_name'))
                    .appendField(new Blockly.FieldDropdown(REQCONDN), 'REQ');
                this.setOutput(true, 'Boolean');
                this.setTooltip(__t('blocks::elev_req_condn_tip'));
            }
        };

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

        Blockly.JavaScript['storeCall'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'storeCall(' + value_floor + ',' + value_direction + ');\n';
            return code;
        };

        Blockly.JavaScript['storeRequest'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'storeRequest(' + value_floor + ');\n';
            return code;
        };

        Blockly.JavaScript['openElevator'] = function(block) {
            var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || '';
            return 'openElevator(' + value_direction + ');\n';
        };

        Blockly.JavaScript['goToFloor'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'goToFloor(' + value_floor + ');\n';
            return code;
        };

        Blockly.JavaScript['requestCount'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = '';
            if (value_floor != '') code = 'requestCount(' + value_floor + ')';
            else code = 'requestCount()';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        Blockly.JavaScript['callCount'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = '';
            if (value_floor != '' && value_direction != '') code = 'callCount(' + value_floor + ',' + value_direction + ')'; // both values passed in
            else code = 'callCount(' + value_floor + value_direction + ')'; // only one or none of the values are being passed in, no need for a comma
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        Blockly.JavaScript['getCallDirection'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'getCallDirection(' + value_floor + ')';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        Blockly.JavaScript['nextRequestedFloor'] = function(block) {
            var code = 'nextRequestedFloor()';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        Blockly.JavaScript['clearCall'] = function(block) {
            var value_floor = Blockly.JavaScript.valueToCode(block, 'floor', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var value_direction = Blockly.JavaScript.valueToCode(block, 'direction', Blockly.JavaScript.ORDER_ATOMIC) || '';
            var code = 'clearCall(' + value_floor + ',' + value_direction + ');\n';
            return code;
        };

        Blockly.JavaScript['request_queue_not_empty'] = function(block) {
            var code = 'requestCount() > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        Blockly.JavaScript['request_queue_not_empty_curr_floor'] = function(block) {
            var code = 'requestCount(floor) > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        Blockly.JavaScript['dir_choice'] = function(block) {
            var argument = block.getFieldValue('DIR');
            var code = 'direction == \'' + argument + '\'';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        Blockly.JavaScript['elev_req_condn'] = function(block) {
            var argument = block.getFieldValue('REQ');
            var code = "";
            if (argument == 'no') code = 'requestCount() == 0';
            else if (argument == 'any') code = 'requestCount() > 0';
            else if (argument == 'floor') code = 'requestCount(floor) > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        Blockly.JavaScript['call_req_condn'] = function(block) {
            var argument = block.getFieldValue('CALL');
            var code = "";
            if (argument == 'no') code = 'callCount() == 0';
            else if (argument == 'any') code = 'callCount() > 0';
            else if (argument == 'floor') code = 'callCount(floor) > 0';
            else if (argument == 'dir') code = 'callCount(floor, direction) > 0';
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        Blockly.JavaScript['getCallFloor'] = function(block) {
            var code = 'getCallFloor()';
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

    },

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

    showCode : function() {
        var code_ = Blockly.JavaScript.workspaceToCode(ElevGame.workspace);
        window.alert(code_);
    },

    showXML : function() {
        var xml = Blockly.Xml.workspaceToDom(ElevGame.workspace);
        var xml_text = Blockly.Xml.domToText(xml);
        window.alert(xml_text);
    },

    reset : function() {
        controller.shutdownAll();
    },

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
