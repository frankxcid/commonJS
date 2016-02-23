/// <reference path="fillinform.js" />
/// <reference path="displaygrid.js" />
/// <reference path="common.js" />
/// <reference path="menu.js" />
/// <reference path="ajaxpost.js" />
/// <reference path="calendar.js" />
/*jslint browser: true  plusplus: true  */
/*global FILLIN, AJAXPOST, DISPLAYGRID, COMMON, MENU, HELPTOPICS*/
var MAIN = {};
MAIN.pendingChange = false;
MAIN.rowsChanges = null;
MAIN.formName = "amain";
MAIN.displayDivId = "pnMainTop";
COMMON.defaultFormName = MAIN.formName;
COMMON.defaultDisplayDiv = MAIN.displayDivId;
COMMON.defaultMessSpanId = "spPendingChangeMess";
MAIN.getUserData = function () {
    "use strict";
    
};
MAIN.displayMenus = function () {
    "use strict";
    var menuIndex, subMenuIndex;
    //Top Menu
    
};
M
MAIN.initPage = function (homePage) {
    "use strict";
    MAIN.getUserData();
    MAIN.displayMenus();
    MAIN.initHomePage();
};
MAIN.setCurrentPage = function (currentPage, Header) {
    ///<summary>Sets the currentPage code and header message in the top banner of the page. The currentPage code is used to determine which help to display</summary>
    ///<param name="currentPage" type="number">The unique code that designates to the help module context aware help</param>
    ///<param name="Header" type="String">The message to display in the top banner, usually tells the user what page he is in</param>
    "use strict";
    //future code should have a way to do breadcrumbs?
    var pageHistObj, pageHistVal;
    document.getElementById(MAIN.currentPageId).value = currentPage;
    document.getElementById(MAIN.titleHeaderId).innerHTML = Header;
    COMMON.clearParent(MAIN.displayDivId);
    COMMON.errMess("");
    DISPLAYGRID.resetGrid();
    MAIN.pendingChange = false;
    if (MAIN.usingNavigationButtons) {
        MAIN.usingNavigationButtons = false;
    } else {
        pageHistVal = document.getElementById("txtPageHistory").value;
        if (pageHistVal === "") {
            pageHistObj = { "hist": [String(currentPage)] };
        } else {
            pageHistObj = JSON.parse(pageHistVal);
            pageHistObj.hist.push(String(currentPage));
        }
        document.getElementById("txtPageHistory").value = JSON.stringify(pageHistObj);
    }
};

//**************************Home Page******************************************//
MAIN.initHomePage = function () {
    "use strict";
    var displayDiv;
    FILLIN.reset();
    MAIN.setCurrentPage(0, "");
};
//*********************************HELP*********************************//
MAIN.displayHelp = function () {
    "use strict";
    var topic;
    topic = document.getElementById("txtCurrentPage").value;
    if (topic === "" || isNaN(topic)) { return; }
    COMMON.helpDialog(topic, MAIN.displayDivId, "90%");
};