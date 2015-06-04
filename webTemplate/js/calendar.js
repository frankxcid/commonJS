/// <reference path="common.js" />
/*jslint browser: true, plusplus:true */
/*global COMMON*/
//ver 2.0.1 01/19/2015
//01/19/2015 - Added code to disable all controls when calendar is displayed (Changed code in CAL.zinitDisplayPosition), changed CAL.zclose to remove the div containing the calendar and to restore control functions, changed document to COMMON.docObj to follow changeable parent document, Changed CAL.zinitDisplayPosition so that the parent's offset is added to fix bug that if parent position was absolute, the parent's position was not added to the display's offset. Possible bug: needs to be aware that if display is off bottom edge, the calendar should display above the control.
var CAL = {};
///<var>id of the display div that shows to the user</var>
CAL.baseDivId = "divCalBase";
///<var>id of the div that contains both calendar panes</var>
CAL.envelopeDivId = "divCalEnvelope";
///<var>id of the left calendar pane</var>
CAL.leftDivId = "divCalLeft";
///<var>id of the right calendar pane</var>
CAL.rightDivId = "divCalRight";
///<var>class of the base when visible (dimensions and visibility, placement is handled in code</var>
CAL.baseVisibleClassName = "dvCalBaseVisible";
///<var>class of the base when hidden</var>
CAL.baseHiddenClassName = "dvCalBaseHidden";
///<var>class of the calendar panes</var>
CAL.paneClassName = "dvCalPaneBase";
///<var>class of the div that allows user to change to next and previous pane</var>
CAL.selectorClassName = "dvCalSelector";
///<var>class of div that allows user select next level up</var>
CAL.topCenterClassName = "dvCalTopCenter";
///<var>class of div on Era display that has no link</var>
CAL.topCenterNoLinkClassName = "dvCalTopCenterNL";
///<var>class of divs at the top that show days of the week abbrev.</var>
CAL.weekDayClassName = "dvCalWeekDay";
///<var>class of div to place hold under header on month and year selectors</var>
CAL.blankUnderHeaderClassName = "dvCalUnderheader";
///<var>class of divs for days that are not in the current month</var>
CAL.otherDayClassName = "dvCalOtherDay";
///<var>class of divs for days in the current month</var>
CAL.currMonthDayClassName = "dvCalCurrDay";
///<var>class of div that shows today's date</var>
CAL.todayClassName = "dvCalToday";
///<var>class of div for date that is currently selected if available</var>
CAL.selDayClassName = "dvCalSelectedDay";
///<var>class of div showing months or years for selection</var>
CAL.eraSelectorClassName = "dvCalMonth";
///<var>class of div showing months or years for selection when current month</var>
CAL.eraSelectorTodayClassName = "dvCalMonthToday";
///<var>class of the div showing months or years for selection when month matches users selected date</var>
CAL.eraSelectorSelectedClassName = "dvCalMonthSel";
///<var>class of div at bottom of calendar for closing the control</var>
CAL.zbottomDivClassName = "dvCalBottom";
///<var>the div id that holds the calendar control</var>
CAL.parentDivId = "";
///<var>interval handle when moving</var>
CAL.intervalHandle = null;
///<var>the movement start</var>
CAL.startPos = 0;
///<var>the movement end position</var>
CAL.endPos = 0;
///<var>the object to receive the output</var>
CAL.valueReturnObj = null;
///<var>Names of the month</var>
CAL.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
CAL.zgetMonthName = function (dateIn) {
    ///<summary>NOT FOR EXTERNAL USE...Retrieves the name of the month and year for display</summary>
    ///<param name="dateIn" type="Date">Date object to get the month and day</param>
    ///<returns type="String"></returns>
    "use strict";
    if (dateIn === undefined || dateIn === null || (typeof dateIn === "string" && dateIn === "")) { dateIn = new Date(); }
    if (typeof dateIn === "string") { dateIn = new Date(dateIn); }
    return CAL.monthNames[dateIn.getMonth()] + " " + String(dateIn.getFullYear());
};

