/// <reference path="menu.js" />
/// <reference path="common.js" />
/*jslint browser: true, plusplus: true*/
/*global AJAXPOST, FILLIN, COMMON*/
//ver 2.0 10/31/2014
var DISPLAYGRID = {};
///<var>the array that holds all the grid objects of a single page</var>
DISPLAYGRID.allGrids = [];
///<var>the class of the td tags in the grid -- align left</var>
DISPLAYGRID.dataCellClass = "datacell";
///<var>the class of td tags that are designated as numbers -- align right</var>
DISPLAYGRID.dataCellNumberClass = "datacellnumber";
///<var>the class of td tags that have a user editable field -- align center</var>
DISPLAYGRID.dataCellWithControlClass = "datacellcontrol";
DISPLAYGRID.summaryTypes = {
    sum: { name: "Total" },
    avg: { name: "Average" },
    min: { name: "Minimum" },
    max: { name: "Maximum" }
};//summary type enum
//******************************NOT FOR EXTERNAL USE****************************************************//
DISPLAYGRID.DisplayGrid = function (gridIndexIn) {
    ///<summary>NOT FOR EXTERNAL USE...Main object, contains all the logic to create the grid, should not be called directly, use DISPLAYGRID.addGrid function to add a new grid</summary>
    ///<param name="gridIndex" type="int">assigned when creating, the index of the grid in DISPLAYGRID.allGrids array</param>
    "use strict";
    var that, pagination, allColDefinitions, allButtonDefinitions, dataResults, columnNames, searchObj, filterObj, gridIndex, currentPage, currentSortIndex, lastSortIndex, filterString, filterFunctionRecur, gridTableId, titleRowId, titleCellId, headerTRId, sortButtonId, filterTRId, filterDDLId, pageNavDivId, pageNavCntrlId, baseClassName, titleCellClassName, titleHeadlineClassName, titleSubHeadlineClassName, gridTableClass, headerTRClass, headerBtnClass, filterTRClass, filterClass, dataRowClass, buttonColumnClass, summaryTRClass, pageNavDivClass, refreshSearchObj, cloneDataResults, getFilterDDL, setSortIndicator, getFilterString, displayRow, dataOutRow, titleBar, headerRow, filterRow, dataRow, summaryRow, pageNavigationBtns, addGridBody, paginate, currentRowColorClass, alternatingRowColorClass1, alternatingRowColorClass2, printTableClass, getButtonColumnTD, runQuery, setDataObject;
    //*********************Private Variables********************************//
    //********Arrays************************************//
    pagination = null; //holds the collection of Onepage objects where each element describes the data that should be in each page. Object pattern: {totalPages: Int, pageNumber0 : {start : Int, end : Int}, pageNumber1...}, total pages shows the number of pages, pageNumber is the page with the start and end row indexes of dataResults
    allColDefinitions = null; //holds the column definition objects
    allButtonDefinitions = null; //holds button definitions
    columnNames = null; //holds the data result column names from the primary query that is used to fill the grid
    dataResults = null; //holds the data results from the primary query that is used to fill the grid
    searchObj = null; //contains the primary key as a key to search for the row a key is in, object pattern: {primarykey0:{index: Int, hasChanged : Boolean}, primaryKey1...} where primary key is the row key, index is the row index of dataResults and hasChange is true if the user has changed that row
    filterObj = null; //stores an array of the data in columns that are filter where each element is the data from each row

    //***********************Private Initializations****//
    that = this;
    gridIndex = gridIndexIn; //the index of the grid in DISPLAYGRID.allGrids array
    currentPage = 1; //holds the current page
    currentSortIndex = -1; //keeps track of the current sort index
    lastSortIndex = -1; //keeps track of the last index sorted
    filterString = ""; //Holds the string that is used to compare with data in the grid when a filter ddl is used
    filterFunctionRecur = false; //this will be true if there is an error in user editable fields. used to prevent recursing the filterChange function
    currentRowColorClass = ""; //used by private function when alternate color rows is true

    //*********ControlId Defaults**********************//
    gridTableId = "ttbGrid"; //the id of the table holding the grid
    titleRowId = "ttrTitle"; //the id of the title cell row
    titleCellId = "ttdTitle"; //the id of the div placed at the top of the grid
    headerTRId = "ttrHead"; //the id of the tr tag for the header row
    sortButtonId = "btnHead"; //the default id prefix of the sort buttons
    filterTRId = "ttrFilt"; //the id of the tr tag for the filter row
    filterDDLId = "ddlFilt"; //the prefix of the control id for filter ddl
    pageNavDivId = "divPage"; //the id of the div the envelopes the page navigation controls
    pageNavCntrlId = "Page"; //the id prefix of the page navigation controls

    //***********Constant Class Names*****************//
    baseClassName = "dvSetupDisplayGrid"; //class of the div envelope that holds the grid
    titleCellClassName = "tdTitleBar"; //class of the div at the top of the grid
    titleHeadlineClassName = "dvTitleHeadline"; //class of the headline div (has help link)
    titleSubHeadlineClassName = "dvTitleSubHeadline"; // class of the sub headline
    gridTableClass = "tbGrid"; //the class of the grid table
    headerTRClass = "trHeader"; //the clss of the tr tag for the header row
    headerBtnClass = "dispGridHeaders"; //the class of the header sort buttons
    filterTRClass = "trFilter"; //the class of the tr tag for the filter row
    filterClass = "dispGridFilters"; //the class of the Drop Down List in the filter row
    dataRowClass = "datarow"; //the class of data rows
    buttonColumnClass = "buttonColumn"; //class for the button column for row buttons
    summaryTRClass = "trSummary"; //the class of the tr tag for the summary row (if requested)
    pageNavDivClass = "dvNavDiv"; //the class of the div that holds the page navigatingcontrols
    alternatingRowColorClass1 = "trRow1"; //used when alternateColor is true, the CSS class for row one
    alternatingRowColorClass2 = "trRow2";//used when alternateColor is true, the CSS class for row two
    printTableClass = "tbPrint";//class of the table in the print window

    //*******************public properties**********************************//
    //initialization
    ///<var>the div where the grid will be displayed (named in initialization)</var>
    this.displayDivId = "";
    ///<var>the name of the container that envelopes the grid (named in initialization)</var>
    this.baseDivId = "";
    ///<var>holds the query id used to fill the grid</var>
    this.queryId = null;
    ///<var>holds the parameter array for the query used to fill the grid</var>
    this.params = null;
    ///<var>Number of rows to display in a single grid (name in initialization)</var>
    this.rowsPerPage = 20;
    //optional Initialization items
    ///<var>the initial sorted column index (named in initialization)</var>
    this.defaultFirstSortIndex = 1;
    ///<var>Holds the condition of the sorting, whether it was forward of reverse (true)</var>
    this.reverseSort = false;
    ///<var>if false, in place of a grid, when there is no results from the grid's query, the message "No results found" will be displayed</var>
    this.supressAlert = false;
    ///<var>message to display if there are no results in the query. Ignored if suppressAlert == true</var>
    this.noResultsMessage = "No items to display";
    ///<var>function object to run if there are no results</var>
    this.noResultsAction = null;
    ///<var>the title of the grid, serves as headline</var>
    this.title = "";
    ///<var>the subtitle of the grid</var>
    this.subHead = "";
    ///<var>the width of the grid table as a valid css width value</var>
    this.gridWidth = null;
    ///<var>set to true if any fields have changed</var>
    this.pendingChanges = false;
    ///<var>set to true to alternate colors;</var>
    this.alternateColor = false;
    ///<var>the width of the button column if present</var>
    this.buttonColumnWidth = null;
    ///<var>overrides the position in the css with this value.  Used to allign the grid with another object</var>
    this.leftPosition = null;
    //*****************Public ReadOnlyProperties******************************//
    this.getColumnName = function (colIndex) {
        ///<summary>Gets the column Name of an Index</summary>
        ///<returns type="String">The name of the column</returns>
        return columnNames[colIndex];
    };
    this.getColumnLength = function () {
        ///<summary>Gets the number of columns
        ///<returns type="Int">The number of columns</returns>
        return columnNames.length;
    };
    this.getFieldData = function (colIndex, rowIndex) {
        ///<summary>Gets the data of a specific item</summary>
        ///<returns type="String">data</returns>
        return dataResults[rowIndex][colIndex];
    };
    this.getDataByKey = function (rowkey, colIndex) {
        var rowIndex;
        rowIndex = that.getKeyRow(rowkey);
        if (rowIndex === -1) { return ""; }
        return that.getFieldData(colIndex, rowIndex);
    };
    this.getRowCount = function () {
        ///<summary>Gets the number of rows</summary>
        ///<returns type="Int">number of rows</returns>
        return (dataResults ? dataResults.length : 0);
    };
    this.getKeyRow = function (keyToSearch) {
        ///<summary>gets the row where a primaryKey is</summary>
        ///<returns type="Int"></returns>
        var intOut;
        intOut = searchObj[keyToSearch].index;
        return (intOut === undefined ? -1 : intOut);
    };
    this.getRowData = function (rowkey) {
        ///<summary>gets the data for the whole row indicated by the key</summary>
        ///<param name="rowkey" type="String">The key of the row</param>
        ///<returns type="String Array">An Array containing the ordered row data</returns>
        var rowIndex;
        rowIndex = that.getKeyRow(rowkey);
        return dataResults[rowIndex];
    };
    //***************************Private Methods****************************************//
    getButtonColumnTD = function () {
        var td;
        td = COMMON.getBasicElement("ttd", null, "&nbsp;");
        if (that.buttonColumnWidth !== undefined && that.buttonColumnWidth !== null) { td.style.width = that.buttonColumnWidth; }
        return td;
    };
    refreshSearchObj = function () {
        var i;
        if (searchObj === null) {
            searchObj = {};
        }
        for (i = 0; i < dataResults.length; i++) {
            if (!searchObj.hasOwnProperty(dataResults[i][0])) {
                searchObj[dataResults[i][0]] = {
                    index: i,
                    hasChanged: false
                };
            }
            searchObj[dataResults[i][0]].index = i;
        }
    };
    //copys the data results from the query to a local data so it is a real clone and not a reference object
    cloneDataResults = function () {
        var i;
        if (!AJAXPOST.dataResults) { return; }
        dataResults = COMMON.cloneDataArray();
        columnNames = [];
        for (i = 0; i < AJAXPOST.columnNames.length; i++) {
            columnNames.push(AJAXPOST.columnNames[i].slice());
        }
        AJAXPOST.dataResults = null;
        AJAXPOST.columnNames = null;
        refreshSearchObj();
    };
    //used to build the drop down lists used to filter items in the grid
    //Parameters:
    //  index       (int)               The column Index
    //Returns       (element:select)    Drop down list
    getFilterDDL = function (index) {
        var DDLOut, currentValue, allValues, i, li, thisValue, displayValue, liObj;
        allValues = [];
        //gather all values
        for (i = 0; i < dataResults.length; i++) {
            thisValue = dataResults[i][index].trim();
            allValues.push((thisValue === "" || !COMMON.isNumber(thisValue, null, null, true)) ? thisValue : parseFloat(thisValue));
        }
        //sort them for grouping
        COMMON.sortArray(allValues, null, false);
        currentValue = "";
        li = "<option value=\"All\">All</option>";
        liObj = [{ "text": "All", "value": "All" }];
        //get only unique (group) values
        for (i = 0; i < allValues.length; i++) {
            if (currentValue !== allValues[i] || i === 0) {
                currentValue = allValues[i];
                displayValue = COMMON.stripHTML(currentValue);
                li += "<option value=\"" + currentValue + "\">" + (displayValue === "" ? "[Blank]" : displayValue) + "</option>";
                liObj.push({ "text": (displayValue === "" ? "[Blank]" : displayValue), "value": currentValue });
            }
        }
        //fill the drop down list
        DDLOut = COMMON.getDDL(filterDDLId + String(index), null, false, String(index), (COMMON.ieVer >= 10 ? null : liObj), filterClass);
        if (COMMON.ieVer >= 10) { DDLOut.innerHTML = li; }
        DDLOut.setAttribute("onchange", "DISPLAYGRID.zfilterChange(" + gridIndex + ");");
        return DDLOut;
    };
    //determine whether to display the up or down arrow
    setSortIndicator = function () {
        var i, thisBtn, buttonVal;
        for (i = 1; i < columnNames.length; i++) {
            buttonVal = columnNames[i].replace("@", "\n");
            if (allColDefinitions[i].isVisible) {
                thisBtn = document.getElementById(sortButtonId + String(i));
                if (i === currentSortIndex) {
                    thisBtn.setAttribute("value", buttonVal + "\u0020" + (that.reverseSort ? "\u2191" : "\u2193"));
                } else {
                    thisBtn.setAttribute("value", buttonVal + "\u0020\u0020");
                }
            }
        }
    };
    //based on the settings of the filter ddl's construct the filter string
    getFilterString = function () {
        var ddl, i;
        filterString = "";
        filterObj = {};
        for (i = 1; i < columnNames.length; i++) {
            if (allColDefinitions[i].isVisible) {
                ddl = document.getElementById(filterDDLId + String(i));
                if (ddl.selectedIndex > 0) {
                    filterString += ddl.options[ddl.selectedIndex].text;
                    filterObj[i] = true;
                }
            }
        }
    };
    //checks if a row matches filter criteria (even if all is selected)
    //Parameters:
    //  rowArray    (Array:String)  the row array of data to examine
    //Returns       (Boolean)       true if the row should be displayed
    displayRow = function (rowArray) {
        //filter string is a concatenation of all filter selections
        //only columns which have a filter selected will be concatenated and checked with the concatenation of the filter selections
        var checkString, i, lFilterString;
        //no filters selected return true
        if (filterString === "") { return true; }
        checkString = "";
        for (i = 1; i < rowArray.length; i++) {
            rowArray[i] = rowArray[i].trim();
            if (filterObj.hasOwnProperty(i)) { checkString += (rowArray[i] === "" ? "!@#$%^" : rowArray[i]); }
        }
        //match the filter selections with the concatenation of the data
        lFilterString = filterString.replace("[Blank]", "!@#$%^");
        return lFilterString === checkString;
    };
    //returns a single row object to be sent to another script or to c# code
    //Parameters:
    //  primaryKey      (String)                The primary key value
    //  forCSharp       (Boolean)               If true will format for c# code
    //Returns           (Array|object literal)  if forCSharp is true will return an array of objects
    dataOutRow = function (primaryKey, forCSharp) {
        var rowIndex, dataOut, thisRow, i, oneItem;
        rowIndex = searchObj[primaryKey].index;
        thisRow = dataResults[rowIndex];
        if (forCSharp) {
            dataOut = [];
            for (i = 0; i < thisRow.length; i++) {
                oneItem = {
                    columnName: columnNames[i],
                    value: thisRow[i],
                    colIndex: i
                };
                dataOut.push(oneItem);
            }
        } else {
            dataOut = {};
            for (i = 0; i < thisRow.length; i++) {
                dataOut[i] = thisRow[i];
            }
        }
        return dataOut;
    };
    //****Grid Parts*****************************************************//

    //constructs the title bar
    //Returns       (element:div)
    titleBar = function () {
        var tr, td, obj1, obj2, totalColumns;
        totalColumns = columnNames.length;
        if (allButtonDefinitions.length > 0) { totalColumns++; }
        //create row
        tr = COMMON.getBasicElement("ttr", titleRowId);
        //create cell
        td = COMMON.getBasicElement("ttd", titleCellId, null, titleCellClassName);
        td.setAttribute("colspan", String(totalColumns));
        //create headline div
        obj1 = COMMON.getBasicElement("div", null, null, titleHeadlineClassName);
        //add headline if present
        if (that.title !== undefined && that.title !== null) {
            obj2 = COMMON.getBasicElement("div", null, that.title);
            obj2.style.cssFloat = "left";
            obj1.appendChild(obj2);
        }
        //create help link
        obj2 = COMMON.getLink(null, "How To Use This Grid", null, "DISPLAYGRID.zshowHelp();");
        obj2.style.cssFloat = "right";
        obj1.appendChild(obj2);
        //create css float killer
        obj2 = document.createElement("div");
        obj2.style.clear = "both";
        obj1.appendChild(obj2);
        //add headline div to cell
        td.appendChild(obj1);
        //create subHeadline if present
        if (that.subHead !== undefined && that.subHead !== null && that.subHead !== "") {
            obj1 = COMMON.getBasicElement("div", null, that.subHead, titleSubHeadlineClassName);
            td.appendChild(obj1);
        }
        //add cell to row
        tr.appendChild(td);
        return tr;
    };
    //contructing the header buttons that will change sorting
    //Returns       (element:tr)
    headerRow = function () {
        var tr, td, btn, i, buttonVal;
        //sortChar = "";
        //if (sorted) { sortChar = "&nbsp;" + (reverse ? "&#8657;" : "&#8659"); }
        tr = COMMON.getBasicElement("ttr", headerTRId, null, headerTRClass);
        td = COMMON.getBasicElement("ttd", null, "Sort By:");
        td.style.width = "38px";
        td.style.textAlig = "right";
        tr.appendChild(td);
        for (i = 1; i < columnNames.length; i++) {
            buttonVal = (allColDefinitions[i].controlRequired ? "*" : "") + columnNames[i].replace("@", "tt");
            if (allColDefinitions[i].isVisible) {
                td = document.createElement("td");
                btn = COMMON.getButton(sortButtonId + String(i), buttonVal, "DISPLAYGRID.zsortChange(" + String(i) + ", " + String(gridIndex) + ");", String(i), headerBtnClass);
                td.appendChild(btn);
                tr.appendChild(td);
            }
        }
        if (allButtonDefinitions.length > 0) {
            td = getButtonColumnTD();
            tr.appendChild(td);
        }
        return tr;
    };
    //the logic to construct the row containing filter DDL's
    //Returns       (element:tr)
    filterRow = function () {
        var tr, td, ddl, i;
        tr = COMMON.getBasicElement("ttr", filterTRId, null, filterTRClass);
        td = COMMON.getBasicElement("ttd", null, "Filter:");
        td.style.textAlig = "right";
        tr.appendChild(td);
        for (i = 1; i < columnNames.length; i++) {
            if (allColDefinitions[i].isVisible) {
                td = document.createElement("td");
                ddl = getFilterDDL(i);
                td.appendChild(ddl);
                tr.appendChild(td);
            }
        }
        if (allButtonDefinitions.length > 0) {
            td = getButtonColumnTD();
            tr.appendChild(td);
        }
        return tr;
    };
    //construct data rows
    //Returns       (element:tr)
    dataRow = function (rowIndex, isFirstRow) {
        var tr, td, printLink, thisColDef, thisRow, i, thisBtn, styleDef, obj;
        if (currentRowColorClass === "" || currentRowColorClass === alternatingRowColorClass2) {
            currentRowColorClass = alternatingRowColorClass1;
        } else {
            currentRowColorClass = alternatingRowColorClass2;
        }
        if (!that.alternateColor) { currentRowColorClass = dataRowClass; }
        tr = COMMON.getBasicElement("ttr", null, null, currentRowColorClass);
        td = document.createElement("td");
        if (isFirstRow && that.getRowCount() > that.rowsPerPage) {
            //Print Link
            printLink = COMMON.getLink(null, "Print", null, "DISPLAYGRID.zassemblePrint(" + String(gridIndex) + "); return false;");
            td.appendChild(printLink);
        } else {
            td.innerHTML = "&nbsp;";
        }
        td.className = DISPLAYGRID.dataCellClass;
        tr.appendChild(td);
        thisRow = dataResults[rowIndex];
        for (i = 1; i < thisRow.length; i++) {
            thisColDef = allColDefinitions[i];
            if (thisColDef.isVisible) {
                td = COMMON.getBasicElement("ttd", null, null, (thisColDef.getCellClass(thisRow)));
                td.style.backgroundColor = thisColDef.getColor(thisRow);
                styleDef = thisColDef.getStyle(thisRow);
                obj = thisColDef.getObj(thisRow);
                if (styleDef !== "") { COMMON.addAttribute(obj, "style", styleDef, true); }
                td.appendChild(obj);
                tr.appendChild(td);
            }
        }
        if (allButtonDefinitions && allButtonDefinitions.length > 0) {
            td = getButtonColumnTD();
            td.innerHTML = "";
            td.className = buttonColumnClass;
            for (i = 0; i < allButtonDefinitions.length; i++) {
                thisBtn = allButtonDefinitions[i].getObject(thisRow);
                if (thisBtn) {
                    td.appendChild(thisBtn);
                }
            }
            tr.appendChild(td);
        }
        return tr;
    };
    //Gets the summary row if any
    //Returns       (element:tr)
    summaryRow = function () {
        var tr, hasSummary, i, td;
        hasSummary = false;
        //reset all summaries and determin if any columns have a summary definition
        for (i = 1; i < allColDefinitions.length; i++) {
            //allColDefinitions[i].initSummary();
            if (allColDefinitions[i].summaryType) { hasSummary = true; break; }
        }
        if (!hasSummary) { return null; } //no column has a summary so exit

        //do display
        tr = COMMON.getBasicElement("ttr", null, null, summaryTRClass);
        for (i = 0; i < allColDefinitions.length; i++) {
            tr.appendChild(allColDefinitions[i].getSummary());
        }
        if (allButtonDefinitions && allButtonDefinitions.length > 0) {
            td = getButtonColumnTD();
            tr.appendChild(td);
        }
        return tr;
    };
    //construct the page navigation buttons, do not go into this function unless there is more than one page
    pageNavigationBtns = function () {
        var baseDiv, navDiv, obj, tab;
        if (pagination === null) { return; }
        baseDiv = document.getElementById(that.baseDivId);
        navDiv = document.getElementById(pageNavDivId);
        if (!navDiv) {
            navDiv = COMMON.getBasicElement("div", pageNavDivId, null, pageNavDivClass);
            baseDiv.appendChild(navDiv);
        }
        //Places the page navigation buttons in place directly under table
        tab = document.getElementById(gridTableId);
        navDiv.style.position = "relative";
        navDiv.style.left = String(tab.offsetLeft) + "px";
        navDiv.style.width = String(tab.offsetWidth) + "px";
        while (navDiv.firstChild) {
            navDiv.removeChild(navDiv.firstChild);
        }
        obj = COMMON.getBasicElement("div", null, "Page " + String(currentPage) + " of " + String(pagination.totalPages) + "&nbsp;");
        navDiv.appendChild(obj);
        obj = COMMON.getButton(pageNavCntrlId + "0", "Previous Page", "DISPLAYGRID.zpageChange(0, " + String(gridIndex) + ");");
        obj.disabled = (currentPage === 1);
        navDiv.appendChild(obj);
        obj = COMMON.getButton(pageNavCntrlId + "1", "Next Page", "DISPLAYGRID.zpageChange(1, " + String(gridIndex) + ");");
        obj.disabled = (currentPage >= pagination.totalPages);
        navDiv.appendChild(obj);
        obj = COMMON.getBasicElement("div", null, "Jump to:");
        navDiv.appendChild(obj);
        obj = COMMON.getFieldObject("txt", pageNavCntrlId, "", false, "integer");
        obj.setAttribute("onkeyup", "return DISPLAYGRID.zjmpTxt(event, " + String(gridIndex) + ");");
        navDiv.appendChild(obj);
        obj = COMMON.getButton(pageNavCntrlId + "2", "Jump", "DISPLAYGRID.zpageChange(2, " + String(gridIndex) + ");");
        navDiv.appendChild(obj);
        baseDiv.appendChild(navDiv);
    };
    //assembles all the parts of the grid after headers and filters
    addGridBody = function () {
        //assembles all the parts of the grid
        var tab, tabChildren, i, lcurrentPage, tr, navDiv, isFirstRow;
        tab = document.getElementById(gridTableId);
        //clear table children except for filter and header rows
        while (tab.childNodes.length > 3) {
            tabChildren = tab.childNodes;
            for (i = 0; i < tabChildren.length; i++) {
                if (tabChildren[i].id !== filterTRId && tabChildren[i].id !== headerTRId && tabChildren[i].id !== titleRowId) {
                    tab.removeChild(tabChildren[i]);
                }
            }
        }
        if (currentPage < 1) { currentPage = 1; }
        if (currentPage > pagination.totalPages) { currentPage = pagination.totalPages; }
        lcurrentPage = pagination[currentPage];
        isFirstRow = true;
        for (i = lcurrentPage.start; i <= lcurrentPage.end; i++) {
            if (displayRow(dataResults[i])) {
                tab.appendChild(dataRow(i, isFirstRow));
                isFirstRow = false;
            }
        }
        tr = summaryRow();
        if (tr) { tab.appendChild(tr); }
        navDiv = document.getElementById(pageNavDivId);
        if (navDiv) {
            document.getElementById(that.baseDivId).removeChild(navDiv);
        }
        if (pagination.totalPages > 1) {
            pageNavigationBtns();
        }
    };
    //breaks up data rows into pages based on RowsPerPage property, gathers filter selections, does summary
    paginate = function () {
        var i, rppCount, oneRowData, n, thisValue;
        pagination = { totalPages: 1 };
        //gather filter selections
        getFilterString();
        rppCount = 0;
        pagination[1] = { start: 0, end: 0 };
        for (n = 1; n < allColDefinitions.length; n++) {
            allColDefinitions[n].initSummary();
        }
        for (i = 0; i < dataResults.length; i++) {
            oneRowData = dataResults[i];
            if (displayRow(oneRowData)) {
                //here if the row matches the filter criteria and the row will be visible to user
                for (n = 1; n < oneRowData.length; n++) {
                    //starting at 1 and not 0 because col 0 is never displayed
                    if (!isNaN(oneRowData[n])) {
                        thisValue = parseFloat(oneRowData[n]);
                        if (String(oneRowData[n]).split(".").length > 1 && i === 0) {
                            allColDefinitions[n].summaryPrecision = String(oneRowData[n]).split(".")[1].length;
                        }
                        allColDefinitions[n].summarySum += thisValue;
                        allColDefinitions[n].summaryRowCount++;
                        if (thisValue > allColDefinitions[n].summaryMax) { allColDefinitions[n].summaryMax = thisValue; }
                        if (thisValue < allColDefinitions[n].summaryMin) { allColDefinitions[n].summaryMin = thisValue; }
                    }
                }
                rppCount++;
                if (rppCount > that.rowsPerPage) {
                    pagination[pagination.totalPages].end = i - 1;
                    pagination.totalPages++;
                    pagination[pagination.totalPages] = { start: i, end: 0 };
                    rppCount = 1;
                }
            }
        }
        pagination[pagination.totalPages].end = dataResults.length - 1;
    };
    runQuery = function () {
        dataResults = null;
        columnNames = null;
        if (that.queryId === undefined || that.queryId === null || that.queryId === -1) { return; }
        AJAXPOST.callQuery(that.queryId, that.params);

        if (!AJAXPOST.dataResults || AJAXPOST.dataResults.length === 0) { return; }
        //copy results data to local variable
        cloneDataResults(that.gridIndex);
    };
    setDataObject = function (dataObj) {
        //assumes dataobj is an array of literal object and that each element has the same property names throughout
        var i, n, oneProp, thisRow;
        if (!dataObj || dataObj.length === 0) { return; }
        dataResults = [];
        columnNames = [];
        for (oneProp in dataObj[0]) {
            if (dataObj[0].hasOwnProperty(oneProp)) {
                columnNames.push(oneProp);
            }
        }
        for (i = 0; i < dataObj.length; i++) {
            thisRow = [];
            for (n = 0; n < columnNames.length; n++) {
                if (dataObj[i].hasOwnProperty(columnNames[n])) {
                    thisRow.push(dataObj[i][columnNames[n]]);
                } else {
                    thisRow.push("");
                }
            }
            dataResults.push(thisRow);
        }
    };
    //***************************************** Public Control Change Actions**********************************************************//

    //this is the action of any of the header sort buttons
    //Parameters:
    //  obj     (input:Element)     The button that was clicked
    this.sortChange = function (colIndex) {
        var alternateSortIndex;
        if (!that.validateGrid) { return; }//do nothing if user editable fields have an error
        currentSortIndex = colIndex;
        if (currentSortIndex === lastSortIndex) {
            that.reverseSort = !that.reverseSort;
        } else {
            that.reverseSort = false;
        }
        lastSortIndex = currentSortIndex;
        alternateSortIndex = allColDefinitions[currentSortIndex].alternateSortColumn;
        COMMON.sortArray(dataResults, alternateSortIndex, that.reverseSort);
        refreshSearchObj();
        paginate();
        setSortIndicator();
        addGridBody();
    };
    //filter ddl change event
    this.filterChange = function () {
        var i;
        if (filterFunctionRecur) { return; }//this will prevent recursing this function when programatically changing the values of the DDL's
        if (!that.validateGrid()) {
            filterFunctionRecur = true;
            for (i = 0; i < columnNames.length; i++) {
                document.getElementById(filterDDLId + String(i)).selectedIndex = 0;
            }
            filterFunctionRecur = false;
            return;
        }//do nothing if fields are invalid
        currentPage = 1;//set to page 1
        paginate(); //redo pagination
        addGridBody(); //render the grid
    };
    //when a page navigation control is used by the user
    //Parameters:
    // controlId    (int)       0 = prev, 1 = next, 2 = jump to page
    this.pageChange = function (controlId) {
        //input id's: btnPageNav0 = prev, btnPageNav1 = next, btnPageNav3 = jump to page, txtPageNav = jump to page textBox
        var jumpToPage;
        jumpToPage = document.getElementById("txt" + pageNavCntrlId);
        if (!that.validateGrid()) {
            jumpToPage.value = "";
            return;
        }//if the form is invalid do nothing
        COMMON.errMess("");//clear any error messages
        switch (controlId) {
            case 0:
                currentPage--;
                break;
            case 1:
                currentPage++;
                break;
            case 2:
                if (jumpToPage.value === "" || isNaN(jumpToPage.value)) {
                    COMMON.errMess("Please Enter a number for the page you want to jump to");
                    jumpToPage.value = "";
                    COMMON.focusme(jumpToPage.id);
                    return;
                }
                currentPage = jumpToPage.value;
                break;
        }
        addGridBody();
    };
    //**************************Public Methods******************************************//
    //Resets and initializes items
    this.initialize = function () {
        lastSortIndex = that.defaultFirstSortIndex;
        currentSortIndex = that.defaultFirstSortIndex;
        currentPage = 1;
        filterString = "";
        allColDefinitions = [];
        allButtonDefinitions = [];
        pagination = null;
        dataResults = null;
        columnNames = null;
        searchObj = null;
        //init id's
        gridTableId += String(gridIndex);
        titleRowId += String(gridIndex);
        titleCellId += String(gridIndex);
        headerTRId += String(gridIndex);
        sortButtonId += String(gridIndex);
        filterTRId += String(gridIndex);
        filterDDLId += String(gridIndex);
        pageNavDivId += String(gridIndex);
        pageNavCntrlId += String(gridIndex);

    };
    //used by various features to get the columndefinition reference
    //Parameters:
    //  colIndex        (Int)  The index of the column
    //Returns       (object:OneColumnDefinition)
    this.initializeColumnDefinitions = function (colIndex) {
        var colDef;
        if (!allColDefinitions) { allColDefinitions = []; }
        colDef = allColDefinitions[colIndex];
        if (colDef === undefined) {
            allColDefinitions[colIndex] = new DISPLAYGRID.ZOneColumnDefinition(colIndex, gridIndex);
        }
        return allColDefinitions[colIndex];
    };
    //used by addRowwButton to get button definition
    //Parameters:
    //  thisButtonDefinition    (OneButtonDefinition)   The OneButtonDefinition object to add
    this.addRowButton = function (thisButtonDefinition) {
        if (!allButtonDefinitions) { allButtonDefinitions = []; }
        allButtonDefinitions.push(thisButtonDefinition);
    };
    //*******************Execute****************************************//
    //this will display the assembled grid
    this.display = function (dataObj) {
        var div, i, thisCol, tab, alternateSortIndex;
        //construct the base of the grid in the document object
        div = document.getElementById(that.baseDivId);
        if (div === null || !div) {
            div = COMMON.getBasicElement("div", that.baseDivId, null, baseClassName);
            if (that.leftPosition !== undefined && that.leftPosition !== null) {
                COMMON.addAttribute(div, "style", "margin-left:0; margin-right:0; position:relative; left:" + that.leftPosition + ";", true);
            }
            if (that.gridWidth !== undefined && that.gridWidth !== null && that.gridWidth !== "") {
                div.style.width = that.gridWidth;
            }
            document.getElementById(that.displayDivId).appendChild(div);
        } else {
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }

        //display Loading Message
        tab = document.createElement("h2");
        tab.innerHTML = "Loading... Please Wait.";
        div.appendChild(tab);

        //query database
        runQuery();
        //if a dataObj is provided then set dataResults and columnNames
        if (dataObj !== undefined && dataObj !== null) {
            setDataObject(dataObj);
        }


        div.removeChild(tab);//removes the "Waiting"

        //do no result actions
        if (!dataResults || dataResults.length === 0) {
            if (typeof that.noResultsAction === "function") {
                that.noResultsAction();
                return;
            }
            if (!that.supressAlert) {
                //clear slate
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
                tab = document.createElement("h2");
                tab.innerHTML = that.noResultsMessage;
                div.appendChild(tab);
            }
            return;
        }

        //fill out all definitions because every column needs a definition
        for (i = 0; i < columnNames.length; i++) {
            thisCol = that.initializeColumnDefinitions(i);
        }
        //if column 0 has a color definition assume this means color the whole row
        thisCol = allColDefinitions[0];
        if (thisCol.colorDefinition !== undefined && thisCol.colorDefinition !== null) {
            for (i = 1; i < columnNames.length; i++) {
                allColDefinitions[i].colorDefinition = thisCol.colorDefinition;
            }
        }

        //hide alternatesort columns and linkValueColumn
        for (i = 0; i < columnNames.length; i++) {
            thisCol = allColDefinitions[i];
            if (thisCol.alternateSortColumn !== i) { allColDefinitions[thisCol.alternateSortColumn].isVisible = false; }
            if (thisCol.linkValueColumn !== i) { allColDefinitions[thisCol.linkValueColumn].isVisible = false; }
        }


        //initial sort
        alternateSortIndex = allColDefinitions[that.defaultFirstSortIndex].alternateSortColumn;
        COMMON.sortArray(dataResults, alternateSortIndex, that.reverseSort);
        refreshSearchObj();

        //assemble grid
        tab = document.createElement("table");
        tab.id = gridTableId;
        tab.className = gridTableClass;
        if (that.gridWidth !== undefined && that.gridWidth !== null && that.gridWidth !== "") {
            tab.style.width = "100%";
        }
        tab.appendChild(titleBar()); //Title Bar Row
        tab.appendChild(headerRow()); //Header Row
        tab.appendChild(filterRow()); //Filter Row
        //clear slate
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        //add title bar
        div.appendChild(tab); //add table to base
        setSortIndicator();
        paginate();
        addGridBody();
    };
    //gets the data to populate the printer friendly popup
    //Parameters
    //  newWindow   (object:window)     the window object created on which the data will be displayed
    this.getDataToPrint = function (newWindow) {
        //used for printer friendly document
        var i, n, thisColDefinition, titleObj, thisValue, thisSummaryRow, iHTML;
        if (currentPage < 1) { currentPage = 1; }
        if (currentPage > pagination.totalPages) { currentPage = pagination.totalPages; }
        titleObj = newWindow.document.createElement("h1");
        titleObj.innerHTML = that.title;
        iHTML = "<table style=\"clear:both\" class=\"" + printTableClass + "\" id=\"printTable\"><tr>";
        for (i = 1; i < columnNames.length; i++) {
            thisColDefinition = allColDefinitions[i];
            if (thisColDefinition.isVisible) {
                iHTML += "<th>" + columnNames[i] + "</th>";
            }
        }
        iHTML += "</tr>";
        for (i = 0; i < dataResults.length; i++) {
            if (displayRow(dataResults[i])) {
                iHTML += "<tr>";
                for (n = 1; n < columnNames.length; n++) {
                    thisColDefinition = allColDefinitions[n];
                    if (thisColDefinition.isVisible) {
                        thisValue = dataResults[i][n];
                        iHTML += "<td class=\"" + (isNaN(thisValue) ? DISPLAYGRID.dataCellClass : DISPLAYGRID.dataCellNumberClass) + "\">" + thisValue + "</td>";
                    }
                }
                iHTML += "</tr>";
            }
        }
        iHTML += "</table>";
        //add title
        if (that.title !== undefined && that.title !== null && that.title !== "") { newWindow.document.body.appendChild(titleObj); }
        //add table to window
        newWindow.document.body.innerHTML += iHTML;
        //add summary
        thisSummaryRow = summaryRow();
        if (thisSummaryRow) { newWindow.document.getElementById("printTable").appendChild(thisSummaryRow); }
    };
    //occurs when a user editable field's value has changed
    //Parameters
    //  primaryKey      (String)        The primary key value
    //  column          (int)           The column index
    //  value           (String)        The new value
    this.valueChange = function (primaryKey, column, value) {
        var rowIndex;
        rowIndex = searchObj[primaryKey].index;
        dataResults[rowIndex][column] = value;
        searchObj[primaryKey].hasChanged = true; //set the hasChanged flag
        that.pendingChanges = true;
    };
    //resets pending changes for example after saving
    this.resetChange = function () {
        var oneProp;
        for (oneProp in searchObj) {
            if (searchObj.hasOwnProperty(oneProp)) {
                searchObj[oneProp].hasChanged = false; //reset
            }
        }
        that.pendingChanges = false;
    };
    //returns data from grid
    //Parameters:
    //  forCSharp       (Boolean)           Set to true to format data for C# code. Object Pattern: {data : [[{ColumnName : (String), Value : (String), ColIndex : (Int)},{}...],[]...]}
    //  showAll         (Boolean)           If false will only return rows where the user has changed data
    //Returns           (Literal Object)    Pattern if forCSharp is true:  {data : [[{ColumnName : (String), Value : (String), ColIndex : (Int)},{column 2}...],[row 2]...]}
    //                                      Pattern if forCSharp is false: {primaryKey0 : { 0 : column0Value(String), 1 : column1Value(String), ...}, primaryKey1 : { 0: column0Value, 1: column1Value, ...}, ...}
    this.getData = function (forCSharp, showAll) {
        var dataOut, oneProp, oneRow, arrayOut;
        dataOut = {};
        arrayOut = [];
        for (oneProp in searchObj) {
            //determine if showing all data (showAll) or else if the line has changes 
            if (searchObj.hasOwnProperty(oneProp) && (searchObj[oneProp].hasChanged || showAll)) {
                //this.dataOutRow = function (primaryKey, forCSharp)
                oneRow = dataOutRow(oneProp, forCSharp);
                if (forCSharp) {
                    arrayOut.push(oneRow);
                } else {
                    dataOut[oneProp] = oneRow;
                }
            }
        }
        if (forCSharp) {
            dataOut.data = arrayOut;
        }
        return dataOut;
    };
    //checks the validation of the user editable fields in the grid
    //Returns   (Boolean)   false if there are errors
    this.validateGrid = function () {
        return COMMON.validateForm(gridTableId);
    };
};

