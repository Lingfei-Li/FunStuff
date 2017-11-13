// ==UserScript==
// @name         Power Code Review Panel
// @namespace    http://amazon.com
// @description  Show your favorite people's code reviews
// @include         https://code.amazon.com/
// @require         https://code.jquery.com/jquery-1.12.3.min.js
// @grant           GM_xmlhttpRequest
// @grant           GM_setValue
// @grant           GM_getValue
// ==/UserScript==

(function() {
    var DataStore = {
        set: function(key, val) {
            return GM_setValue(key, val);
        },
        get: function(key) {
            return GM_getValue(key, "");
        }
    }

    
    var refreshFavoritePerson = function() {
        let favoriteUsersString = document.getElementById("favoritePersonsInput").value;
        if(!favoriteUsersString) favoriteUsersString = "";
        let favoriteUsersList = [];
        if(favoriteUsersString.indexOf(",") !== -1) {
            favoriteUsersList = favoriteUsersString.split(",");
        } else {
            favoriteUsersList = favoriteUsersString.split(" ");
        }
        favoriteUsersList = favoriteUsersList.map(function(user) {
            return user.trim();
        }).filter(function(user) {
            return user.length > 0;
        });

        console.log(favoriteUsersList);

        DataStore.set("favoriteUserLogins", favoriteUsersList.join(","));

        powerCodeReviewPanel.loadReviews();
    }

    var powerCodeReviewPanel = {
        favoritePersons: function() {
            var result  = DataStore.get("favoriteUserLogins").split(",");
            if(!result) {
                result = [];
            }
            result = result.map(function(user) {
                return user.trim();
            });
            return result;
        },

        loadReviews: function() {
            document.getElementById("review_from_favorite_person_table").innerHTML = "";
            this.favoritePersons().forEach(function(userLogin) {
                console.log("Loading user data for", userLogin);
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://code.amazon.com/api/reviews/open_and_assigned_to_user_html?ajax=true&user="+userLogin,
                    onload: function(data) {
                        var userHTML = JSON.parse(data.responseText).html;
                        var domParser = new DOMParser();
                        var userDOM = domParser.parseFromString(userHTML, 'text/html');
                        var tr = userDOM.getElementsByTagName("tr");
                        var userReviewsHTML = "";
                        for (var i=0; i < tr.length; i++ ) {
                            var td = tr[i].getElementsByTagName('td');
                            if(td[0].innerHTML === "from "+userLogin ) {
                                userReviewsHTML += tr[i].outerHTML;
                            }
                        }
                        console.log("Load complete for user", userLogin);
                        document.getElementById("review_from_favorite_person_table").innerHTML += userReviewsHTML;
                    }
                });
            });
        },
        displayFavoritePeopleReviews: function() {
            console.log("Loading user data...");
            var html = `<div class="panel-heading">
                        <h3>Open Reviews from Your Favorite Persons</h3>
                        </div>`;
            html += "<div class='panel-body'><div id='review_from_favorite_person'>";

            html += `<div class="input-group search" style="margin-bottom: 10px; width: 500px;">
                     <input type="text" name="user" id="favoritePersonsInput" size="10" class="form-control" placeholder="john, doe">
                     <div class="input-group-btn">
                     <button class="btn" type="submit" id="setFavoritePersonButton">Go</button>
                     </div>
                     </div>`;


            html += "<table><tbody id='review_from_favorite_person_table'>";

            html += "</tbody></table>";
            html += "</div></div>";

            var reviews = document.createElement("div");
            reviews.className = "reviews panel panel-default clear powerCodeReviewPanel";
            reviews.innerHTML = html;
            document.getElementsByClassName("non-ng-dash")[0].appendChild(reviews);

            document.getElementById("setFavoritePersonButton").addEventListener('click', refreshFavoritePerson);

            document.getElementById("favoritePersonsInput").value = this.favoritePersons().join(", ");
            document.getElementById("favoritePersonsInput").addEventListener('keyup', function(event) {
                if(event.keyCode === 13) {
                    refreshFavoritePerson();
                }
            });

            this.loadReviews();
        }
    };
    
    powerCodeReviewPanel.displayFavoritePeopleReviews();
})();