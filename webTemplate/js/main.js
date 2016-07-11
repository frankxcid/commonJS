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
MAIN.displayDivId = "divMain";
COMMON.defaultFormName = MAIN.formName;
COMMON.defaultDisplayDiv = MAIN.displayDivId;
COMMON.defaultMessSpanId = "spPendingChangeMess";
MAIN.pageHistVal = null;
MAIN.getUserData = function () {
    "use strict";

};
MAIN.displayMenus = function () {
    "use strict";
    var menuIndex, subMenuIndex;
    //Top Menu

};
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
    var pageHistObj;
    COMMON.clearParent(MAIN.displayDivId);
    COMMON.errMess("");
    DISPLAYGRID.resetGrid();
    FILLIN.reset();
    MAIN.pendingChange = false;
    if (!COMMON.exists(MAIN.pageHistVal)) {
        MAIN.pageHistVal = { "hist": [String(currentPage)] }
    } else {
        MAIN.pageHistVal.hist.push(String(currentPage));
    }
};

//**************************Home Page******************************************//
MAIN.initHomePage = function () {
    "use strict";
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