CAL.ZOneDate = function (dateIn) {
    ///<summary>NOT FOR EXTERNAL USE...Class that helps the creation of dates for day calendar</summary>
    ///<param name="dateIn" type="String|Date">(Optional) Either a string representing a date or date object</param>
    "use strict";
    var initialize, currentDate;
    //private functions
    //Initializes the object
    initialize = function () {
        var offset;
        //if no date set to today
        if (dateIn === undefined || dateIn === null || (typeof dateIn === "string" && dateIn === "")) { dateIn = new Date(); }
        if (typeof dateIn === "string") {
            //if date in is a string make it into a date object
            dateIn = new Date(dateIn);
        }
        //set the date to the beginning of the month going into the previous Sunday before the first of the month
        currentDate = new Date(dateIn.getFullYear(), dateIn.getMonth(), 1);
        offset = currentDate.getDay();
        if (offset === 0) { offset = 7; }
        currentDate.setDate(currentDate.getDate() - offset);
    };
    //constructor
    initialize();
    //public properties
    this.weekdayAbbv = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    this.selectedDate = null;
    //public methods
    //retrieves an object that contains all neccessary data for a date div in the day selector Calendar
    this.getDateObj = function () {
        var obj, today, selectedDate;
        today = new Date();
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        selectedDate = new Date(CAL.zgetValueEntered());
        obj = {};
        obj.dt = COMMON.dateToString(currentDate);
        obj.day = String(currentDate.getDate());
        if (selectedDate && selectedDate.getTime() === currentDate.getTime()) {
            obj.className = CAL.selDayClassName;
            obj.tag = "Date selected ";
        } else if (currentDate.getTime() === today.getTime()) {
            obj.className = CAL.todayClassName;
            obj.tag = "Today ";
        } else if (currentDate.getMonth() === dateIn.getMonth()) {
            obj.className = CAL.currMonthDayClassName;
            obj.tag = "";
        } else {
            obj.className = CAL.otherDayClassName;
            obj.tag = "";
        }
        obj.dtObj = currentDate;
        return obj;
    };
    //move pointer to the next date
    this.increment = function () {
        currentDate.setDate(currentDate.getDate() + 1);
    };
    //the string representation of the beginning of the caledar display
    this.strMonthStart = COMMON.dateToString(dateIn);
};
CAL.zclearPane = function (paneObj) {
    ///<summary>NOT FOR EXTERNAL USE...Removes all children from a pane</summary>
    ///<param name="paneObj" type="div:element"></param> 
    "use strict";
    while (paneObj.firstChild) {
        paneObj.removeChild(paneObj.firstChild);
    }
};
CAL.zgetValueEntered = function () {
    ///<summary>NOT FOR EXTERNAL USE...When this control is associated with a text box, retrieve the value and use it a the initial value</summary>
    ///<returnss type=""></returns>
    "use strict";
    var valueEntered;
    if (CAL.valueReturnObj && CAL.valueReturnObj.value && CAL.valueReturnObj.value !== "") {
        valueEntered = CAL.valueReturnObj.value;
    }
    return valueEntered;
};
CAL.zmonthNameDisplay = function (itemCurrentlyDisplayed) {
    ///<summary>NOT FOR EXTERNAL USE...the top center of the day selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="String">String representation of the date the calendar is showing</param>
    ///<returns type="div:element"></returns>
    "use strict";
    var obj1, obj2;
    obj1 = COMMON.getBasicElement("div", null, null, CAL.topCenterClassName);
    obj2 = COMMON.getLink(null, CAL.zgetMonthName(itemCurrentlyDisplayed), null, "CAL.zmoveToMonthSelector('" + itemCurrentlyDisplayed + "');");
    obj1.appendChild(obj2);
    return obj1;
};
CAL.zyearDisplay = function (itemCurrentlyDisplayed) {
    ///<summary>NOT FOR EXTERNAL USE...the top center of the Month selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="String">String representation of the date the calendar is showing</param>
    ///<returns type="div:element"></returns> 
    "use strict";
    var obj1, obj2, thisDate;
    thisDate = new Date(itemCurrentlyDisplayed);
    obj1 = COMMON.getBasicElement("div", null, null, CAL.topCenterClassName);
    obj2 = COMMON.getLink(null, String(thisDate.getFullYear()), null, "CAL.zmoveToEraSelector('" + itemCurrentlyDisplayed + "');");
    obj1.appendChild(obj2);
    return obj1;
};
CAL.zeraDisplay = function (itemCurrentDisplayed) {
    ///<summary>NOT FOR EXTERNAL USE...the top center of the year selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="String">String representation of the date the calendar is showing</param>
    ///<returns type="div:element"></returns>
    "use strict";
    var obj1, thisDate;
    thisDate = new Date(itemCurrentDisplayed);
    obj1 = COMMON.getBasicElement("div", null, null, CAL.topCenterNoLinkClassName);
    obj1.innerHTML = String(thisDate.getFullYear() - 6) + " - " + String(thisDate.getFullYear() + 5);
    return obj1;
};
CAL.zheader = function (itemCurrentlyDisplayed, selectorType, paneObj) {
    ///<summary>NOT FOR EXTERNAL USE...the top of any selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="String">String representation of the date the calendar is showing</param>
    ///<param name="selectorType" type="String">the type of selector from CAL.enumSelectorTypes</param>
    ///<param name="paneObj" type="div:element">The pane this header is being added to</param>
    "use strict";
    var obj1, obj2;
    obj1 = COMMON.getBasicElement("div", null, null, CAL.selectorClassName);
    obj1.style.clear = "both";
    obj2 = COMMON.getLink(null, "&#8656;", null, "CAL.zmoveLateral('" + itemCurrentlyDisplayed + "', '" + selectorType + "', false);");
    obj1.appendChild(obj2);
    paneObj.appendChild(obj1);
    //middle
    paneObj.appendChild(CAL.enumSelectorTypes[selectorType].topDisplayFunction(itemCurrentlyDisplayed));
    //right
    obj1 = COMMON.getBasicElement("div", null, null, CAL.selectorClassName);
    obj2 = COMMON.getLink(null, "&#8658;", null, "CAL.zmoveLateral('" + itemCurrentlyDisplayed + "', '" + selectorType + "', true);");
    obj1.appendChild(obj2);
    paneObj.appendChild(obj1);
};
CAL.zbottom = function () {
    ///<summary>NOT FOR EXTERNAL USE...the bottom of any selector</summary>
    ///<returns type="div:element"></returns>
    "use strict";
    var obj1, obj2;
    obj1 = COMMON.getBasicElement("div", null, null, CAL.zbottomDivClassName);
    obj2 = COMMON.getLink(null, "Close", null, "CAL.zclose();");
    obj1.appendChild(obj2);
    return obj1;
};
CAL.zdaySelector = function (monthToDisplay, paneObj) {
    ///<summary>NOT FOR EXTERNAL USE...Renders a day selector Calendar in one of the two panes</summary>
    ///<param name="monthToDisplay" type="String">String representation of the date being displayed</param>
    ///<param name="paneObj" type="div:elemen">The div this calendar will appear in.</param>
    "use strict";
    var thisDate, i, n, dtObj;
    CAL.zclearPane(paneObj);
    thisDate = new CAL.ZOneDate(monthToDisplay);
    //top row
    CAL.zheader(thisDate.strMonthStart, "day", paneObj);
    for (i = 0; i < 7; i++) {
        paneObj.innerHTML += "<div class=\"" + CAL.weekDayClassName + "\"" + (i === 0 ? " style=\"clear:both;\"" : "") + ">" + thisDate.weekdayAbbv[i] + "</div>";
    }
    for (n = 0; n < 6; n++) {
        for (i = 0; i < 7; i++) {
            dtObj = thisDate.getDateObj();
            paneObj.innerHTML += "<div class=\"" + dtObj.className + "\"" + (i === 0 ? " style=\"clear:both;\"" : "") + "><a href=\"#\" onclick=\"CAL.zitemSelected('day', '" + dtObj.dt + "', true); return false;\" title=\"" + dtObj.tag + dtObj.dt + "\">" + dtObj.day + "</a></div>";
            thisDate.increment();
        }
    }
    paneObj.appendChild(CAL.zbottom());
};
CAL.zmonthSelector = function (YearToDisplay, paneObj, returnValue) {
    ///<summary>NOT FOR EXTERNAL USE...Renders a month selector Calendar in one of the two panes</summary>
    ///<param name="yearToDisplay" type="tring">String representation of the date being displayed</param>
    ///<param name="paneObj" type="div:element">The div this calendar will appear in.</param>
    ///<param name="returnValue" type="Boolean">set to true so value selected is returned to the calling script or will show a day selector</param>
    "use strict";
    var n, i, thisDate, dtSelectedDay, strDisplayDate, tag, className, today, monthCount;
    thisDate = new Date(YearToDisplay);
    today = new Date();
    dtSelectedDay = new Date(CAL.zgetValueEntered());
    CAL.zclearPane(paneObj);
    CAL.zheader(YearToDisplay, "month", paneObj);
    paneObj.appendChild(COMMON.getBasicElement("div", null, "&nbsp;", CAL.blankUnderHeaderClassName));
    monthCount = 0;
    for (n = 0; n < 4; n++) {
        for (i = 0; i < 3; i++) {
            strDisplayDate = String(monthCount + 1) + "/01/" + String(thisDate.getFullYear());
            className = CAL.eraSelectorClassName;
            tag = "";
            if (today.getFullYear() === thisDate.getFullYear() && today.getMonth() === monthCount) {
                className = CAL.eraSelectorTodayClassName;
                tag = "Current Month - ";
            }
            if (dtSelectedDay.getMonth() === monthCount && dtSelectedDay.getFullYear() === thisDate.getFullYear()) {
                className = CAL.eraSelectorSelectedClassName;
                tag = "Selected - ";
            }
            paneObj.innerHTML += "<div class=\"" + className + "\"" + (i === 0 ? " style=\"clear:both;\"" : "") + "><a href=\"#\" onclick=\"CAL.zitemSelected('month', '" + strDisplayDate + "', " + (returnValue ? "true" : "false") + "); return false;\" title=\"" + tag + CAL.monthNames[monthCount] + " " + String(thisDate.getFullYear()) + "\">" + CAL.monthNames[monthCount] + "</a></div>";
            monthCount++;
        }
    }
    paneObj.appendChild(CAL.zbottom());
};
CAL.zyearSelector = function (EraToDisplay, paneObj, returnValue) {
    ///<summary>NOT FOR EXTERNAL USE...Renders a year selector Calendar in one of the two panes</summary>
    ///<param name="EraToDisplay" type="String">String representation of the date being displayed</param>
    ///<param name="paneObj" type="div:element">The div this calendar will appear in.</param>
    ///<param name="returnValue" type="Boolean">set to true so value selected is returned to the calling script or will show a day selector</param>
    "use strict";
    var n, i, thisDate, dtSelectedDate, strDisplayDate, tag, className, today, yearStart;
    thisDate = new Date(EraToDisplay);
    today = new Date();
    dtSelectedDate = new Date(CAL.zgetValueEntered());
    CAL.zclearPane(paneObj);
    CAL.zheader(EraToDisplay, "year", paneObj);
    paneObj.appendChild(COMMON.getBasicElement("div", null, "&nbsp;", CAL.blankUnderHeaderClassName));
    yearStart = thisDate.getFullYear() - 6;
    for (n = 0; n < 4; n++) {
        for (i = 0; i < 3; i++) {
            strDisplayDate = "01/01/" + String(yearStart);
            className = CAL.eraSelectorClassName;
            tag = "";
            if (today.getFullYear() === yearStart) {
                className = CAL.eraSelectorTodayClassName;
                tag = "Current Year - ";
            }
            if (dtSelectedDate.getFullYear() === yearStart) {
                className = CAL.eraSelectorSelectedClassName;
                tag = "Selected - ";
            }
            paneObj.innerHTML += "<div class=\"" + className + "\"" + (i === 0 ? " style=\"clear:both;\"" : "") + "><a href=\"#\" onclick=\"CAL.zitemSelected('year', '" + strDisplayDate + "', " + (returnValue ? "true" : "false") + "); return false;\" title=\"" + tag + String(yearStart) + "\">" + String(yearStart) + "</a></div>";
            yearStart++;
        }
    }
    paneObj.appendChild(CAL.zbottom());
};
CAL.zchangeMonth = function (currentItemDisplayed, rightArrowClicked) {
    ///<summary>NOT FOR EXTERNAL USE...Selects the next or previous month when arrows are clicked at the top of a day selector</summary>
    ///<param name="currentItemDisplayed" type="String">String representation of the date being displayed</param>
    ///<param name="rightArrowClicked" type="Boolean">true if moving to the next month (forward in time)</param>
    ///<returns type="Date"></returns>
    "use strict";
    var thisDate;
    thisDate = new Date(currentItemDisplayed);
    return COMMON.dateToString(new Date(thisDate.setMonth(thisDate.getMonth() + (rightArrowClicked ? 1 : -1))));
};
CAL.zchangeYear = function (currentItemDisplayed, rightArrowClicked) {
    ///<summary>NOT FOR EXTERNAL USE...Selects the next or previous year when arrows are clicked at the top of a month selector</summary>
    ///<param name="currentItemDisplayed" type="String">String representation of the date being displayed</param>
    ///<param name="rightArrowClicked" type="Boolean">true if moving to the next month (forward in time)</param>
    ///<returns type="Date"></returns>
    "use strict";
    var thisDate;
    thisDate = new Date(currentItemDisplayed);
    return COMMON.dateToString(thisDate.setFullYear(thisDate.getFullYear() + (rightArrowClicked ? 1 : -1)));
};
CAL.zchangeEra = function (currentItemDisplayed, rightArrowClicked) {
    ///<summary>NOT FOR EXTERNAL USE...Selects the next or previous era when arrows are clicked at the top of a year selector</summary>
    ///<param name="currentItemDisplayed" type="String">String representation of the date being displayed</param>
    ///<param name="rightArrowClicked" type="Boolean">true if moving to the next month (forward in time)</param>
    ///<returns type="Date"></returns>
    "use strict";
    var thisDate;
    thisDate = new Date(currentItemDisplayed);
    return COMMON.dateToString(thisDate.setFullYear(thisDate.getFullYear() + (rightArrowClicked ? 12 : -12)));
};
CAL.zmoveToEraSelector = function (itemCurrentlyDisplayed) {
    ///<summary>NOT FOR EXTERNAL USE...The click event of the header of a month selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="string">String representation of the date being displayed</param>
    "use strict";
    CAL.zpaneMovement(false, "year", itemCurrentlyDisplayed, false);
};
CAL.zmoveToMonthSelector = function (itemCurrentlyDisplayed, moveDown) {
    ///<summary>NOT FOR EXTERNAL USE...The click event of the header of a day selector or selecting a year in the year selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="string">String representation of the date being displayed</param>
    ///<param name="moveDown" type="Boolean)      set true when coming from a year selector</param>
    "use strict";
    CAL.zpaneMovement(moveDown, "month", itemCurrentlyDisplayed, false);
};
CAL.zmoveToDaySelector = function (itemCurrentlyDisplayed) {
    ///<summary>NOT FOR EXTERNAL USE...The click event of selecting a month in the month selector</summary>
    ///<param name="itemCurrentlyDisplayed" type="string">String representation of the date being displayed</param>
    "use strict";
    CAL.zpaneMovement(true, "day", itemCurrentlyDisplayed, false);
};
CAL.enumSelectorTypes = {
    "day": { "selectorFunction": CAL.zdaySelector, "changeFunction": CAL.zchangeMonth, "topDisplayFunction": CAL.zmonthNameDisplay, "moveDownFunction": "" },
    "month": { "selectorFunction": CAL.zmonthSelector, "changeFunction": CAL.zchangeYear, "topDisplayFunction": CAL.zyearDisplay, "moveDownFunction": CAL.zmoveToDaySelector },
    "year": { "selectorFunction": CAL.zyearSelector, "changeFunction": CAL.zchangeEra, "topDisplayFunction": CAL.zeraDisplay, "moveDownFunction": CAL.zmoveToMonthSelector }
};
CAL.zpositionPanes = function (sideBySide) {
    ///<summary>NOT FOR EXTERNAL USE...Arranges the panes in the configuration of side by side or top to bottom</summary>
    ///<param name="sideBySide" type="Boolean">True for side by side</param>
    "use strict";
    if (sideBySide) {
        COMMON.docObj.getElementById(CAL.leftDivId).style.cssFloat = "left";
        COMMON.docObj.getElementById(CAL.rightDivId).style.cssFloat = "left";
        COMMON.docObj.getElementById(CAL.envelopeDivId).style.left = CAL.startPos;
        COMMON.docObj.getElementById(CAL.envelopeDivId).style.top = "0";
    } else {
        COMMON.docObj.getElementById(CAL.leftDivId).style.cssFloat = "none";
        COMMON.docObj.getElementById(CAL.rightDivId).style.cssFloat = "none";
        COMMON.docObj.getElementById(CAL.envelopeDivId).style.left = "0";
        COMMON.docObj.getElementById(CAL.envelopeDivId).style.top = CAL.startPos;
    }
};
CAL.zinitDisplayPosition = function (txtObj) {
    ///<summary>NOT FOR EXTERNAL USE...initializes the display, creates the base of the display on the first use or uses an existing calendar base</summary>
    ///<param name="txtObj" type="input:element">the text box associated with this display</param>
    "use strict";
    var baseObj, posLeft, posTop, parentObj, obj1, obj2, foundAbsolute;
    //disable all controls
    COMMON.blockInput("body");
    baseObj = COMMON.getBasicElement("div", CAL.baseDivId);
    obj1 = COMMON.getBasicElement("div", CAL.envelopeDivId);
    obj2 = COMMON.getBasicElement("div", CAL.leftDivId, null, CAL.paneClassName);
    obj1.appendChild(obj2);
    obj2 = COMMON.getBasicElement("div", CAL.rightDivId, null, CAL.paneClassName);
    obj1.appendChild(obj2);
    baseObj.appendChild(obj1);
    COMMON.docObj.getElementById(CAL.parentDivId).appendChild(baseObj);
    baseObj = COMMON.docObj.getElementById(CAL.baseDivId);
    baseObj.className = CAL.baseVisibleClassName;
    CAL.startPos = 0;
    //initialize positions
    CAL.zpositionPanes(true);
    posLeft = txtObj.offsetLeft;
    posTop = txtObj.offsetTop;
    foundAbsolute = false;
    //iterates through parents and adds offset until no parents are left or until a parent is positioned absolutely
    if (txtObj.offsetParent) {
        parentObj = txtObj.offsetParent;
        posLeft += parentObj.offsetLeft;
        posTop += parentObj.offsetTop;
        if (parentObj.style.position && parentObj.style.position === "absolute") {
            foundAbsolute = true;
        }
        while (parentObj.offsetParent && !foundAbsolute) {
            parentObj = parentObj.offsetParent;
            if (parentObj.style.position && parentObj.style.position === "absolute") {
                break;
            }
            posLeft += parentObj.offsetLeft;
            posTop += parentObj.offsetTop;
        }
    }
    COMMON.docObj.getElementById(CAL.baseDivId).style.top = String(posTop) + "px";
    COMMON.docObj.getElementById(CAL.baseDivId).style.left = String(posLeft) + "px";
};
CAL.zkillInterval = function () {
    ///<summary>NOT FOR EXTERNAL USE...clears the interval object and stops the CAL.zanimateMovement recurse</summary>
    "use strict";
    if (CAL.intervalHandle) {
        clearInterval(CAL.intervalHandle);
        CAL.intervalHandle = null;
    }
};
CAL.zanimateMovement = function (itemToBeDisplayed, selectorType, dtTimeStart, topToBottom) {
    ///<summary>NOT FOR EXTERNAL USE...logic for animating the movement of the panes</summary>
    ///<param name="itemToBeDisplayed" type="String">The string representation of the date currently being displayed</param>
    ///<param name="selectorType" type="String">The selector type from CAL.enumSelectorTypes</param>
    ///<param name="dtTimeStart" type="Date">The time when animation began. used to stop animation after a set time</param>
    ///<param name="topToBottom" type="Boolean">the arrangement of the panes</param>
    "use strict";
    var animationDuration, timePassed, timeProgress, positionChange, currentPosition, rightArrow;
    rightArrow = (CAL.startPos === 0);
    animationDuration = 400; //milliseconds
    timePassed = new Date() - dtTimeStart;
    timeProgress = timePassed / animationDuration;
    positionChange = Math.sin(timeProgress * 1.6);//makes a smooth animation slow and then fast
    if (timeProgress >= 1) {
        timeProgress = 1;
        currentPosition = CAL.endPos;
    } else {
        currentPosition = Math.abs(CAL.endPos - CAL.startPos) * positionChange;
        currentPosition = CAL.startPos + (currentPosition * (rightArrow ? -1 : 1));
    }
    if (topToBottom) {
        COMMON.docObj.getElementById(CAL.envelopeDivId).style.top = currentPosition + "px";
    } else {
        COMMON.docObj.getElementById(CAL.envelopeDivId).style.left = currentPosition + "px";
    }
    if (timeProgress === 1) {
        CAL.zkillInterval();
        //duplicate item in the other pane so that it is ready for next animation
        CAL.enumSelectorTypes[selectorType].selectorFunction(itemToBeDisplayed, COMMON.docObj.getElementById(rightArrow ? CAL.leftDivId : CAL.rightDivId));
    }
};
CAL.zpaneMovement = function (forward, hiddenPaneSelectorType, itemToDisplay, panesLateral) {
    ///<summary>NOT FOR EXTERNAL USE...Initializes the placement of the panes and starts the animation interval</summary>
    ///<param name="forward" type="Boolean">Tells that animation is to right (Panes moving left) or down (Panes moving up)</param>
    ///<param name="hiddenPaneSelectorType" type="Strin">The selector type for the pane to be displayed from CAL.enumSelectorTypes</param>
    ///<param name="itemToDisplay" type="String">The string representation of the date currently being displayed</param>
    ///<param name="panesLateral" type="Boolea">Set whether the panes are side by side if true</param>
    "use strict";
    var hiddenDivId, startIsLess, dtStart;
    //set Start position
    //forward is rightarrow or down
    if (forward) {
        CAL.startPos = 0;
        CAL.endPos = (panesLateral ? -191 : -220);
    } else {
        CAL.startPos = (panesLateral ? -191 : -220);
        CAL.endPos = 0;
    }
    CAL.zpositionPanes(panesLateral);
    //set hidden item
    startIsLess = CAL.startPos < CAL.endPos;
    if (startIsLess) {
        hiddenDivId = CAL.leftDivId;
    } else {
        hiddenDivId = CAL.rightDivId;
    }
    CAL.enumSelectorTypes[hiddenPaneSelectorType].selectorFunction(itemToDisplay, COMMON.docObj.getElementById(hiddenDivId));
    //kill anytimeout if available
    CAL.zkillInterval();
    //do animation
    dtStart = new Date();
    CAL.intervalHandle = setInterval(function () { CAL.zanimateMovement(itemToDisplay, hiddenPaneSelectorType, dtStart, !panesLateral); }, 10);
};
CAL.zmoveLateral = function (itemCurrentlyDisplayed, selectorType, rightArrowClicked) {
    ///<summary>NOT FOR EXTERNAL USE...Does a lateral movement of panes for when the arrows at the top of selectors is clicked</summary>
    ///<param name="itemCurrentlyDisplayed" type="String">The string representation of the date currently being displayed</param>
    ///<param name="selectorType" type="String">The selector type for the pane to be displayed from CAL.enumSelectorTypes</param>
    ///<param name="rightArrowClicked" type="Boolean">Animating to the right (panes moving left)</param>
    "use strict";
    var selectorObj;
    //find new item
    selectorObj = CAL.enumSelectorTypes[selectorType];
    itemCurrentlyDisplayed = selectorObj.changeFunction(itemCurrentlyDisplayed, rightArrowClicked);
    CAL.zpaneMovement(rightArrowClicked, selectorType, itemCurrentlyDisplayed, true);
};
CAL.zclose = function () {
    ///<summary>NOT FOR EXTERNAL USE...Closes and hides the base of the calendar control</summary>
    "use strict";
    var baseObj, obj1;
    baseObj = COMMON.docObj.getElementById(CAL.baseDivId);
    if (baseObj) {
        obj1 = baseObj.parentNode;
        obj1.removeChild(baseObj);
    }
    COMMON.blockInput("body", true);
};
CAL.zitemSelected = function (selectorType, itemSelected, sendValueToObject) {
    ///<summary>NOT FOR EXTERNAL USE...The click event of selecting any item in any selector</summary>
    ///<param name="selectorType" type="String">The selector type for the pane to be displayed from CAL.enumSelectorTypes</param>
    ///<param name="itemSelected" type="object"> Data representing the item selected in a selector</param>
    ///<param name="sendValueToObject" type="Boolean">True will send data to the text box associated with this control</param>
    "use strict";
    if (sendValueToObject) {
        if (CAL.valueReturnObj) {
            CAL.valueReturnObj.value = itemSelected;
        }
        CAL.zclose();
        return;
    }
    CAL.enumSelectorTypes[selectorType].moveDownFunction(itemSelected, true);
};
//***********************************Data Validation***********************************************************//
CAL.zvalidChars = function (keyCodeIn) {
    ///<summary>NOT FOR EXTERNAL USE...Test if the key code is allowed in the text box</summary>
    ///<param name="keyCodeIn " type="int"></param>
    ///<returns type="Boolean">True if the keycode is allowed</returns>
    "use strict";
    //valid keycodes are:
    //0 thru 47 white space chars
    //48 thru 57 (0 - 9 top of keyboard)
    //96 thru 105 (0 - 9 on keypad)
    //111 (/ from keypad or divide)
    //191 forward slash
    return (keyCodeIn === 111 || keyCodeIn === 191 || (keyCodeIn >= 0 && keyCodeIn <= 57) || (keyCodeIn >= 96 && keyCodeIn <= 105));
};
CAL.zcheckDaysInMonth = function (days, month, year) {
    ///<summary>NOT FOR EXTERNAL USE...Test if the number of days exceeds the days of a particular month</summary>
    ///<param name="days" type="Int"></param>
    ///<param name="month" type="Int"></param>
    ///<param name="Years" type="Int">(Optional)</param>
    ///<returns type="Boolean">True if days exceed amount</returns>
    "use strict";
    var mDays;
    mDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year == undefined || year == null) { year = 2004; }
    if (month === 2 && year % 4 === 0) { mDays[1] = 29; }
    return (days > mDays[month - 1]);
};
CAL.errors = {
    "none": "&nbsp;",
    "chars": "Please enter only the numeric values or the slash.  Valid entries are 0123456789/",
    "month": "Please enter a date value in the format Month/Day/Year.  Enter a value of 1 through 12 for the month, two digit month (i.e. 01, 02, etc) is acceptable",
    "date": "Please Enter a date value in the format Month/Day/Year. Enter a value of 1 through $$ days for the month of ##, you can use two digits (i.e. 01, 02, etc) for days less than 10",
    "year": "Please Enter a date value in the format Month/Day/Year.  You must enter a four digit year (i.e. 1994, 2013, etc) between 1900 and 2100",
    "delimitter": "Please Enter a date value in the format Month/Day/Year.  Use the forward slash (/) to separate Month Date and Year",
    "generic": "Please Enter a date value in the format Month/Day/Year."
};
CAL.zdisplayError = function (obj, errorType, errorDivId, day, month) {
    ///<summary>NOT FOR EXTERNAL USE...Displays the error message and sets the field red if the incorrect format of the date was entered</summary>
    ///<param name="obj" type="Element">The text box</param>
    ///<param name="errorType" type="String">The Error from CAL.errors</param>
    ///<param name="errorDivId" type="String">The id of the div where the error message will be displayed</param>
    ///<param name="day" type="Int">(Optional)  Used for date error in CAL.errors</param>
    ///<param name="month" type="Int">(Optional)  Ignored if day is not provided. Used for date error in CAL.errors</param>
    ///<returns type="Boolean">True if there is an error</returns>
    "use strict";
    var mess, hasError;
    hasError = false;
    mess = CAL.errors[errorType];
    if (day !== undefined || day !== null) {
        mess = mess.replace("$$", String(day));
        mess = mess.replace("##", CAL.monthNames[month - 1]);
    }
    COMMON.docObj.getElementById(errorDivId).innerHTML = mess;
    hasError = errorType !== "none";
    return (!COMMON.checkFieldHasError(obj, hasError, hasError));
};

