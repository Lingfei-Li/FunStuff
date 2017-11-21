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


/*
1. Add groups of favorite users
2. Set alias for groups
3. Edit, Delete
4. Reload after editing
5. Loading users
*/


(function() {
    let headDOM = $("head");

    const style = `
        <style>
            .group_header h4, h5 {
                display: inline-block;
            }

            .group_header h5 {
                color: grey;
            }
            
            .group_header a{
                margin-left: 1px;
                display: none;
            }
            .reviews_group:hover .group_header .toggle_edit_group_link {
                display: inline-block;
            }
            .delete_group_link {
                color: #ba0000;
            }
            .group_header_editing {
                display: none;
            }
            .reload_panel_link {
                display: none;
            }
        </style>
    `;
    headDOM.append(style);


    const DataStore = {
        "FAV_GROUPS_KEY": "favoriteGroups",
        "ID_COUNTER": "groupIdCounter",
        _generateId: function(groups={}) {
            let keys = [];
            for(key in groups) {
                keys.push(key);
            }

            let cnt = GM_getValue(this.ID_COUNTER, 0);
            while(cnt in keys) {
                cnt ++;
            }
            GM_setValue(this.ID_COUNTER, cnt + 1);
            return cnt;
        },
        _set: function (key, val) {
            return GM_setValue(key, val);
        },
        _get: function (key) {
            return GM_getValue(key, "");
        },
        _setFavoriteGroupsString: function(groupsStr) {
            return this._set(this.FAV_GROUPS_KEY, groupsStr);
        },
        _getFavoriteGroupsString: function() {
            return this._get(this.FAV_GROUPS_KEY);
        },
        setFavoriteGroupWithStr: function(groupStr, alias='') {
            let group = groupStr.split(',').filter(function(user) {
                return user.length > 0;
            });
            this.setFavoriteGroup(group, alias);
        },
        setFavoriteGroup: function(group, id=undefined, alias=undefined) {
            let groups = this.getFavoriteGroups();
            if(id === undefined) {
                id = this._generateId(groups);
            }
            if(alias === undefined) {
                alias = `Group ${id}`;
            }
            groups[id] = {
                'users': group,
                'alias': alias
            };
            const groupsStr = JSON.stringify(groups);
            this._setFavoriteGroupsString(groupsStr);
        },
        getFavoriteGroups: function() {
            const groupsStr = this._getFavoriteGroupsString();
            if(groupsStr === "") {
                return {};
            }
            return JSON.parse(this._getFavoriteGroupsString());
        },
        getFavoriteGroupById: function(id) {
            const groups = this.getFavoriteGroups();
            if(id in groups) {
                return groups[id]['users'];
            }
            return [];
        },
        getUniqueFavoriteUsers: function() {
            let groups = this.getFavoriteGroups();
            console.log('groups:', groups);
            let result = [];
            for(let id in groups) {
                const group = groups[id];
                if(group['users']) group['users'].forEach(function(user) {
                    if(!result.includes(user)) {
                        result.push(user);
                    }
                });
            }
            return result;
        },
        deleteGroup: function(id) {
            let groups = this.getFavoriteGroups();
            if(id in groups) {
                console.log('deleting ' + id);
                delete groups[id];
                const groupsStr = JSON.stringify(groups);
                this._setFavoriteGroupsString(groupsStr);
            }
        }
    };

    function editGroup(id) {
        console.log('edit group', id);

        let group_header = document.getElementById(`group_header_${id}`);
        group_header.style.display = 'none';

        let group_header_editing = document.getElementById(`group_header_editing_${id}`);
        group_header_editing.style.display = 'block';
    }

    function hideGroupEditing(id) {
        console.log('cancel edit group', id);

        let group_header = document.getElementById(`group_header_${id}`);
        group_header.style.display = 'block';

        let group_header_editing = document.getElementById(`group_header_editing_${id}`);
        group_header_editing.style.display = 'none';
    }

    function saveGroup(id) {
        console.log('save group', id);

        const groupStr = document.getElementById(`edit_group_users_${id}`).value;
        const group = groupStr.split(",").map(function(user) {
            return user.trim();
        }).filter(function(user) {
            return user.length > 0;
        });
        const alias = document.getElementById(`edit_group_alias_${id}`).value;

        DataStore.setFavoriteGroup(group, id, alias);

        document.getElementById(`group_header_alias_${id}`).innerHTML = `${alias}`;
        document.getElementById(`group_header_users_${id}`).innerHTML = `(${groupStr})`;

        document.getElementById(`reload_panel_link_${id}`).style.display = 'inline-block';

        hideGroupEditing(id);
    }

    function deleteGroup(id) {
        console.log('delete group', id);
        DataStore.deleteGroup(id);
        document.getElementById(`group_${id}`).style.display = 'none';
        let groupBodies = document.getElementsByClassName(`reviews_group_body_${id}`);
        for(let i = 0; i < groupBodies.length; i ++) {
            groupBodies[i].style.display = 'none'   ;
        }
    }

    const powerCodeReviewPanel = {
        loadReviews: function() {
            const groups = DataStore.getFavoriteGroups();
            if(!groups) return;
            let groupsContainer = document.getElementById('favorite_groups');

            const uniqueUsers = DataStore.getUniqueFavoriteUsers();
            let loadingBanner = document.getElementById('loading_banner');
            loadingBanner.innerHTML = `<h4>Loading data for: ${uniqueUsers.join(', ')}</h4>`;


            let groupHTML = '';

            groupHTML += '<table>';

            for(const id in groups) {
                let html = `<tr class='reviews_group' id='group_${id}'><td colspan='4'>`;
                
                const groupStr = groups[id].users.join(", ");
                const alias = groups[id].alias;
                html += `<span class='group_header' id='group_header_${id}'>
                            <h4 id='group_header_alias_${id}'>${alias}</h4>
                            <h5 id='group_header_users_${id}'> (${groupStr})</h5>
                            <a class='reload_panel_link' id='reload_panel_link_${id}'>reload</a>
                            <a class='toggle_edit_group_link' id='edit_group_link_${id}'>edit</a>
                            <a class='toggle_edit_group_link delete_group_link' id='delete_group_link_${id}'>delete</a>
                        </span>`;
                html += `<span class='group_header_editing' id='group_header_editing_${id}'>
                            <input id='edit_group_alias_${id}' type='text' placeholder='Alias' value='${alias}'/>
                            <input id='edit_group_users_${id}' type='text' placeholder='foo, bar' value='${groupStr}'/>
                            <button id='save_edit_group_link_${id}'>Save</button>
                            <a id='cancel_edit_group_link_${id}'>Cancel</a>
                        </span>`;
                html += `<td></tr>`;

                // A table of open CRs from each user, wrapped in a placeholding 'tbody' tag
                groups[id]['users'].forEach(function(userLogin) {
                    html += `<tbody class='reviews_group_body_${id} reviews_user_${userLogin}'></tbody>`;
                });

                groupHTML += html;
            }

            groupHTML += '</table>';

            groupsContainer.innerHTML = groupHTML;


            for(const id in groups) {
                document.getElementById(`edit_group_link_${id}`).addEventListener('click', function() { editGroup(id) });
                document.getElementById(`save_edit_group_link_${id}`).addEventListener('click', function() { saveGroup(id) });
                document.getElementById(`cancel_edit_group_link_${id}`).addEventListener('click', function() { hideGroupEditing(id) });
                document.getElementById(`delete_group_link_${id}`).addEventListener('click', function() { deleteGroup(id) });
                document.getElementById(`reload_panel_link_${id}`).addEventListener('click', function() { powerCodeReviewPanel.loadReviews() });
            }

            this.loadReviewsForUsers(uniqueUsers);

        },
        loadReviewsForUsers: function(users) {
            let loadingUsers = JSON.parse(JSON.stringify(users));
            console.log(loadingUsers);
            users.forEach(function(userLogin) {
                console.log("Loading user data for", userLogin);
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://code.amazon.com/api/reviews/open_and_assigned_to_user_html?ajax=true&user=${userLogin}`,
                    onload: function(data) {
                        let userHTML = JSON.parse(data.responseText).html;
                        const domParser = new DOMParser();
                        const userDOM = domParser.parseFromString(userHTML, 'text/html');
                        const tr = userDOM.getElementsByTagName("tr");
                        let userReviewsHTML = "";
                        for (let i=0; i < tr.length; i++ ) {
                            const td = tr[i].getElementsByTagName('td');
                            if(td[0].innerHTML === "from "+userLogin ) {
                                userReviewsHTML += tr[i].outerHTML;
                            }
                        }
                        console.log("Load complete for user", userLogin);

                        let userReviewContainers = document.getElementsByClassName(`reviews_user_${userLogin}`);
                        for(let i = 0; i < userReviewContainers.length; i ++) {
                            userReviewContainers[i].innerHTML += userReviewsHTML;
                        }

                        if(loadingUsers.includes(userLogin)) {
                            loadingUsers.splice(loadingUsers.indexOf(userLogin), 1);
                            let loadingBanner = document.getElementById('loading_banner');
                            if(loadingUsers.length != 0) {
                                loadingBanner.innerHTML = `<h4>Loading users: ${loadingUsers.join(', ')}</h4>`;
                            } else {
                                loadingBanner.innerHTML = ``;
                            }
                        } else {
                            console.error(`Can't find user ${userLogin} from loading users`);
                        }
                    }
                });
            });
        },
        initDisplayElements: function() {
            console.log("Loading user data...");
            const panelSkeleton =
                `<div class="panel-heading">
                    <h3>Open Reviews from Your Favorite Persons</h3>
                </div>
                <div class='panel-body'><div id='review_from_favorite_person'>
                    <div class="input-group search" style="margin-bottom: 10px; width: 500px;">
                        <input type="text" name="user" id="favorite_persons_input" size="10" class="form-control" placeholder="foo, bar">
                        <div class="input-group-btn">
                            <button class="btn" type="submit" id="set_favorite_person_button">Add</button>
                        </div>
                    </div>

                    <div id='loading_banner'>
                        <!-- A banner that shows loading information  -->
                    </div>
                    
                    <div id='favorite_groups'>
                        <!-- The main component of the panel -->
                    </div>
                </div>`;

            var panel = document.createElement("div");
            panel.className = "reviews panel panel-default clear powerCodeReviewPanel";
            panel.innerHTML = panelSkeleton;

            // Add the power panel to the page
            document.getElementsByClassName("non-ng-dash")[0].appendChild(panel);

            // Set event listeners to the 'Go' button
            document.getElementById("set_favorite_person_button").addEventListener('click', addFavoriteGroup);
            // Set enter key listener to the 'Go' button
            document.getElementById("favorite_persons_input").addEventListener('keyup', function(event) {
                if(event.keyCode === 13) addFavoriteGroup();
            });
        },        
        
    };

    
    const addFavoriteGroup = function () {
        console.log('Adding favorite groups');
        let groupStr = $("#favorite_persons_input").val();
        console.log('favorite user string:', groupStr);
        if (!groupStr) return;
        let group = groupStr.split(",").map(function(user) {
            return user.trim();
        }).filter(function(user) {
            return user.length > 0;
        });
        DataStore.setFavoriteGroup(group);
        console.log(DataStore.getFavoriteGroups());
        powerCodeReviewPanel.loadReviews();
    };

    powerCodeReviewPanel.initDisplayElements();
    powerCodeReviewPanel.loadReviews();

})();