DISPLAYGRID.ZOneColumnDefinition = function (cIndex, gridIndex) {
    ///<summary>NOT FOR EXTERNAL USE...Holds the properties of a column, every column needs to have a column definition</summary>
    ///<param name="colIndex" type="int">the index of the column this definition represents</param>
    "use strict";
    var that, colIndex, fieldType;
    that = this;
    //Constructor
    colIndex = cIndex; // the index of this column
    fieldType = COMMON.fieldTypes.spa; //the type of control to display, controltype definitions are in common.js (see object COMMON.fieldTypes)
    //optional properties
    this.isVisible = true; //determine whether this column will be visible
    this.alternateSortColumn = colIndex; //set this property so that when this columns is sorted it is sorted based on the alternate column.  If alternateSortColumn is not the same as colIndex then it will hide the alternate column
    //control properties
    this.setControlType = function (type) {
        fieldType = COMMON.fieldTypes[type];
    };
    this.controlRequired = false; //set whether the control is required to be filled in or selected by the user
    this.numberValidationType = "none"; //the type of validation the control. validationtype definitions are in common.js (see object COMMON.validationTypes) expect values: none, integer, decimal, money
    this.maxLength = 0; //set this to a value that is a number greater than zero. this will be ignored if the control type is not a text box or textarea
    this.readOnlyDefinition = null; //holds a Generic Definition of a determination column and valueFunction with the pattern "function (val) {return Boolean}" where val is the value of the determinating column for this row and returns true if the field should be readOnly
    this.onchangeAction = null; //script to run onchange event of the control
    this.onkeypressAction = null; //script to run onkeypress event of the control
    //ddl control properties
    this.listItem = null; //array of literal objects with the properties: text and value for ddl control
    this.valueListQuery = null; //ignored if listItem has a value. The queryid to run for a ddl control  (SQLConnect.SQLS in SQLConnect.cs) 
    this.listQueryParams = null; //ignored if listItem has a value. the parameter for the query in valueListQuery
    //link control properties
    this.linkValueColumn = colIndex; //ignored if type is not "lnk". Set this to the column that will provide a value for the href or onclick attribute. if this column is not the linkValueColumn then the linkValueColumn will be hidden
    this.href = null; //ignored if type is not "lnk". the href of the link where ~ is replaced with the value from the linkValueColumn
    this.onclickAction = null; //script to run onclick event of the control
    this.toolTip = null; //ignored if type is not "lnk". Tooltip to show on hover
    //summary properties
    this.summaryType = null; //use DISPLAYGRID.summaryType values
    this.summarySum = null; //keeps running total
    this.summaryRowCount = null; //keeps number of rows
    this.summaryMax = null; //keeps highest value
    this.summaryMin = null; //keeps lowest value
    this.summaryPrecision = 0; //set the number of decimal places to show on a summary
    //color properties
    this.colorDefinition = null; //a generic definitions containing the determinating column  and the colorvaluefunction with pattern "function (val) {return Color}" where val is the value of the determinationColumn. The color to return will be any valid css color value (#RRGGBB or common name).  If no color is return as in the case of null or undefined, then the default color white will be used
    //initializes summary, to be run in gridBody() function
    this.styleDefinition = null; //contains the function object with the pattern function(val){return String InLine Style} where val is the value of the determinationColumn. The style returned will be applied to the object in the grid cell
    this.initSummary = function () {
        that.summarySum = 0;
        that.summaryRowCount = 0;
        that.summaryMax = null;
        that.summaryMin = null;
    };
    //gets the 2 character Column Letter so that column index 0 = 0A, 1 = 0B, 26 = AA
    //Returns   (String)
    this.getColumnLetter = function () {
        var num0, num1, let0, let1;
        num0 = Math.floor((colIndex + 1) / 26);
        num1 = parseInt((colIndex + 1) % 26, 10);
        let0 = "0";
        if (num0 > 0) { let0 = String.fromCharCode(num0 + 64); }
        let1 = String.fromCharCode(num1 + 64);
        return let0 + let1;
    };
    //Gets the object of the column for a particular row
    //Parameters:
    //  dataRow     (Array:String)      The dataResult Row
    //  primaryKey  (String)            The primary key of the row column 0 of dataResults
    //Returns       (obj:Element)       HTML element
    this.getObj = function (dataRow) {
        var dVal, localType, obj, id, attrib, value, localHref, localOnclick, primaryKey;
        localType = fieldType;
        if (that.readOnlyDefinition) {
            dVal = dataRow[that.readOnlyDefinition.determinationColumn];
            if (that.readOnlyDefinition.valueFunction(dVal)) { localType = COMMON.fieldTypes.spa; }
        }
        primaryKey = dataRow[0];
        id = String(gridIndex) + "GRID" + that.getColumnLetter() + primaryKey;
        value = dataRow[colIndex];
        attrib = { "pkey": primaryKey, "column": String(colIndex), "gridindex": String(gridIndex) };
        //add onchange to keep track of what fields have changed
        if (localType.isField) {
            attrib.onchange = "DISPLAYGRID.zfieldChanged(" + String(gridIndex) + ", this);";
        }
        switch (localType.id) {
            case "cal":
                obj = COMMON.getCalendar(id, value, that.controlRequired, null, COMMON.pageMessageDivId, null, that.onkeypressAction, that.onchangeAction, attrib);
                break;
            case "ddl":
                if (that.onchangeAction !== undefined && that.onchangeAction !== null) {
                    attrib.onchange += that.onchangeAction;
                }
                if (that.listItem) {
                    obj = COMMON.getDDL(id, value, that.controlRequired, null, that.listItem, null, attrib);
                } else {
                    obj = COMMON.getDDLfromQuery(id, value, that.controlRequired, that.valueListQuery, that.listQueryParams, null, null, attrib);
                }
                break;
            case "lnk":
                if (that.href) { localHref = that.href.replace("~", dataRow[that.linkValueColumn]); } else { localHref = null; }
                if (that.onclickAction) { localOnclick = that.onclickAction.replace("~", dataRow[that.linkValueColumn]); } else { localOnclick = null; }
                obj = COMMON.getLink(id, dataRow[colIndex], localHref, localOnclick, that.toolTip, attrib);
                break;
            default:
                if (that.onchangeAction !== undefined && that.onchangeAction !== null) {
                    attrib.onchange += that.onchangeAction;
                }
                if (that.onkeypressAction !== undefined && that.onkeypressAction !== null) {
                    attrib.onkeyup = that.onkeypressAction;
                }
                obj = COMMON.getFieldObject(localType.id, id, value, that.controlRequired, that.numberValidationType, null, null, null, attrib);
                break;
        }
        return obj;
    };
    //Gets class to assign to the cell (td element) depending on if the cell has a user editable field or else is either a number or not a number
    //Parameters:
    //  dataRow     (Array:String)      The dataResult Row
    //Returns       (String)            css classname
    this.getCellClass = function (dataRow) {
        var dVal, localType, value;
        localType = fieldType.id;
        if (that.readOnlyDefinition) {
            dVal = dataRow[that.readOnlyDefinition.determinationColumn];
            if (that.readOnlyDefinition.valueFunction(dVal)) { localType = "spa"; }
        }
        value = dataRow[colIndex];
        if (localType === "lnk") { return DISPLAYGRID.dataCellClass; }
        if (localType === "spa") {
            if (isNaN(value)) { return DISPLAYGRID.dataCellClass; }
            return DISPLAYGRID.dataCellNumberClass;
        }
        return DISPLAYGRID.dataCellWithControlClass;
    };
    //Gets the background color to assign to a cell (td element) based on color definition
    //Parameters:
    //  dataRow     (Array:String)      The dataResult Row
    //Returns       (String)            css color
    this.getColor = function (dataRow) {
        var dColVal, color;
        if (!that.colorDefinition) { return "transparent"; }
        dColVal = dataRow[that.colorDefinition.determinationColumn];
        color = that.colorDefinition.valueFunction(dColVal);
        return color || "transparent";
    };
    //Gets the style to assign to a cell (td element) based on the style definition
    //Parameters:
    //  dataRow     (Array:String)      The dataResult Row
    //Returns       (String)            in-line style string
    this.getStyle = function (dataRow) {
        var dColVal, style;
        if (!that.styleDefinition) { return ""; }
        dColVal = dataRow[that.styleDefinition.determinationColumn];
        style = that.styleDefinition.valueFunction(dColVal);
        return style || "";
    };
    //Returns the value of the summary
    //Returns       (element:td)
    this.getSummary = function () {
        var td, thisVal, intPart, decPart;
        td = document.createElement("td");
        if (!that.summaryType) {
            td.innerHTML = "&nbsp;";
        } else {
            switch (that.summaryType) {
                case DISPLAYGRID.summaryTypes.sum:
                    thisVal = that.summarySum;
                    break;
                case DISPLAYGRID.summaryTypes.min:
                    thisVal = that.summaryMin;
                    break;
                case DISPLAYGRID.summaryTypes.max:
                    thisVal = that.summaryMax;
                    break;
                case DISPLAYGRID.summaryTypes.avg:
                    thisVal = (that.summaryRowCount === 0 ? 0 : that.summarySum / that.summaryRowCount);
                    break;
            }
            decPart = String(Math.round(Math.round(thisVal * Math.pow(10, that.summaryPrecision))) - (Math.floor(thisVal) * Math.pow(10, that.summaryPrecision)));
            intPart = String(Math.floor(thisVal));
            if (decPart.length > that.summaryPrecision && that.summaryPrecision > 0) { decPart = decPart.substring(0, that.summaryPrecision); }
            decPart = "." + decPart.padRight("0", that.summaryPrecision);
            if (that.summaryPrecision === 0) { decPart = ""; }
            td.innerHTML = that.summaryType.name + " " + intPart + decPart;
        }
        return td;
    };
};
DISPLAYGRID.zshowHelp = function () {
    ///<summary>NOT FOR EXTERNAL USE...Shows help information in in OK dialog</summary>
    "use strict";
    var mess;
    mess = document.createElement("div");
    mess.appendChild(COMMON.getBasicElement("hh2", null, "Introduction"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "The Grid is a uniform way of showing columnar data.  You can view the data and may edit the data if any of the fields are user editable.  The data is broken down into pages which can be view by using the page navigation buttons at the bottom of the grid if there are more rows than can be displayed at one time.  By clicking on the column header names, you can sort the data by that column.  Click the same column name again and the column will be sorted in reverse, or largest to smallest.  You can filter one or more columns by selecting what you want to see from the drop down list at the top of each column under the column headings.  Each row may have buttons that can affect the row on which the button is located.  Finally, you can print all the contents of the grid (including data on other pages) by clicking on the print link.  The image below shows a typical grid and its components."));
    mess.appendChild(COMMON.getImageElement(null, "jpg/grid.gif", "Grid Help"));
    mess.appendChild(COMMON.getBasicElement("hh2", null, "Components"));
    mess.appendChild(COMMON.getBasicElement("hh3", null, "Sorting Buttons"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "You can sort the grid by clicking the column title button at the very top of the grid. The grid will be sorted numerically (smallest to largest) if all the items in the column are numbers, by date (oldest to newest) if all items in that column are date and time, otherwise, the column will be sorted alphabetically (symbols, then a-z).  If you click the same button again, the sort will be done in reverse. The column that is sorted will have an arrow indicator showing that it was sorted and the direction.  Reverse sort is indicated by an arrow pointing up.  Currently, sorting cannot be stacked so please use column filters to help this situation."));
    mess.appendChild(COMMON.getBasicElement("hh3", null, "Filters"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "Under the column name sorting buttons, there are drop downs that contain every unique value present in the column.  If the value is empty or blank, use the selection labeled [Blank]. To select the filter, click the filter selector and select a value. The only rows that will show are those that have the selected value in that column.  Select a filter for more than one column to further refine your search. To remove the filter, select &quot;All&quot;.  Filters affect the print popup and Summary rows if available."));
    mess.appendChild(COMMON.getBasicElement("hh3", null, "Print"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "Click on the Print link located in the first data row on the extreme left of the grid.  Click on print to display a printer friendly popup with all data from the grid.  After all data is loaded, click on the print button which will display the printer select dialog.  Select a printer and click Print button. Once your grid is printed, you can close the popup or click the close button.  Loading data to the print popup may take several minutes, please wait until the grid is completely done in order to use the Print and Close buttons.  Filters will affect the data displayed in the popup."));
    mess.appendChild(COMMON.getBasicElement("hh3", null, "Row Buttons (Not available in all grids)"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "If there is a button on the right of each data row, use the button to affect the data in the row which the button is on.  It is possible that an action caused by the button will navigate away from the grid and you will be prompted whether you want to continue and discard changes if any."));
    mess.appendChild(COMMON.getBasicElement("hh3", null, "Page Navigation (Not available in all grids)"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "If there are more rows in the grid than can be displayed at one time, the page navigation area will appear. The page navigation area will: Show current page being displayed and total pages; Provides buttons that allow you to navigate to the next and previous pages; Provides a text box and button where you can enter the page you want to &quot;jump-to&quot;.  The previous page button will be disabled in page 1 and conversely, the next page button will be disabled in the last page.  The Jump text box only allows numbers. Entering a number higher than the total number of pages will navigate to the last page. Entering a number less than 1 will navigate you to the first page.  Changing pages will not discard any changes you have made in user editable fields."));
    mess.appendChild(COMMON.getBasicElement("hh2", null, "User Editable Fields (Not available in all grids)"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "If available, you may be able to change some of the data on the grid. Make changes as necessary.  Changing the page will not disacard your changes.  However, some grid may have buttons on the last column of each data row.  Clicking on these buttons while there are pending changes will prompt you about whether to continue and discard changes or discontinue the action of the button.  Please save your changes frequently."));
    mess.appendChild(COMMON.getBasicElement("hh2", null, "Summary Rows (Not available in all grids)"));
    mess.appendChild(COMMON.getBasicElement("ppp", null, "Some grids may include summary row as the last row in the grid.  Any summaries will include data from all pages including rows from pages not currently being displayed.  Summaries are also affected by filter selections and will only summarize the data the belongs to the filter combination selected"));
    FILLIN.okDialog("pnMainTop", "Grid Help", mess, "90%", "Close");
};