//*******************************External Use functions************************************************************//
CAL.checkDateEntry = function (event) {
    ///<summary>Logic to check the input of a date text box</summary>
    ///<param name="event" type="Event"></param>
    ///<returns type="Boolean">false if there is an error which removeds the input from the text box</returns>
    "use strict";
    var obj, value, key, errorDivId, dateParts, days, month, year;
    obj = COMMON.getTargetObj(event);
    value = obj.value.trim();
    key = COMMON.getKeyPressed(event);
    errorDivId = obj.getAttribute("messagediv");
    //check current entry
    if (key !== undefined && !CAL.zvalidChars(key)) { return CAL.zdisplayError(obj, "chars", errorDivId); }
    if (key <= 47) { return true; }
    //check complete entry
    dateParts = value.split('/');
    if (dateParts.length > 3) { return CAL.zdisplayError(obj, "generic", errorDivId); }
    //check month
    if (dateParts.length > 0) {
        month = parseInt(dateParts[0], 10);
        if (month < 1 || month > 12) { return CAL.zdisplayError(obj, "month", errorDivId); }
    }
    //check date
    if (dateParts.length > 1) {
        days = parseInt(dateParts[1], 10);
        if (days < 1 || CAL.zcheckDaysInMonth(days, month)) {
            return CAL.zdisplayError(obj, "date", errorDivId, days, month);
        }
    }
    //check year and check leap year dates
    if (dateParts.length > 2) {
        year = parseInt(dateParts[2], 10);
        if (dateParts[2].length === 2 && year < 50) { year = 2000 + year; }
        if (dateParts[2].length === 2 && year > 50) { year = 1900 + year; }
        if (dateParts[2].length === 3 || dateParts[2].length > 4 || year < 1900 || year > 2100) { return CAL.zdisplayError(obj, "year", errorDivId); }
        if (CAL.zcheckDaysInMonth(days.month, year)) { return CAL.zdisplayError(obj, "date", errorDivId); }
    }
    return CAL.zdisplayError(obj, "none", errorDivId);
};
CAL.showDaySelector = function (txtObj, parentDivId) {
    ///<summary>Displays the day selector control in association with a text box</summary>
    ///<param name="txtObj" type="input:element">The text box associated with the calendar</param>
    ///<param name="parentDivId" type="String">Optional) The id of a parent element where this control will be displayed</param>
    ///<returnss type=""></returns>
    "use strict";
    var valueEntered, parentObj;
    CAL.parentDivId = COMMON.defaultDisplayDiv;
    if (parentDivId) {
        CAL.parentDivId = parentDivId;
    }
    if (txtObj && txtObj.value !== undefined) {
        if (!CAL.parentDivId) {
            parentObj = txtObj.parentNode;
            if (parentObj && parentObj.id && parentObj.id !== "") {
                CAL.parentDivId = parentObj.id;
            } else {
                while (parentObj && (!parentObj.id || parentObj.id === "") && !CAL.parentDivId) {
                    if (parentObj.id && parentObj.id !== "") {
                        CAL.parentDivId = parentObj.id;
                        break;
                    }
                    parentObj = parentObj.parentNode;
                }
            }
        }
        valueEntered = txtObj.value;
        CAL.valueReturnObj = txtObj;
    }
    CAL.zinitDisplayPosition(txtObj || COMMON.docObj.getElementById(parentDivId));//get the position of the text box and place calendar display on top
    CAL.enumSelectorTypes.day.selectorFunction(valueEntered, COMMON.docObj.getElementById(CAL.leftDivId));
    CAL.enumSelectorTypes.day.selectorFunction(valueEntered, COMMON.docObj.getElementById(CAL.rightDivId));
};