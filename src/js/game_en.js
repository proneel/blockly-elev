var messages = {

    blocks: {
        openElevator_name : 'open elevator',
        openElevator_tip : 'Open the elevator at the desired floor and indicate the direction to pick up passengers',
        openElevator_tipS : 'Open the elevator to pick up passengers',
        goToFloor_name : 'go to floor',
        goToFloor_tip : 'Send the elevator to a desired floor. Make sure you pass the floor as a parameter!'
    },

    info: {
        1: '<p>The panel on the left of this game shows a building with 5 floors and a closed elevator door on each floor</p> </p><p>As soon as the game starts, you will see a person arrive on floor 1 and press the &quot;up&quot; button to call the elevator.</p></p>Your task is to fill in the &quot;elevator called&quot; procedure on the right to respond to that call.</p><p>After the person enters the elevator they will press a button indicating the desired floor they wish to travel to. Your also need to fill in the &quot;floor requested&quot; procedure on the right to respond to that request</p><p>Good luck and press the Help button if you want a hint</p> <p>Do not worry, it really needs only 2 lines of code to work! Once you move the blocks into the 2 procedures, you can view your code with &quot;View Code&quot; or run the game with &quot;Run Code&quot;</p><p>How exciting :)</p>',
        2: '<p>On this level, we make it a teeny bit difficult. You will see the person arrive on the second floor, while the elevator is idle on the first. Thats not too bad, you already know how to send the elevator to that floor, dont you?</p></p>We also add one more procedure to fill in this time, &quot;floor arrived&quot;. You need to fill in what one does when the elevator arrives at the floor, perhaps just open it?</p> <p>Good luck and press the Help button if you want a hint</p>',
        3: '<p>We had only one person in the first two levels. Now we have two, so double the fun!</p><p>You will see a person arrive on the first floor and travel to the fifth. Soon after you\'ve successfully moved that person to the destination a second person shows up, this time on the second floor!</p> <p>Good luck and press the Help button if you want a hint</p>',
    },

    help: {
        1: '<p>In this simplest scenario, the elevator is already on the floor where the person arrives, so just open the elevator.</p><p>And when the person presses the button, we call &quot;floor requested&quot; in which case just go to the desired floor! Dont forget to pass the floor as the argument to the call ... </p>',
        2: '<p>In this case, the elevator is not already on the floor where the person arrives, so let us first send the elevator to that floor.</p><p>And when we arrive at a floor, lets just open the elevator. </p>',
        3: '<p>Here you need to deal with both cases, one when the elevator is on the floor where the person arriving is and also where it isn\'t.</p><p> This calls for an &quot;if-else&quot; block where you check if the floor the elevator is on, &quotat floor&quot; is the same as the floor from where the person called, &quot;floor&quot;.</p><p> If they are the same, just open the elevator, else go to that floor ... simple, innit?</p>'
    }
};
