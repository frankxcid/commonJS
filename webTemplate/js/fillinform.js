/*jslint browser: true, plusplus: true */
/*global XMLQuery, COMMON, fxCalendar*/
/// <reference path="common.js" />
//ver 1.0 10/31/2014
var FILLIN = {};
///<var>an array containing form objects for a page
FILLIN.allForms = [];
///<var>helps keep track of how many items in FILLIN.allForms
FILLIN.maxFormIndex = 0;
///<var>class name for div holding controls
FILLIN.ControlEnvelopeClassName = "dvCDControlCell";
///<var>class name for dialog and form subhead
FILLIN.subHeadClassName = "dvCDSubHead";
///<var>class name for div containing button at the bottom of dialog or form
FILLIN.buttondivClassName = "dvCDBottomButtons";
///<var>class name for sub head when simple dialog (Not a form and has no controls)
FILLIN.subHeadClassName2 = "dvCDSubHeadSimpleDialog";
///<var>the id prefix (suffixed with formid) of the div used to hide the parent
FILLIN.coverallDivIdPrefix = "divFFCoverall";
///<var>Enum for form stacking. this determines whether the base div is float-ed left or right or clear-ed</var>
FILLIN.formStacking = {
    "left": "Left",
    "right": "Right",
    "stacked": ""
};
//*********************************************Helper Objects NOT FOR EXTERNAL USE*******************************************//

