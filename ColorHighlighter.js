define(function (require) {
    'use strict';

    function Colorhighlighter(cm) {
        cm.on('renderLine', this.process.bind(this));
        this.process(cm, null, cm.display.lineDiv);
    }

    Colorhighlighter.prototype.process = function (cm, cmline, node) {
        console.log(node);
        let spanElements = node.getElementsByTagName('span');
        for(let i = 0; i < spanElements.length; i ++) {
            let line = spanElements[i];

            const separatorText = "----------";
            if(line.innerText === separatorText) {
                // line.style.color = '#f00';
            }
        }
    };
    return Colorhighlighter;
})