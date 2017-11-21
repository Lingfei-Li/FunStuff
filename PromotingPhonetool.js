// ==UserScript==
// @name         Phonetool Promotion History
// @namespace    http://amazon.com
// @description  Show promotion history of the user
// @include         https://phonetool.amazon.com/users/*
// @require         https://code.jquery.com/jquery-1.12.3.min.js
// @grant           GM_xmlhttpRequest
// ==/UserScript==


(function() {
    const PromotingPhonetool = {
        empId: $(location).attr("pathname").match(/[people|users]\/(\w+)/)[1],
        loadPromitionHistory: function() {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://ekarulf.corp.amazon.com/phone-widgets/job-history.cgi?format=greasemonkey&target=" + PromotingPhonetool.empId,
                onload: function(data) {
                    var historyData = JSON.parse(data.responseText);

                    let promotionData = [];
                    let currJobTitle;
                    let currStartDateSec;
                    for(var i = historyData.length - 1; i >= 0; i --) {
                        const item = historyData[i];
                        if(item.business_title.indexOf("Inter") !== -1) {
                            continue;
                        }
                        const jobTitle = item.job_title;
                        const startDateStr = item.start_date;
                        const startDateSec = Date.parse(startDateStr);
                        if(!currJobTitle || currJobTitle !== jobTitle) {
                            currJobTitle = jobTitle;

                            const diff = Math.floor(startDateSec - currStartDateSec);
                            
                            const day = 1000 * 60 * 60 * 24;
                            let days = Math.floor(diff/day);
                            let months = Math.floor(days/31);
                            let years = Math.floor(months/12);
                            months -= 12*years;

                            const diffStr = `${years} years, ${months} months`;

                            const promotion = {
                                "jobTitle": currJobTitle,
                                "startDateSec": startDateSec,
                                "startDateStr": startDateStr,
                                "diffStr": diffStr,
                            };

                            promotionData.push(promotion);
                            
                            currStartDateSec = startDateSec;
                        }
                    }

                    var html = "<div style='padding:20px 0 0 30px; font-family:Arial'>";
                    html += "<p class='title'><i class='icon-lightbulb'></i>  Promotion History</p><hr/>";
                    html += "<div class='main-content' style='padding:10px'>";
                    for(let i = 0; i < promotionData.length; i ++) {
                        const promotion = promotionData[i];

                        html += "<div style='padding:5px 0; margin:0; border-bottom:1px solid #eee'>";
                        html += "<h4 style='font-size:1.2em; font-weight:bold; color:#444; margin:0'>" + promotion.jobTitle + "</h4>";
                        if(i == 0) {
                            html += "<h5>" + promotion.startDateStr + "</h5>";
                        } else if(currStartDateSec) {
                            html += `<h5>${promotion.startDateStr} (Promotion took ${promotion.diffStr})</h5>`;
                        } 
                        html += "</div>";

                        if(i == promotionData.length - 1) {
                            html += "<div style='padding:5px 0; margin:0; border-bottom:1px solid #eee'>";
                            const diff = Math.floor(Date.now() - promotion.startDateSec);
                            const day = 1000 * 60 * 60 * 24;
                            let days = Math.floor(diff/day);
                            let months = Math.floor(days/31);
                            let years = Math.floor(months/12);
                            months -= 12*years;

                            const diffStr = `${years} years, ${months} months`;

                            html += `<h5>${diffStr} since the last promition</h5>`;
                            html += "</div>";
                        }
                    }

                    html += "</div>";
                    var d = document.createElement("div");
                    d.className = "well content-well";
                    d.innerHTML = html;
                    document.getElementsByClassName("org-chart")[0].parentNode.appendChild(d);
                }
            });
        }
    };
    
    PromotingPhonetool.loadPromitionHistory();

})();