//*******************Helper Functions not for External use*********************//
DISPLAYGRID.zgetColumnDef = function (gridIndex, colIndex) {
    ///<summary>NOT FOR EXTERNAL USE...Returns the column definition object of a specific grid</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column</param>
    ///<returns type="object:OneColumnDefinition"></returns>
    "use strict";
    var thisGrid;
    thisGrid = DISPLAYGRID.allGrids[gridIndex];
    return thisGrid.initializeColumnDefinitions(colIndex);
};
DISPLAYGRID.zassemblePrint = function (gridIndex) {
    ///<summary>NOT FOR EXTERNAL USE...creates a pop up window for printer friendly HTML of grid Contents</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    "use strict";
    var thisGrid, obj1, obj2, obj3, newWindowObj, dvWaitingObj;
    thisGrid = DISPLAYGRID.allGrids[gridIndex];
    //create window
    newWindowObj = window.open("", "newWindowObj", "menubar=no, scrollbars=yes, status=no, titlebar=no, toolbar=no");
    obj1 = newWindowObj.document.createElement("style");
    obj1.type = "text/css";
    obj1.media = "print";
    obj1.innerHTML = ".hideDiv{display:none;}";
    newWindowObj.document.body.appendChild(obj1);
    obj1 = newWindowObj.document.createElement("style");
    obj1.type = "text/css";
    obj1.innerHTML = ".tbPrint{border-collapse:collapse;}.tbPrint td{margin:0;padding:2px;border:solid 1px black;}.tbPrint th{margin:0;padding:2px;border-color:black;border-width:1px 1px 2px 1px;border-style:solid;}#dvWaiting{text-align:center;margin-top:200px;}#dvWaiting h2{color:#5171AE;}.hideDiv{overflow:hidden;}";
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
    obj1.id = "dvWaiting";
    obj2 = newWindowObj.document.createElement("h2");
    obj2.id = "h2Loading";
    obj2.innerHTML = "Loading...Please Wait.";
    obj1.appendChild(obj2);
    obj2 = newWindowObj.document.createElement("div");
    obj3 = newWindowObj.document.createElement("img");
    obj3.src = "jpg/waiting.gif";
    obj3.width = "64";
    obj3.height = "64";
    obj3.alt = "Waiting Icon";
    obj2.appendChild(obj3);
    obj1.appendChild(obj2);
    newWindowObj.document.body.appendChild(obj1);
    thisGrid.getDataToPrint(newWindowObj);
    dvWaitingObj = newWindowObj.document.getElementById("dvWaiting");
    while (dvWaitingObj.firstChild) {
        dvWaitingObj.removeChild(dvWaitingObj.firstChild);
    }
    newWindowObj.document.body.removeChild(dvWaitingObj);
};
DISPLAYGRID.zfieldChanged = function (gridIndex, obj) {
    ///<summary>NOT FOR EXTERNAL USE...When a user editable field is changed, save to dataresults</summary>
    ///<param name="gridIndex" type="int">the index of the grid</param>
    ///<param name="obj" type="element">the field element that has the onchange event</param>
    "use strict";
    var fieldType, pkey, col, val;
    fieldType = COMMON.fieldTypes[obj.getAttribute("fieldtype")];//the fieldType object
    pkey = obj.getAttribute("pkey"); //get the primary key
    col = obj.getAttribute("column"); //get the column Index
    val = fieldType.getValueFunction(obj);//get the value
    //change the value and set hasChanged flag
    DISPLAYGRID.allGrids[gridIndex].valueChange(pkey, col, val);
};
//*******************************************************Grid Manipulation Static Functions, NOT FOR EXTERNAL USE************************************************//
DISPLAYGRID.zsortChange = function (colIndex, gridIndex) {
    ///<summary>NOT FOR EXTERNAL USE...When header (sorting) button is clicked</summary>
    ///<param name="colIndex" type="int">the column Index of the button that was clicked</param>
    ///<param name="gridIndex" type="int">the index of the grid</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].sortChange(colIndex);
};
DISPLAYGRID.zfilterChange = function (gridIndex) {
    ///<summary>NOT FOR EXTERNAL USE...Filter DDL has changed</summary>
    ///<param name="gridIndex" type="int">the index of the grid</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].filterChange();
};
DISPLAYGRID.zpageChange = function (controlIndex, gridIndex) {
    ///<summary>NOT FOR EXTERNAL USE...when a page navigation button is clicked</summary>
    ///<param name="controlIndex" type="int">tells which button was clicked</param>
    ///<param name="gridIndex" type="(int">the index of the grid</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].pageChange(controlIndex);
};
DISPLAYGRID.zjmpTxt = function (e, gridIndex) {
    ///<summary>NOT FOR EXTERNAL USE...user uses keyboard while jump text box is focused</summary>
    ///<param name="e" type="Object:Event">The Event Object</param>
    ///<param name="gridIndex" type="int">the index of the grid</param>
    ///<returns type="Boolean"></returns>
    "use strict";
    var target, keycode, charToCheck;
    charToCheck = "";
    if (e.key) {
        charToCheck = e.key;
    }
    if (e.srcElement) {
        target = e.srcElement;
        keycode = (e.keycode || e.which);
    } else if (e.target) {
        target = e.target;
        keycode = (e.which || e.keycode);
    }
    if (!target) { return true; }
    if (!keycode) { return true; }
    if (keycode === 13) {
        DISPLAYGRID.allGrids[gridIndex].pageChange(2);
        return true;
    }
    if (charToCheck === "") { charToCheck = String.fromCharCode(keycode); }
    COMMON.errMess("");
    target.style.backgroundColor = "white";
    if (COMMON.checkInteger("txt", target.id)) {
        COMMON.errMess(" Enter Numbers only ");
        target.style.backgroundColor = "red";
        target.value = "";
        return false;
    }
    return true;
};
//********************Helper Objects not for External use********************************************//
DISPLAYGRID.ZOneButtonDefinition = function (gIndex, id, value, onclickAction, determinationColumn, logicCheckFunction, isButtonToBeDisabled) {
    ///<summary>NOT FOR EXTERNAL USE...Holds the properties of a button object for each row</summary>
    ///<param name="gIndex" type="int">The Grid Index of the Grid this definition belongs to</param>
    ///<param name="id" type="int">the id of the button, the primary key of the row will be appended to the id</param>
    ///<param name="value" type="String">The text displayed on the button</param>
    ///<param name="onclickAction" type="String:Scrip">The script to run when user click this button</param>
    ///<param name="determinantColumn" type="int">(optional) The index of the column whose value will determine if the button is displayed. If omitted, this button will be displayed in all rows</param>
    ///<param name="logicCheckFunction" type="function object">(optional) Ignored if determinantColumn is not provided. the Function to run to determine if to display or enable this button.  The function will have the pattern "function (val) { return Boolean }" where val is the value of the determinant column for a particular row. If the result of the function is true, the button will be displayed or enabled</param>
    ///<param name="isButtonToBeDisabled" type="Boolean">(optional) Ignored if determinantColumn is not provided, if true then button will be disabled and not omitted from the row if the logicCheckFunction returns false</param>
    "use strict";
    var that;
    that = this;
    this.gridIndex = gIndex; // The Grid Index of the Grid this definition belongs to
    this.id = id; //The id of the button
    this.value = value; //The value of the button
    this.onclickAction = onclickAction; //The script to run when the button is clicked
    this.genericDefinition = null; //used to determine if the button will be shown or enabled. If omitted, then this button will be shown/enabled for all rows. The pattern is "function (val) { return boolean }" where val is the value found in the determination column for this row. The function will return true if the button is to be shown or enabled, otherwise the button will not be shown or will be disabled
    this.width = null;
    if (determinationColumn) {
        this.genericDefinition = { determinationColumn: determinationColumn, valueFunction: logicCheckFunction };
    }
    this.isButtonToBeDisabled = isButtonToBeDisabled; //If true, the button will be disabled instead of hidden when the logicFunction returns false
    //gets the button object for a row
    //Returns       (element:input[type:button])
    this.getObject = function (dataRow) {
        var dVal, showButton, attrib, localId, primaryKey, btn;
        primaryKey = dataRow[0];
        showButton = true;
        localId = id + String(primaryKey);
        if (that.genericDefinition) {
            dVal = dataRow[that.genericDefinition.determinationColumn];
            showButton = that.genericDefinition.valueFunction(dVal);
        }
        if (showButton || isButtonToBeDisabled) {
            attrib = { "pkey": String(primaryKey), "gridindex": String(gIndex) };
            if (!showButton) { attrib.disabled = "disabled"; }
            btn = COMMON.getButton(localId, value, that.onclickAction, "", null, attrib);
            if (that.width !== undefined && that.width !== null) { btn.style.width = that.width; }
            return btn;
        }
        return null;
    };
};

