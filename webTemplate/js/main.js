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
MAIN.filterSettings = null;
MAIN.filterSettingsCookieName = "filterSettings";
MAIN.filterDivId = "divFilter";
MAIN.WOGridDivID = "divWOGrid";
MAIN.siteId = "";
MAIN.setPendingChange = function () {
    "use strict";
    MAIN.pendingChange = true;
    COMMON.errMess("Changes Pending");
};
MAIN.displaySearch = function () {
    "use strict";
    var navObj, obj1, obj2, obj3;
    //Search
    obj1 = COMMON.getBasicElement("div", null, null, "search");
    obj2 = COMMON.getBasicElement("spa", null, "Search");
    obj1.appendChild(obj2);
    obj2 = COMMON.getFieldObject("txt", "txtSearch", document.getElementById("txtSearchStore").value);
    COMMON.addAttribute(obj2, "onkeyup", "MAIN.doSearch();", true);
    obj1.appendChild(obj2);
    obj2 = COMMON.getLink(null, null, null, "MAIN.doSearch();", "Search by PO");
    obj3 = COMMON.getImageElement(null, "jpg/search30.jpg", "Search Icon", null, null, 21, 21);
    obj2.appendChild(obj3);
    obj1.appendChild(obj2);
    navObj = document.getElementById("divHeaderBottomSearch");
    navObj.appendChild(obj1);
};
MAIN.getUserData = function () {
    "use strict";
    //userDate = {"username":"", "userid":"", "email":"", "firstname":"", "lastname":"", "mi":"", "employeenumber":"", "phone":"", "approved":false, "common":false, "supervisor":false, "admin": false, "maintenance":false, "anonymous":true, "locked":false, "loggedin":false, "securitylevel":0 }
    var userData, whoami, logged;
    whoami = "";
    userData = document.getElementById("txtUserData").value;
    if ((MAIN.userData === undefined || MAIN.userData === null) && (userData !== "")) {
        MAIN.userData = JSON.parse(userData);
    }
    logged = (MAIN.userData.loggedin ? "Logged in as " : "Welcome ");
    whoami = logged + ((MAIN.userData.firstname + " " + MAIN.userData.lastname).trim() + " (" + MAIN.userData.username + ")").trim();
    document.getElementById("spaWhoAmI").innerHTML = whoami;
};
MAIN.displayMenus = function () {
    "use strict";
    var menuIndex, subMenuIndex;
    //Top Menu
    menuIndex = MENU.initMenus(true);
    if (!MAIN.userData.loggedin) {
        MENU.addTopLevelMenu(menuIndex, "Login", null, "MAIN.displayLogin();", "125px", "Login to access Work Order management");
    } else {
        if (MAIN.userData.supervisor || MAIN.userData.admin) {
            MENU.addTopLevelMenu(menuIndex, "Manage Notifications", null, "MAIN.displayNotificationManagement();", null, "Manage notification events");
            MENU.addTopLevelMenu(menuIndex, "Settings", null, "MAIN.displaySettings();", "93px", "Program settings");
            MENU.addTopLevelMenu(menuIndex, "Manage Users", null, "MAIN.displayManageUsers();", "135px", "Manage User settings and login errors");

            subMenuIndex = MENU.addTopLevelMenu(menuIndex, "Reports", null, null, "100px");
            MENU.addSubMenu(menuIndex, subMenuIndex, "Metrics", null, "MAIN.displayMetricsReport();", null, "Run Metrics Report");
        }
        MENU.addTopLevelMenu(menuIndex, "Equip. Parts", null, "MAIN.displayEquipmentParts();", "115px", "Manage Equipment Parts");
        MENU.addTopLevelMenu(menuIndex, "Logout", null, "MAIN.processLogout();", "75px", "Logout");
    }

    MENU.displayMenu(menuIndex, "divTopMenu");
    //Bottom Menu
    menuIndex = MENU.initMenus(false);
    MENU.addTopLevelMenu(menuIndex, "Help/Instructions", null, "MAIN.displayHelp();", "150px", "Get Help or Instructions on current page");
    MENU.addTopLevelMenu(menuIndex, "<span class=\"spaNewWO\">Create New Work Order<span>", null, "MAIN.displayWorkOrder(0);", "230px", "Create New Work Order");
    MENU.addTopLevelMenu(menuIndex, "Home", null, "MAIN.initHomePage();", "80px", "View Work Orders");
    MENU.displayMenu(menuIndex, "divHeaderBottomMenu");
};
MAIN.processLogout = function () {
    "use strict";
    MAIN.userData.loggedin = false;
    COMMON.vbPostBack("btnLogout");
};
MAIN.getFilterSettings = function () {
    "use strict";
    var i;
    MAIN.filterSettings = COMMON.readCookie(MAIN.filterSettingsCookieName);
    if (!MAIN.filterSettings) {
        //cookie missing
        MAIN.filterSettings = {};
        MAIN.filterSettings.tech = (MAIN.userData.admin || MAIN.userData.supervisor ? "" : MAIN.userid);
        AJAXPOST.callQuery("getAllStatus");
        for (i = 0; i < AJAXPOST.dataResults.length; i++) {
            MAIN.filterSettings[AJAXPOST.dataResults[i][0]] = { "text": AJAXPOST.dataResults[i][1], "checked": (AJAXPOST.dataResults[i][0] === "4" || AJAXPOST.dataResults[i][0] === "5"), "islast": (i === (AJAXPOST.dataResults.length - 1)) };
        }
        COMMON.writeCookie(MAIN.filterSettingsCookieName, MAIN.filterSettings, true);
    }
};
MAIN.initPage = function (homePage) {
    "use strict";
    MAIN.getUserData();
    MAIN.siteId = document.getElementById("txtSiteId").value;
    MAIN.displayMenus();
    MAIN.displaySearch();
    if (homePage) { MAIN.initHomePage(); }
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
//*************************REPORTS*********************************************//
MAIN.displayMetricsReport = function () {
    "use strict";
    var params;
    params = [MAIN.siteId];
    AJAXPOST.customRequest("metricsReport", params, true);
};
//**************************Home Page******************************************//
MAIN.initHomePage = function (fromSearch, allOpen) {
    "use strict";
    var displayDiv;
    FILLIN.reset();
    displayDiv = document.getElementById(MAIN.displayDivId);
    if (!fromSearch) {
        MAIN.setCurrentPage(0, "Maintenance Work Orders");
    } else {
        MAIN.setCurrentPage(1, "Work Order Search Result");
    }
    displayDiv.appendChild(COMMON.getBasicElement("div", MAIN.filterDivId));
    displayDiv.appendChild(COMMON.getBasicElement("div", MAIN.WOGridDivID));
    if (fromSearch) {
        MAIN.displaySearchResults();
    } else {
        MAIN.displayHome(allOpen);
    }
};
MAIN.clearSearchResults = function () {
    "use strict";
    document.getElementById("txtSearch").value = "";
    MAIN.doSearch();
};
MAIN.displaySearchResults = function () {
    "use strict";
    var formIndex;
    formIndex = FILLIN.createForm(MAIN.filterDivId, "Search Results for " + document.getElementById("txtSearch").value, "Keep entering text in the search text box to refine your search. Use * for wildcard searches (e.g. w*rd will match word, ward weird).", MAIN.clearSearchResults, null, "1160px");
    FILLIN.addButton(formIndex, null, "btnClearSearch", "Clear Search", true);
    FILLIN.displayForm(formIndex);
    MAIN.displayWOGrid(true);
};
MAIN.doSearch = function () {
    "use strict";
    var searchVal;
    searchVal = (document.getElementById("txtSearch").value).trim();
    document.getElementById("txtSearchStore").value = searchVal;
    if (searchVal.length < 3 && searchVal !== "") { return; }
    if (searchVal === "") {
        MAIN.displayHome();
        return;
    }
    MAIN.initHomePage(true);
};
MAIN.displayHome = function (allOpen) {
    "use strict";
    var formIndex, obj1, obj2, obj3, obj4, obj5, i, remainder, baseDiv, cellDiv, cellCount, oneProp, thisFilter, cellWidth, params;
    MAIN.getFilterSettings();
    COMMON.errMess("");
    formIndex = FILLIN.createForm(MAIN.filterDivId, "Work orders", "Use the filters to display the work orders.  Click the button to edit the order", null, null, "1140px");
    if (allOpen) {
        obj1 = COMMON.getBasicElement("div");
        obj2 = COMMON.getButton("btnShowOpen", "Return to Filters", "MAIN.initHomePage();");
        obj1.appendChild(obj2);
        FILLIN.addGenericControl(formIndex, obj1, null, true);
    } else {
        obj1 = COMMON.getBasicElement("div");
        obj2 = document.createElement("input");
        obj2.type = "radio";
        obj2.id = "rad60";
        obj2.setAttribute("name", "radDateFilter");
        obj2.value = "rad60";
        obj2.checked = true;
        obj2.setAttribute("onchange", "MAIN.customDateFilterChange(false);");
        obj1.appendChild(obj2);
        obj2 = document.createElement("label");
        obj2.setAttribute("for", "rad60");
        obj2.innerHTML = "Last 60 Days";
        obj1.appendChild(obj2);

        obj2 = document.createElement("input");
        obj2.type = "radio";
        obj2.id = "radCust";
        obj2.setAttribute("name", "radDateFilter");
        obj2.value = "radCust";
        obj2.setAttribute("onchange", "MAIN.customDateFilterChange(true);");
        obj1.appendChild(obj2);
        obj2 = document.createElement("label");
        obj2.setAttribute("for", "radCust");
        obj2.innerHTML = "Custom Dates";
        obj1.appendChild(obj2);

        obj2 = document.createElement("table");
        obj2.setAttribute("style", "padding:0; margin:0;");

        obj3 = document.createElement("tr");
        obj4 = document.createElement("td");
        obj4.innerHTML = "Start";
        obj3.appendChild(obj4);
        obj4 = document.createElement("td");
        obj4.innerHTML = "End";
        obj3.appendChild(obj4);
        obj4 = document.createElement("td");
        obj4.innerHTML = "&nbsp;";
        obj3.appendChild(obj4);
        obj2.appendChild(obj3);

        obj3 = document.createElement("tr");
        obj4 = document.createElement("td");
        obj4.appendChild(COMMON.getCalendar("txtStartDate", null, true, null, "divErrMess" + String(formIndex), "txtFilterDate", null, null, null, true));
        obj3.appendChild(obj4);
        obj4 = document.createElement("td");
        obj4.appendChild(COMMON.getCalendar("txtEndDate", null, true, null, "divErrMess" + String(formIndex), "txtFilterDate", null, null, null, true));
        obj3.appendChild(obj4);
        obj4 = document.createElement("td");
        obj5 = COMMON.getButton("btnDateFilt", "Apply", "MAIN.filterDateChange();");
        obj5.disabled = true;
        obj4.appendChild(obj5);

        obj3.appendChild(obj4);
        obj2.appendChild(obj3);
        obj1.appendChild(obj2);

        FILLIN.addGenericControl(formIndex, obj1, "Date Filter", null, true);

        obj1 = document.createElement("div");
        obj2 = COMMON.getBasicElement("div", null, "(Change this to view Work Orders assigned to any other maintenance tech.)");
        obj1.appendChild(obj2);
        params = [MAIN.siteId];
        obj2 = COMMON.getDDLfromQuery("ddlMaintUsers", null, false, "WOgetMaintenanceUsersFilter", params);
        COMMON.addAttribute(obj2, "onchange", "MAIN.userFilterChanged(this);", true);
        obj1.appendChild(obj2);
        FILLIN.addGenericControl(formIndex, obj1, "Maintenance Tech. Filter");

        obj1 = document.createElement("table");
        obj2 = document.createElement("tr");
        obj3 = document.createElement("td");
        obj3.setAttribute("colspan", "3");
        obj4 = COMMON.getButton("btnShowOpen", "Show Open work Orders", "MAIN.initHomePage(false, true)");
        obj3.appendChild(obj4);
        obj2.appendChild(obj3);
        obj1.appendChild(obj2);


        remainder = 3;
        obj2 = null;
        for (oneProp in MAIN.filterSettings) {
            if (MAIN.filterSettings.hasOwnProperty(oneProp) && oneProp !== "tech") {
                if (remainder > 2) {
                    if (obj2) { obj1.appendChild(obj2); }
                    obj2 = document.createElement("tr");
                    remainder = 0;
                }
                thisFilter = MAIN.filterSettings[oneProp];
                obj2.appendChild(MAIN.statusFilterDisplay(oneProp, thisFilter.text, remainder, thisFilter.islast, thisFilter.checked));
                remainder++;
            }
        }
        obj1.appendChild(obj2);

        FILLIN.addGenericControl(formIndex, obj1, "Status Filter");
    }
    FILLIN.displayForm(formIndex);
    //set the width of cells to 32%
    if (!allOpen) {
        baseDiv = document.getElementById("divContentBase" + String(formIndex)).childNodes;
        cellCount = 0;
        for (i = 0; i < baseDiv.length; i++) {
            cellDiv = baseDiv[i];
            if (cellDiv.getAttribute("class") === "dvCDControlCell") {
                switch (cellCount) {
                case 0:
                    cellWidth = "295";
                    break;
                case 1:
                    cellWidth = "220";
                    break;
                case 2:
                    cellWidth = "600";
                    break;
                }
                COMMON.addAttribute(cellDiv, "style", "width:" + cellWidth + "px;height:130px", true);
                cellCount++;
            }
        }
        MAIN.resetFilterDates();
    }
    MAIN.displayWOGrid(false, allOpen);
};
MAIN.statusFilterDisplay = function (id, text, columnNumber, isLast, isChecked) {
    "use strict";
    var obj1, obj2, attr;
    obj1 = document.createElement("td");
    attr = { "onchange": "MAIN.statusFilterChange(this);" };
    obj2 = COMMON.getCheckBox("chkStatus" + id, isChecked, text, null, null, attr, "chkFilter");
    obj1.appendChild(obj2);
    if (isLast && columnNumber < 2) {
        obj1.setAttribute("colspan", (columnNumber === 0 ? "3" : "2"));
    }
    obj1.appendChild(obj2);
    return obj1;
};
MAIN.customDateFilterChange = function (customDates) {
    "use strict";
    MAIN.disableElement(document.getElementById("txtStartDate"), !customDates);
    MAIN.disableElement(document.getElementById("txtEndDate"), !customDates);
    MAIN.disableElement(document.getElementById("lnktxtStartDate"), !customDates);
    MAIN.disableElement(document.getElementById("lnktxtEndDate"), !customDates);
    MAIN.disableElement(document.getElementById("btnDateFilt"), !customDates);
    if (!customDates) {
        MAIN.resetFilterDates();
    }
};
MAIN.disableElement = function (obj, disable) {
    "use strict";
    if (obj.hasAttribute("disabled")) { obj.removeAttribute("disabled"); }
    if (disable) { obj.setAttribute("disabled", "disabled"); }
};
MAIN.resetFilterDates = function () {
    "use strict";
    var scratchDate;
    scratchDate = new Date().setDate(-60);
    document.getElementById("txtStartDate").value = COMMON.dateToString(scratchDate);
    scratchDate = new Date();
    document.getElementById("txtEndDate").value = COMMON.dateToString(scratchDate);
};
MAIN.filterDateChange = function (isEP) {
    "use strict";
    var hasError, stDate, edDate;
    hasError = false;
    hasError = COMMON.checkFieldHasError("txtStartDate", hasError);
    hasError = COMMON.checkFieldHasError("txtEnddate", hasError);
    if (hasError) { return; }
    stDate = new Date(document.getElementById("txtStartDate").value);
    edDate = new Date(document.getElementById("txtEndDate").value);
    hasError = COMMON.checkFieldHasError("txtStartDate", hasError, stDate > edDate, "Start Date must be before or the same as End Date");
    hasError = COMMON.checkFieldHasError("txtEndDate", hasError, stDate > edDate, "Start Date must be before or the same as End Date");
    if (hasError) { return; }
    if (isEP) {
        MAIN.displayGridEP();
        return;
    }
    MAIN.displayWOGrid();
};
MAIN.statusFilterChange = function (obj) {
    "use strict";
    var id;
    id = obj.id.substring(9);
    MAIN.filterSettings[id].checked = obj.checked;
    COMMON.writeCookie(MAIN.filterSettingsCookieName, MAIN.filterSettings, true);
    MAIN.displayWOGrid();
};
MAIN.userFilterChanged = function (obj) {
    "use strict";
    MAIN.filterSettings.tech = COMMON.getDDLValue(obj);
    COMMON.writeCookie(MAIN.filterSettingsCookieName, MAIN.filterSettings, true);
    MAIN.displayWOGrid();
};
MAIN.WOGridIsNewStyle = function (val) {
    "use strict";
    if (val === "YES") {
        return "color:white;font-weight:bolder;background-color:red;width:95%;";
    }
    return "";
};
MAIN.filterButtonOpenClick = function () {
    "use strict";
    var obj;
    obj = document.getElementById("btnShowOpen");
    obj.value = "Show Filter";
    MAIN.displayWOGrid(false, true);
};
MAIN.displayWOGrid = function (fromSearch, allOpen) {
    "use strict";
    var startDate, endDate, userFilter, statusFilter, oneProp, searchString, userId, params, gridIndex, allOpenParam;
    startDate = (fromSearch || allOpen ? "" : COMMON.getTextValue("txtStartDate"));
    endDate = (fromSearch || allOpen ? "" : COMMON.getTextValue("txtEndDate"));
    userFilter = (fromSearch || allOpen ? "" : COMMON.getDDLValue("ddlMaintUsers"));
    statusFilter = "";
    if (!fromSearch && !allOpen) {
        for (oneProp in MAIN.filterSettings) {
            if (MAIN.filterSettings.hasOwnProperty(oneProp) && oneProp !== "tech") {
                if (MAIN.filterSettings[oneProp].checked) {
                    statusFilter += (statusFilter === "" ? "" : ",") + String(oneProp);
                }
            }
        }
    }
    searchString = COMMON.getTextValue("txtSearch");
    if (searchString === "") { searchString = "NULL"; }
    userId = (MAIN.userData.userid === "" ? "0" : MAIN.userData.userid);
    allOpenParam = "0";
    if (allOpen) {
        allOpenParam = "1";
    }
    params = [startDate, endDate, userFilter, statusFilter, searchString, userId, MAIN.siteId, allOpenParam];
    gridIndex = DISPLAYGRID.addGrid(MAIN.WOGridDivID, "divGrid0", "WOgetWorkOrders", params, 15, (MAIN.userData.loggedin ? 9 : 8), true, false, (fromSearch ? "No results found for &quot;" + searchString + "&quot;" : null));
    DISPLAYGRID.addRowButton(gridIndex, "btnEditWO", "View/Edit", "MAIN.displayWorkOrder(this.getAttribute('pkey'));");
    DISPLAYGRID.addStyleDefinition(gridIndex, 7, 7, MAIN.WOGridIsNewStyle);
    DISPLAYGRID.setWidth(gridIndex, "1148px");
    DISPLAYGRID.display(gridIndex);
};
//***************************************************Login**********************************************************//
MAIN.displayLogin = function () {
    "use strict";
    var formIndex, obj1, obj2;
    MAIN.setCurrentPage(2, "Login To Maintenance Work Order");
    FILLIN.reset();
    formIndex = FILLIN.createForm(MAIN.displayDivId, "Login", "Enter your user name and password to manage work orders.", MAIN.processLogin, null, "300px");
    FILLIN.addTextBox(formIndex, "txtUserName", "", "User Name", true, null, null, "280px", true);
    FILLIN.addTextBox(formIndex, "pasPassword", "", "Password", true, null, null, "280px", true, null, true);
    obj1 = COMMON.getBasicElement("div");
    obj1.style.width = "270px";
    obj2 = COMMON.getCheckBox("chkPersist", false);
    obj1.appendChild(obj2);
    FILLIN.addGenericControl(formIndex, obj1, "Keep me logged in", true);
    FILLIN.addButton(formIndex, true, "btnLogin", "Login", false, true);
    FILLIN.displayForm(formIndex);
    document.getElementById("chkPersist");
};
MAIN.processLogin = function () {
    "use strict";
    var params;
    params = { "parameters": [] };
    params.parameters.push(document.getElementById("txtUserName").value);
    params.parameters.push(document.getElementById("pasPassword").value);
    params.parameters.push(document.getElementById("chkPersist").checked ? "true" : "false");
    document.getElementById("txtData1").value = JSON.stringify(params);
    COMMON.vbPostBack("btnLogin");
};
//***************************************************Settings*****************************************************************//
MAIN.saveSettings = function (dialogResults) {
    "use strict";
    var changes, params, oneProp;
    if (!dialogResults) {
        //exit clicked
        MAIN.initHomePage();
        return;
    }
    if (!DISPLAYGRID.allGrids[MAIN.settingsGridIndex].pendingChanges) { return; }
    changes = DISPLAYGRID.allGrids[MAIN.settingsGridIndex].getData();
    for (oneProp in changes) {
        if (changes.hasOwnProperty(oneProp)) {
            params = [oneProp, COMMON.getDDLValue("ddlListMaster"), changes[oneProp][1], changes[oneProp][2], changes[oneProp][3], MAIN.siteId];
            AJAXPOST.callQuery("WOsaveListItem", params, true);
        }
    }
    MAIN.displaySettingsGrid();
    COMMON.errMess("Changes Saved");
};
MAIN.settingsGridIndex = null;
MAIN.currentListIndex = null;
MAIN.displaySettings = function () {
    "use strict";
    var formIndex, obj1;
    MAIN.setCurrentPage(3, "Application Settings");
    FILLIN.reset();
    formIndex = FILLIN.createForm(MAIN.displayDivId, "Manage Settings and Lists", "Use this screen to change settings and choices when entering work orders. Select the list you want to manage from the drop down list. Manage list by adding a new item or edit existing items in the grid and click Save.", MAIN.saveSettings, null, "900px");
    FILLIN.addDDL(formIndex, "ddlListMaster", null, "Select List To Manage", false, "getListMasterForSettings", null, null, true);
    obj1 = COMMON.getButton("btnAddNew", "", "MAIN.addNewSettingItem();");
    FILLIN.addGenericControl(formIndex, obj1);
    FILLIN.addButton(formIndex, false, "btnExit", "Exit", true);
    FILLIN.addButton(formIndex, true, "btnSaveSettings", "Save Changes");
    FILLIN.displayForm(formIndex);
    document.getElementById(MAIN.displayDivId).appendChild(COMMON.getBasicElement("div", "divSettingsGrid"));
    document.getElementById("btnAddNew").style.marginTop = "15px";
    document.getElementById("ddlListMaster").setAttribute("onchange", "MAIN.ddlMasterChanged();");
    MAIN.displaySettingsGrid();
};
MAIN.saveNewListItem = function (dialogResults, dataValues) {
    "use strict";
    var params;
    if (!dialogResults || !dataValues.hasChanged) { return; }
    params = ["0", COMMON.getDDLValue("ddlListMaster"), dataValues.txtSortOrder.value, dataValues.txtItem.value, 1, MAIN.siteId];
    AJAXPOST.callQuery("WOsaveListItem", params, true);
    MAIN.displaySettingsGrid();
    COMMON.errMess("New Item Added");
};
MAIN.continueAddNewSettingItem = function (dialogResults) {
    "use strict";
    var listName, formIndex;
    if (!dialogResults) { return; }
    listName = COMMON.getDDLText("ddlListMaster");
    formIndex = FILLIN.createDialog(MAIN.displayDivId, "Add New " + listName, "Enter field values (all fields are required and only numbers are allowed is Sort Order.  The new item will appear on the grid once you click save or exit to discard changes", MAIN.saveNewListItem, null, "50%");
    FILLIN.addTextBox(formIndex, "txtSortOrder", "", "Sort Order", true, "integer", null, null, true);
    FILLIN.addTextBox(formIndex, "txtItem", "", listName, true);
    FILLIN.addButton(formIndex, false, "btnExitNew", "Cancel", true, false, true);
    FILLIN.addButton(formIndex, true, "btnSaveNew", "Save", false, true);
    FILLIN.displayForm(formIndex);
};
MAIN.addNewSettingItem = function () {
    "use strict";
    if (MAIN.pendingChange) {
        FILLIN.yesNoDialog(MAIN.displayDivId, "Changes Pending", "There are data changes pending that you have not saved. Would you like to continue and discard these changes?", "50%", MAIN.continueAddNewSettingItem);
        return;
    }
    MAIN.continueAddNewSettingItem(true);
};
MAIN.continueDDLMasterChanged = function (dialogResults) {
    "use strict";
    if (!dialogResults) {
        document.getElementById("ddlListMaster").selectedIndex = MAIN.currentListIndex;
        return;
    }
    MAIN.displaySettingsGrid();
};
MAIN.ddlMasterChanged = function () {
    "use strict";
    if (MAIN.pendingChange) {
        FILLIN.yesNoDialog(MAIN.displayDivId, "Changes Pending", "There are data changes pending that you have not saved. Would you like to continue and discard these changes?", "50%", MAIN.continueDDLMasterChanged);
        return;
    }
    MAIN.displaySettingsGrid();
};
MAIN.continueDeleteItem = function (dialogResult, listId) {
    "use strict";
    var params, mess;
    if (!dialogResult) { return; }
    params = [listId];
    AJAXPOST.callQuery("deleteListItem", params);
    mess = AJAXPOST.dataResults[0][1];
    MAIN.displaySettingsGrid();
    COMMON.errMess(mess);
};
MAIN.deleteListItem = function (btnObj) {
    "use strict";
    var listId;
    listId = btnObj.getAttribute("pkey");
    if (MAIN.pendingChange) {
        FILLIN.yesNoDialog(MAIN.displayDivId, "Changes Pending", "There are data changes pending that you have not saved. Would you like to continue and discard these changes?", "50%", MAIN.continueDeleteItem, listId);
        return;
    }
    MAIN.continueDeleteItem(true, listId);
};
MAIN.displaySettingsGrid = function () {
    "use strict";
    var params, gridIndex;
    MAIN.pendingChange = false;
    MAIN.currentListIndex = document.getElementById("ddlListMaster").selectedIndex;
    COMMON.errMess("");
    document.getElementById("btnAddNew").value = "Add New " + COMMON.getDDLText("ddlListMaster");
    params = [COMMON.getDDLValue("ddlListMaster"), MAIN.siteId];
    DISPLAYGRID.resetGrid();
    gridIndex = DISPLAYGRID.addGrid("divSettingsGrid", "divGrid0", "WOgetList", params, 15, 1);
    DISPLAYGRID.addRowButton(gridIndex, "btnDelete", "Delete", "MAIN.deleteListItem(this);");
    DISPLAYGRID.addTextBox(gridIndex, 1, true, "integer", null, "MAIN.setPendingChange();", "MAIN.setPendingChange();");
    DISPLAYGRID.addTextBox(gridIndex, 2, true, null, null, "MAIN.setPendingChange();", "MAIN.setPendingChange();");
    DISPLAYGRID.addYesNo(gridIndex, 3, "MAIN.setPendingChange();");
    DISPLAYGRID.setWidth(gridIndex, "908px");
    DISPLAYGRID.display(gridIndex);
    MAIN.settingsGridIndex = gridIndex;
};
//****************************************Manage Notifications**************************************************//
MAIN.displayNotificationManagement = function () {
    "use strict";
    var formIndex, obj1, obj2, params, i, attr, iHTML;
    MAIN.setCurrentPage(6, "Manage Notifications");
    FILLIN.reset();
    formIndex = FILLIN.createForm(MAIN.displayDivId, "Manage Event Notification", "Use this screen to manage what events will cause a notification email to be sent.  You can set up the email where notification are sent by selecting Settings from the top menu.  If the event is checked below then you will receive an email with the information of the work order when that event occurs. Changes are automatically saved", null, null, "910px");
    params = ["6", MAIN.siteId];
    AJAXPOST.callQuery("WOgetList", params);
    iHTML = "<ul>";
    for (i = 0; i < AJAXPOST.dataResults.length; i++) {
        iHTML += "<li>" + AJAXPOST.dataResults[i][2] + "</li>";
    }
    iHTML += "</ul>";
    obj1 = COMMON.getBasicElement("div", null, iHTML);
    obj1.style.width = "880px";
    FILLIN.addGenericControl(formIndex, obj1, "Notification List", true);
    params = [MAIN.siteId];
    AJAXPOST.callQuery("getEventNotification", params);
    obj1 = COMMON.getBasicElement("div");
    obj1.style.width = "880px";
    for (i = 0; i < AJAXPOST.dataResults.length; i++) {
        attr = { "onchange": "MAIN.saveNotification(" + AJAXPOST.dataResults[i][0] + ");"};
        obj2 = COMMON.getCheckBox("chkSelection" + AJAXPOST.dataResults[i][0], (AJAXPOST.dataResults[i][2] === "1"), AJAXPOST.dataResults[i][1], null, null, attr);
        obj2.style.cssFloat = "left";
        obj2.style.width = "250px";
        obj1.appendChild(obj2);
    }
    FILLIN.addGenericControl(formIndex, obj1, "Events that will send notification email.", true);
    FILLIN.displayForm(formIndex);
};
MAIN.saveNotification = function (eventId) {
    "use strict";
    var params;
    params = [eventId, MAIN.siteId];
    AJAXPOST.callQuery("saveNotification", params, true);
};
//*****************************************Manage Users********************************************************//
MAIN.createNewUser = function () {
    "use strict";
    MAIN.displayEditUser("0");
};
MAIN.displayManageUsers = function () {
    "use strict";
    var formIndex;
    MAIN.setCurrentPage(4, "Manage Users");
    FILLIN.reset();
    formIndex = FILLIN.createForm(MAIN.displayDivId, "User Management", "Edit existing users by clicking on the edit button or create a new user by clicking on the Create button below. Deactivated user are unable to log in but must remain so that their history can be in the database. If the user is locked because he used the incorrect password too many times, you can unlock them by clicking on the Edit button and then unlocking them button.", MAIN.createNewUser, null, "900px");
    FILLIN.addButton(formIndex, true, "btnAddNewUser", "Create New User", true);
    FILLIN.displayForm(formIndex);
    document.getElementById(MAIN.displayDivId).appendChild(COMMON.getBasicElement("div", "divUserGrid"));
    MAIN.displayUserGrid();
};
MAIN.showActivate = function (val) {
    "use strict";
    return val === "";
};
MAIN.showDeactivate = function (val) {
    "use strict";
    return val === "Yes";
};
MAIN.displayUserGrid = function () {
    "use strict";
    var gridIndex, params;
    COMMON.errMess("");
    params = [MAIN.siteId];
    gridIndex = DISPLAYGRID.addGrid("divUserGrid", "divGrid0", "WOgetUsers", params, 15, 1);
    DISPLAYGRID.addRowButton(gridIndex, "btnEditUser", "Edit", "MAIN.displayEditUser(this.getAttribute('pkey'));", "77px");
    DISPLAYGRID.addRowButton(gridIndex, "btnActivate", "Activate", "MAIN.saveUser('changeApproval', null, this.getAttribute('pkey'));", "77px", 4, MAIN.showActivate);
    DISPLAYGRID.addRowButton(gridIndex, "btnDeactivate", "Deactivate", "MAIN.saveUser('changeApproval', null, this.getAttribute('pkey'));", "77px", 4, MAIN.showDeactivate);
    DISPLAYGRID.setButtonColumnWidth(gridIndex, "154px");
    DISPLAYGRID.setWidth(gridIndex, "908px");
    DISPLAYGRID.display(gridIndex);
};
MAIN.saveUser = function (dialogResult, dataValues, userId) {
    "use strict";
    var params, results, userdata;
    results = "";
    if (dialogResult === "Exit") { return; }
    if (dialogResult === "unlockUser" || dialogResult === "changeApproval") {
        params = [userId];
    }
    if (dialogResult === "saveUser") {
        userdata = {};
        userdata.username = dataValues.txtUserName.value;
        userdata.password = dataValues.pasPassword.value;
        userdata.firstname = dataValues.txtFirstName.value;
        userdata.lastname = dataValues.txtLastName.value;
        userdata.mi = dataValues.txtMI.value;
        userdata.employeenumber = dataValues.txtEmpNum.value;
        userdata.phone = dataValues.txtPhone.value;
        userdata.userid = userId;
        userdata.supervisor = (dataValues.ddlRole.value === "2");
        userdata.admin = (dataValues.ddlRole.value === "3");
        userdata.maintenance = (dataValues.ddlRole.value === "1");
        userdata.siteid = MAIN.siteId;
        params = [JSON.stringify(userdata)];
    }
    results = AJAXPOST.customRequest(dialogResult, params);
    MAIN.displayUserGrid();
    COMMON.errMess(results);
};
MAIN.displayEditUser = function (userId) {
    "use strict";
    var isNew, params, userData, formIndex, li, roleId;
    isNew = (userId === "0");
    params = [userId];
    userData = JSON.parse(AJAXPOST.customRequest("getUserData", params));
    formIndex = FILLIN.createDialog(MAIN.displayDivId, (isNew ? "Add User" : "Edit " + userData.firstname + " " + userData.lastname), "Required fields are marked with an asterisk*. " + (isNew ? "" : "To change the user&#49;s password, enter the new password in the text box otherwise leave blank. ") + "Click Save button to save your data or Cancel to exit without making changes", MAIN.saveUser, userId, "525px");
    FILLIN.addTextBox(formIndex, "txtUserName", (isNew ? "" : userData.username), "User Name", true, null, null, "248px", true, "User Name");
    FILLIN.addTextBox(formIndex, "pasPassword", "", "Password", isNew, null, null, "248px", false, "Password", true);
    FILLIN.addTextBox(formIndex, "txtFirstName", userData.firstname, "First Name", true, null, null, "223px", true, "First Name");
    FILLIN.addTextBox(formIndex, "txtLastName", userData.lastname, "Last Name", true, null, null, "223px", false, "Last Name");
    FILLIN.addTextBox(formIndex, "txtMI", userData.mi, "MI", false, null, null, "40px", false, "MI");
    FILLIN.addTextBox(formIndex, "txtEmpNum", userData.employeenumber, "Employee Number", false, null, null, "172px", true, "Employee Number");
    FILLIN.addTextBox(formIndex, "txtPhone", userData.phone, "Phone", false, null, null, "172px", false, "Phone");
    li = [{ "text": "Maintenance", "value": "1" }, { "text": "Supervisor", "value": "2" }, { "text": "Administrator", "value": "3" }];
    roleId = (userData.admin ? "3" : (userData.supervisor ? "2" : "1"));
    FILLIN.addDDL(formIndex, "ddlRole", roleId, "SecurityRole", false, li, null, "146px");
    FILLIN.addButton(formIndex, "Exit", "btnCancelEditUser", "Cancel", true, false, true);
    FILLIN.addButton(formIndex, "saveUser", "btnSaveEditUser", "Save", false, true);
    if (userData.locked) {
        FILLIN.addButton(formIndex, "unlockUser", "btnUnlockEditUser", "Unlock User", false, false, true);
    }
    FILLIN.displayForm(formIndex);
    if (userData.locked) {
        FILLIN.errorMessage(formIndex, "User is LOCKED!");
    }
};
//**************************************************Maintenance Orders************************************************//
MAIN.currentWO = null;
// MAIN.currentWO = {
//    "originatorname": ""
//, "originatorphone": ""
//, "assigneduserid": ""
//, "worklocationid": "-1"
//, "summary": ""
//, "worktypeid": "-1" 
//, "status": "New" //defaults to Status New
//, "priorityid": "" //defaults to first list item
//, "expecteddate": ""
//, "completeddate": ""
//, "createddate": "" //default to current system time
//, "siteid": ""
//, "workorderid": ""
//, "assigneduser": ""
//, "worklocation": ""
//, "worktype": ""
//, "priority": ""
//, "statusid": ""
//, "isnew": true
//, "isreadonly": false
//, "workflowstep": 1
//, "currenteditorid":""
//, "noteallowed":false
//}
MAIN.displayWorkOrder = function (workorderid) {
    "use strict";
    var obj1, obj2, obj3, params, mainDiv, pageTitle, helpTopic;
    FILLIN.reset();
    params = [workorderid, MAIN.siteId];
    MAIN.currentWO = JSON.parse(AJAXPOST.customRequest("getWorkOrder", params));
    pageTitle = "New Maintenance Work Order";
    if (!MAIN.currentWO.isnew) {
        pageTitle = "Maintenance Work Order " + String(MAIN.currentWO.workorderid).padLeft("0", 6);
    } else {
        MAIN.currentWO.originatorname = MAIN.userData.firstname + " " + MAIN.userData.lastname;
    }
    helpTopic = 5;
    if (MAIN.userData.securitylevel === 1) { helpTopic = 9; }
    if (MAIN.userData.securitylevel > 2) { helpTopic = 10; }
    if (MAIN.currentWO.isnew) { helpTopic = 11; }
    MAIN.setCurrentPage(helpTopic, pageTitle);
    //override readonly for supervisor or admin and if workorder is not closed
    if (MAIN.userData.securitylevel >= 2 && MAIN.currentWO.workflowstep < 3) { MAIN.currentWO.isreadonly = false; }
    mainDiv = document.getElementById(MAIN.displayDivId);
    mainDiv.appendChild(COMMON.getBasicElement("div", "divOrderLeft"));
    obj1 = COMMON.getBasicElement("div", "divOrderRight");
    obj1.appendChild(COMMON.getBasicElement("div", "divOrderNote"));
    obj1.appendChild(COMMON.getBasicElement("div", "divOrderNoteHistory"));
    mainDiv.appendChild(obj1);
    MAIN.displayWOHeader();
    if (MAIN.currentWO.noteallowed) {
        obj1 = document.getElementById("divOrderNote");
        obj2 = COMMON.getBasicElement("fieldset", null, null, "newNoteFieldset");
        obj3 = COMMON.getBasicElement("legend", null, "New Note");
        obj2.appendChild(obj3);
        obj3 = COMMON.getFieldObject("txa", "txaNewNote", "", false, null, "Enter new note to attach to this work order");
        COMMON.addAttribute(obj3, "onkeyup", "MAIN.setWOPendingChange();", true);
        obj2.appendChild(obj3);
        obj1.appendChild(obj2);
    }
    if (!MAIN.currentWO.isnew) {
        MAIN.displayWOSupplemental();
    }
    MAIN.displayNotes();
    MAIN.createEPObject(MAIN.currentWO.workorderid, true);
    if (MAIN.currentWO.hasep) { MAIN.displayEPHeadWO(); }
};
MAIN.displayEPHeadWO = function () {
    "use strict";
    var formIndex, gridIndex, params, attr;
    formIndex = FILLIN.createForm("divOrderLeft", "Equipment Parts", "Use the &quot;Manage Equipment Parts&quot; button to make changes or edit equipment parts for this work order.", null, null, "765px");
    MAIN.fillInHeaderStaticEP(formIndex, true);
    attr = { "style": "width:754px;color:black;margin:0;padding:0;" };
    FILLIN.addGenericControl(formIndex, COMMON.getBasicElement("div", "divEPLineGrid", null, null, null, attr), "&nbsp;", true);
    FILLIN.displayForm(formIndex);
    params = [MAIN.currentEP.equipmentpartid];
    gridIndex = DISPLAYGRID.addGrid("divEPLineGrid", "divGrid00", "WOGetEquipmentLineGrid", params, 5, 1, true, true);
    DISPLAYGRID.setWidth(gridIndex, "750px");
    DISPLAYGRID.hideColumn(gridIndex, 6);
    DISPLAYGRID.display(gridIndex);
};
MAIN.setWOPendingChange = function () {
    "use strict";
    var val;
    val = COMMON.getTextValue("txaNewNote");
    FILLIN.allForms[MAIN.headerFormIndex].pendingChanges = (val !== "");
    FILLIN.allForms[MAIN.headerFormIndex].errorMessage(val === "" ? "" : "*Pending Changes");
};
MAIN.headerFormIndex = null;
MAIN.displayWOHeader = function () {
    "use strict";
    var formIndex, params;
    params = ["", ""];
    formIndex = FILLIN.createForm("divOrderLeft", (MAIN.currentWO.isnew ? "Create New Work Order" : "Edit Work Order " + String(MAIN.currentWO.workorderid).padLeft("0", 6)), (!MAIN.currentWO.isreadonly ? "fields marked with asterisk* are required. Fill out all information and click Save. " : "") + "Enter any notes for this work order in the New Note area. Existing notes will be below listed in chronological order." + (MAIN.userData.securitylevel >= 2 ? "  You can delete notes by clicking on the X above your note." : ""), MAIN.processWOCommands, null, "765px");
    FILLIN.addSpan(formIndex, null, (MAIN.currentWO.isnew ? "New" : MAIN.currentWO.workorderid.padLeft("0", 6)), "Work Order Number", "140px", true);
    if (MAIN.currentWO.isreadonly) {
        FILLIN.addSpan(formIndex, null, MAIN.currentWO.originatorname, "Submitter&#39;s Name", "300px");
        FILLIN.addSpan(formIndex, null, MAIN.currentWO.originatorphone, "Contact Phone or Email", "260px");
        FILLIN.addSpan(formIndex, null, MAIN.currentWO.worklocation, "Work Location", "260px", true);
        FILLIN.addSpan(formIndex, null, MAIN.currentWO.worktype, "Type", "130px");
        FILLIN.addSpan(formIndex, null, MAIN.currentWO.priority, "Priority", "128px");
    } else {
        FILLIN.addTextBox(formIndex, "txtOriginator", MAIN.currentWO.originatorname, "Submitter&#39;s Name", true, null, null, "282px", false, "Enter your full name");
        FILLIN.addTextBox(formIndex, "txtOriginatorPhone", MAIN.currentWO.originatorphone, "Contact Phone or Email", true, null, null, "298px", false, "Enter you extension or email for us to contact you");
        params[0] = "1";
        params[1] = MAIN.siteId;
        FILLIN.addDDL(formIndex, "ddlWorkLocation", MAIN.currentWO.worklocationid, "Work Location", true, "WOgetListForDDL", params, "240px", true);
        params[0] = "2";
        FILLIN.addDDL(formIndex, "ddlWorkType", MAIN.currentWO.worktypeid, "Type", true, "WOgetListForDDL", params, "200px");
        params[0] = "4";
        FILLIN.addDDL(formIndex, "ddlPriority", MAIN.currentWO.priorityid, "Priority", true, "WOgetListForDDL", params, "120px");
    }
    FILLIN.addSpan(formIndex, null, MAIN.currentWO.createddate, "Created Date", "162px");
    if (MAIN.currentWO.isreadonly) {
        FILLIN.addSpan(formIndex, null, MAIN.currentWO.summary, "Summary", "740px", true);
    } else {
        FILLIN.addTextArea(formIndex, "txaSummary", MAIN.currentWO.summary, "Summary", true, null, 1000, "740px", "100px", true, "Enter a short summary describing the problem here. Enter more detail using a note");
    }
    //buttons
    FILLIN.addButton(formIndex, "Exit", "btnExitWO", "Exit", true, false, true);
    if (!MAIN.currentWO.isreadonly || MAIN.currentWO.noteallowed) {
        FILLIN.addButton(formIndex, "Save", "btnSaveWO", "Save", false, true);
    }
    if (!MAIN.currentWO.isnew) {
        FILLIN.addButton(formIndex, "Print", "btnPrintWO", "Print Work Order", true);
        if (MAIN.userData.securitylevel >= 1 && MAIN.currentWO.workflowstep < 3) {
            FILLIN.addButton(formIndex, "Cancel", "btnCancelWO", "Cancel Work Order", false, false, true);
            FILLIN.addButton(formIndex, "ManageEP", "btnManageEP", "Manage Equipment Parts", false, false, true);
        }
    }
    FILLIN.displayForm(formIndex);
    MAIN.headerFormIndex = formIndex;
};
MAIN.displayWOSupplemental = function () {
    "use strict";
    var formIndex, params;
    formIndex = FILLIN.createForm("divOrderLeft", "Additional Information", null, MAIN.processWOCommands, null, "765px");
    if (MAIN.userData.securitylevel >= 2 && !MAIN.currentWO.isreadonly) {
        params = [MAIN.siteId];
        FILLIN.addDDL(formIndex, "ddlMaintUser", MAIN.currentWO.assigneduserid, "Maintenance Personnel Assigned", false, "WOGetAssignWorkerDDL", params, "300px", true, "FILLIN.zfieldChanged(" + String(MAIN.headerFormIndex) + ");");
        FILLIN.addCalendar(formIndex, "txtExpectedDate", MAIN.currentWO.expecteddate, "Expected Date", false, false, "FILLIN.zfieldChanged(" + String(MAIN.headerFormIndex) + ");");
    } else {
        FILLIN.addSpan(formIndex, null, (MAIN.currentWO.assigneduser === "" ? "&nbsp;" : MAIN.currentWO.assigneduser), "Maintenance Personnel Assigned", "300px", true);
        FILLIN.addSpan(formIndex, null, (MAIN.currentWO.expecteddate === "" ? "&nbsp;" : MAIN.currentWO.expecteddate), "Expected Date", "145px");
    }

    FILLIN.addSpan(formIndex, null, MAIN.currentWO.status, "Status", "255px");
    FILLIN.addSpan(formIndex, null, (MAIN.currentWO.completeddate === "" ? "&nbsp;" : MAIN.currentWO.completeddate), "Completed Date", "740px", true);

    //buttons
    if (MAIN.userData.securitylevel >= 2) {
        if (MAIN.currentWO.workflowstep === 7) {
            FILLIN.addButton(formIndex, "ReOpen", "btnReOpenWO", "Re-Open Work Order");
        }
        if (MAIN.currentWO.workflowstep === 4) {
            FILLIN.addButton(formIndex, "Close", "btnCloseWO", "Close and Accept Work Order");
            FILLIN.addButton(formIndex, "Reject", "btnRejectWO", "Reject Completion");
        }
        if (MAIN.currentWO.workflowstep === 3 || MAIN.currentWO.workflowstep === 5) {
            FILLIN.addButton(formIndex, "Uncancel", "btnUncancelWO", "Remove Cancellation");
        }
    }
    if (MAIN.userData.securitylevel >= 1) {
        if (MAIN.currentWO.workflowstep === 2 || MAIN.currentWO.workflowstep === 6) {
            FILLIN.addButton(formIndex, "Completed", "btnCompletedWO", "Maintenance Completed");
        }
    }
    FILLIN.displayForm(formIndex);
};
MAIN.noteFullText = null;
MAIN.displayNotes = function () {
    "use strict";
    var params, i, iHTML, className, noteText, legendText, deleteEligible, longNote, noteObj;
    MAIN.noteFullText = {};
    params = [MAIN.currentWO.workorderid];
    AJAXPOST.callQuery("getNotes", params);
    if (!AJAXPOST.dataResults || AJAXPOST.dataResults.length === 0) { return; }
    iHTML = "";
    for (i = 0; i < AJAXPOST.dataResults.length; i++) {
        deleteEligible = (MAIN.userData.securitylevel >= 2 && AJAXPOST.dataResults[i][1] !== "18" && MAIN.currentWO.noteallowed);
        switch (AJAXPOST.dataResults[i][1]) {
        case "15":
            className = "submitterFieldset";
            legendText = "Orginator";
            break;
        case "16":
            className = "maintFieldset";
            legendText = "Maintenance Staff";
            break;
        case "17":
            className = "supervisorFieldset";
            legendText = "Supervisor";
            break;
        case "18":
            className = "autoFieldset";
            legendText = "Auto-Log";
            break;
        }
        noteText = AJAXPOST.dataResults[i][2].replace("\"", "&quot;");
        longNote = noteText.length > 120;
        if (longNote) {
            noteObj = {};
            noteObj.text = noteText;
            noteObj.type = legendText;
            noteObj.author = AJAXPOST.dataResults[i][3] + " " + AJAXPOST.dataResults[i][4];
            MAIN.noteFullText[AJAXPOST.dataResults[i][0]] = noteObj;

            noteText = noteText.substring(0, 120) + "...";
        }
        iHTML += "<fieldset class=\"" + className + "\">";
        iHTML += "<legend>"  + legendText + "</legend>";
        iHTML += "<h6>" + AJAXPOST.dataResults[i][3] + " " + AJAXPOST.dataResults[i][4] + "</h6>";
        if (deleteEligible) {
            iHTML += "<input type=\"button\" value=\"Delete\" title=\"Delete this note\" onclick=\"MAIN.deleteNote(" + AJAXPOST.dataResults[i][0] + ");\" />";
        }
        iHTML += "<p>" + noteText + "</p>";
        if (longNote) {
            iHTML += "<div style=\"clear:both;\"><a href=\"#\" onclick=\"MAIN.displayFullNote(" + AJAXPOST.dataResults[i][0] + "); return false;\">Read More.</a></div>";
        }
        iHTML += "</fieldset>";
    }
    document.getElementById("divOrderNoteHistory").innerHTML = iHTML;
};
MAIN.displayFullNote = function (noteid) {
    "use strict";
    FILLIN.okDialog(MAIN.displayDivId, MAIN.noteFullText[noteid].type, "<h3>" + MAIN.noteFullText[noteid].author + "</h3><p>" + MAIN.noteFullText[noteid].text + "</p>", "50%", "Close");
};
MAIN.sendEmail = function (eventid, orderid) {
    "use strict";
    //eventid   descript
    //125       Order Created
    //126       Order Assigned
    //127       Order Cancelled (Assigned Tech)
    //128       Work Completed (Unapproved)
    //129       Order Cancelled (Supervisor)
    //130       Work Rejected (Supervisor)
    //131       Order Closed
    //132       Note Created
    //133       Note Deleted
    //134       Work Order Data Updated
    //135       Work Order Re-openned
    //136       Cancellation Removed from Work Order
    //137       Equipment Part Order Created
    var params;
    if (orderid === undefined || orderid === null) {
        orderid = MAIN.currentWO.workorderid;
    }
    params = [String(orderid), String(eventid)];
    AJAXPOST.customRequest("sendEmail", params);
};
MAIN.deleteNote = function (noteid) {
    "use strict";
    var params;
    params = [noteid, MAIN.userData.userid];
    AJAXPOST.callQuery("deleteNote", params, true);
    MAIN.sendEmail(133);
    params = ["Note Deleted", MAIN.currentWO.workorderid, MAIN.siteId];
    AJAXPOST.customRequest("sendEmail", params);
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess("Note Deleted");
};
MAIN.processWOCommands = function (dialogResult, datavalues) {
    "use strict";
    if (dialogResult === "Save") {
        MAIN.saveWO(datavalues);
        return;
    }
    if (dialogResult === "Exit") {
        MAIN.initHomePage();
        return;
    }
    if (dialogResult === "Print") {
        MAIN.printWO();
        return;
    }
    if (dialogResult === "Cancel") {
        MAIN.cancelWO();
        return;
    }
    if (FILLIN.allForms[MAIN.headerFormIndex].pendingChanges) {
        FILLIN.okDialog(MAIN.displayDivId, "Pending Change", "You have changes pending, you need to save them before continuing. Click save and then try your action again", "50%");
        return;
    }
    if (dialogResult === "ReOpen" || dialogResult === "Close") {
        MAIN.closeOrReopenWO();
        return;
    }
    if (dialogResult === "Reject") {
        MAIN.rejectWO();
        return;
    }
    if (dialogResult === "Uncancel") {
        MAIN.uncancelWO();
        return;
    }
    if (dialogResult === "Completed") {
        MAIN.workCompletedWO();
        return;
    }
    if (dialogResult === "ManageEP") {
        MAIN.manageEPFromWO();
        return;
    }
};
MAIN.continueRejectWO = function (dialogResult, datavalues) {
    "use strict";
    var params;
    if (!dialogResult || !datavalues.hasChanged) { return; }
    MAIN.saveNote("Work Order Rejected: " + datavalues.txaNoteReject.value);
    params = [MAIN.currentWO.workorderid, MAIN.userData.userid];
    AJAXPOST.callQuery("setWorkOrderRejected", params, true);
    MAIN.sendEmail(130);
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess("Work Order Rejected");
};
MAIN.rejectWO = function () {
    "use strict";
    var formIndex;
    formIndex = FILLIN.createDialog(MAIN.displayDivId, "Rejection Reason", "You must enter a reason for the rejection and click Continue. Rejected work orders are set to status &quot;Assigned&quot; so the work can be completed again.", MAIN.continueRejectWO, null, "500px");
    FILLIN.addTextArea(formIndex, "txaNoteReject", "", "Rejection Reason", true, null, 2000, "400px", "200px", true, "Enter a reason for rejecting the work on the work order");
    FILLIN.addButton(formIndex, false, "btnRejectExit", "Cancel", true, false, true);
    FILLIN.addButton(formIndex, true, "btnRejectSave", "Continue", false, true);
    FILLIN.displayForm(formIndex);
};
MAIN.closeOrReopenWO = function () {
    "use strict";
    var params, today, mess;
    today = new Date();
    params = [MAIN.currentWO.workorderid, MAIN.userData.userid, COMMON.dateToString(today)];
    AJAXPOST.callQuery("setWorkOrderClose", params);
    mess = AJAXPOST.dataResults[0][0];
    MAIN.sendEmail(MAIN.currentWO.workflowstep === 7 ? 135 : 131);
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess(mess);
};
MAIN.saveWO = function (datavalues, suppressEmail) {
    "use strict";
    var params, hasFields, obj, emailSent, fieldsUpdated, woAssigned;
    emailSent = false;
    hasFields = false;
    fieldsUpdated = false;
    woAssigned = false;
    if (datavalues) {
        if (datavalues.hasOwnProperty("txtOriginator") && MAIN.currentWO.originatorname !== datavalues.txtOriginator.value) {
            MAIN.currentWO.originatorname = datavalues.txtOriginator.value;
            hasFields = true;
            fieldsUpdated = true;
        }
        if (datavalues.hasOwnProperty("txtOriginatorPhone") && MAIN.currentWO.originatorphone !== datavalues.txtOriginatorPhone.value) {
            MAIN.currentWO.originatorphone = datavalues.txtOriginatorPhone.value;
            hasFields = true;
            fieldsUpdated = true;
        }
        if (datavalues.hasOwnProperty("ddlWorkLocation") && MAIN.currentWO.worklocationid !== datavalues.ddlWorkLocation.value) {
            MAIN.currentWO.worklocationid = datavalues.ddlWorkLocation.value;
            hasFields = true;
            fieldsUpdated = true;
        }
        if (datavalues.hasOwnProperty("ddlWorkType") && MAIN.currentWO.worktypeid !== datavalues.ddlWorkType.value) {
            MAIN.currentWO.worktypeid = datavalues.ddlWorkType.value;
            hasFields = true;
            fieldsUpdated = true;
        }
        if (datavalues.hasOwnProperty("ddlPriority") && MAIN.currentWO.priorityid !== datavalues.ddlPriority.value) {
            MAIN.currentWO.priorityid = datavalues.ddlPriority.value;
            hasFields = true;
            fieldsUpdated = true;
        }
        if (datavalues.hasOwnProperty("txaSummary") && MAIN.currentWO.summary !== datavalues.txaSummary.value) {
            MAIN.currentWO.summary = datavalues.txaSummary.value;
            hasFields = true;
            fieldsUpdated = true;
        }
    }
    obj = document.getElementById("ddlMaintUser");
    if (obj && MAIN.currentWO.assigneduserid !== COMMON.getDDLValue(obj)) {
        MAIN.currentWO.assigneduserid = COMMON.getDDLValue("ddlMaintUser");
        hasFields = true;
        woAssigned = true;
    }
    obj = document.getElementById("txtExpectedDate");
    if (obj && MAIN.currentWO.expecteddate !== COMMON.getTextValue(obj)) {
        MAIN.currentWO.expecteddate = COMMON.getTextValue("txtExpectedDate");
        hasFields = true;
        fieldsUpdated = true;
    }
    if (hasFields) {
        MAIN.currentWO.siteid = MAIN.siteId;
        MAIN.currentWO.currenteditorid = MAIN.userData.userid;
        params = [JSON.stringify(MAIN.currentWO)];
        MAIN.currentWO.workorderid = AJAXPOST.customRequest("saveWorkOrderHeader", params);
    }
    if (woAssigned && !suppressEmail) {
        MAIN.sendEmail(126);
        emailSent = true;
    }
    if (fieldsUpdated && !emailSent && !suppressEmail) {
        MAIN.sendEmail(134);
        emailSent = true;
    }
    if (MAIN.currentWO.isnew && !emailSent && !suppressEmail) {
        MAIN.sendEmail(125);
        emailSent = true;
    }
    obj = document.getElementById("txaNewNote");
    if (obj && obj.value !== "") {
        MAIN.saveNote(obj.value);
        if (!emailSent && !suppressEmail) { MAIN.sendEmail(132); }
    }
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess("Work Order Saved");
};
MAIN.saveNote = function (message) {
    "use strict";
    var params;
    params = [MAIN.currentWO.workorderid, MAIN.userData.userid, message];
    AJAXPOST.callQuery("saveNote", params, true);
};
MAIN.printWO = function () {
    "use strict";
    var params, obj1, obj2, newWindowObj, iHTML, i;
    newWindowObj = window.open("", "newWindowObj", "menubar=no, scrollbars=yes, status=no, titlebar=no, toolbar=no");
    obj1 = newWindowObj.document.createElement("style");
    obj1.type = "text/css";
    obj1.media = "print";
    obj1.innerHTML = ".hideDiv{display:none;}";
    newWindowObj.document.body.appendChild(obj1);
    obj1 = newWindowObj.document.createElement("style");
    obj1.type = "text/css";
    obj1.innerHTML = "table{border-collapse:collapse;}td{margin:0;padding:2px;border:solid 1px black;}th{margin:0;padding:2px;border-color:black;border-width:1px 1px 2px 1px;border-style:solid;}h2, h3{margin:0;padding:0;}";
    newWindowObj.document.body.appendChild(obj1);
    obj1 = newWindowObj.document.createElement("div");
    obj1.className = "hideDiv";
    obj2 = newWindowObj.document.createElement("input");
    obj2.type = "button";
    obj2.value = "Print";
    obj2.setAttribute("style", "float:left;");
    obj2.setAttribute("onclick", "window.print();");
    obj1.appendChild(obj2);
    obj2 = newWindowObj.document.createElement("input");
    obj2.type = "button";
    obj2.value = "Close";
    obj2.setAttribute("style", "float:right;");
    obj2.setAttribute("onclick", "window.close();");
    obj1.appendChild(obj2);
    newWindowObj.document.body.appendChild(obj1);
    obj1 = newWindowObj.document.createElement("div");
    iHTML = "<h2 style='clear:both;'>Work Order " + String(MAIN.currentWO.workorderid).padLeft("0", 6) + " for Location: " + MAIN.currentWO.worklocation + "</h2>";
    iHTML += "<h3>" + MAIN.currentWO.summary + "</h3><table><tr><th>Submitter&#39;s Name</th><th>Contact Phone or Email</th><th>Type</th></tr><tr><td>" + MAIN.currentWO.originatorname + "</td><td>" + MAIN.currentWO.originatorphone + "</td><td>" + MAIN.currentWO.worktype + "</td></tr><tr><th>Priority</th><th>Status</th><th>Maintenance Personnel Assigned</th></tr><tr><td>" + MAIN.currentWO.priority + "</td><td>" + MAIN.currentWO.status + "</td><td>" + MAIN.currentWO.assigneduser + "</td></tr><tr><th>Created Date</th><th>Expected Date</th><th>Completed Date</th></tr><tr><td>" + MAIN.currentWO.createddate + "</td><td>" + MAIN.currentWO.expecteddate + "</td><td>" + MAIN.currentWO.completeddate + "</td></tr></table><h2>History/Log</h2>";
    params = [String(MAIN.currentWO.workorderid)];
    AJAXPOST.callQuery("getNotes", params);
    if (AJAXPOST.dataResults && AJAXPOST.dataResults.length > 0) {
        for (i = 0; i < AJAXPOST.dataResults.length; i++) {
            iHTML += "<div>" + AJAXPOST.dataResults[i][4] + " " + AJAXPOST.dataResults[i][5] + " " + AJAXPOST.dataResults[i][3] + ": " + AJAXPOST.dataResults[i][2] + "</div>";
        }
    } else {
        iHTML += "<div>None</div>";
    }
    obj1.innerHTML = iHTML;
    newWindowObj.document.body.appendChild(obj1);
};
MAIN.cancelWO = function () {
    "use strict";
    var params;
    params = [MAIN.currentWO.workorderid, MAIN.userData.securitylevel, MAIN.userData.userid];
    AJAXPOST.callQuery("CancelWorkOrder", params, true);
    MAIN.sendEmail(MAIN.userData.securitylevel === 2 ? 129 : 127);
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess("Work Order Cancelled");
};
MAIN.uncancelWO = function () {
    "use strict";
    var params;
    params = [MAIN.currentWO.workorderid, MAIN.userData.userid];
    AJAXPOST.callQuery("UnCancelWorkOrder", params, true);
    MAIN.sendEmail(136);
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess("Cancellation Removed from Work Order");
};
MAIN.workCompletedWO = function () {
    "use strict";
    var params;
    params = [MAIN.currentWO.workorderid, MAIN.userData.userid];
    AJAXPOST.callQuery("setWorkCompleted", params, true);
    MAIN.sendEmail(128);
    MAIN.displayWorkOrder(MAIN.currentWO.workorderid);
    COMMON.errMess("Work Completed on this Work Order");
};
//*********************************************Parts Order***************************************//
MAIN.currentEP = null;
MAIN.displayEquipmentParts = function () {
    "use strict";
    var formIndex, obj1, obj2, obj3, obj4, obj5, i, baseDiv, cellCount, cellDiv, cellWidth, attr;
    FILLIN.reset();
    MAIN.setCurrentPage(7, "Equipment Parts");
    formIndex = FILLIN.createForm(MAIN.displayDivId, "Manage Equipment Parts", "Manage Existing Orders or add a new Equipment Part Order.  Use the filters to navigate to the Order you wish to manage in the grid below. Add a new order by clicking on the &quot;Add New Equipment Part Order&quot; button", MAIN.processBtnEP, null, "900px");

    obj1 = COMMON.getBasicElement("div");
    obj2 = document.createElement("input");
    obj2.type = "radio";
    obj2.id = "rad60";
    obj2.setAttribute("name", "radDateFilter");
    obj2.value = "rad60";
    obj2.checked = true;
    obj2.setAttribute("onchange", "MAIN.customDateFilterChange(false);");
    obj1.appendChild(obj2);
    obj2 = document.createElement("label");
    obj2.setAttribute("for", "rad60");
    obj2.innerHTML = "Last 60 Days";
    obj1.appendChild(obj2);

    obj2 = document.createElement("input");
    obj2.type = "radio";
    obj2.id = "radCust";
    obj2.setAttribute("name", "radDateFilter");
    obj2.value = "radCust";
    obj2.setAttribute("onchange", "MAIN.customDateFilterChange(true);");
    obj1.appendChild(obj2);
    obj2 = document.createElement("label");
    obj2.setAttribute("for", "radCust");
    obj2.innerHTML = "Custom Dates";
    obj1.appendChild(obj2);

    obj2 = document.createElement("table");
    obj2.setAttribute("style", "padding:0; margin:0;");

    obj3 = document.createElement("tr");
    obj4 = document.createElement("td");
    obj4.innerHTML = "Start";
    obj3.appendChild(obj4);
    obj4 = document.createElement("td");
    obj4.innerHTML = "End";
    obj3.appendChild(obj4);
    obj4 = document.createElement("td");
    obj4.innerHTML = "&nbsp;";
    obj3.appendChild(obj4);
    obj2.appendChild(obj3);

    obj3 = document.createElement("tr");
    obj4 = document.createElement("td");
    obj4.appendChild(COMMON.getCalendar("txtStartDate", null, true, null, "divErrMess" + String(formIndex), "txtFilterDate", null, null, null, true));
    obj3.appendChild(obj4);
    obj4 = document.createElement("td");
    obj4.appendChild(COMMON.getCalendar("txtEndDate", null, true, null, "divErrMess" + String(formIndex), "txtFilterDate", null, null, null, true));
    obj3.appendChild(obj4);
    obj4 = document.createElement("td");
    obj5 = COMMON.getButton("btnDateFilt", "Apply", "MAIN.filterDateChange(true);");
    obj5.disabled = true;
    obj4.appendChild(obj5);

    obj3.appendChild(obj4);
    obj2.appendChild(obj3);
    obj1.appendChild(obj2);

    FILLIN.addGenericControl(formIndex, obj1, "Date Filter", null, true);

    attr = { "onchange": "MAIN.displayGridEP();" };
    obj1 = COMMON.getBasicElement("div");
    obj2 = COMMON.getCheckBox("chkPending", true, "Pending Orders", null, null, attr);
    obj1.appendChild(obj2);
    obj2 = COMMON.getCheckBox("chkCompleted", false, "Completed Orders", null, null, attr);
    obj1.appendChild(obj2);

    FILLIN.addGenericControl(formIndex, obj1, "Show Only");

    FILLIN.addButton(formIndex, "AddNew", "btnAddNewEP", "Add New Equipment Part Order", true);
    FILLIN.addButton(formIndex, "Report", "btnReportEP", "Print");
    FILLIN.displayForm(formIndex);
    document.getElementById(MAIN.displayDivId).appendChild(COMMON.getBasicElement("div", "divGridEP"));
    //set the width of cells to 32%
    baseDiv = document.getElementById("divContentBase" + String(formIndex)).childNodes;
    cellCount = 0;
    for (i = 0; i < baseDiv.length; i++) {
        cellDiv = baseDiv[i];
        if (cellDiv.getAttribute("class") === "dvCDControlCell") {
            switch (cellCount) {
            case 0:
                cellWidth = "440";
                break;
            case 1:
                cellWidth = "440";
                break;
            }
            COMMON.addAttribute(cellDiv, "style", "width:" + cellWidth + "px;height:130px", true);
            cellCount++;
        }
    }
    MAIN.resetFilterDates();
    MAIN.displayGridEP();
};
MAIN.displayGridEP = function () {
    "use strict";
    var params, gridIndex;
    params = [MAIN.siteId, COMMON.getTextValue("txtStartDate"), COMMON.getTextValue("txtEndDate"), (COMMON.getChkValue("chkPending") ? "1" : "0"), (COMMON.getChkValue("chkCompleted") ? "1" : "0")];
    gridIndex = DISPLAYGRID.addGrid("divGridEP", "divGrid0", "WOGetEquipmentPartsGrid", params, 15, 1, true);
    DISPLAYGRID.addRowButton(gridIndex, "btnEditEP", "Manage", "MAIN.displayEP(this.getAttribute('pkey'));");
    DISPLAYGRID.setWidth(gridIndex, "908px");
    DISPLAYGRID.display(gridIndex);
};
MAIN.continueAddNewEP = function (dialogResult) {
    "use strict";
    if (dialogResult) {
        MAIN.initHomePage();
        FILLIN.okDialog(MAIN.displayDivId, "Order parts from within Work Order", "Please order parts from within the Work Order that requires them.  This is to keep track of the disposition of parts. Edit the Work Order and click the &quot;Order Parts&quot; button.", "50%");
        return;
    }
    MAIN.createEPObject(0);
    MAIN.createNewEP();
};
MAIN.processBtnEP = function (dialogResults) {
    "use strict";
    var params;
    if (dialogResults === "AddNew") {
        FILLIN.yesNoDialog(MAIN.displayDivId, "New Equipment Part", "Is the part being ordered part being used to complete a Work Order?", "50%", MAIN.continueAddNewEP);
        return;
    }
    if (dialogResults === "Report") {
        params = [MAIN.siteId, COMMON.getTextValue("txtStartDate"), COMMON.getTextValue("txtEndDate"), (COMMON.getChkValue("chkPending") ? "1" : "0"), (COMMON.getChkValue("chkCompleted") ? "1" : "0")];
        AJAXPOST.customRequest("equipPartsReport", params, true);
        //AJAXPOST.downloadPDF("rpt/6500.pdf");
        return;
    }
};
MAIN.createEPObject = function (id, isOrder) {
    "use strict";
    var params;
    params = [String(id), (isOrder ? "1" : "0")];
    AJAXPOST.callQuery("WOgetEquipmentPartsHeader", params);
    MAIN.currentEP = {};
    MAIN.currentEP.equipmentpartid = parseFloat(AJAXPOST.dataResults[0][0]); //the equipmentpartid is not always the id from the parameters of the function
    MAIN.currentEP.createddate = AJAXPOST.dataResults[0][1];
    MAIN.currentEP.dept = AJAXPOST.dataResults[0][2];
    MAIN.currentEP.workorderid = (AJAXPOST.dataResults[0][3] === "No Work Order" ? AJAXPOST.dataResults[0][3] : (AJAXPOST.dataResults[0][3]).padLeft("0", 6));
    MAIN.currentEP.epnote = AJAXPOST.dataResults[0][4];
    MAIN.currentEP.createuser = (AJAXPOST.dataResults[0][5] === "" ? MAIN.userData.firstname + " " + MAIN.userData.lastname : AJAXPOST.dataResults[0][5]);
    MAIN.currentEP.status = AJAXPOST.dataResults[0][6];
    MAIN.currentEP.createuserid = (AJAXPOST.dataResults[0][7] === "" ? MAIN.userData.userid : AJAXPOST.dataResults[0][7]);
    MAIN.currentEP.isorder = (AJAXPOST.dataResults[0][8] === "1");
};
MAIN.manageEPFromWO = function () {
    "use strict";
    //EP object (MAIN.currentEP) was created when Work Order was displayed
    if (MAIN.currentEP.equipmentpartid === 0) {
        MAIN.createNewEP();
    } else {
        MAIN.displayEPview();
    }
};
MAIN.fillInHeaderStaticEP = function (formIndex, fromWODisplay) {
    "use strict";
    FILLIN.addSpan(formIndex, null, MAIN.currentEP.createddate, "Date Ordered", (fromWODisplay ? "75px" : "100px"), true);
    FILLIN.addSpan(formIndex, null, MAIN.currentEP.workorderid, "Work Order", (fromWODisplay ? "60px" : "120px"));
    FILLIN.addSpan(formIndex, null, MAIN.currentEP.createuser, "Created By", "200px");
    FILLIN.addSpan(formIndex, null, MAIN.currentEP.status, "Status", (fromWODisplay ? "75px" : "120px"));
    if (fromWODisplay) {
        FILLIN.addSpan(formIndex, null, MAIN.currentEP.dept, "Department or Machine", "250px");
        FILLIN.addSpan(formIndex, null, MAIN.currentEP.epnote, "Notes", "740px", true);
    }
};
MAIN.createNewEP = function () {
    "use strict";
    var formIndex, subHead;
    subHead = "Add any notes describing the problem or reasoning for this Parts Order. Click Save to continue and add part numbers to the order.";
    if (MAIN.currentEP.isorder && MAIN.userData.securitylevel >= 2) {
        subHead = "You can change the &quot;Department or Machine&quot; by changing the Work Location in the Work Order. " + subHead;
    } else if (MAIN.currentEP.isorder) {
        subHead = "&quot;Department or Machine&quot; matches the Work Location on the Work Order. " + subHead;
    } else {
        subHead = "Enter the Department or Machine for which this Part Order was created. " + subHead;
    }
    formIndex = FILLIN.createDialog(MAIN.displayDivId, "New Equipment Parts Order",  subHead, MAIN.continueCreateNewEP, null, "630px");
    MAIN.fillInHeaderStaticEP(formIndex);
    if (MAIN.currentEP.isorder) {
        FILLIN.addSpan(formIndex, null, MAIN.currentEP.dept, "Department or Machine", "600px", true);
    } else {
        FILLIN.addTextBox(formIndex, "txtDept", MAIN.currentEP.dept, "Department or Machine", true, null, null, "610px", true, "Enter the Department or Machine Name");
    }
    FILLIN.addTextArea(formIndex, "txaEPNote", MAIN.currentEP.epnote, "Notes", false, null, 2000, "600px", "200px", true, "Add any pertinent notes to this Parts Order");
    FILLIN.addButton(formIndex, false, "btnExitNewEP", "Cancel", true, false, true);
    FILLIN.addButton(formIndex, true, "btnSaveNewEP", "Save", false, true);
    FILLIN.displayForm(formIndex);
};
MAIN.continueCreateNewEP = function (dialogResult, dataValues) {
    "use strict";
    if (!dialogResult || !dataValues.hasChanged) { return; }
    MAIN.currentEP.dept = (MAIN.currentEP.isorder ? MAIN.currentEP.dept : dataValues.txtDept.value);
    MAIN.currentEP.epnote = dataValues.txaEPNote.value;
    MAIN.saveEPHeader();
    MAIN.sendEmail(137, MAIN.currentEP.equipmentpartid);
    MAIN.displayEPview();
};
MAIN.saveEPHeader = function () {
    "use strict";
    var params;
    params = [];
    params.push(String(MAIN.currentEP.equipmentpartid));
    params.push(MAIN.currentEP.dept);
    params.push(MAIN.currentEP.workorderid);
    params.push(MAIN.currentEP.epnote);
    params.push(MAIN.userData.userid);
    params.push(MAIN.siteId);
    AJAXPOST.callQuery("WOAddEditEquipHeader", params);
    MAIN.currentEP.equipmentpartid = AJAXPOST.dataResults[0][0];
};
MAIN.displayEP = function (equipmentPartId) {
    "use strict";
    MAIN.createEPObject(equipmentPartId);
    MAIN.displayEPview();
};
MAIN.displayEPview = function () {
    "use strict";
    var formIndex;
    FILLIN.reset();
    MAIN.setCurrentPage(8, "Equipment Parts Order");
    formIndex = FILLIN.createForm(MAIN.displayDivId, "Equipment Part Order " + String(MAIN.currentEP.equipmentpartid).padLeft("0", 6), "Make any required changes to the Parts Order Header and click save. Add part order lines by clicking on the &quot;Add New Part&quot; button. Make changes to the part lines by clicking on &quot;Receive Parts&quot; or &quot;Delete&quot; button to the right of the line you wish to manage. Receive Parts will allow you to set the number of parts received. You can delete part orders with the Delete button only if you have not received any parts on that line.", MAIN.saveEPView, null, "1000px");
    MAIN.fillInHeaderStaticEP(formIndex);
    if (MAIN.currentEP.isorder) {
        FILLIN.addSpan(formIndex, null, MAIN.currentEP.dept, "Department or Machine", "350px");
    } else {
        FILLIN.addTextBox(formIndex, "txtDept", MAIN.currentEP.dept, "Department or Machine", true, null, null, "360px", false, "Enter the Department or Machine Name");
    }
    FILLIN.addTextArea(formIndex, "txaEPNote", MAIN.currentEP.epnote, "Notes", false, null, 2000, "970px", "50px", true, "Add any pertinent notes to this Parts Order");
    FILLIN.addButton(formIndex, "Exit", "btnExitEPView", "Exit", true, false, true);
    FILLIN.addButton(formIndex, "NewPart", "btnAddNewEPView", "Add New Part", true, false, true);
    FILLIN.addButton(formIndex, "Save", "btnSaveEPView", "Save", false, true);
    FILLIN.displayForm(formIndex);
    document.getElementById(MAIN.displayDivId).appendChild(COMMON.getBasicElement("div", "divEPLineGrid0"));
    MAIN.displayEPLineGrid();
};
MAIN.saveEPView = function (dialogResult, dataValues) {
    "use strict";
    if (dialogResult === "Exit") {
        MAIN.displayEquipmentParts();
        return;
    }
    if (dialogResult === "Save") {
        MAIN.currentEP = (MAIN.currentEP.isorder ? MAIN.currentEP.dept : dataValues.txtDept.value);
        MAIN.currentEP = dataValues.txaEPNote.value;
        MAIN.saveEPHeader();
        return;
    }
    if (dialogResult === "NewPart") {
        MAIN.addNewEPLine();
        return;
    }
};
MAIN.showEPReceiveBtn = function (val) {
    "use strict";
    return (val === "0");
};
MAIN.showEPDeleteBtn = function (val) {
    "use strict";
    var fltVal;
    fltVal = parseFloat(val);
    return (fltVal === 0);
};
MAIN.displayEPLineGrid = function () {
    "use strict";
    var gridIndex, params;
    params = [MAIN.currentEP.equipmentpartid];
    gridIndex = DISPLAYGRID.addGrid("divEPLineGrid0", "divGrid0", "WOGetEquipmentLineGrid", params, 10, 1, false, false, "Add parts by clicking on &quot;Add New Part&quot; button");
    DISPLAYGRID.hideColumn(gridIndex, 6);
    DISPLAYGRID.setWidth(gridIndex, "1008px");
    DISPLAYGRID.addRowButton(gridIndex, "btnReceive", "Receive Parts", "MAIN.receiveEPLine(this.getAttribute('pkey'));", "100px", 6, MAIN.showEPReceiveBtn, true);
    DISPLAYGRID.addRowButton(gridIndex, "btnDelete", "Delete", "MAIN.deleteEPLine(this.getAttribute('pkey'));", "100px", 4, MAIN.showEPDeleteBtn, true);
    DISPLAYGRID.setButtonColumnWidth(gridIndex, "200px");
    DISPLAYGRID.display(gridIndex);
};
MAIN.addNewEPLine = function () {
    "use strict";
    var formIndex;
    formIndex = FILLIN.createDialog(MAIN.displayDivId, "Order Part", "Enter all required information (marked with asterisk) and click Save", MAIN.continueAddNewEPLine, null, "400px");
    FILLIN.addTextBox(formIndex, "txtEPPart", "", "Part Number", true, null, null, "382px", true, "Enter the part number");
    FILLIN.addTextArea(formIndex, "txaEPDesc", "", "Description", false, null, 255, "372px", "50px", true, "Enter a description of the part");
    FILLIN.addTextBox(formIndex, "txtEPQty", "0", "Quantity", true, "integer", null, "382px", true, "Enter a whole number");
    FILLIN.addButton(formIndex, false, "btnExitEPLine", "Cancel", true, false, true);
    FILLIN.addButton(formIndex, true, "btnSaveEPLine", "Save", false, true);
    FILLIN.displayForm(formIndex);
};
MAIN.continueAddNewEPLine = function (dialogResult, dataValues) {
    "use strict";
    var params;
    if (!dialogResult || !dataValues.hasChanged) { return; }
    params = [];
    params.push(MAIN.currentEP.equipmentpartid);
    params.push(dataValues.txtEPPart.value);
    params.push(dataValues.txaEPDesc.value);
    params.push(dataValues.txtEPQty.value);
    params.push(MAIN.userData.userid);
    AJAXPOST.callQuery("WOAddEquipLine", params, true);
    MAIN.displayEPLineGrid();
    COMMON.errMess("Part Added");
};
MAIN.receiveEPLine = function (id) {
    "use strict";
    var formIndex;
    formIndex = FILLIN.createDialog(MAIN.displayDivId, "Receive Parts", "Enter the number of parts to receive. This can be negative numbers to adjust quantities", MAIN.continueReceiveEPLine, id, "450px");
    FILLIN.addTextBox(formIndex, "txtQtyRx", "0", "Quantity Received (Can be negative)", true, "integer", null, "432px", true, "Enter a number");
    FILLIN.addButton(formIndex, false, "btnExitEPLine", "Cancel", true, false, true);
    FILLIN.addButton(formIndex, true, "btnSaveEPLine", "Save", false, true);
    FILLIN.displayForm(formIndex);
};
MAIN.continueReceiveEPLine = function (dialogResult, dataValues, id) {
    "use strict";
    var params;
    if (!dialogResult || !dataValues.hasChanged) { return; }
    params = [id, dataValues.txtQtyRx.value, MAIN.userData.userid];
    AJAXPOST.callQuery("WOReceiveEquipLine", params, true);
    MAIN.displayEPview();
    COMMON.errMess("Parts Received");
};
MAIN.deleteEPLine = function (id) {
    "use strict";
    FILLIN.yesNoDialog(MAIN.displayDivId, "Deleting Part Line", "You are deleting a Line from this Equipment Parts Order. This action cannot be undone.  Are you sure you want to delete this line?", "50%", MAIN.continueDeleteEPLine, id);
};
MAIN.continueDeleteEPLine = function (dialogResult, id) {
    "use strict";
    var params;
    if (!dialogResult) { return; }
    params = [id];
    AJAXPOST.callQuery("WODeleteEPLine", params, true);
    MAIN.displayEPview();
    COMMON.errMess("Line Deleted");
};
//*********************************HELP*********************************//
MAIN.displayHelp = function () {
    "use strict";
    var topic;
    topic = document.getElementById("txtCurrentPage").value;
    if (topic === "" || isNaN(topic)) { return; }
    COMMON.helpDialog(topic, MAIN.displayDivId, "90%");
};