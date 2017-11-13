// ==UserScript==
// @name         Make Isengard Great Again
// @namespace    http://amazon.com
// @description  Show a group of filters in Isengard console access page
// @include         https://isengard.amazon.com/console-access
// @require         https://code.jquery.com/jquery-1.12.3.min.js
// @require     bootstrapJS    https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// ==/UserScript==

(function() {

    $("head").append("<script>" + GM_getResourceText("bootstrapJS") + "</script>");
    $("head").append("<style>" + GM_getResourceText("bootstrapCSS") + "</style>");

    const filterButtonStyle = `
        <style>
            .filterButton {
                margin-left: 10px;
            }
            .filterButton:focus {outline:0;}
        </style>
    `;
    $("head").append(filterButtonStyle);

    function applyFilters(event) {
        let buttonClicked = document.getElementById(event.target.id);
        if(buttonClicked.className.indexOf("btn-primary") !== -1) {
            buttonClicked.classList.add("btn-default");
            buttonClicked.classList.remove("btn-primary");
        } else {
            buttonClicked.classList.add("btn-primary");
            buttonClicked.classList.remove("btn-default");
            buttonClicked.classList.add("btn-primary");
        }


        const stageFilters = document.getElementsByClassName("stageFilters")[0].getElementsByTagName("button");
        let stageFilterResult = [];
        for(let i = 0; i < stageFilters.length; i ++) {
            const filter = stageFilters[i];
            if(filter.className.indexOf("btn-primary") !== -1) {
                stageFilterResult.push(filter.innerHTML);
            } else if(stageFilterResult.includes(filter.innerHTML)){
                stageFilterResult.remove(filter.innerHTML);
            }
        }
        makeIsengardGreatAgain.filters['stage'] = stageFilterResult;


        const regionFilters = document.getElementsByClassName("regionFilters")[0].getElementsByTagName("button");
        let regionFilterResult = [];
        for(let i = 0; i < regionFilters.length; i ++) {
            const filter = regionFilters[i];
            if(filter.className.indexOf("btn-primary") !== -1) {
                regionFilterResult.push(filter.innerHTML);
            } else if(regionFilterResult.includes(filter.innerHTML)){
                regionFilterResult.remove(filter.innerHTML);
            }
        }
        makeIsengardGreatAgain.filters['region'] = regionFilterResult;

        refreshResults();
    }

    function refreshResults() {
        var accountEntries = document.getElementsByClassName("console-access-account-entry");
        for(let i = 0; i < accountEntries.length; i ++) {
            let account = accountEntries[i];
            const accountEmail = account.getElementsByClassName("entry-info")[0].getElementsByClassName("isengard-orange")[0].innerHTML;

            // Filter by stage
            let validStage = false;
            if(makeIsengardGreatAgain.filters['stage'].length === 0) {
                validStage = true;
            } else {   
                makeIsengardGreatAgain.filters['stage'].forEach(function(filter) {
                    if(accountEmail.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                        validStage = true;
                    }
                });
            }

            // Filter by stage
            let validRegion = false;
            if(makeIsengardGreatAgain.filters['region'].length === 0) {
                validRegion = true;
            } else {
                makeIsengardGreatAgain.filters['region'].forEach(function(filter) {
                    if(accountEmail.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                        validRegion = true;
                    }
                });
            }
            

            // Filter by stage
            let validCellIndex = false;
            if(makeIsengardGreatAgain.filters['cellIndex'].length === 0) {
                validCellIndex = true;
            } else {
                makeIsengardGreatAgain.filters['cellIndex'].forEach(function(filter) {
                    if(accountEmail.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                        validCellIndex = true;
                    }
                });
            }
            

            // Filter by stage
            let validType = false;
            if(makeIsengardGreatAgain.filters['type'].length === 0) {
                validType = true;
            } else {
                makeIsengardGreatAgain.filters['type'].forEach(function(filter) {
                    if(accountEmail.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                        validType = true;
                    }
                });
            }
            
            if(validStage && validRegion && validCellIndex && validType) {
                account.style["display"] = "block";
            } else {
                account.style["display"] = "none";
            }
        }
    }

    function extractInfo(accountEmail) {
        if(accountEmail.indexOf("aws-scm-accounts") !== -1) {
            // aws-scm-accounts+alpha-us-east-1-prototype-region@amazon.com 
            var rx = /aws-scm-accounts\+([^-]*)-([^-]*-[^-]*-[^-]*)-([^-]*)-([^-]*).*@amazon.com/g;
            var arr = rx.exec(accountEmail);
            return {
                "stage": arr[1],
                "region": arr[2],
                "type": arr[3],
                "cell": arr[4]
            }
        }
        return null;
    }

    function setOptions() {

    }


    var makeIsengardGreatAgain = {
        options: {
            'stage': [],
            'region': [],
            'type': []
        },
        filters: {
            'stage': [],
            'region': [],
            'cellIndex': [],
            'type': []
        },
        do: function() {

            setTimeout(function () {
                var accountEntries = document.getElementsByClassName("console-access-account-entry");
                for(let i = 0; i < accountEntries.length; i ++) {
                    let account = accountEntries[i];
                    const accountEmail = accountEntries[i].getElementsByClassName("entry-info")[0].getElementsByClassName("isengard-orange")[0].innerHTML;
                    const accountInfo = extractInfo(accountEmail);
                    if(accountInfo) {
                        if(!makeIsengardGreatAgain.options['stage'].includes(accountInfo['stage'])) {
                            makeIsengardGreatAgain.options['stage'].push(accountInfo['stage']);
                        }
                        if(!makeIsengardGreatAgain.options['region'].includes(accountInfo['region'])) {
                            makeIsengardGreatAgain.options['region'].push(accountInfo['region']);
                        }
                        if(!makeIsengardGreatAgain.options['type'].includes(accountInfo['type'])) {
                            makeIsengardGreatAgain.options['type'].push(accountInfo['type']);
                        }
                    }                    
                }


                const accountsPanel = document.getElementById("fed-accounts-pane");
                let filterPanel = document.createElement("div");

                

                let html = "";
                let stageFiltersGroup = "";
                stageFiltersGroup +=    "<div class='stageFilters'>";
                stageFiltersGroup +=    "<h5>Stage: </h5>";
                for(let i = 0; i < makeIsengardGreatAgain.options['stage'].length; i ++) {
                    const stageVal = makeIsengardGreatAgain.options['stage'][i];
                    stageFiltersGroup +=    "<button id='stage-"+stageVal+"' class='filterButton btn btn-default'>"+stageVal+"</button>";
                }
                stageFiltersGroup +=    "</div>";

                let regionFiltersGroup =    "<div class='regionFilters'>";
                regionFiltersGroup +=    "<h5>Region: </h5>";
                for(let i = 0; i < makeIsengardGreatAgain.options['region'].length; i ++) {
                    const reginoVal = makeIsengardGreatAgain.options['region'][i];
                    regionFiltersGroup +=    "<button id='region-"+reginoVal+"' class='filterButton btn btn-default'>"+reginoVal+"</button>";
                }
                regionFiltersGroup +=    "</div>";



                html += stageFiltersGroup;
                html += regionFiltersGroup;
    
                filterPanel.innerHTML = html;
    
                accountsPanel.parentNode.insertBefore(filterPanel, accountsPanel);
    
                var filterButtons = document.getElementsByClassName("filterButton");
                for(let i = 0; i < filterButtons.length; i ++) {
                    filterButtons[i].addEventListener('click', applyFilters);
                }

            }, 2000);
        }
    };
    
    makeIsengardGreatAgain.do();
    GM_addStyle (GM_getResourceText ("bootstrapCSS"));
})();