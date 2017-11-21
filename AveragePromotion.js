// ==UserScript==
// @name         Average SDE Promotion
// @namespace    http://amazon.com
// @description  Show average promotion history of company-wide SDE position
// @include         https://phonetool.amazon.com/users/*
// @require         https://code.jquery.com/jquery-1.12.3.min.js
// @grant           GM_xmlhttpRequest
// ==/UserScript==



(function() {



    const AveragePromotion = {
        load: function() {
            const totalPage = 10;
            let currentPage = 5;
            const url = `https://phonetool.amazon.com/search/search_result_list?search_properties%5Bcurrent_query%5D%5Bfilter_type%5D=All+fields&search_properties%5Bcurrent_query%5D%5Bquery%5D=software+dev&search_properties%5Bfilter_type%5D=All+fields&search_properties%5Brequest_sort_type%5D=Relevance&search_properties%5Bsearch_term%5D=software+dev&search_properties%5Bsort_order%5D=ASC&search_properties%5Bsort_type%5D=Relevance&search_properties%5Btarget_page%5D=1&search_properties%5Buse_fuzzy_search%5D=false&total_pages=${totalPage}&page=${currentPage}`;
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: function(data) {
                    const result = JSON.parse(data.responseText);
                    console.log(result);
                }
            });
        }
    };

    AveragePromotion.load();

})();