﻿/// <reference path="ajaxpost.js" />
/*jslint browser: true, for: true, white: true, this: true*/
/*global COMMON*/
/// <reference path="common.js" />
/*this version will not work with intranettools4.5 version of menu. it is based on pure javascript calling of menus*/
/*Ver 2.1 4/8/2016*/
var MENU = {};
///<var>The CSS class of the div the menu will be placed in</var>
MENU.parentDivClassName = "menuEnvelope";
///<var>The CSS class of sub menu div container</var>
MENU.subMenuClassName = "submenudiv";
///<var>The CSS class of top menu links</var>
MENU.menuLinkClassName = "menu";
///<var>The CSS class of the submenu links</var>
MENU.subMenuLinkClassName = "submenu";
///<var>The class name of the envelope that holds the full menu object</var>
MENU.menuEnvelopeClassName = "menuinnerbox";
///<var>Contains all the menu constructs</var>
MENU.allMenuObjects = [];
///<var>the time out handle for menu animation</var>
MENU.timeoutObj = null;
///<var>The time it take for a sub menu to disappear after user stop hovering over the menu in seconds</var>
MENU.menuDisplayTimeout = 1;
///<var>Overrides the width of the submenus which normally is the width of the top level menu
MENU.subMenuWidthOverride = null;
///<var>Display symbol if true</var>
MENU.displaySymbol = true;
MENU.ZOneMenuChoice = function (text, href, onclickFunction, tooltip, target) {
    ///<summary>NOT FOR EXTERNAL USE...holds property for a menu choice</summary>
    "use strict";
    var that = this;
    var defaultSymbol = "&#8659;";
    this.id = null; //the id of the control
    this.getObject = function (isSub, hasSubs) {
        var iHTML = text;
        var obj1;
        if (!isSub && hasSubs) {
            iHTML = document.createElement("div");
            if (typeof text === "string" || typeof text === "number") {
                obj1 = COMMON.getBasicElement("span", null, text);
                iHTML.appendChild(obj1);
            } else {
                iHTML.appendChild(text);
            }
            obj1 = COMMON.getBasicElement("span", null, defaultSymbol);
            if (MENU.displaySymbol) { iHTML.appendChild(obj1); }
        }
        var onclick = onclickFunction;
        if (isSub && onclickFunction) {
            onclick += " MENU.zclearAllMenus();";
        }
        if (!href && !onclickFunction) { href = "#"; }
        var attr = { "onmouseover": (isSub ? "MENU.zstopTimeout();" : "MENU.zhoverBaseMenu(this);"), "onmouseout": "MENU.zstartTimeout();" };
        return COMMON.getLink(that.id, iHTML, href, onclick, tooltip, attr, target);
    };
};
MENU.ZOneMenuGrouping = function (topLevelChoice, width) {
    ///<summary>NOT FOR EXTERNAL USE...holds the top level choice and submenus if available</summary>
    "use strict";
    var that = this;
    this.topLevelChoice = topLevelChoice;
    this.allSubMenuChoices = null; //holds OneMenuChoice object for sub menus
    this.addSubMenuChoice = function (subMenuChoice) {
        if (!that.allSubMenuChoices) { that.allSubMenuChoices = []; }
        that.allSubMenuChoices.push(subMenuChoice);
    };
    this.width = width;//the width as a CSS width value
};
MENU.ZOneMenuObject = function () {
    ///<summary>NOT FOR EXTERNAL USE...holds properties for a full menu construct</summary>
    "use strict";
    var that = this;
    this.menuObjectIndex = 0;
    var allMenuGroupings = [];
    this.addMenuChoice = function (text, href, onclickFunction, tooltip, width, target) {
        var topLevelChoice = new MENU.ZOneMenuChoice(text, href, onclickFunction, tooltip, target);
        var thisGroup = new MENU.ZOneMenuGrouping(topLevelChoice, width);
        allMenuGroupings.push(thisGroup);
        return allMenuGroupings.length - 1;
    };
    this.addSubMenuChoice = function (menuGroupIndex, text, href, onclickFunction, tooltip, target) {
        var thisChoice = new MENU.ZOneMenuChoice(text, href, onclickFunction, tooltip, target);
        allMenuGroupings[menuGroupIndex].addSubMenuChoice(thisChoice);
    };
    this.assembleMenu = function (parentDivId) {
        document.getElementById(parentDivId).className = MENU.parentDivClassName;
        var obj1 = COMMON.getBasicElement((COMMON.ieVer <= 8 ? "div" : "nav"), parentDivId + "nav", null, MENU.menuEnvelopeClassName);
        var obj2 = document.createElement("ul");
        allMenuGroupings.forEach(function (item, index) {
            var hasSubs = (item.allSubMenuChoices !== null);
            var obj3 = document.createElement("li");
            var obj4 = item.topLevelChoice.getObject(false, hasSubs);
            obj4.setAttribute("menuindex", String(that.menuObjectIndex));
            obj4.setAttribute("choiceindex", String(index));
            obj4.setAttribute("setwidth", ((item.width !== undefined && item.width !== null) ? item.width : "auto"));
            obj4.className = MENU.menuLinkClassName;
            if (item.width !== undefined && item.width !== null) { obj4.style.width = item.width; }
            obj3.appendChild(obj4);
            obj2.appendChild(obj3);
            if (hasSubs) {
                var subObj1 = COMMON.getBasicElement("div", null, null, MENU.subMenuClassName);
                subObj1.style.display = "none";
                subObj1.id = "menu" + String(that.menuObjectIndex).padLeft("0", 3) + String(index);
                var n;
                var subObj2;
                for (n = 0; n < item.allSubMenuChoices.length; n += 1) {
                    subObj2 = item.allSubMenuChoices[n].getObject(true);
                    subObj2.className = MENU.subMenuLinkClassName;
                    if (MENU.subMenuWidthOverride !== undefined && MENU.subMenuWidthOverride !== null) {
                        subObj2.style.width = MENU.subMenuWidthOverride;
                    } else if (item.width !== undefined && item.width !== null) {
                        subObj2.style.width = item.width;
                    }
                    subObj1.appendChild(subObj2);
                }
                obj1.appendChild(subObj1);
            }
        });
        obj1.appendChild(obj2);
        document.getElementById(parentDivId).appendChild(obj1);
    };
};
MENU.zclearAllMenus = function () {
    "use strict";
    ///<summary>NOT FOR EXTERNAL USER...clears (hides) any menus that may be displayed</summary>
    var allDivs = document.getElementsByTagName("div");
    var keys = Object.keys(allDivs);
    keys.forEach(function (item) {
        var divId = allDivs[item].id;
        if (COMMON.exists(divId) && divId.length > 7 && divId.substring(0, 4) === "menu") {
            allDivs[item].style.display = "none";
        }
    });
};
MENU.zshowOneMenu = function (obj) {
    "use strict";
    ///<summary>NOT FOR EXTERNAL USE...when hovering over a top level menu item, this will display sub menus if there are any</summary>
    var menuIndex = obj.getAttribute("menuindex");
    var choiceIndex = obj.getAttribute("choiceindex");
    var menuWidth = obj.getAttribute("setwidth");
    var thisMenu = document.getElementById("menu" + menuIndex.padLeft("0", 3) + choiceIndex);
    if (!thisMenu) { return false; }
    thisMenu.style.display = "inline";
    thisMenu.style.width = MENU.subMenuWidthOverride || menuWidth;
    var calcWidth = thisMenu.offsetWidth;
    thisMenu.style.top = String(obj.offsetTop + obj.offsetHeight) + "px";
    var calcLeft = obj.offsetLeft;
    var windowWidth = COMMON.getWindowWidth();
    if ((calcLeft + calcWidth) > windowWidth) {
        calcLeft = (windowWidth - calcWidth);
        if (calcLeft < 0) { calcLeft = 0; }
    }
    thisMenu.style.left = String(calcLeft) + "px";
    return true;
};
MENU.zstopTimeout = function () {
    "use strict";
    ///<summary>NOT FOR EXTERNAL USE...stop the timeout that makes sub menus dissappear when hovering over the top level menu or any item in the sub menu</summary>
    if (MENU.timeoutObj) {
        clearTimeout(MENU.timeoutObj);
        MENU.timeoutObj = null;
    }
};
MENU.zstartTimeout = function () {
    "use strict";
    ///<summary>NOT FOR EXTERNAL USE...start a timeout the will make sub menus dissappear after a few seconds</summary>
    MENU.zstopTimeout();
    MENU.timeoutObj = setTimeout(function () { MENU.zclearAllMenus(); }, MENU.menuDisplayTimeout * 1000);
};
MENU.zhoverBaseMenu = function (obj) {
    "use strict";
    ///<summary>NOT FOR EXTERNAL USE...called when hovering over a top level menu item</summary>
    MENU.zstopTimeout();
    MENU.zclearAllMenus();
    if (!MENU.zshowOneMenu(obj)) { MENU.zstartTimeout(); }
};
//**********************************EXTERNAL USE FUNCTIONS******************************************************//
MENU.initMenus = function (reset) {
    ///<summary>initialize a menu construct, reset will clear all menu constructs</summary>
    ///<param name="reset" type="Boolean">true will clear all menus from memory</param>
    ///<returns type="Number">The Index of the menu grouping</returns>
    "use strict";
    var currentIndex;
    if (reset) { MENU.allMenuObjects = []; }
    currentIndex = MENU.allMenuObjects.length;
    MENU.allMenuObjects.push(new MENU.ZOneMenuObject());
    MENU.allMenuObjects[currentIndex].menuObjectIndex = currentIndex;
    return currentIndex;
};
MENU.addTopLevelMenu = function (menuIndex, text, href, onclick, width, tooltip, target) {
    ///<summary>Adds a new menu grouping to the menu object while also describing the top level menu choice</summary>
    ///<param name="menuIdex" type="Number">The index of the menu construct. provided by MENU.initMenus()</param>
    ///<param name="text" type="String|Element">The text or object to be displayed in the menu</param>
    ///<param name="href" type="String">(Optional)Ignored if onclick is provided.  The URL to navigate</param>
    ///<param name="onclick" type="String">(Optional)The javascript function to run when user clicks on this. return false not required. Provide either HREF or onclick. Href ignored if onclick is provided</param>
    ///<param name="width" type="String">(Optional)Any CSS width value</param>
    ///<param name="tooltip" type="String">(Optional)Message to show when use hovers over this choice</param>
    ///<param name="target" type="String">(Optional) the target link value (i.e. _blank, _self (default), etc..)</param>
    ///<returns type="Number">The Index of the menu grouping</returns>
    "use strict";
    var thisMenuObj;
    thisMenuObj = MENU.allMenuObjects[menuIndex];
    return thisMenuObj.addMenuChoice(text, href, onclick, tooltip, width, target);
};
MENU.addSubMenu = function (menuIndex, groupingIndex, text, href, onclick, tooltip, target) {
    ///<summary>Adds a new sub menu choice to a menu grouping</summary>
    ///<param name="menuIdex" type="Number">The index of the menu construct. provided by MENU.initMenus()</param>
    ///<param name="groupingIndex" type="Number">The index of the menu grouping in the menu construct. Provided by Menu.addToplevelMenu()</param>
    ///<param name="text" type="String|Element">The text or object to be displayed in the menu</param>
    ///<param name="href" type="String">(Optional)Ignored if onclick is provided.  The URL to navigate</param>
    ///<param name="onclick" type="String">(Optional)The javascript function to run when user clicks on this. return false not required. Provide either HREF or onclick. Href ignored if onclick is provided</param>
    ///<param name="tooltip" type="String">(Optional)Message to show when use hovers over this choice</param>
    ///<param name="target" type="String">(Optional) the target link value (i.e. _blank, _self (default), etc..)</param>
    "use strict";
    var thisMenuObj;
    thisMenuObj = MENU.allMenuObjects[menuIndex];
    thisMenuObj.addSubMenuChoice(groupingIndex, text, href, onclick, tooltip, target);
};
MENU.displayMenu = function (menuIndex, parentDivId) {
    ///<summary>Displays the menu construct</summary>
    ///<param name="menuIdex" type="Number">The index of the menu construct. provided by MENU.initMenus()</param>
    ///<param name="parentDivId" type="String">The Id of the div element where the menu is to be displayed</param>
    "use strict";
    MENU.allMenuObjects[menuIndex].assembleMenu(parentDivId);
};