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
MAIN.titleHeaderId = "hh1TitleHeader";
MAIN.currentPageId = "txtCurrentPage";
MAIN.userData = null;
MAIN.displayMenus = function () {
    "use strict";
    var menuIndex;
    menuIndex = MENU.initMenus(true);
    //<emis Jere

    MENU.displayMenu(menuIndex, "divTopMenu");
};
MAIN.displayHeader = function () {
    "use strict";
    var headObj, obj1, obj2, obj3;
    headObj = document.getElementById("divHeader");
    obj1 = COMMON.getBasicElement("h1", MAIN.titleHeaderId, "Hello There");
    headObj.appendChild(obj1);
    obj1 = COMMON.getBasicElement("div", null, null, "help");
    obj2 = COMMON.getLink(null, null, null, "displayHelp();", "Displays instructions and help based on the current page");
    obj3 = COMMON.getImageElement(null, "jpg/help.jpg", "Help Icon", null, null, 27, 27);
    obj2.appendChild(obj3);
    obj1.appendChild(obj2);
    headObj.appendChild(obj1);
    obj1 = COMMON.getBasicElement("div", "divLogin", "Logged in as " + MAIN.userData.fullName + " (" + MAIN.userData.domain + "\\" + MAIN.userData.userName + ")", "loginDisplay");
    headObj.appendChild(obj1);
    obj1 = COMMON.getBasicElement("div", "divTopMenu");
    headObj.appendChild(obj1);
};
MAIN.displaySearch = function () {
    "use strict";
    var navObj, obj1, obj2, obj3;
    //Search
    obj1 = COMMON.getBasicElement("div", null, null, "search");
    obj2 = COMMON.getBasicElement("spa", null, "Search For PO");
    obj1.appendChild(obj2);
    obj2 = COMMON.getFieldObject("txt", "txtSearch", document.getElementById("txtSearchStore").value);
    COMMON.addAttribute(obj2, "onkeyup", "doSearch(event);", true);
    obj1.appendChild(obj2);
    obj2 = COMMON.getLink(null, null, null, "doSearch();", "Search by PO");
    obj3 = COMMON.getImageElement(null, "jpg/search30.jpg", "Search Icon", null, null, 21, 21);
    obj2.appendChild(obj3);
    obj1.appendChild(obj2);
    navObj = document.getElementById("navdivTopMenunav");
    if (!navObj) { navObj = document.getElementById("divTopMenunav"); }
    navObj.appendChild(obj1);
};
MAIN.getUserData = function () {
    "use strict";
    var userData;
    userData = document.getElementById("txtUserData").value;
    if ((MAIN.userData === undefined || MAIN.userData === null) && (userData !== "")) {
        MAIN.userData = JSON.parse(userData);
    }
};
MAIN.initPage = function () {
    "use strict";
    MAIN.getUserData();
    MAIN.displayHeader();
    MAIN.displayMenus();
    MAIN.displaySearch();
    if (MAIN.userData.isValidUser) {
        MAIN.displayHome();
    } else {
        MAIN.displayRequisitionRequest();
    }
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