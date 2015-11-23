var messages = {

    blocks: {
        openElevator_name : 'open elevator',
        openElevator_tip : 'Open the elevator at the desired floor and indicate the direction to pick up passengers',
        openElevator_tipS : 'Open the elevator to pick up passengers',
        goToFloor_name : 'go to floor',
        goToFloor_tip : 'Send the elevator to a desired floor. Make sure you pass the floor as a parameter!',
        storeRequest_name : 'queue request',
        storeRequest_tip : 'Queue the traveler\'s request into the elevator\'s "memory". Don\'t worry, we can unqueue this at the appropriate time. Make sure you pass the floor as a parameter!',
        nextRequestedFloor_name : 'earliest request',
        nextRequestedFloor_tip : 'Pick up the earliest (oldest) floor request from the elevator\'s "memory". This would be one that has been queued by queue request.',
        requestCount_name : 'request count',
        requestCount_tipS : 'Count of requests made by travelers inside the elevator and store in its "memory". Check that the count of requests is 1 or more before calling \'earliest request\'.',
        requestCount_tip : 'Count of requests made by travelers inside the elevator and store in its "memory". This procedure can be called with or without the floor parameter. If called without, it will give the count of all requests in the queue. If called with a floor parameter, it will give the count of requests on just that floor! Check that the count of requests is 1 or more before calling \'earliest request\'.',
        request_queue_not_empty_name : 'request queue not empty',
        request_queue_not_empty_tip : 'There are active requests made by travelers inside the elevator and those travelers haven\'t yet been taken to their destination floor. Use this in an \'if\' or \'else-if\' block to enter instructions based on this state.',
        request_queue_not_empty_curr_floor_name : 'traveler(s) to this floor',
        request_queue_not_empty_curr_floor_tip : 'There are one or more travelers inside the elevator who wish to get off at this floor. Use this in an \'if\' or \'else-if\' block to enter instructions based on this state.',
        dir_choice_name : 'elevator direction',
        dir_choice_tip : 'Use this in an \'if\' or \'if-else\' block to enter instructions based on the direction of the elevator (up or down).'
    },

    info: {
        1: '<p>The panel on the left of this game shows a building with 5 floors and a closed elevator door on each floor</p> </p><p>As soon as the game starts, you will see a person arrive on floor 1 and press the &quot;up&quot; button to call the elevator.</p></p>Your task is to fill in the &quot;elevator called&quot; procedure on the right to respond to that call.</p><p>After the person enters the elevator they will press a button indicating the desired floor they wish to travel to. Your also need to fill in the &quot;floor requested&quot; procedure on the right to respond to that request</p><p>Good luck and press the Help button if you want a hint</p> <p>Do not worry, it really needs only 2 lines of code to work! Once you move the blocks into the 2 procedures, you can view your code with &quot;View Code&quot; or run the game with &quot;Run Code&quot;</p><p>How exciting :)</p>',
        2: '<p>On this level, we make it a teeny bit difficult. You will see the person arrive on the second floor, while the elevator is idle on the first. Thats not too bad, you already know how to send the elevator to that floor, dont you?</p></p>We also add one more procedure to fill in this time, &quot;floor arrived&quot;. You need to fill in what one does when the elevator arrives at the floor, perhaps just open it?</p> <p>Good luck and press the Help button if you want a hint</p>',
        3: '<p>We had only one person in the first two levels. Now we have two, so double the fun!</p><p>You will see a person arrive on the first floor and travel to the fifth. Soon after you\'ve successfully moved that person to the destination a second person shows up, this time on the second floor!</p> <p>Good luck and press the Help button if you want a hint</p>',
        4: '<p>Now on this level, we will work with our first set of co-travelers!</p><p>We have two persons starting out on the first floor, but one going to the third and the second going all the way to the fifth.</p><p>Can you send them safely to their desired destinations?</p> <p>Good luck and press the Help button if you want a hint</p>',
        5: '<p>In the previous level, we did get both persons safely to their desired destinations, but it probably wasn\'t the best way ... we went all the way up to fifth and then down to third, just because the guy for fifth pushed the button first, getting to be first in queue!</p> Now on this level, let us optimize that so we\'ll do our stopover at third, letting that person get off and then make our way to fifth. That shouldn\'t be too difficult, right?</p><p>Good luck and press the Help button if you want a hint</p>'
    },

    help: {
        1: '<p>In this simplest scenario, the elevator is already on the floor where the person arrives, so just open the elevator.</p><p>And when the person presses the button, we call &quot;floor requested&quot; in which case just go to the desired floor! Dont forget to pass the floor as the argument to the call ... </p>',
        2: '<p>In this case, the elevator is not already on the floor where the person arrives, so let us first send the elevator to that floor.</p><p>And when we arrive at a floor, lets just open the elevator. </p>',
        3: '<p>Here you need to deal with both cases, one when the elevator is on the floor where the person arriving is and also where it isn\'t.</p><p> This calls for an &quot;if-else&quot; block where you check if the floor the elevator is on, &quotat floor&quot; is the same as the floor from where the person called, &quot;floor&quot;.</p><p> If they are the same, just open the elevator, else go to that floor ... simple, innit?</p>',
        4: '<p>Since both persons get on the same floor, they are going to be pressing the buttons immediately, for floor 5 and floor 3.<p></p> You cannot just go to the floors as they get pressed. You need to \'save\' them in a queue. When the elevator door closes, you can see if there are any requests (Hint: use \'request queue is not empty\' in an \'if\' block) then send the elevator to that floor.</p><p>That way, each time the elevator door is closed, you will be processing the \'requests\' (Hint: use \'earliest request\' to get one at a time) till there are none left and all travelers have been dispatched to their destination!</p>',
        5: '<p>Rather than going straight to the floor based on the \'earliest request\' (like we did on level 4) let\'s just go one floor at a time.</p>To do that, add 1 to the current floor if the elevator direction is \'up\' or subtract 1 from the current floor in case the direction is \'down\'. (Hint: Use the Math blocks to do the arithmetic and the \'elevator direction\' in an \'if\' block to decide on add/subtract).</p><p> When we arrive at a floor, we see if there is anyone getting off here (Hint: use \'traveler(s) to this floor\' in an \'if\') and open the elevator if so; if not, do your arithmetic again to go one floor up or down as before!</p>'
    }
};