//****************EXTERNAL USE ITEMS: CONSTRUCTORS AND FEATURE ADDERS***********************************************************//
DISPLAYGRID.resetGrid = function () {
    ///<summary>Clears all grids from memory</summary>
    "use strict";
    DISPLAYGRID.allGrids = [];
};
DISPLAYGRID.allignGrid = function (gridIndex, idOrObject) {
    "use strict";
    var thisGrid, obj;
    thisGrid = DISPLAYGRID.allGrids[gridIndex];
    obj = idOrObject;
    if (typeof idOrObject === "string") {
        obj = document.getElementById(idOrObject);
    }
    thisGrid.leftPosition = String(obj.offsetLeft) + "px";
};
DISPLAYGRID.addGrid = function (displayDivId, baseDivId, queryId, params, rowsPerPage, firstSortIndex, reverseSort, suppressAlert, noResultsMessage, noResultsAction) {
    ///<summary>Adds a new Grid to Array</summary>
    ///<param name="displayDivId" type="String">the container element where the grid will be displayed</param>
    ///<param name="baseDivId" type="String">grid envelope element id</param>
    ///<param name="queryId" type="String or Int">(Optional) Can be omitted if providing a data object when calling DISPLAYGRID.display(). The name of the query that will provide the data for this grid.  Column 0 must be a unique primary key</param>
    ///<param name="params" type="Array of Strings">(Optional) Ignored if queryId is null. An array of values that will be included in the SQL statement as variables (see code in SQLConnect.cs)</param>
    ///<param name="rowsPerPage" type="Int">number of rows to show at one time</param>
    ///<param name="firstSortIndex" type="Int">(Optional) the columns that the grid will be sorted by when initially displayed</param>
    ///<param name="reverseSort" type="Boolean">(Optional) is the initialSort Reversed. Ignored if firstSortIndex is not set</param>
    ///<param name="suppressAlert" type="Boolean">(Optional) if true, no message will be displayed if there are no results in the query</param>
    ///<param name="noResultsMessage" type="String">(Optional) the message to display if there are no results (ignored if suppressAlert == true)</param>
    ///<param name="noResultsAction" type="Function Object">(Optional) the function to run if there are no results. with the pattern "function(){code...}"</param>
    ///<returns type="int">The index of the grid object in DISPLAYGRID.allGrids</returns>
    "use strict";
    var newGrid, gridIndex;
    if (!DISPLAYGRID.allGrids) { DISPLAYGRID.allGrids = []; }
    gridIndex = DISPLAYGRID.allGrids.length;
    newGrid = new DISPLAYGRID.DisplayGrid(gridIndex);
    newGrid.displayDivId = displayDivId;
    newGrid.baseDivId = baseDivId;
    newGrid.queryId = queryId;
    newGrid.params = params;
    newGrid.rowsPerPage = rowsPerPage;
    if (firstSortIndex) {
        newGrid.defaultFirstSortIndex = firstSortIndex;
        newGrid.reverseSort = reverseSort;
    }
    if (suppressAlert !== undefined) {
        newGrid.supressAlert = suppressAlert;
        if (!suppressAlert && noResultsMessage) { newGrid.noResultsMessage = noResultsMessage; }
    }
    if (noResultsAction) { newGrid.noResultsAction = noResultsAction; }
    newGrid.initialize();
    DISPLAYGRID.allGrids.push(newGrid);
    return gridIndex;
};
DISPLAYGRID.addTitles = function (gridIndex, title, subHead) {
    ///<summary>Adds titles to the grid and tool tip</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="title" type="String">The Title to show on title bar</param>
    ///<param name="subHead" type="String">A sub headline or tool tip to show on title bar</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].title = title;
    DISPLAYGRID.allGrids[gridIndex].subHead = subHead;
};
DISPLAYGRID.setButtonColumnWidth = function (gridIndex, width) {
    ///<summary>Sets the CSS width of the button column if present</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="width" type="String">Any valid CSS width value</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].buttonColumnWidth = width;
};
DISPLAYGRID.alternateColors = function (gridIndex) {
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].alternateColor = true;
};
DISPLAYGRID.setWidth = function (gridIndex, width) {
    ///<summary>Sets the width of the grid table</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="width" type="String">A valid css element width value</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].gridWidth = width;
};
DISPLAYGRID.addColorDefinition = function (gridIndex, colindex, determinationColumn, colorValueFunction) {
    ///<summary>adds a Color Definitions for a column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colindex" type="int">The index of the column to affect</param>
    ///<param name="determinationColumn" type="int">the index of the column whose value will determine what color to shade the data cell</param>
    ///<param name="colorValueFunction" type="function object">The function to determine the color to display, The function will be in the pattern "function (val) {return Color}" where val is the value of the determinationColumn. The color to return will be any valid css color value (#RRGGBB or common name).  If no color is return as in the case of null or undefined, then the default color white will be used</param>
    "use strict";
    var thisColumnDefinition;
    thisColumnDefinition = DISPLAYGRID.zgetColumnDef(gridIndex, colindex);
    thisColumnDefinition.colorDefinition = { determinationColumn: determinationColumn, valueFunction: colorValueFunction };
};
DISPLAYGRID.addStyleDefinition = function (gridIndex, colIndex, determinationColumn, styleValueFunction) {
    //<summary>adds style Definitions for a column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="determinationColumn" type="int">the index of the column whose value will determine what color to shade the data cell</param>
    ///<param name="styleValueFunction" type="function object">The function that returns a in-line style string, The function will be in the pattern "function (val) {return String in-line style}" where val is the value of the determinationColumn. The style to return will be any valid css style string (e.g. color:white;border: 1px solid red; etc).  If no string is return as in the case of null or undefined, then no style will be applied</param>
    "use strict";
    var thisColumnDefinition;
    thisColumnDefinition = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColumnDefinition.styleDefinition = { "determinationColumn": determinationColumn, "valueFunction": styleValueFunction };
};
DISPLAYGRID.addTextBox = function (gridIndex, colIndex, isRequired, COMMONvalType, maxLength, onchangeAction, onkeypressAction) {
    ///<summary>adds text boxes to specific column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="isRequired" type="Boolean">Field cannot be blank if true</param>
    ///<param name="COMMONvalType" type="String">(Optional) from common.js COMMON.validationTypes</param>
    ///<param name="maxLength" type="int">(Optional) enter number > 0 to check for max length</param>
    ///<param name="onchangeAction" type="String:Script">(Optional) function to run onchange</param>
    ///<param name="onkeypressAction" type="String:Script">(Optional) function to run onkeypress</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.setControlType("txt");
    thisColDef.controlRequired = isRequired;
    if (COMMONvalType) { thisColDef.numberValidationType = COMMONvalType; }
    if (maxLength) { thisColDef.maxLength = maxLength; }
    if (onchangeAction) { thisColDef.onchangeAction = onchangeAction; }
    if (onkeypressAction) { thisColDef.onkeypressAction = onkeypressAction; }
};
DISPLAYGRID.addDDL = function (gridIndex, colIndex, isRequired, queryIdOrArray, params, onchangeAction) {
    ///<summary>adds Drop Down List to specific column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="isRequired" type="Boolean">Field cannot be blank if true</param>
    ///<param name="queryIdOrArray" type="String|ObjectArray">Either a string that is the name of the query (SQLConnect.SQLS from SQLConnect.cs) or an array of literal objects that have the properties "text" and "value"</param>
    ///<param name="params" type="StringArray">(Optional) Ignored if queryIdOrArray is not a String. The parameters of the query</param>
    ///<param name="onchangeAction" type="String:Script">(Optional) function to run onchange</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.setControlType("ddl");
    thisColDef.controlRequired = isRequired;
    if (typeof queryIdOrArray === "string") {
        thisColDef.valueListQuery = queryIdOrArray;
        thisColDef.listQueryParams = params;
    } else {
        thisColDef.listItem = queryIdOrArray;
    }
    if (onchangeAction) { thisColDef.onchangeAction = onchangeAction; }
};
DISPLAYGRID.addYesNo = function (gridIndex, colIndex, onchangeAction) {
    ///<summary>adds Drop Down List with yes and no</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="onchangeAction" type="String:Script">(Optional) function to run onchange</param>
    "use strict";
    var listItems;
    listItems = [];
    listItems.push({ text: "Yes", value: "1" });
    listItems.push({ text: "No", value: "0" });
    DISPLAYGRID.addDDL(gridIndex, colIndex, false, listItems, null, onchangeAction);
};
DISPLAYGRID.addCheckBox = function (gridIndex, colIndex, onchangeAction) {
    ///<summary>adds checkbox</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="onchangeAction" type="String:Script">(Optional) function to run onchange</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.setControlType("chk");
    thisColDef.onchangeAction = onchangeAction;
};
DISPLAYGRID.addLink = function (gridIndex, colIndex, linkValueColumn, href, onclick, toolTip) {
    ///<summary>adds link</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="linkValueColumn" type="int">The index of the column that will provide additional code to the href or onclick attributes. If linkValueColumn != colIndex then the linkValueColumn will be hidden</param>
    ///<param name="href" type="string">The href attribute of the link. If a "~" is inserted in the code then it will be replaces with the value from the linkValueColumn for this row</param>
    ///<param name="onclick" type="string:script">The onclick attribute of the link. If a "~" is inserted in the code then it will be replaces with the value from the linkValueColumn for this row</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.setControlType("lnk");
    thisColDef.linkValueColumn = linkValueColumn;
    thisColDef.toolTip = toolTip;
    if (href) { thisColDef.href = href; }
    if (onclick) { thisColDef.onclickAction = onclick; }
};
DISPLAYGRID.addCalendar = function (gridIndex, colIndex, isRequired, onchangeAction, onkeypressAction) {
    ///<summary>adds calendar control set to specific column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="isRequired" type="Boolean">Field cannot be blank if true</param>
    ///<param name="onchangeAction" type="String:Script">(Optional) function to run onchange</param>
    ///<param name="onkeypressAction" type="String:Script">(Optional) function to run onkeypress</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.setControlType("cal");
    thisColDef.controlRequired = isRequired;
    if (onchangeAction) { thisColDef.onchangeAction = onchangeAction; }
    if (onkeypressAction) { thisColDef.onkeypressAction = onkeypressAction; }
};
DISPLAYGRID.addSummary = function (gridIndex, colIndex, summaryType) {
    ///<summary>adds a summary definition to the column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex " type="int">The index of the column to affect</param>
    ///<param name="summaryType" type="DISPLAYGRID.summaryTypes">Use a value from DISPLAYGRID.summaryTypes</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.summaryType = summaryType;
};
DISPLAYGRID.setAlternateSortColumn = function (gridIndex, colIndex, alternateSortColumn) {
    ///<summary>When user sorts this column use the value a hidden column instead</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to affect</param>
    ///<param name="alternateSortColumn" type="int">THe index of the column to use for sorting</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.alternateSortColumn = alternateSortColumn;
};
DISPLAYGRID.hideColumn = function (gridIndex, colIndex) {
    ///<summary>Hide a specific column</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to hide</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.isVisible = false;
};
DISPLAYGRID.addRowButton = function (gridIndex, id, value, onclick, width, determinationColumn, logicFunction, isButtonToBeDisabled) {
    ///<summary>Adds a button to each row depending on definition</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="id" type="String">The id of the button</param>
    ///<param name="value" type="String">The value of the button</param>
    ///<param name="onclick" type="String:Script">The script to run when the button is clicked</param>
    ///<param name="determinationColumn" type="int">(Optional) The column that provides the value for the logic function</param>
    ///<param name="logicFunction" type="function">(Optional) Ignored if the determinationColumn is not set. A function that will display or enable the button.  The pattern is "function (val) { return boolean }" where val is the value found in the determination column for this row. The function will return true if the button is to be shown or enabled, otherwise the button will not be shown or will be disabled</param>
    ///<param name="isButtonToBeDisabled" type="boolean">(Optional) Ignored if the determiniationColumn is not set. If true, the button will be disabled instead of hidden when the logicFunction returns false</param>
    "use strict";
    var thisGrid, btnDef;
    thisGrid = DISPLAYGRID.allGrids[gridIndex];
    btnDef = new DISPLAYGRID.ZOneButtonDefinition(gridIndex, id, value, onclick, determinationColumn, logicFunction, isButtonToBeDisabled);
    btnDef.width = width;
    thisGrid.addRowButton(btnDef);
};
DISPLAYGRID.addReadOnlyDefinition = function (gridIndex, colIndex, determinationColumn, logicFunction) {
    ///<summary>Add a definition that tells in a particular column where there is a user editable field under what conditions the field should not be editable as a result of a function</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="colIndex" type="int">The index of the column to hide</param>
    ///<param name="determinationColumn" type="int">The column that provides the value for the logic function</param>
    ///<param name="logicFunction" type="function">A function whose result will determine if the field is not editable.  The pattern is "function (val) { return boolean }" where val is the value found in the determination column for this row. The function will return true if the user editable field is to be read-only</param>
    "use strict";
    var thisColDef;
    thisColDef = DISPLAYGRID.zgetColumnDef(gridIndex, colIndex);
    thisColDef.readOnlyDefinition = { determinationColumn: determinationColumn, valueFunction: logicFunction };
};
DISPLAYGRID.display = function (gridIndex, dataObj) {
    ///<summary>Use after all features have been added to render the grid</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="dataObj" type="Array">An array of literal objects in the format {"ColumnName0":"ColumnValue0","ColumnName1":"ColumnValue1",...}</param>
    "use strict";
    DISPLAYGRID.allGrids[gridIndex].display(dataObj);
};
DISPLAYGRID.getData = function (gridIndex, forCSharp, showAll) {
    ///<summary>returns data from grid</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="forCSharp" type="Boolean">Set to true to format data for C# code. Object Pattern: {data : [[{ColumnName : (String), Value : (String), ColIndex : (Int)},{}...],[]...]}</param>
    ///<param name="showAll" type="Boolean">If false will only return rows where the user has changed data</param>
    ///<returns type="Literal Object">Pattern if forCSharp is true:  {data : [[{ColumnName : (String), Value : (String), ColIndex : (Int)},{column 2}...],[row 2]...]} Pattern if forCSharp is false: {primaryKey0 : { 0 : column0Value(String), 1 : column1Value(String), ...}, primaryKey1 : { 0: column0Value, 1: column1Value, ...}, ...}</returns>
    "use strict";
    return DISPLAYGRID.allGrids[gridIndex].getData(forCSharp, showAll);
};
DISPLAYGRID.getDataRow = function (gridIndex, pkey) {
    ///<summary>gets the data for the whole row indicated by the key</summary>
    ///<param name="gridIndex" type="int">The index of the grid</param>
    ///<param name="pkey" type="String">The key of the row</param>
    ///<returns type="String Array">An Array containing the ordered row data</returns>
    "use strict";
    return DISPLAYGRID.allGrids[gridIndex].getRowData(pkey);
};
DISPLAYGRID.validateGrid = function (gridIndex) {
    ///<summary>Validates user editable fields in the grid</summary>
    ///<returns type="Boolean">False if any field has errors</returns>
    "use strict";
    return DISPLAYGRID.allGrids[gridIndex].validateGrid();
};