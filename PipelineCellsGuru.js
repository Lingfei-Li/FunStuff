// ==UserScript==
// @name         Pipeline Cells Guru
// @namespace    http://amazon.com
// @description  Show your favorite people's code reviews
// @include         https://pipelines.amazon.com/pipelines/*
// @require         https://code.jquery.com/jquery-1.12.3.min.js
// ==/UserScript==

(function() {
    function extractAccountId(arn) {
        var rx = /arn:aws:cloudformation:[^:]*:(\d+):.*/g;
        var arr = rx.exec(arn);
        return arr[1]; 
    }

    var guru = {
        showAWSAdminLink: function() {
            var accounts = $("div.name");
            for(var i = 0; i < accounts.length; i ++) {
                const account = accounts[i];
                if(account.innerText.indexOf("arn:aws:cloudformation") !== -1) {
                    const accountId = extractAccountId(accounts[i].innerText);

                    let adminLink = document.createElement("a");
                    adminLink.href = "https://isengard.amazon.com/federate?account="+accountId+"&role=Admin";
                    adminLink.innerHTML = " - Login as Admin";
                    account.parentNode.insertBefore(adminLink, account.nextSibling);
                }
            }
            
        }
    };
    guru.showAWSAdminLink();
})();