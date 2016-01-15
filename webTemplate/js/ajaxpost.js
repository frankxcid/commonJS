///<reference path="common.js" />
//Used to query using pre established sql queries
/*jslint browser: true, for: true, white: true, this: true*/
/*global FILLIN, COMMON, window*/
/*Ver 1.1.0 01/23/2015*/
var AJAXPOST = {};
///<var>array that holds the column names in orders from the query</var>
AJAXPOST.columnNames = null;
///<var>results in 2 dimensional array (array of arrays)</var>
AJAXPOST.dataResults = null;
///<var>The id of the iFrame</var>
AJAXPOST.iFrameId = "ifrAjax";
///<var>The result which can be read in the continuing function</var>
AJAXPOST.responseText = "";
///<var>The key of the command object</var>
AJAXPOST.commandObjectKey = "commandObj";
///<va>The key of the payload object</var>
AJAXPOST.sendVarsObjectKey = "sendVars";
///<var>The request type enumeration</var>
AJAXPOST.requestType = {
    SQLQuery: { requestType: "query", postType: "other" },
    FileUpload: { requestType: "fileupload", postType: "upload" },
    ImageToSQL: { requestType: "imagetosql", postType: "upload" },
    downloadPDF: { requestType: "downloadPDF", postType: "download" },
    fileList: { requestType: "fileList", postType: "other" },
    fileListMedia: { requestType: "fileListMedia", postType: "other" },
    crystalReportStream: { requestType: "crystalReportStream", postType: "download" },
    crystalReportSave: { requestType: "crystalReportSave", postType: "download" },
    commonExcel: { requestType: "gridexcel", postType: "download" }
};
///<var>holds responses from server by tokenid</var>
AJAXPOST.responseContainer = {};
AJAXPOST.zgetCommandObj = function (reqType, tokenId) {
    ///<summary>NOT FOR EXTERNAL USE**Gets the command object sent in the command parameter of the request</summary>
    ///<param name="reqType" type="String">The requesttype from AJAXPOST.requestType enumeration</param>
    ///<param name="tokenId" type="String">The token id that identifies the post</param>
    ///<returns type="Literal Object" />
    "use strict";
    var commandObj;
    commandObj = {};
    commandObj.reqType = reqType;
    commandObj.tokenId = tokenId;
    commandObj.iframePost = false;
    return commandObj;
};
AJAXPOST.zdoPost = function (requestType, sendVars, uploadFileControlId, continuingFunction, optionalData) {
    ///<summary>NOT FOR EXTERNAL USE**performs an AJAX Post</summary>
    ///<param name="requestType" type="String">The Request type command</param>
    ///<param name="sendVars" type="LiteralObject">Literal Object containing key=value pairs that will be posted</param>
    ///<params name="uploadFileControlId" type="String">The id of a file control for file uploads</param>
    ///<params name="continuingFunction" type="Function Object">(Optional)The variable containing a function that will be run when post is complete in the format function(resultdata, optionalData){}</param>
    ///<params name="optionalData" type="Object">(Optional)Ignored if continuingFunction is not provided. Optional data post on the continuingFunction</param>
    "use strict";
    var reqType, postCompleteDetector, ajaxForm, thisRequest, docObj, obj1, fileToSend, commandObj, combinedObj;
    if (typeof requestType === "string") {
        reqType = AJAXPOST.requestType[requestType];
    } else {
        reqType = requestType;
    }
    if (reqType === undefined || reqType === null) {
        //custom request
        reqType = {};
        reqType.requestType = requestType;
        reqType.postType = "other";
    }
    postCompleteDetector = new AJAXPOST.zdetectPostComplete(reqType.requestType, continuingFunction, optionalData);
    commandObj = AJAXPOST.zgetCommandObj(reqType.requestType, postCompleteDetector.tokenId);
    if ((COMMON.ieVer <= 9 && reqType.postType === "upload") || reqType.postType === "download") {
        //iframes act asynchronously
        ajaxForm = AJAXPOST.zcreateIFrame(commandObj, sendVars);
        if (uploadFileControlId !== undefined && uploadFileControlId !== null) {
            obj1 = document.getElementById(uploadFileControlId);
            ajaxForm.appendChild(obj1);
        }
        ajaxForm.submit();
        postCompleteDetector.startDetection();
        return postCompleteDetector.tokenId;
    }
    thisRequest = new XMLHttpRequest();
    thisRequest.open("POST", "ajaxpost.aspx", false);
    if (COMMON.ieVer <= 9 || window.FormData === undefined) {
        combinedObj = {};
        combinedObj[AJAXPOST.commandObjectKey] = JSON.stringify(commandObj);
        combinedObj[AJAXPOST.sendVarsObjectKey] = JSON.stringify(sendVars);
        thisRequest.send(JSON.stringify(combinedObj));
    } else {
        docObj = new FormData();
        docObj.append(AJAXPOST.commandObjectKey, JSON.stringify(commandObj));
        docObj.append(AJAXPOST.sendVarsObjectKey, JSON.stringify(sendVars));
        if (uploadFileControlId !== undefined && uploadFileControlId !== null) {
            fileToSend = COMMON.getFileValue(uploadFileControlId).file;
            docObj.append(uploadFileControlId, fileToSend);
        }
        thisRequest.send(docObj);
    }
    if (thisRequest.response) {
        AJAXPOST.responseContainer[postCompleteDetector.tokenId].responseText = thisRequest.response;
    } else {
        AJAXPOST.responseContainer[postCompleteDetector.tokenId].responseText = thisRequest.responseText;
    }
    if (continuingFunction) {
        continuingFunction(AJAXPOST.getResponse(postCompleteDetector.tokenId), optionalData);
    }
    return postCompleteDetector.tokenId;
};
AJAXPOST.zSetNullBlank = function (valueIn) {
    ///<summary>NOT FOR EXTERNAL USE**changes null or undefined string variables to empty string</summary>
    ///<param name="valueIn" type="String">The value to check</param>
    ///<returns type="String" />
    "use strict";
    return (valueIn === undefined || (valueIn === null ? "" : valueIn));
};
AJAXPOST.zcreateIFrame = function (commandObj, sendVars) {
    ///<summary>NOT FOR EXTERNAL USE**Creates an IFrame for use with posting asynchronously</summary>
    ///<param name="commandObj" type="Literal Object">Object created by AJAXPOST.zgetCommandObj</param>
    ///<param name="sendVars" type="Literal Object">Literal object to send to server as JSON</param>
    ///<returns type="Element">The form element</returns>
    "use strict";
    var obj1, obj2, obj3, attr, formId;
    commandObj.iframePost = true;
    formId = "frmAjax";
    obj1 = document.getElementById(AJAXPOST.iFrameId);
    if (!obj1) {
        obj1 = document.createElement("iframe");
        obj1.id = AJAXPOST.iFrameId;
        attr = { "name": obj1.id, "width": "0", "height": "0", "border": "0", "src": "", "style": "display:none;" };
        COMMON.addAttribute(obj1, attr, null, true);
        document.body.appendChild(obj1);
    }

    obj2 = document.getElementById(formId);
    if (!obj2) {
        obj2 = document.createElement("form");
        obj2.id = formId;
        attr = { "target": AJAXPOST.iFrameId, "action": "ajaxpost.aspx", "method": "post", "style": "display:none;", "enctype": "multipart/form-data", "encoding": "multipart/form-data", "name": obj2.id };
        COMMON.addAttribute(obj2, attr, null, true);
        document.body.appendChild(obj2);
    }
    while (obj2.firstChild) {
        obj2.removeChild(obj2.firstChild);
    }
    //on ie9 you cannot stringify a JSON using innerHTML, you have to use this notation below so the whole object gets sent to the server. otherwise, the value property of the hidden field "dataRead" will only be "{"
    obj3 = document.createElement("input");
    obj3.type = "hidden";
    obj3.id = AJAXPOST.commandObjectKey;
    obj3.value = JSON.stringify(commandObj);
    obj3.setAttribute("name", obj3.id);
    obj2.appendChild(obj3);
    obj3 = document.createElement("input");
    obj3.type = "hidden";
    obj3.id = AJAXPOST.sendVarsObjectKey;
    obj3.value = JSON.stringify(sendVars);
    obj3.setAttribute("name", obj3.id);
    obj2.appendChild(obj3);
    return obj2;
};
AJAXPOST.zdetectPostComplete = function (requestType, postCompleteFunction, optionalData) {
    ///<summary>NOT FOR EXTERNAL USE** Checks that the Ajax request is complete and runs the function provided</summary>
    ///<param name="requestType" type="String">The type of request</param>
    ///<param name="postCompleteFunction" type="functionObject">a variable holding a function object that will be run in the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="optionalData" type="Object">Any object that will be passed to the continuing function</param>
    ///<returns type="String">The tokenId</returns>
    "use strict";
    var intervalHandle, cookieChecker, cookieObj, that;
    that = this;
    this.tokenId = requestType + String((new Date()).getTime());
    AJAXPOST.responseContainer[this.tokenId] = {};
    cookieChecker = function () {
        cookieObj = COMMON.readCookie(that.tokenId, true);
        if (cookieObj && cookieObj === String(that.tokenId)) {
            window.clearInterval(intervalHandle);
            AJAXPOST.responseContainer[that.tokenId].intervalHandle = null;
            if (document.getElementById(AJAXPOST.iFrameId).body) {
                AJAXPOST.responseContainer[that.tokenId].responseText = document.getElementById(AJAXPOST.iFrameId).body.innerHTML;
            } else {
                AJAXPOST.responseContainer[that.tokenId].responseText = "Post Completed";
            }
            if (postCompleteFunction) {
                postCompleteFunction(that.tokenId, optionalData);
            }
        }
    };
    this.startDetection = function () {
        intervalHandle = window.setInterval(cookieChecker, 100);
        AJAXPOST.responseContainer[that.tokenId].intervalHandle = intervalHandle;
    };
};
AJAXPOST.zIframeFormUpload = function (fileControlId, dataReadObj, onload) {
    ///<summary>NOT FOR EXTERNAL USE** Creates an IFrame and form element for browsers that are not HTML5 read
    ///<param name="fileControlId" type="String">The id of the file control to append to the form</param>
    ///<param name="dataReadObj" type="Object">The Object containing the data to pass to the Server</param>
    ///<param name="onload" type="String">(Optional)The script to run after iFrame is loaded</param>
    "use strict";
    var ajaxForm, obj1;
    ajaxForm = AJAXPOST.zcreateIFrame("fileupload", dataReadObj, onload);
    obj1 = document.getElementById(fileControlId);
    ajaxForm.appendChild(obj1);
    ajaxForm.submit();
};
AJAXPOST.reset = function () {
    ///<summary>Clears the response container and stops any intervals</summary>
    "use strict";
    var oneProp;
    if (!COMMON.objectIsEmpty(AJAXPOST.responseContainer)) {
        for (oneProp in AJAXPOST.responseContainer) {
            if (AJAXPOST.responseContainer.hasOwnProperty(oneProp) && AJAXPOST.responseContainer[oneProp].intervalHandle) {
                window.clearInterval(AJAXPOST.responseContainer[oneProp].intervalHandle);
            }
        }
    }
    AJAXPOST.responseContainer = {};
};
AJAXPOST.getResponse = function (tokenId) {
    ///<summary>(Also used internally by AJAXPOST) Returns the server response if any for a POST identified by the tokenId</summary>
    ///<param name="tokenId" type="String">The tokenId that represents the POST</param>
    ///<returns type="String">The response from the POST that may be the payload but may include error messaages</returns>
    "use strict";
    if (!AJAXPOST.responseContainer || !AJAXPOST.responseContainer.hasOwnProperty(tokenId) || !AJAXPOST.responseContainer[tokenId].responseText) { return null; }
    return AJAXPOST.responseContainer[tokenId].responseText;
};
AJAXPOST.callQuery = function (QueryIndex, Parameters, noResult, continuingFunction, optionalData) {
    ///<summary>calls remoteq.aspx to query SQL and return an XML file containing a JSON formatted string that is converted into the arrays AJAXPOST.columnNames and AJAXPOST.dataResults</summary>
    ///<param name="QueryIndex" type="String">The Name of the query described in the SQLConnect SQLS enum in the file SQLConnect.cs</param>
    ///<param name="Parameters" type="Object|String"> (Optional) Parameters used in the SQL query in SQLConnect.cs</param>
    ///<param name="noResult" type="Boolean">(Optional) Set to true if the query run does not return any results</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="optionalData" type="String">(Optional) any additional data to send to server, can be JSON.stringify</param>
    "use strict";
    //parameters will be passed as an array
    var sendVars, objJSON, i, tokenId;
    //create and object (sendVars) that can be turned into a JSON string
    sendVars = {};
    sendVars.queryid = String(QueryIndex);
    sendVars.optvals = [];
    sendVars.noresult = (noResult ? "1" : "0");
    if (Parameters && typeof Parameters === "string") { Parameters = [Parameters]; }
    if (Parameters && Parameters.length > 0) {
        for (i = 0; i < Parameters.length; i += 1) {
            Parameters[i] = String(Parameters[i]).replace("'", "&#39;");
        }
        sendVars.optvals = Parameters;
    }
    tokenId = AJAXPOST.zdoPost(AJAXPOST.requestType.SQLQuery.requestType, sendVars, null, continuingFunction, optionalData);
    if (noResult) { return; } //no result needed if there isn't any
    //turn the result into a JSON object (generic object) that was predefined in remoteq.aspx.cs
    objJSON = JSON.parse(AJAXPOST.getResponse(tokenId));
    AJAXPOST.columnNames = null;
    AJAXPOST.dataResults = [];
    if (objJSON.columns && objJSON.columns.length > 0) { AJAXPOST.columnNames = objJSON.columns; }//add columns to global AJAXPOST.columnNames
    if (!objJSON.rows || objJSON.rows.length === 0) { return; }//no rows then exit
    for (i = 0; i < objJSON.rows.length; i += 1) {
        AJAXPOST.dataResults.push(objJSON.rows[i]);
    }
};
AJAXPOST.uploadFile = function (fileControlID, destinationPath, action, destinationFileName, optionalData, continuingFunction) {
    ///<summary>Called to upload a file to the server</summary>
    ///<param name="fileControlId" type="String">The id of the file element</param>
    ///<param name="destinationPath" type="String">The path the file will be stored in the server relative to the web application</param>
    ///<param name="action" type="String">(Optional) a command to the server to run prior to saving the file</param>
    ///<param name="destinationFileName" type="String">(Optional) the name of the file when saved if omitted, the file will be named the same as the original name</param>
    ///<param name="optionalData" type="String">(Optional) any additional data to send to server, can be JSON.stringify</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<returns type="String">TokenId</returns>
    "use strict";
    var sendVars;
    action = AJAXPOST.zSetNullBlank(action);
    destinationFileName = AJAXPOST.zSetNullBlank(destinationFileName);
    optionalData = AJAXPOST.zSetNullBlank(optionalData);
    sendVars = { 'destinationPath': destinationPath, 'action': action, 'destinationFileName': destinationFileName, 'optionalData': optionalData, 'fileControlId': fileControlID };
    return AJAXPOST.zdoPost(AJAXPOST.requestType.FileUpload.requestType, sendVars, fileControlID, continuingFunction, optionalData);
};
AJAXPOST.saveImageToSQL = function (fileControlId, queryId, spParameters, indexOfImageInParameters, action, continuingFunction, optionalData) {
    ///<summary>Will upload an image file to the server and save it to SQL database</summary>
    ///<param name="fileControlId" type="String">The id of the file upload element (input type=file)</param>
    ///<param name="queryId" type="String">The name of the stored procedure, omitting pr_</param>
    ///<param name="spParameters" type="Array">An array containing the parameters to the stored procedure, including the parameter for the image</param>
    ///<param name="indexOfImageInParameters" type="Integer">The index of the parameter where the image will be sent to the SQL server</param>
    ///<param name="action" type="String">(Optional) an additional command to be sent to the server for custom action</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="optionalData" type="Any">(Optional)Any data that can be send in the continuingFunction</param>
    ///<returns type="String">TokenId</return>
    "use strict";
    var sendVars;
    action = AJAXPOST.zSetNullBlank(action);
    sendVars = { "spName": queryId, "spParameters": spParameters, "indexOfImageInParameters": indexOfImageInParameters, "fileControlId": fileControlId, "action": action };
    return AJAXPOST.zdoPost(AJAXPOST.requestType.ImageToSQL.requestType, sendVars, fileControlId, continuingFunction, optionalData);
};
AJAXPOST.downloadPDF = function (relativePathAndFileName, overrideFileName, action, optionalData, continuingFunction) {
    ///<summary>downloads PDF files from server</summary>
    ///<param name="relativePathAndFileName" type="String">The path and file name relative to the calling web page</param>
    ///<param name="overrideFileName" type="String">(Optional) overrides the name of the file for client download</param>
    ///<param name="action" type="String">(Optional) a command to the server to run prior to downloading the file</param>
    ///<param name="optionalData" type="String">(Optional) any additional data to send to server, can be JSON.stringify</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<returns type="String">TokenId</return>
    "use strict";
    var sendVars;
    overrideFileName = AJAXPOST.zSetNullBlank(overrideFileName);
    action = AJAXPOST.zSetNullBlank(action);
    optionalData = AJAXPOST.zSetNullBlank(optionalData);
    sendVars = { "pathAndFile": relativePathAndFileName, "action": action, "overrideFileName": overrideFileName, "optionalData": optionalData };
    return AJAXPOST.zdoPost(AJAXPOST.requestType.downloadPDF.requestType, sendVars, null, continuingFunction, optionalData);
};
AJAXPOST.commonExcel = function (data, title, columnnames, numberformatcolumns, continuingFunction) {
    ///<summary>Creates an Excel Download from tabular data</summary>
    ///<param name="data" type="Array of String Arrays">The data to display</param>
    ///<param name="title" type="String">The name of the spreadsheet</param>
    ///<param name="columnnames" type="Array of Strings">(Optional) Column header labels</param>
    ///<param name="numberformatcolumns" type="Array of Numbers">(Optional)Designates the columns that contain numerical data. First column is 0</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    "use strict";
    var sendVars;
    if (!COMMON.exists(columnnames)) { columnnames = []; }
    if (!COMMON.exists(numberformatcolumns)) { numberformatcolumns = []; }
    sendVars = { "data": data, "columnnames": columnnames, "title": title, "numbercolumns": numberformatcolumns };
    return AJAXPOST.zdoPost(AJAXPOST.requestType.commonExcel, sendVars, null, continuingFunction, null);
};
AJAXPOST.getFileList = function (parentFolder, includeSubFolders, extensionFilter, continuingFunction, optionalData, withMedia) {
    ///<summary>Gets a list of files that are in a directory</summary>
    ///<param name="parentFolder" type="String">the relative path to the folder where the files are stored</param>
    ///<param name="includeSubFolders" type="Boolean">(Optional) True will also list files from subfolders</param>
    ///<param name="extensionFilter" type="String">(Optional) a string represent the file extenstion search pattern filter (e.g. "*.txt")</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="optionalData" type="Any">(Optional)Any data that can be send in the continuingFunction</param>
    ///<param name="withMedia" type="Boolean">(Optional)Returns additional media data for videos</param>
    ///<returns type="Object">JSON object with an array listing all files</returns>
    "use strict";
    var sendVars, tokenId, rqType;
    //create and object (sendVars) that can be turned into a JSON string
    sendVars = { "parentFolder": parentFolder, "includeSubFolders": (includeSubFolders !== undefined && includeSubFolders !== null && includeSubFolders), "extensionFilter": (extensionFilter === undefined || (extensionFilter === null ? "*.*" : extensionFilter)) };
    rqType = (withMedia ? AJAXPOST.requestType.fileListMedia : AJAXPOST.requestType.fileList);
    tokenId = AJAXPOST.zdoPost(rqType.requestType, sendVars, null, continuingFunction, optionalData);
    //process the reply from the server
    //turn the result into a JSON object (generic object) that was predefined in remoteq.aspx.cs
    //public String parentFolder = "";
    //public Boolean includeSubFolders = false;
    //public String extensionFilter = "";
    //public List<string> fileList = null;
    return JSON.parse(AJAXPOST.getResponse(tokenId));
};
AJAXPOST.getCrystalReportStream = function (relativeReportFileName, params, outputFileName, action, optionalData, downloadCompleteFunction) {
    ///<summary>Runs a crystal report and sends it to user via response stream</summary>
    ///<param name="relativeReportFileName" type="String">The relative path and name of the report file</param>
    ///<param name="params" type="Array">The array containing the parameters for the report</param>
    ///<param name="outputFileName" type="String">The Name of the file when user downloads it</param>
    ///<param name="action" type="String">(Optional) A code used by ajaxpost.aspx for custom data</param>
    ///<param name="optionalData" type="String">(Optional) data sent to ajaxpost.aspx for custom application</param>
    ///<param name="downloadCompleteFunction" type="Object">(Optional) The function object that will run when file download is completed</param>
    ///<returns type="String">TokenId</returns>
    "use strict";
    var sendVars;
    action = AJAXPOST.zSetNullBlank(action);
    optionalData = AJAXPOST.zSetNullBlank(optionalData);
    //downloadFile property not use in streaming, use by crystalReportFile function
    sendVars = { "pathAndFile": relativeReportFileName, "parameters": params, "action": action, "outputFileName": outputFileName, "optionalData": optionalData, "downloadFile": false };
    return AJAXPOST.zdoPost(AJAXPOST.requestType.crystalReportStream.requestType, sendVars, null, downloadCompleteFunction, optionalData);
};
AJAXPOST.getCrystalReportSaveFile = function (relativeReportFileName, params, outputFileName, downloadFile, action, optionalData, downloadCompleteFunction) {
    ///<summary>Runs a crystal report and creates a file on the server (output directory and file name need to specified and server needs write rights to that directory</summary>
    ///<param name="relativeReportFileName" type="String">The relative path and name of the report file</param>
    ///<param name="params" type="Array">The array containing the parameters for the report</param>
    ///<param name="outputFileName" type="String">The relative path and name of the output file</param>
    ///<param name="downloadFile" type="Boolean">(Optional) If true will allow user to download the file after saved to hard drive</param>
    ///<param name="action" type="String">(Optional) A code used by ajaxpost.aspx for custom data</param>
    ///<param name="optionalData" type="String">(Optional) data sent to ajaxpost.aspx for custom application</param>
    ///<param name="downloadCompleteFunction" type="Object">(Optional) The function object that will run when file download is completed</param>
    "use strict";
    var sendVars;
    action = AJAXPOST.zSetNullBlank(action);
    optionalData = AJAXPOST.zSetNullBlank(optionalData);
    //downloadFile property not use in streaming, use by crystalReportFile function
    sendVars = { "pathAndFile": relativeReportFileName, "parameters": params, "action": action, "outputFileName": outputFileName, "optionalData": optionalData, "downloadFile": (downloadFile && typeof downloadFile === "boolean") };
    return AJAXPOST.zdoPost(AJAXPOST.requestType.crystalReportSave.requestType, sendVars, null, downloadCompleteFunction, optionalData);
};
AJAXPOST.customRequest = function (action, params, forDownload) {
    ///<summary>Sends a custom request to ajaxpost.aspx with params. Program ajaxpost.aspx.cs</summary>
    ///<param name="action" type="String">The name of the command to send to ajaxpost.aspx</param>
    ///<param name="params" type="Array">Array containing payload for the command</param>
    ///<param name="forDownload" type="Boolean">(Optional) if true will create an iframe to post as receive a download response</param>
    ///<returns type="String">The response from the server</returns>
    "use strict";
    var sendVars, tokenId;
    sendVars = { "param": params };
    if (forDownload === true) {
        action = { "requestType": action, "postType": "download" };
    }
    tokenId = AJAXPOST.zdoPost(action, sendVars);
    return AJAXPOST.getResponse(tokenId);
};