define(function (require) {
    'use strict';

    var highlightedLines = [];
    var todoBlockLines = [];
    const currDateBlockClassName = "curr-date-block";
    const todoBlockClassName = "todo-block";

    function Colorhighlighter(cm) {
        cm.on('renderLine', this.process.bind(this));
        if(validateMode(cm.doc.mode.name)) {
            this.process(this._cm, null, cm.display.lineDiv);
            this.colorizeTodo(cm);
        }
    }

    function validateMode(mode) {
        return mode === "funstuff";
    }

    Colorhighlighter.prototype.process = function (cm, cmline, node) {
        traverseAllLines(node);
    };

    Colorhighlighter.prototype.highlightCurrDateBlock = function(cm, cursorPos) {
        if(!validateMode(cm.doc.mode.name)) {
            return;
        }
        highlightedLines.forEach(function(line) {
            cm.removeLineClass(line, 'background', currDateBlockClassName); 
        });
        highlightedLines = [];

        const cursorLineNum = cursorPos.line;

        let lineNodes = cm.display.lineDiv.childNodes;

        let completionFlag = 0;
        let offset = 0;
        while(completionFlag != 3) {
            const lowerLineNum = cursorLineNum - offset,
                  higherLineNum = cursorLineNum + offset;

            const dateSeparatorRegex = /-----+/i;
            if((completionFlag & 1) == 0) {
                if(lowerLineNum < 0 || dateSeparatorRegex.test(cm.getLine(lowerLineNum))) {
                    completionFlag += 1;
                } else {
                    cm.addLineClass(lowerLineNum, 'background', currDateBlockClassName); 
                    highlightedLines.push(lowerLineNum);
                }
            }
            if((completionFlag & 2) == 0) {
                if(higherLineNum >= cm.lineCount() || dateSeparatorRegex.test(cm.getLine(higherLineNum))) {
                    completionFlag += 2;
                } else {
                    cm.addLineClass(higherLineNum, 'background', currDateBlockClassName); 
                    highlightedLines.push(higherLineNum);
                }
            }
            offset ++;
        }
    }

    Colorhighlighter.prototype.colorizeTodo = function(cm) {
        if(!validateMode(cm.doc.mode.name)) {
            return;
        }
        todoBlockLines.forEach(function(line) {
            cm.removeLineClass(line, 'background', todoBlockClassName); 
        });
        todoBlockLines = [];

        let todoStarted = false;
        for(let i = 0; i < cm.lineCount(); i ++) {
            const todoBlockRegex = /#####+/i
            if(todoBlockRegex.test(cm.getLine(i)) && !todoStarted) {
                cm.addLineClass(i, 'background', todoBlockClassName);
                todoBlockLines.push(i);
                todoStarted = true;
            } else if(todoBlockRegex.test(cm.getLine(i)) && todoStarted) {
                cm.addLineClass(i, 'background', todoBlockClassName);
                todoBlockLines.push(i);
                todoStarted = false;
            } else if(todoStarted) {
                cm.addLineClass(i, 'background', todoBlockClassName);
                todoBlockLines.push(i);
            } else if(!todoStarted){
                continue;
            }
        }
    }

    function highlightSeparator(node) {
        let separatorElements = node.getElementsByClassName('cm-date-separator');
        for(let i = 0; i < separatorElements.length; i ++) {
            let line = separatorElements[i];
            line.style.background = '#00f';
            line.parentElement.parentElement.style.background = '#00f';
        }
    }

    function traverseAllLines(node) {
        let elements = node.childNodes;
        for(let i = 0; i < elements.length; i ++) {
            let line = elements[i];
            let textElement = line.getElementsByClassName('cm-date-header');
            if(textElement.length != 0) {
                // console.log(textElement);
                // console.log(textElement[0].innerText);
            }
            // console.log(i, line);
        }
    }

    return Colorhighlighter;
})