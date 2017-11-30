// ==UserScript==
// @name         Sprint Board Highlighter
// @namespace    http://amazon.com
// @description  Show promotion history of the user
// @include         https://issues.amazon.com/sprints/*mode=list*
// ==/UserScript==


(function() {
    let retryCount = 10;
    
    function tryInitialize() {
        console.log("Trying to initialize Sprint Board Highlighter. Remaining retries: " + retryCount);
        setTimeout(initialize, 100);
    }

    function initialize() {
        // const taskRows = document.getElementsByClassName("sprint-list-task-row");
        const taskRows = document.querySelectorAll(".sprint-list-task-row:not(.sprint-tasks-header)");
        if(taskRows.length <= 0 && --retryCount >= 0) {
            return tryInitialize();
        }
        for(let i = 0; i < taskRows.length; i ++) {
            const task = taskRows[i];
            const progressButtons = task.getElementsByClassName("sprint-list-task-lane");
            
            for(let j = 0; j < progressButtons.length; j ++) {
                if(progressButtons[j].getAttribute('data-lane-selected') === "true") {
                    const progress = progressButtons[j].innerHTML;
                    if(progress === "D") {
                        task.style.opacity = 0.5;
                    } else {
                        task.style.opacity = 1.0;
                    }
                }
            }
        }

        addProgressChangeListener();
        retryCount = 5;
        console.log("Sprint Board Highlighter started.");
    }

    function addProgressChangeListener() {
        const progressButtons = document.getElementsByClassName("sprint-list-task-lane");
        for(let i = 0; i < progressButtons.length; i ++) {
            progressButtons[i].addEventListener("click", function(){
                tryInitialize();
            });
        }
    }

    tryInitialize();

})();