FILLIN.zsetButtons = function (divId, setEnabled, formIndex) {
    ///<summary>NOT FOR EXTERNAL USE...Sets all button in the parent object to disabled to prevent any action then on the current dialog. Applies blur. Not to be used on forms</summary>
    ///<param name="divId" type="String">The element id of the dialog container object</param>
    ///<param name="setEnabled" type="Boolean">If true, re-enables all buttons</param>
    ///<param name="formIndex" type="Int">The index of the form in FILLIN.allForms</param>
    "use strict";
    var parentObj;
    parentObj = document.getElementById(divId);
    COMMON.blockInput(parentObj.id, setEnabled, null, FILLIN.coverallDivIdPrefix + String(formIndex), "39");
};
FILLIN.zbuttonClicked = function (formIndex, btnObj) {
    ///<summary>NOT FOR EXTERNAL USE...Run on any buttons onclick event, closes the form if it is a dialog, runs the continuing function and removes the form from memory</summary>
    ///<param name="formIndex" type="Int">The index of the form in FILLIN.allForms</param>
    ///<param name="btnObj" type="element">The button that was clicked</param>
    "use strict";
    FILLIN.allForms[formIndex].close(btnObj);
    //remove the form if it is a dialog and no scripts need to be run
    if (FILLIN.allForms && FILLIN.allForms[formIndex] && FILLIN.allForms[formIndex].removeMe) {
        FILLIN.allForms[formIndex] = null;
        delete FILLIN.allForms[formIndex];
    }
};
FILLIN.zfieldChanged = function (formIndex) {
    ///<summary>NOT FOR EXTERNAL USE...Runs on any user editable field on the keyup or onchange event as appropriate. Sets the flag that changes are pending</summary>
    ///<param name="formIndex" type="Int">The index of the form in FILLIN.allForms</param>
    "use strict";
    FILLIN.allForms[formIndex].pendingChanges = true;
    if (FILLIN.allForms[formIndex].suppressPendingMessage) { return; }//do not display message if messages are suppressed
    FILLIN.allForms[formIndex].errorMessage("*Pending Changes");
};
FILLIN.zaddForm = function (formObj) {
    ///<summary>NOT FOR EXTERNAL USE...Adds a form to FILLIN.allForms and ensures that indexes are not reused</summary>
    ///<param name="formObj" type="FILLIN.Form Object">The Form object to add</param>
    ///<returns type="Int">The index of the form in FILLIN.allForms</returns>
    "use strict";
    var formIndex;
    formIndex = FILLIN.maxFormIndex;
    while (FILLIN.allForms[formIndex] !== undefined) {
        formIndex++;
    }
    formObj.formIndex = formIndex;
    FILLIN.allForms[formIndex] = formObj;
    FILLIN.maxFormIndex = formIndex + 1;
    return formIndex;
};
FILLIN.Form = function (headLine, parentDivId, width, message) {
    ///<summary>NOT FOR EXTERNAL USE...Creates the form object</summary>
    ///<param name="headLine" type="String">The text in the Title Bar</param>
    ///<param name="parentDivId" type="String">The id of the parent element where this form will be displayed</param>
    ///<param name="width" type="String">Any valid css width value</param>
    ///<param name="message" type="String|Element">(Optional) message at the top of the form main area. if String adds a div with string as content. If object, appends as child</param>
    "use strict";
    var that, baseObjId, contentBaseObjId, errorDivId, baseObjClassName, titleObjClassName, contentBaseClassName, errorDivClassName, init, getFieldValues, fieldsValueObj;
    that = this;
    //Private values
    baseObjId = "divformBase";
    contentBaseObjId = "divContentBase";
    errorDivId = "divErrMess";
    //css class
    baseObjClassName = "dvCDBase";
    titleObjClassName = "dvCDTitle";
    contentBaseClassName = "dvCDContentBase";
    errorDivClassName = "dvCDErr";
    //private methods
    init = function () {
        baseObjId += String(that.formIndex);
        contentBaseObjId += String(that.formIndex);
        errorDivId += String(that.formIndex);
        //set classNames to use fillinform styles
        if (that.isForm) {
            baseObjClassName = baseObjClassName.replace("CD", "FF") + that.formStacking;
            titleObjClassName = titleObjClassName.replace("CD", "FF");
            contentBaseClassName = contentBaseClassName.replace("CD", "FF");
            errorDivClassName = errorDivClassName.replace("CD", "FF");
        }

    };
    //gets the value from fields object pattern: {fieldIndexOfField1: {id: idOfField1, value: valuefromfield1, hasChanged: Boolean},fieldIndexOfField2: {id: idOfField2, value: valueFromField2, hasChanged: Boolean},...}
    getFieldValues = function (setIdAsIndex) {
        var contentBaseObj, obj, allDescendants, fieldType, fieldIndex, value, i, hasFields;
        hasFields = false;
        contentBaseObj = document.getElementById(contentBaseObjId);
        fieldsValueObj = { "hasChanged": that.pendingChanges };
        allDescendants = contentBaseObj.getElementsByTagName("*");
        if (allDescendants.length > 0) {
            for (i = 0; i < allDescendants.length; i++) {
                obj = allDescendants[i];
                if (obj.hasAttribute("fieldtype")) {
                    fieldType = COMMON.fieldTypes[obj.getAttribute("fieldtype")];
                    if (fieldType && fieldType.isField) {
                        hasFields = true;
                        value = fieldType.getValueFunction(obj.id);
                        fieldIndex = obj.getAttribute("fieldindex");
                        if (!fieldIndex) { fieldIndex = obj.id; }
                        fieldsValueObj[(setIdAsIndex ? obj.id : fieldIndex)] = { "id": obj.id, "value": value, "hasChanged": that.pendingChanges };
                    }
                }
            }
        }
        if (!hasFields) { fieldsValueObj = null; }
    };
    //arrays
    this.allControls = [];
    this.allButtons = [];
    //Public Properties
    this.formIndex = null; // the index of this form in FILLIN.allForms
    this.suppressPendingMessage = false; //if false, will display the message "Pending Changes" when any control is changed
    this.optionalData = null; //value to pass to continuingfunction
    this.optionalValidationFunction = null; //after user clicks a button (only if doValidation property for that button is true) this function will be run. function pattern: function (dataValuesFromform){Returns Boolean} where dataValuesFromform is the value of the form fields. the function returns true if the data is valid otherwise processing will no continue close. send messages to the form's error div by using FILLIN.errorMessage function. See dataValuesFromform pattern above.
    this.continuingFunction = null; //a function that will be used when a user clicks a button in the form. the function should be assigned to a variable and have the pattern: function (dialogResult, dataValuesFromform, optionalData) where dialogResult is the value assigned in the button Definition, dataValuesFromform is an object that contains the values from the controls. if there are no values (such as dataValuesFromform is empty) then optionalData will be the value in order to accomodate continuing functions with only 2 arguments when the form is a Dialog and is known not to have values, and optionalData is the value of optionalData from the form object. See dataValuesFromform pattern above.
    //public methods
    this.manualOffset = null; //ignored if this.isForm is true. the top offset in pixels from the top of the parentContainer to the top of the dialog override auto placement
    this.isForm = false; //when true will display as form inline on page instead of popup
    this.pendingChanges = false; //user has changed a field in the form
    this.removeMe = false; //if true, upon close will remove this form from memory
    this.formStacking = FILLIN.formStacking.stacked; //sets the float or clear of the base div in forms only
    //Displays a message at the top of the form in red letters (see customconfirm.css)
    //Parameters:
    // message      (String)    Message to display
    this.errorMessage = function (message) {
        if (message === undefined || message === null || message === "") { message = "&nbsp;"; }
        document.getElementById(errorDivId).innerHTML = message;
    };
    //displays the form
    this.display = function () {
        var parentDivObj, baseDivObj, obj1, obj2, i, leftPosition, topPosition, hasEditableField, firstEditableField;
        init();
        hasEditableField = false;
        if (!that.isForm) { FILLIN.zsetButtons(parentDivId, false, that.formIndex); }
        parentDivObj = document.getElementById(parentDivId);
        baseDivObj = document.getElementById(FILLIN.baseObjId + String(that.formIndex));
        if (baseDivObj) { parentDivObj.removeChild(baseDivObj); }
        baseDivObj = COMMON.getBasicElement("div", baseObjId, null, baseObjClassName);
        if (width !== undefined && width !== null) { baseDivObj.style.width = width; }
        //add headline
        if (headLine === undefined || headLine === null) { headLine = "&nbsp;"; }
        obj1 = COMMON.getBasicElement("div", null, headLine, titleObjClassName);
        obj2 = COMMON.getLink(null, "X", null, "FILLIN.allForms[" + that.formIndex + "].continueClose(true, 0);");
        obj2.className = "toolClose";
        if (that.allButtons.length <= 1 && !that.isForm) {
            obj1.appendChild(obj2);
        }
        baseDivObj.appendChild(obj1);
        //add content base
        obj1 = COMMON.getBasicElement("div", null, null, contentBaseClassName);
        obj1.id = contentBaseObjId;
        //add the message div
        if (message !== undefined && message !== null) {
            if (typeof message === "string") {
                obj2 = COMMON.getBasicElement("div", null, message, (that.allControls.length === 0 && !that.isForm ? FILLIN.subHeadClassName2 : FILLIN.subHeadClassName));
                obj1.appendChild(obj2);
            }
            if (typeof message === "object") {
                obj1.appendChild(message);
            }
        }
        //if there are controls add the error message display div
        if (that.allControls.length > 0) {
            obj2 = COMMON.getBasicElement("div", null, "&nbsp;", errorDivClassName);
            obj2.id = errorDivId;
            obj1.appendChild(obj2);
        }
        if (that.allControls.length > 0) {
            for (i = 0; i < that.allControls.length; i++) {
                if (!hasEditableField && that.allControls[i].isEditable) {
                    firstEditableField = i;
                    hasEditableField = true;
                }
                obj1.appendChild(that.allControls[i].getObject());
            }
        }
        obj2 = document.createElement("div");
        obj2.style.clear = "both";
        obj1.appendChild(obj2);
        //add buttons 
        if (that.allButtons.length > 0) {
            obj2 = document.createElement("div");
            obj2.className = FILLIN.buttondivClassName;
            for (i = 0; i < that.allButtons.length; i++) {
                obj2.appendChild(that.allButtons[i].getObject(that.allButtons.length === 1, that.isForm));
            }
            obj1.appendChild(obj2);
        }
        baseDivObj.appendChild(obj1);
        //add form to page
        parentDivObj.appendChild(baseDivObj);
        //set position of the form when it is a dialog
        if (!that.isForm) {
            baseDivObj.style.position = "absolute";
            leftPosition = ((parentDivObj.offsetWidth - baseDivObj.offsetWidth) / 2);
            if (leftPosition < 0) { leftPosition = 0; }
            baseDivObj.style.left = String(leftPosition) + "px";
            topPosition = parentDivObj.offsetTop;
            if (parentDivObj.style.position && parentDivObj.style.position === "absolute") { topPosition = 0; }
            topPosition = that.manualOffset || (parentDivObj.offsetHeight * 0.1 + topPosition);
            baseDivObj.style.top = String(topPosition) + "px";
        }
        //set focus to first field if the form has fields
        if (hasEditableField) {
            COMMON.focusme(that.allControls[firstEditableField].id);
        }
    };
    //returns field values
    //Returns   (Lit. Object)object pattern: {fieldIndexOfField1: {id: idOfField1, value: valuefromfield1, hasChanged: Boolean},fieldIndexOfField2: {id: idOfField2, value: valueFromField2, hasChanged: Boolean},...}
    this.getValues = function (setIdAsIndex) {
        getFieldValues(setIdAsIndex);
        return fieldsValueObj;
    };
    //validates form
    //Returns   (Boolean)   true if form fields pass common validation and optional validation if present
    this.validateForm = function () {
        var commonValidation;
        commonValidation = COMMON.validateForm(baseObjId);
        if (!commonValidation) {
            that.errorMessage("There are errors in one or more fields shown highlighted in red. Hover your mouse pointer over a red field to see the specific error.");
        }
        if (that.pendingChanges && that.optionalValidationFunction !== undefined && that.optionalValidationFunction !== null) {
            commonValidation = commonValidation && that.optionalValidationFunction(fieldsValueObj, that.formIndex);
        }
        return commonValidation;
    };
    //Saves form data and reset pending change
    //Parameters:
    //  QueryIndex      (String)        The Name of the query described in the SQLConnect SQLS enum in the file SQLConnect.cs
    //  Parameters      (Array)         (Optional) Parameters used in the SQL query in SQLConnect.cs
    //  noResults       (Boolean)       (Optional) Set to true if the query run does not return any results
    //  suppressMessage (Boolean)       (Optional) if true will clear error message in the form, otherwise, will display "Data Saved"
    this.saveData = function (queryid, params, hasNoResults, suppressMessage) {
        if (!that.pendingChanges) { return; }
        XMLQuery.callQuery(queryid, params, hasNoResults);
        that.pendingChanges = false;
        that.errorMessage(suppressMessage ? "" : "Data Saved");
    };
    //Called by this.close to continue from a dialog
    //Parameters:
    //  dialogResult        (Boolean)       Determine if user pick yes to continue closing or continue the action of the button
    //  btnIndex            (String)        The index of the button from allButtons array
    this.continueClose = function (dialogResult, btnIndex) {
        var contDialogResult, parentObj, baseObj;
        if (!dialogResult) { return; }
        parentObj = document.getElementById(baseObjId).parentElement;
        //get the field Values
        getFieldValues(true);
        //Validation
        if (that.allButtons[btnIndex] && that.allButtons[btnIndex].doValidation === true) {
            if (!that.validateForm()) {
                return;
            }//form has an error
        }
        //if fieldValuesObj is null or empty, replace it with optionalData
        if (fieldsValueObj === null || COMMON.objectIsEmpty(fieldsValueObj)) {
            fieldsValueObj = that.optionalData;
        }
        //remove the form when it is a dialog
        if (!that.isForm) {
            baseObj = document.getElementById(baseObjId);
            while (baseObj.firstChild) {
                baseObj.removeChild(baseObj.firstChild);
            }
            parentObj.removeChild(baseObj);

            FILLIN.zsetButtons(parentObj.id, true, that.formIndex);
            that.removeMe = true;
        }
        //call continuing function
        if (that.allButtons[btnIndex] && that.continuingFunction !== undefined && that.continuingFunction !== null) {
            contDialogResult = that.allButtons[btnIndex].dialogResult;
            that.continuingFunction(contDialogResult, fieldsValueObj, that.optionalData);
        }
    };
    //Called by the onclick action of a button in the form
    //Parameters:
    //  btnObj      (Element:Button)    The button element that was clicked
    this.close = function (btnObj) {
        var btnIndex;
        btnIndex = parseInt(btnObj.getAttribute("buttonIndex"), 10);
        //do confirmation if pending changes
        if (that.allButtons[btnIndex].doConfirm && that.pendingChanges) {
            FILLIN.yesNoDialog(baseObjId, "Confirm", "There are changes pending. Do you to continue and discard changes?", "50%", FILLIN.allForms[that.formIndex].continueClose, String(btnIndex));
            return;
        }
        that.continueClose(true, btnIndex);
    };
};
FILLIN.ZOneControl = function (controlType, formIndex, id, value, label, required, numberValidation, maxLen, newLine) {
    ///<summary>NOT FOR EXTERNAL USE...Creates a field object</summary>
    ///<param name="controlType" type="String">the type of control to display, controltype definitions are in common.js (see object COMMON.fieldTypes)</param>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">(Optional) the id of the element</param>
    ///<param name="value" type="String">(Optional) the initial value to display</param>
    ///<param name="label" type="String">(Optional) the label to display with the field</param>
    ///<param name="required" type="Boolean">(Optional) true then the user will have to fill in this field if it is a text type field or select a choice other than the choice with the value -1 if DDL</param>
    ///<param name="numberValidation" type="String">(Optional) the type of validation the control. validationtype definitions are in common.js (see object COMMON.validationTypes)</param>
    ///<param name="maxLen" type="Int">(Optional) the maximum number of characters that can be entered in a text type field</param>
    ///<param name="newLine" type="Boolean">(Optional) set to true so that this control will be placed in a new line</param>
    "use strict";
    var that, fieldType;
    that = this;
    //constructors
    fieldType = COMMON.fieldTypes[controlType]; //the type of control to display (see COMMON.fieldTypes)
    //public properties
    this.id = id; //the element's id
    this.fieldIndex = null; //the index of this control in the allControls array
    this.value = value; //the value of the element
    this.hasChanged = false; //set to true if the user has updated a field
    this.listItem = null; //array of literal objects with the properties: text and value for ddl control
    this.queryid = null; // //ignored if listItem has a value. The queryid to run for a ddl control  (SQLConnect.SQLS in SQLConnect.cs) 
    this.params = null; //ignored if listItem has a value. the parameter for the query in valueListQuery
    this.linkOnClick = null; //the script to run for onclick event on links
    this.href = null; //ignored if linkOnClick has a value. The href for links
    this.width = null; //the width on the field
    this.height = "auto"; //the height of the control
    this.newLine = newLine || false; //tells that this control starts a new row
    this.fieldChangeScript = ""; //adds a field change script
    this.isEditable = (fieldType !== undefined && fieldType !== null && fieldType.isField === true); //true if the field accepts user input
    this.placeholder = null; //add visible text to text fields
    this.numFieldData = null; //data in the format {min:value, max:value, step:value}
    this.preconfiguredContainer = null; //if the element is created in the calling script, then return that object;
    this.target = null; //for links only, sets the href target
    this.calendarCloseFunction = null; //function that runs when a date is chosen in the format function(valueSelect, calendarOptionalData)
    this.calendarOptionalData = null; //optional data send to calendar close function
    this.calendarCloseHelper = function (value, optionalData) {
        FILLIN.zfieldChanged(formIndex);
        if (that.calendarCloseFunction) {
            that.calendarCloseFunction(value, optionalData);
        }
    };
    //gets the field element construct
    //Parameters:
    //Returns       (Element)
    this.getObject = function () {
        var objOut, obj1, fieldChangeScript, attrib, i, thisFieldtype;
        //create envelope and label
        objOut = document.createElement("div");
        objOut.className = FILLIN.ControlEnvelopeClassName;
        //if (that.height === "auto") {
        //    objOut.style.height = "45px";
        //}
        if (that.newLine || that.fieldIndex === 0) {
            objOut.style.clear = "both";
            objOut.style.marginLeft = "5px";
        }
        if (label !== undefined && label !== null && label !== "") {
            obj1 = document.createElement("h5");
            obj1.innerHTML = (required ? "*" : "") + label;
            objOut.appendChild(obj1);
        }
        fieldChangeScript = "FILLIN.zfieldChanged(" + formIndex + ", this);" + (that.fieldChangeScript !== undefined && that.fieldChangeScript !== null ? that.fieldChangeScript : "");
        //if the controls are preconfigured then process this and exit
        if (that.preconfiguredContainer !== undefined && that.preconfiguredContainer !== null) {
            //make sure all controls have onchange with the fieldChangeScript
            if (that.preconfiguredContainer.childNodes.length > 0) {
                for (i = 0; i < that.preconfiguredContainer.childNodes.length; i++) {
                    obj1 = that.preconfiguredContainer.childNodes[i];
                    if (obj1.hasAttribute("fieldtype")) {
                        thisFieldtype = COMMON.fieldTypes[obj1.getAttribute("fieldtype")];
                        if (thisFieldtype.isField) {
                            COMMON.addAttribute(obj1, "onchange", fieldChangeScript, true);
                        }
                    }
                }
            }
            objOut.appendChild(that.preconfiguredContainer);
            return objOut;
        }
        attrib = { "fieldindex": String(that.fieldIndex) };
        if (fieldType === COMMON.fieldTypes.txa && !that.width) {
            objOut.style.width = "95%";
        }
        switch (fieldType.id) {
            case "cal":
                obj1 = COMMON.getCalendar(id, that.value, required, null, COMMON.pageMessageDivId, null, fieldChangeScript, fieldChangeScript, attrib, false, that.calendarCloseHelper, that.calendarOptionalData);
                break;
            case "ddl":
                attrib.onchange = fieldChangeScript;
                if (that.listItem) {
                    obj1 = COMMON.getDDL(id, value, required, null, that.listItem, null, attrib);
                } else {
                    obj1 = COMMON.getDDLfromQuery(id, value, required, that.queryid, that.params, null, null, attrib);
                }
                break;
            case "lnk":
                obj1 = COMMON.getLink(id, value, (that.linkOnClick ? "#" : that.href), that.linkOnClick, null, attrib, that.target);
                break;
            case "num":
                attrib.onchange = fieldChangeScript;
                obj1 = COMMON.getNumberField(id, value, required, null, numberValidation, that.numFieldData.min, that.numFieldData.max, that.numFieldData.step, that.placeholder, attrib);
                break;
            default:
                if (fieldType.isField) {
                    attrib.onchange = fieldChangeScript;
                    if (fieldType.canHaveMaxLen) { attrib.onkeyup = fieldChangeScript; }
                }
                if (fieldType === COMMON.fieldTypes.txa) {
                    attrib.style = "";
                    if (that.height !== undefined && that.height !== null && that.height !== "") { attrib.style += "height:" + that.height + ";"; }
                    if (that.width !== undefined && that.width !== null && that.width !== "") { attrib.style += "width:" + that.width + ";"; }
                }
                obj1 = COMMON.getFieldObject(fieldType.id, id, value, required, numberValidation, that.placeholder, maxLen, null, attrib);
                //if (fieldType !== COMMON.fieldTypes.txa) { obj1.style.height = that.height; }
                break;
        }
        if (fieldType === COMMON.fieldTypes.spa && that.width) {
            //fixes width on inline span
            obj1.style.cssFloat = "left";
        }
        if (fieldType !== COMMON.fieldTypes.txa) { that.id = obj1.id; }
        if (that.width !== undefined && that.width !== null && that.width !== "") { obj1.style.width = that.width; }
        objOut.appendChild(obj1);
        return objOut;
    };
};
FILLIN.ZButtonDefinition = function (formIndex, id, value, dialogResult, placeLeft, doValidation, doConfirm) {
    ///<summary>NOT FOR EXTERNAL USE...Creates a button definition</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">the id of the button</param>
    ///<param name="valu" type="String">the value of the button</param>
    ///<param name="dialogResults" type="object">the value to pass to the dialogResult of the continuing function. For forms that are dialogs, usually a boolean. On dialogs, the form will also close</param>
    ///<param name="placeLeft" type="Boolean">determines if the button will be floated left or right</param>
    ///<param name="doConfirm" type="Boolean">(Optional) when button is clicked, such as a cancel or exit, if there are pending changes will confirm with user if they should discard changes and continue or cancel the execution of the "close" function</param>
    "use strict";
    var that;
    that = this;
    this.dialogResult = dialogResult; //the dialogresult if this button is clicked
    this.placeLeft = placeLeft; //the button will be floated left if true else floated right
    this.doValidation = doValidation || false; //clicking on this button will do validation on fields if true
    this.buttonIndex = null; //the index of this button in the allbuttons array
    this.doConfirm = doConfirm || false; //when button is clicked, such as a cancel or exit, if there are pending changes will confirm with user if they should discard changes and continue or cancel the execution of the "close" function
    //gets the button object
    //Parameters:
    //  singleButton        (Boolean)       If true will center button
    //Returns       (Element)
    this.getObject = function (singleButton, isForm) {
        var obj;
        obj = COMMON.getButton(id, value, "FILLIN.zbuttonClicked(" + formIndex + ", this);");
        obj.setAttribute("buttonIndex", String(that.buttonIndex));
        if (!singleButton || isForm) { obj.style.cssFloat = (that.placeLeft ? "left" : "right"); }
        return obj;
    };
};
FILLIN.zaddControl = function (formIndex, thisControl) {
    ///<summary>NOT FOR EXTERNAL USE...Adds a button to the allControls Array of the Form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="thisControl" type="Element">The element added to the form</param>
    ///<returns type="Int">The index of the control in allControls array of the form</returns>
    "use strict";
    var fieldIndex;
    fieldIndex = FILLIN.allForms[formIndex].allControls.length;
    thisControl.fieldIndex = fieldIndex;
    FILLIN.allForms[formIndex].allControls.push(thisControl);
    return fieldIndex;
};
//******************************************External use methods********************************************************//

