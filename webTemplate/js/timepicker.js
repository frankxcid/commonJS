/// <reference path="common.js" />
/*jslint browser: true, plusplus:true */
/*global COMMON*/
//ver 1.0.0 1/27/2015
var TIMEPICKER = {};
///<var>array that holds all the time Controls</var>
TIMEPICKER.allTimePickers = [];
///<var>the css class of the base div</var>
TIMEPICKER.baseObjClassName = "dvTimePickerBase";
///<var>the css class of the hour or minute roller</var>
TIMEPICKER.timeRollerClassName = "dvTimeRoller";
///<var>the css class of the AM/PM roller</var>
TIMEPICKER.timeAPRollerClassName = "dvTimeAPRoller";
///<var>the css class of the covering divs that partially hide the rollers</var>
TIMEPICKER.coverTopClassName = "dvTimeCoverTop";
///<var>the css class of the covering divs that partially hide the rollers</var>
TIMEPICKER.coverBottomClassName = "dvTimeCoverBottom";
///<var>the css class of the center indicator</var>
TIMEPICKER.indicatorClassName = "dvTimeIndicator";
///<var>the css class of the colon</var>
TIMEPICKER.colonClassName = "dvTimeColon";
///<var>id of the div that holds the Hour divs</var>
TIMEPICKER.zhhEnvelopeDivId = "divTimHH";
///<var>id of the div that holds the Minute divs</var>
TIMEPICKER.zmmEnvelopeDivId = "divTimMM";
///<var>id of the div that holds the AM/PM divs</var>
TIMEPICKER.zapEnvelopeDivId = "divTimAP";
///<var>id of the div that is the indicator</var>
TIMEPICKER.zindicatorDivId = "divTimIn";
///<var>this affects the size of all components which is based on this size in pixels</var>
TIMEPICKER.zpixelsInOneUnit = 24;
///<var>The number of milliseconds that a movement animation lasts</var>
TIMEPICKER.zanimationDuration = 400;
///<var>The number of milliseconds between each single frame of animation</var>
TIMEPICKER.zanimationFrameSpacing = 10;
TIMEPICKER.zTimePicker = function (baseDivId) {
    "use strict";
    var that, initDate, fillCell, updateDisplay, getLetter, getCell, rollerElements, animateMovement, endPosition, startPosition, killInterVal, intervalHandle, currentlyAnimating, addRollerCell, addRoller, addRollerAMPM, addCovers, addIndicator, addColon, addAPRollerLink;
    that = this;
    //+++++++++++++++++++Constructors++++++++++++++++++++++++++++++++++++++++++++++++++
    initDate = new Date();
    //+++++++++++++++++++++Public Properties+++++++++++++++++++++++++++++++++++++++++++++++++++
    this.baseObj = null;
    this.pickerIndex = -1; //The index of this object in TIMEPICKER.allTimePickers
    this.selectedHour = initDate.getHours(); //The hour to be displayed or selected
    this.selectedMinute = initDate.getMinutes(); //the minute to be displayed or selected
    this.selectedAM = this.selectedHour < 12;
    //+++++++++++++++++++++++Private Properties+++++++++++++++++++++++++++++++++++++
    endPosition = 0; //used by animation
    startPosition = 0; //used by animation
    intervalHandle = null; //used by animation
    rollerElements = 5; //number of cells in each roller (DO NOT CHANGE)
    currentlyAnimating = false; //used to prevent over clicking
    //++++++++++++++++++++++Private Methods++++++++++++++++++++++++++++++++++++++++++
    getLetter = function (index) {
        switch (index) {
        case 0:
            return "A";
        case 1:
            return "B";
        case 2:
            return "C";
        case 3:
            return "D";
        case 4:
            return "E";
        }
    };
    killInterVal = function () {
        if (intervalHandle) {
            clearInterval(intervalHandle);
            intervalHandle = null;
        }
        currentlyAnimating = false;
    };
    getCell = function (isHour, cellIndex) {
        var obj, divId;
        if (isHour === undefined || isHour === null) {
            divId = TIMEPICKER.zapEnvelopeDivId;
        } else {
            divId = (isHour ? TIMEPICKER.zhhEnvelopeDivId : TIMEPICKER.zmmEnvelopeDivId);
        }
        obj = that.baseObj.children[divId + String(that.pickerIndex)];
        obj = obj.children[divId + getLetter(cellIndex) + String(that.pickerIndex)];
        return obj;
    };
    fillCell = function (isHour, val, cellIndex) {
        var obj;
        if (cellIndex === 1 || cellIndex === 3) {
            //TIMEPICKER.zrollerMove = function (pickerIndex, isHour, movingDown)
            val = "<a href=\"#\" onclick=\"return TIMEPICKER.zrollerMove(" + that.pickerIndex + ", " + (isHour ? "true" : "false") + ", " + (cellIndex === 1 ? "true" : "false") + ");\">" + val + "</a>";
        }
        obj = getCell(isHour, cellIndex);
        obj.innerHTML = val;
    };
    addAPRollerLink = function (isAM) {
        var val;
        val = (isAM ? "AM" : "PM");
        if (isAM !== that.selectedAM) {
            val = "<a href=\"#\" onclick=\"return TIMEPICKER.zAPRollerMove(" + that.pickerIndex + ", " + (that.selectedAM ? "false" : "true") + ");\">" + val + "</a>";
        }
        return val;
    };
    updateDisplay = function () {
        var startH, startM, i, cellObj;
        startH = that.selectedHour;
        if (startH > 11) { startH -= 12; } //selectedHour is 24 hour clock with values from 0 - 23 convert to 12 hour clock values 0 - 11
        startH -= 2; //subtract 2 because roller will display 2 hours before and 2 after (The top and bottom hours are hidden from view)
        //fix time if negative overflow (less than zero)
        startM = that.selectedMinute - 2;
        if (startH < 0) { startH += 12; }
        if (startM < 0) { startM += 60; }
        for (i = 0; i < rollerElements; i++) {
            if (startH > 11) { startH = 0; }
            if (startM > 59) { startM = 0; }
            //the display number is plus one
            fillCell(true, String(startH === 0 ? 12 : startH).padLeft("0", 2), i);
            fillCell(false, String(startM).padLeft("0", 2), i);
            startH++;
            startM++;
        }
        //return rollers to start position
        that.baseObj.children[TIMEPICKER.zhhEnvelopeDivId + String(that.pickerIndex)].style.top = "-" + String(1.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        that.baseObj.children[TIMEPICKER.zmmEnvelopeDivId + String(that.pickerIndex)].style.top = "-" + String(1.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        that.baseObj.children[TIMEPICKER.zapEnvelopeDivId + String(that.pickerIndex)].style.top = String((that.selectedAM ? 0.75 : -0.25) * TIMEPICKER.zpixelsInOneUnit) + "px";
        for (i = 1; i < 4; i++) {
            cellObj = getCell(true, i);
            cellObj.style.fontWeight = (i === 2 ? "bold" : "normal");
            cellObj = getCell(false, i);
            cellObj.style.fontWeight = (i === 2 ? "bold" : "normal");
        }
        cellObj = getCell(null, 0);
        cellObj.style.fontWeight = (that.selectedAM ? "bold" : "normal");
        cellObj.innerHTML = addAPRollerLink(true);
        cellObj = getCell(null, 1);
        cellObj.style.fontWeight = (!that.selectedAM ? "bold" : "normal");
        cellObj.innerHTML = addAPRollerLink(false);
    };
    animateMovement = function (divIdToAnimate, dtTimeStart) {
        var timePassed, timeProgress, positionChange, currentPosition;
        timePassed = new Date() - dtTimeStart;
        timeProgress = timePassed / TIMEPICKER.zanimationDuration;
        positionChange = Math.sin(timeProgress * 1.6); //smooth animation, slow then fast
        if (timeProgress >= 1) {
            timeProgress = 1;
            currentPosition = endPosition;
        } else {
            currentPosition = startPosition + ((endPosition - startPosition) * positionChange);
        }
        that.baseObj.children[divIdToAnimate + String(that.pickerIndex)].style.top = String(currentPosition * TIMEPICKER.zpixelsInOneUnit) + "px";
        if (timeProgress === 1) {
            killInterVal();
            updateDisplay();
        }
    };
    addRollerCell = function (divId, doBold) {
        var obj1;
        obj1 = COMMON.getBasicElement("div", divId);
        obj1.style.height = String(TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.style.width = String(TIMEPICKER.zpixelsInOneUnit) + "px";
        if (doBold) { obj1.style.fontWeight = "bold"; }
        return obj1;
    };
    addRoller = function (isHour) {
        var obj, i, divId;
        divId = (isHour ? TIMEPICKER.zhhEnvelopeDivId : TIMEPICKER.zmmEnvelopeDivId);
        obj = COMMON.getBasicElement("div", divId + String(that.pickerIndex), null, TIMEPICKER.timeRollerClassName);
        obj.style.height = String(5 * TIMEPICKER.zpixelsInOneUnit) + "px";
        obj.style.width = String(TIMEPICKER.zpixelsInOneUnit - 2) + "px";
        obj.style.left = String(isHour ? (0) : (0.25 * TIMEPICKER.zpixelsInOneUnit)) + "px";
        for (i = 0; i < rollerElements; i++) {
            obj.appendChild(addRollerCell(divId + getLetter(i) + that.pickerIndex, (i === 2)));
        }
        that.baseObj.appendChild(obj);
    };
    addRollerAMPM = function () {
        var obj1;
        obj1 = COMMON.getBasicElement("div", TIMEPICKER.zapEnvelopeDivId + String(that.pickerIndex), null, TIMEPICKER.timeAPRollerClassName);
        obj1.style.height = String(2 * TIMEPICKER.zpixelsInOneUnit - 2) + "px";
        obj1.style.width = String(TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.style.left = String(0.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.style.top = "-" + String(0.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.appendChild(addRollerCell(TIMEPICKER.zapEnvelopeDivId + "A" + that.pickerIndex, that.selectedAM));
        obj1.appendChild(addRollerCell(TIMEPICKER.zapEnvelopeDivId + "B" + that.pickerIndex, !that.selectedAM));
        that.baseObj.appendChild(obj1);
    };
    addCovers = function () {
        var obj1;
        obj1 = COMMON.getBasicElement("div", null, null, TIMEPICKER.coverTopClassName);
        obj1.style.top = "0";
        obj1.style.height = String(0.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        that.baseObj.appendChild(obj1);
        obj1 = COMMON.getBasicElement("div", null, null, TIMEPICKER.coverBottomClassName);
        obj1.style.top = String(2 * TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.style.height = String(0.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        that.baseObj.appendChild(obj1);
    };
    addIndicator = function () {
        var obj1;
        obj1 = COMMON.getBasicElement("div", null, "&nbsp;", TIMEPICKER.indicatorClassName);
        obj1.style.top = String(0.25 * TIMEPICKER.zpixelsInOneUnit - 2) + "px";
        obj1.style.height = String(TIMEPICKER.zpixelsInOneUnit) + "px";
        that.baseObj.appendChild(obj1);
    };
    addColon = function () {
        var obj1;
        obj1 = COMMON.getBasicElement("div", null, ":", TIMEPICKER.colonClassName);
        obj1.style.top = String((0.25 * TIMEPICKER.zpixelsInOneUnit) - (4.75 * TIMEPICKER.zpixelsInOneUnit) + 2) + "px";
        obj1.style.left = String(TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.style.height = String(TIMEPICKER.zpixelsInOneUnit) + "px";
        obj1.style.width = String(0.25 * TIMEPICKER.zpixelsInOneUnit) + "px";
        that.baseObj.appendChild(obj1);
    };
    //++++++++++++++++++++++PUBLIC Methods+++++++++++++++++++++++++++++++++++++++
    this.animateHourMinute = function (isHour, isMovingDown) {
        var dtStart, divId, hh, cellObj;
        if (currentlyAnimating) { return; }//prevents overclicking
        currentlyAnimating = true;
        startPosition = -1.25;
        endPosition = (isMovingDown ? -0.25 : -2.25);
        divId = (isHour ? TIMEPICKER.zhhEnvelopeDivId : TIMEPICKER.zmmEnvelopeDivId);
        dtStart = new Date();
        cellObj = getCell(isHour, 2);
        cellObj.style.fontWeight = "normal";
        cellObj = getCell(isHour, (isMovingDown ? 1 : 3));
        cellObj.style.fontWeight = "bold";
        intervalHandle = setInterval(function () { animateMovement(divId, dtStart); });
        if (isHour) {
            //convert to 12hour
            hh = that.selectedHour;
            if (hh > 11) { hh -= 12; }
            //make the change
            hh = hh + (isMovingDown ? -1 : 1);
            if (hh > 11) { hh -= 12; }
            if (hh < 0) { hh += 12; }
            //return to 24 hour
            if (!that.selectedAM) { hh += 12; }
            that.selectedHour = hh;
        } else {
            that.selectedMinute = that.selectedMinute + (isMovingDown ? -1 : 1);
            if (that.selectedMinute > 59) { that.selectedMinute -= 60; }
            if (that.selectedMinute < 0) { that.selectedMinute += 60; }
        }
    };
    this.animateAMPM = function (isMovingDown) {
        var dtStart, cellObj;
        if (currentlyAnimating) { return; }
        currentlyAnimating = true;
        startPosition = (isMovingDown ? -0.25 : 0.75);
        endPosition = (isMovingDown ? 0.75 : -0.25);
        dtStart = new Date();
        cellObj = getCell(null, 0);
        cellObj.style.fontWeight = (isMovingDown ? "bold" : "normal");
        cellObj = getCell(null, 1);
        cellObj.style.fontWeight = (isMovingDown ? "normal" : "bold");
        intervalHandle = setInterval(function () { animateMovement(TIMEPICKER.zapEnvelopeDivId, dtStart); });
        that.selectedAM = isMovingDown;
        if (that.selectedAM === (that.selectedHour > 11)) {
            that.selectedHour = that.selectedHour + (that.selectedAM ? -12 : 12);
        }
    };
    this.getValue = function () {
        return String(that.selectedHour) + ":" + String(that.selectedMinute).padLeft("0", 2);
    };
    this.assemblePicker = function () {
        var obj1;
        that.baseObj = COMMON.getBasicElement("div", baseDivId + String(that.pickerIndex), null, TIMEPICKER.baseObjClassName);
        COMMON.addAttribute(that.baseObj, "timepickerIndex", that.pickerIndex, true);
        COMMON.addAttribute(that.baseObj, "style", "width:" + String(3.25 * TIMEPICKER.zpixelsInOneUnit) + "px;height:" + String(2.5 * TIMEPICKER.zpixelsInOneUnit) + "px;", true);
        //create the hour roller
        addRoller(true);
        //create the minute roller
        addRoller(false);
        //create the AM/PM roller
        addRollerAMPM();
        addCovers();
        updateDisplay();
        addIndicator();
        addColon();
        obj1 = COMMON.getBasicElement("div");
        obj1.style.clear = "both";
        that.baseObj.appendChild(obj1);
        return that.baseObj;
    };
    this.setValue = function (newValue) {
        var hh, mm;
        hh = parseFloat(newValue.split(":")[0]);
        mm = parseFloat(newValue.split(":")[1]);
        that.selectedHour = hh;
        that.selectedMinute = mm;
        that.selectedAM = (hh < 12);
    };
    this.updateControl = function () {
        updateDisplay();
    };
};
TIMEPICKER.zrollerMove = function (pickerIndex, isHour, movingDown) {
    ///<summary>NOT FOR EXTERNAL USE - runs the hour/minute change event</summary>
    ///<param name="pickerIndex" type="Number">The index of the picker in TIMEPICKER.allTimePickers</param>
    ///<param name="isHour" type="Boolean">True for hour roller</param>
    ///<param name="movingDown" type="Boolean">True if the roller is to move down (second cell from top is clicked)</param>
    "use strict";
    var myPicker;
    myPicker = TIMEPICKER.allTimePickers[pickerIndex];
    myPicker.animateHourMinute(isHour, movingDown);
    //*****************DEBUG******************************
    document.getElementById("txtDude").value = myPicker.getValue();
    //*****************DEBUG******************************
    return false;
};
TIMEPICKER.zAPRollerMove = function (pickerIndex, movingDown) {
    ///<summary>NOT FOR EXTERNAL USE - runs the AM PM change event</summary>
    ///<param name="pickerIndex" type="Number">The index of the picker in TIMEPICKER.allTimePickers</param>
    ///<param name="movingDown" type="Boolean">True if the roller is to move down (top cell is clicked)</param>
    "use strict";
    var myPicker;
    myPicker = TIMEPICKER.allTimePickers[pickerIndex];
    myPicker.animateAMPM(movingDown);
    //*****************DEBUG******************************
    document.getElementById("txtDude").value = myPicker.getValue();
    //*****************DEBUG******************************
    return false;
};
//***********************************************External Functions***************************************************//
TIMEPICKER.reset = function () {
    ///<summary>Clears Timepickers from memory</summary>
    "use strict";
    TIMEPICKER.allTimePickers = [];
};
TIMEPICKER.createTimepicker = function (pickerId, initialValue) {
    ///<summary>Creates a timepicker object and returns it</summary>
    ///<param name="pickerId" type="String">The id of the base div that contains the control</param>
    ///<param name="initalValue" type="String">(Optional) The initial time to set the control in the format ("HH:MM") HH Value 0 - 23, MM Value 0 - 59. If omitted, the time will be the current system time</param>
    ///<returns type="Element" />
    "use strict";
    var myIndex, myTimePicker;
    myIndex = TIMEPICKER.allTimePickers.length;
    myTimePicker = new TIMEPICKER.zTimePicker(pickerId);
    myTimePicker.pickerIndex = myIndex;
    if (initialValue !== undefined && initialValue !== null) {
        myTimePicker.setValue(initialValue);
    }
    TIMEPICKER.allTimePickers[myIndex] = myTimePicker;
    return myTimePicker.assemblePicker();
};
TIMEPICKER.getValue = function (objId) {
    ///<summary>Gets the value of a time picker control</summary>
    ///<param name="objId" type="String">The id of the time picker</param>
    ///<returns type="String">The selected time in the format H:MM 24Hour</returns>
    "use strict";
    var obj, pickerIndex;
    obj = document.getElementById(objId);
    pickerIndex = obj.getAttribute("timepickerIndex");
    return TIMEPICKER.allTimePickers[parseFloat(pickerIndex)].getValue();
};
TIMEPICKER.setValue = function (objId, newValue) {
    ///<summary>Sets the value of a time picker control</summary>
    ///<param name="objId" type="String">The id of the time picker</param>
    ///<param name="newValue" type="String"
    "use strict";
    var obj, pickerIndex, myTimePicker;
    obj = document.getElementById(objId);
    pickerIndex = obj.getAttribute("timepickerIndex");
    myTimePicker = TIMEPICKER.allTimePickers[parseFloat(pickerIndex)];
    myTimePicker.setValue(newValue);
    myTimePicker.updateControl();
};