FILLIN.reset = function () {
    ///<summary>Resets needed variables of this object. Use this when displaying a new page</summary>
    "use strict";
    FILLIN.allForms = [];
    //FILLIN.maxFormIndex = 0;
};
FILLIN.setStacking = function (formIndex, stacking) {
    ///<summary>Sets the stacking of the form by float-ing or clear-ing the base div. Ignored in dialogs</summary>
    ///<param name="formIndex" type="Number">The index of the form in FILLIN.allForms</param>
    ///<param name="stacking" type="FILLIN.stacking">Use FILLIN.stacking enumeration</param>
    "use strict";
    var thisForm;
    thisForm = FILLIN.allForms[formIndex];
    thisForm.formStacking = stacking;
};
FILLIN.validateForm = function (formIndex) {
    ///<summary>Does common validation and optional validation if provided</summary>
    ///<returns type="Boolean">Returns true if all fields are valid</returns>
    "use strict";
    return FILLIN.allForms[formIndex].validateForm();
};
FILLIN.suppressPendingChangesMessage = function (formIndex) {
    ///<summary>Will not display 'Pending Changes' message when a control on the form is changed</summary>
    ///param name="formIndex" type="Number">The index of the form in FILLIN.allForms</param>
    "use strict";
    FILLIN.allForms[formIndex].suppressPendingMessage = true;
};
FILLIN.closeDialog = function (formIndex) {
    ///<summary>Closes a dialog without prompting or validating.</summary>
    ///param name="formIndex" type="Number">The index of the form in FILLIN.allForms</param>
    "use strict";
    var thisForm;
    thisForm = FILLIN.allForms[formIndex];
    thisForm.continueClose(true);
};
FILLIN.saveData = function (formIndex, queryId, params, hasNoResults, suppressMessage) {
    ///<summary>Saves form data and reset pending change, if there are not pending changes, will do nothing</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="QueryIndex" type="String">The Name of the query described in the SQLConnect SQLS enum in the file SQLConnect.cs</param>
    ///<param name="Parameters" type="Array">(Optional) Parameters used in the SQL query in SQLConnect.cs</param>
    ///<param name="noResults" type="Boolean">(Optional) Set to true if the query run does not return any results</param>
    ///<param name="suppressMessage" type="Boolean">(Optional) if true will clear error message in the form, otherwise, will display "Data Saved"</param>
    "use strict";
    FILLIN.allForms[formIndex].saveData(queryId, params, hasNoResults, suppressMessage);
};
FILLIN.getFieldValues = function (formIndex, setIdAsIndex) {
    ///<summary>Gets the values of the form. Recommended use for non-dialog forms that do not close</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="setIdAsIndex" type="Boolean">(Optional) If true then the object returned will have the object Id as the property index otherwise, it will be the index of the order the controls were added to the form</param>
    ///<returns type="Lit. Object">object pattern: {fieldIndexOfFieldOrObjId1: {id: idOfField1, value: valuefromfield1, hasChanged: Boolean},fieldIndexOfFieldOrObjId2: {id: idOfField2, value: valueFromField2, hasChanged: Boolean},...}</returns>
    "use strict";
    return FILLIN.allForms[formIndex].getValues(setIdAsIndex);
};
FILLIN.createDialog = function (parentDivId, headline, message, continuingfunction, optionalData, width, optionalValidationFunction) {
    ///<summary>Creates a Dialog</summary>
    ///<param name="parentDivId" type="String">The id of the parent element where this dialog will be displayed</param>
    ///<param name="headline" type="String">(Optional) The text in the Title Bar</param>
    ///<param name="message" type="String|Element">(Optional) message at the top of the form main area. if String adds a div with string as content. If object, appends as child</param>
    ///<param name="continuingfunction" type="function">(Optional) a function that will be used when a user clicks a button in the dialog. the function should be assigned to a variable and have the pattern: function (dialogResult, dataValuesFromForm, optionalData) where dialogResult is the value assigned in the button Definition, dataValuesFromForm is an object that contains the values from the controls. if there are no values (such as dataValuesFromForm is empty) then optionalData will be the value in order to accomodate continuing functions with only 2 arguments when the Dialog is known not to have values, and optionalData is the value of optionalData from the FILLIN.Form object. dataValuesFromForm pattern:  {idField1: {id: idOfField1, value: valuefromfield1},idOfField2: {id: idOfField2, value: valueFromField2},...}</param>
    ///<param name="optionalData" type="object">(Optional) Ignored if continuingfunction is not specified. Any data of any type the will be passed to the continuing function</param>
    ///<param name="width" type="String">Any valid css width value</param>
    ///<param name="optionalValidationFunction" type="function">(Optional) after user clicks a button (if the doValidation property for that button is true) this function will be run. function pattern: function (dataValuesFromForm, formIndex){Returns Boolean} where dataValuesFromForm is the value of the form fields. formIndex is the index of the form the function returns true if the data is valid control will not be sent to the continuing funtion. send messages to the dialog's error div by using FILLIN.errorMessage function. dataValuesFromForm pattern:  {IdOfField1: {id: idOfField1, value: valuefromfield1},IdOfField2: {id: idOfField2, value: valueFromField2},...}</param>
    ///<returns type="Int">The index of the dialog in FILLIN.allForms</returns>
    "use strict";
    var thisDialog;
    thisDialog = new FILLIN.Form(headline, parentDivId, width, message);
    thisDialog.continuingFunction = continuingfunction;
    thisDialog.optionalData = optionalData;
    thisDialog.optionalValidationFunction = optionalValidationFunction;
    return FILLIN.zaddForm(thisDialog);
};
FILLIN.resetPendingChanges = function (formIndex) {
    ///<summary>Clears pending changes after completing an external action</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    "use strict";
    FILLIN.allForms[formIndex].pendingChanges = false;
};
FILLIN.displayForm = function (formIndex) {
    ///<summary>Displays the form</summary>
    ///<param name="formIndex" type="Number">the index of the form in FILLIN.allForms</param>
    "use strict";
    FILLIN.allForms[formIndex].display();
};
FILLIN.errorMessage = function (formIndex, message) {
    ///<summary>Places an error message on the top line of the form</summary>
    ///<param name="formIndex" type="Int">The index of the form in FILLIN.allForms</param>
    ///<param name="message" type="message">The message to display</param>
    "use strict";
    FILLIN.allForms[formIndex].errorMessage(message);
};
FILLIN.addSpan = function (formIndex, id, value, title, width, newLine) {
    ///<summary>Adds a span tag (Label?) to the form</summary>:
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="width" type="String">(Optional) Any valid css width value.  if provided will set the css width of this field</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    "use strict";
    var fieldIndex;
    fieldIndex = FILLIN.zaddControl(formIndex, new FILLIN.ZOneControl("spa", formIndex, id, value, title, false, null, null, newLine));
    FILLIN.allForms[formIndex].allControls[fieldIndex].width = width;
};
FILLIN.addNumberBox = function (formIndex, id, value, title, isRequired, COMMONvalType, min, max, step, width, newline, placeholder) {
    ///<summary>Adds a input of type number</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="isRequired" type="Boolean">(Optional)  if true, the field will be required to have an entry in it during validation</param>
    ///<param name="COMMONvalType" type="String">(Optional) a value from COMMON.validationTypes in common.js. Determines a type of number validation</param>
    ///<param name="min" type="number">(Optional) Minimum value allowed</param>
    ///<param name="max" type="number">(Optional) Maximum value allowed</param>
    ///<param name="step" type="number">(Optional) accepted values in the increment of this value starting with min (i.e. values accepted are min, min + step, min + (step * 2), etc... up to max value)</param>
    ///<param name="width" type="String">(Optional) Any valid css width value.  if provided will set the css width of this field</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    ///<param name="placeholder" type="Strin">(Optional) Adds a visible text on fields when field is empty HTML5</param>
    "use strict";
    var fieldIndex, fType;
    fType = "num";
    if (COMMON.ieVer < 10) { fType = "txt"; }
    fieldIndex = FILLIN.zaddControl(formIndex, new FILLIN.ZOneControl(fType, formIndex, id, value, title, isRequired, COMMONvalType, null, newline));
    FILLIN.allForms[formIndex].allControls[fieldIndex].numFieldData = { "min": min, "max": max, "step": step };
    FILLIN.allForms[formIndex].allControls[fieldIndex].placeholder = placeholder;
    FILLIN.allForms[formIndex].allControls[fieldIndex].width = width;
};
FILLIN.addTextBox = function (formIndex, id, value, title, isRequired, COMMONvalType, maxLength, width, newLine, placeHolder, password) {
    ///<summary>Adds a text box field to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="Strin">The text to be displayed in field's label</param>
    ///<param name="isRequired" type="Boolean">(Optional)  if true, the field will be required to have an entry in it during validation</param>
    ///<param name="COMMONvalType" type="String">(Optional) a value from COMMON.validationTypes in common.js. Determines a type of number validation</param>
    ///<param name="maxLength" type="Int">(Optional) if provided will check that the number of charaters =< this value</param>
    ///<param name="width" type="String">(Optional) Any valid css width value.  if provided will set the css width of this field</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    ///<param name="placeHolder" type="String">(Optional) Adds a visible text on fields when field is empty HTML5</param>
    ///<param name="password" type="Boolean">(Optional) set textbox type to password</param>
    "use strict";
    var fieldIndex;
    fieldIndex = FILLIN.zaddControl(formIndex, new FILLIN.ZOneControl((password === true ? "pas" : "txt"), formIndex, id, value, title, isRequired, COMMONvalType, maxLength, newLine));
    FILLIN.allForms[formIndex].allControls[fieldIndex].width = width;
    FILLIN.allForms[formIndex].allControls[fieldIndex].placeholder = placeHolder;
};
FILLIN.addTextArea = function (formIndex, id, value, title, isRequired, COMMONvalType, maxLength, width, height, newLine, placeHolder) {
    ///<summary>Adds a text area field to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="isRequired" type="Boolean">(Optional)  if true, the field will be required to have an entry in it during validation</param>
    ///<param name="COMMONvalType" type="String">(Optional) a value from COMMON.validationTypes in common.js. Determines a type of number validation</param>
    ///<param name="maxLength" type="Int">(Optional) if provided will check that the number of charaters is less or equal to this value</param>
    ///<param name="width" type="String">(Optional) Any valid css width value.  if provided will set the css width of this field</param>
    ///<param name="height" type="String">(Optional) and valid css height value.  If provided will set the css height of this field</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    ///<param name="placeHolder" type="String">(Optional) Adds a visible text on fields when field is empty HTML5</param>
    "use strict";
    var fieldIndex;
    fieldIndex = FILLIN.zaddControl(formIndex, new FILLIN.ZOneControl("txa", formIndex, id, value, title, isRequired, COMMONvalType, maxLength, newLine));
    FILLIN.allForms[formIndex].allControls[fieldIndex].width = width;
    FILLIN.allForms[formIndex].allControls[fieldIndex].height = height;
    FILLIN.allForms[formIndex].allControls[fieldIndex].placeholder = placeHolder;
};
FILLIN.addDDL = function (formIndex, id, value, title, isRequired, queryIdOrArray, params, width, newLine, fieldChangeScript) {
    ///<summary>Adds a drop downlist to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="isRequired" type="Boolean">(Optional)  if true, the field will be required to have an entry in it during validation</param>
    ///<param name="queryIdOrArray" type="String|Array">Either the queryId (from SQLConnect.cs SQLConnect.SQLS enum) or an array of objects where each object has the properties text and value. used to fill out options in the ddl (select tag)</param>
    ///<param name="params" type="Array:string">(Optional) ignored if queryIdOrArray is not a String. Parameters for the SQL statement specified in the queryid</param>
    ///<param name="width" type="String">(Optional) Any valid css width value.  if provided will set the css width of this field</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    ///<param name="fieldChangeScript" type="String">(Optional) script to run if the selection is changed</param>
    "use strict";
    var thisControl;
    thisControl = new FILLIN.ZOneControl("ddl", formIndex, id, value, title, isRequired, null, null, newLine);
    if (fieldChangeScript) {
        thisControl.fieldChangeScript = fieldChangeScript;
    }
    thisControl.width = width;
    if (typeof queryIdOrArray === "string") {
        thisControl.queryid = queryIdOrArray;
        thisControl.params = (params ? params.slice() : null);
    } else {
        thisControl.listItem = queryIdOrArray;
    }
    FILLIN.zaddControl(formIndex, thisControl);
};
FILLIN.addYesNoDDL = function (formIndex, id, value, title, width, newLine) {
    ///<summary>Adds a yes or no Drop down list to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="width" type="String">(Optional) Any valid css width value.  if provided will set the css width of this field</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    "use strict";
    var listItems;
    listItems = [];
    listItems.push({ text: "Yes", value: "1" });
    listItems.push({ text: "No", value: "0" });
    FILLIN.addDDL(formIndex, id, value, title, false, listItems, null, width, newLine);
};
FILLIN.addCheckBox = function (formIndex, id, value, title, newLine) {
    ///<summary>Adds a check box field to the form</summary>
    ///<param name="formIndex" type="In">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field (True, 1 or else will not be checked)</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    "use strict";
    FILLIN.zaddControl(formIndex, new FILLIN.ZOneControl("chk", formIndex, id, value, title, null, null, null, newLine));
};
FILLIN.addLink = function (formIndex, id, value, title, href, onclick, newLine, target) {
    ///<summary>Adds a link ("a" tag) field to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field (innerHTML)</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="href" type="String">(Optional) Ignored if onclick is provided. The href</param>
    ///<param name="onclick" type="String">(Optional) the script to run during the field's onclick event</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form. </param>
    ///<param name="target" type="String">(Optional) Ignored unless HREF is provided. The HREF Target</param>
    "use strict";
    var thisControl;
    thisControl = new FILLIN.ZOneControl("lnk", formIndex, id, value, title);
    thisControl.href = href;
    thisControl.linkOnClick = onclick;
    thisControl.newLine = newLine;
    thisControl.target = target;
    FILLIN.zaddControl(formIndex, thisControl);
};
FILLIN.addCalendar = function (formIndex, id, value, title, isRequired, newLine, onchangeScript, itemSelectedFunction, itemSelectedOptionalData) {
    ///<summary>Adds a calendar control to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="isRequired" type="Boolean">(Optional)  if true, the field will be required to have an entry in it during validation</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form.  </param>
    ///<param name="onchangeScript" type="String">(Optional) the script to run if the object is changed, this will be run if the user changes the value of the text box and if the user clicks on the calendar button (Not necessarily changes the value)</param>
    ///<param name="itemSelectedFunction" type="Function Variable">(Optional) A function that is run when the user selects a date from the calendar. format = function(valueSelected, itemSelectedOptionalData);</param>
    ///<param name="itemSelectedOptionalData" type="Object">(Optional) Ignored if itemSelectedFunction is not provided. Optional data to send to the itemSelected function</param>
    "use strict";
    var thisControl;
    thisControl = new FILLIN.ZOneControl("cal", formIndex, id, value, title, isRequired, null, null, newLine);
    thisControl.fieldChangeScript = onchangeScript;
    thisControl.calendarCloseFunction = itemSelectedFunction;
    thisControl.calendarOptionalData = itemSelectedOptionalData;
    FILLIN.zaddControl(formIndex, thisControl);
};
FILLIN.addGenericControl = function (formIndex, preconfiguredControl, title, newLine) {
    ///<summary>Adds a container for other elements provided in the preconfiguredControl parameter</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="preconfiguredControl" type="Element">An HTML container container preconfigured controls</param>
    ///<param name="title" type="String">The text to be displayed in field's label</param>
    ///<param name="newLine" type="Boolean">(Optional) if true, this field will start a new row on the form.  </param>
    "use strict";
    var thisControl;
    thisControl = new FILLIN.ZOneControl("gen", formIndex, null, null, title);
    thisControl.preconfiguredContainer = preconfiguredControl;
    thisControl.newLine = newLine;
    FILLIN.zaddControl(formIndex, thisControl);
};
FILLIN.addButton = function (formIndex, dialogResultOrData, id, value, placeLeft, doValidation, doConfirm) {
    ///<summary>Adds a button control to the form</summary>
    ///<param name="formIndex" type="Int">the index of the form in FILLIN.allForms</param>
    ///<param name="dialogResultOrData" type="Object">any value that will be provided to the continuing function when this button is clicked. This is in additional to any value provided in the forms optionalValue parameter</param>
    ///<param name="id" type="String">The element's id</param>
    ///<param name="value" type="String">The initial value of the field</param>
    ///<param name="placeLeft" type="Boolean">The button's cssFloat. if true, it will be floated left, otherwise, rigth</param>
    ///<param name="doValidation" type="Boolean">If true will do form validation and the optionalValidation function provided to the form.  If a false is returned by either validation, the form will not give control to the continuingfunction</param>
    ///<param name="doConfirm" type="Boolean">If true will check if any changes are pending and will prompt user, hint: leave false or omit on buttons that return true</param>
    "use strict";
    var thisButton;
    thisButton = new FILLIN.ZButtonDefinition(formIndex, id, value, dialogResultOrData, placeLeft, doValidation, doConfirm);
    thisButton.buttonIndex = FILLIN.allForms[formIndex].allButtons.length;
    thisButton.doValidation = doValidation;
    FILLIN.allForms[formIndex].allButtons.push(thisButton);
};
FILLIN.yesNoDialog = function (parentDivId, headLine, message, width, continuingFunction, optionalData) {
    ///<summary>Creates and displays a dialog type form with yes and no buttons where yes returns true as the dialogResult to the continuing function</summary>
    ///<param name="parentDivId" type="String">The id of the parent element where this dialog will be displayed</param>
    ///<param name="headLine" type="String">(Optional) The text in the Title Bar</param>
    ///<param name="message" type="String|Element">(Optional) message at the top of the form main area. if String adds a div with string as content. If object, appends as child</param>
    ///<param name="width" type="String">Any valid css width value</param>
    ///<param name="continuingfunction" type="function">(Optional) a function that will be used when a user clicks a button in the dialog. the function should be assigned to a variable and have the pattern: function (dialogResult, dataValuesFromDialog, optionalData) where dialogResult is the value assigned in the button Definition, dataValuesFromDialog is an object that contains the values from the controls. if there are no values (such as dataValuesFromDialog is empty) then optionalData will be the value in order to accomodate continuing functions with only 2 arguments when the Dialog is known not to have values, and optionalData is the value of optionalData from the Dialog object. dataValuesFromForm pattern:  {IdOfField1: {id: idOfField1, value: valuefromfield1},IdOfField2: {id: idOfField2, value: valueFromField2},...}</param>
    ///<param name="optionalData" type="object">(Optional) Ignored if continuingfunction is not specified. Any data of any type the will be passed to the continuing function</param>
    "use strict";
    var formIndex;
    formIndex = FILLIN.createDialog(parentDivId, headLine, message, continuingFunction, optionalData, width);
    FILLIN.addButton(formIndex, true, "btnDialogYes" + formIndex, "Yes", true);
    FILLIN.addButton(formIndex, false, "btnDialogNo" + formIndex, "No");
    FILLIN.displayForm(formIndex);
};
FILLIN.okDialog = function (parentDivId, headLine, message, width, buttonText) {
    ///<summary>Creates and displays a dialog type form with a single OK button</summary>
    ///<param name="parentDivId" type="String">The id of the parent element where this dialog will be displayed</param>
    ///<param name="headLine" type="String">(Optional) The text in the Title Bar</param>
    ///<param name="message" type="String|Element">(Optional) message at the top of the form main area. if String adds a div with string as content. If object, appends as child</param>
    ///<param name="width" type="String">Any valid css width value</param>
    ///<param name="buttonText" type="String">(Optional) the value of the button.  If omitted, the button will have a value of "OK"</param>
    "use strict";
    var formIndex;
    formIndex = FILLIN.createDialog(parentDivId, headLine, message, null, null, width);
    FILLIN.addButton(formIndex, true, "btnDialogOK" + formIndex, (buttonText || "OK"));
    FILLIN.displayForm(formIndex);
};
FILLIN.createForm = function (parentDivId, headline, message, continuingfunction, optionalData, width, optionalValidationFunction) {
    ///<summary>Creates a Form object (not dialog)</summary>
    ///<param name="parentDivId " type="String">The id of the parent element where this form will be displayed</param>
    ///<param name="headline" type="String">(Optional) The text in the Title Bar</param>
    ///<param name="message" type="String|Element">(Optional) message at the top of the form main area. if String adds a div with string as content. If object, appends as child</param>
    ///<param name="continuingfunction" type="function">(Optional) a function that will be used when a user clicks a button in the form. the function should be assigned to a variable and have the pattern: function (buttonData, dataValuesFromForm, optionalData) where buttonData is the value assigned in the button Definition, dataValuesFromForm is an object that contains the values from the controls. if there are no values (such as dataValuesFromForm is empty) then optionalData will be the value in order to accomodate continuing functions with only 2 arguments when the Form is known not to have values, and optionalData is the value of optionalData from the Form object. dataValuesFromForm pattern:  {fieldIndexOfField1: {id: idOfField1, value: valuefromfield1},fieldIndexOfField2: {id: idOfField2, value: valueFromField2},...}</param>
    ///<param name="optionalData" type="object">(Optional) Ignored if continuingfunction is not specified. Any data of any type the will be passed to the continuing function</param>
    ///<param name="width" type="String">Any valid css width value</param>
    ///<param name="optionalValidationFunction" type="function">(Optional) after user clicks a button (if the doValidation property for that button is true) this function will be run. function pattern: function (dataValuesFromForm, formIndex){Returns Boolean} where dataValuesFromForm is the value of the form fields. formIndex is the index of the form the function returns true if the data is valid control will not be sent to the continuing funtion. send messages to the dialog's error div by using FILLIN.errorMessage function. dataValuesFromForm pattern:  {IdOfField1: {id: idOfField1, value: valuefromfield1},IdOfField2: {id: idOfField2, value: valueFromField2},...}</param>
    "use strict";
    var formIndex;
    formIndex = FILLIN.createDialog(parentDivId, headline, message, continuingfunction, optionalData, width, optionalValidationFunction);
    FILLIN.allForms[formIndex].isForm = true;
    return formIndex;
};