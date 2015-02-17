///<reference path="common.js" />
//Used to query using pre established sql queries
/*jslint browser: true, plusplus: true */
/*global FILLIN, COMMON*/
/*Ver 1.1.0 01/23/2015*/
var AJAXPOST = {};
///<var>array that holds the column names in orders from the query</var>
AJAXPOST.columnNames = null;
///<var>results in 2 dimensional array (array of arrays)</var>
AJAXPOST.dataResults = null;
///<var>The id of the iFrame</var>
AJAXPOST.iFrameId = "ifrAjax";
AJAXPOST.zdoPost = function (formDataPairs) {
    ///<summary>NOT FOR EXTERNAL USE**performs an XMLHTTPRequest synchronous post with form data</summary>
    ///<param name="formDataPairs" type="LiteralObject|FormData">Literal Object containing key=value pairs that will be posted</param>
    ///<returns type="String">The XMLHttpRequest.response property</returns>
    "use strict";
    var thisRequest;
    thisRequest = new XMLHttpRequest();
    thisRequest.open("POST", "ajaxpost.aspx", false);
    thisRequest.send(formDataPairs.hasOwnProperty("reqType") ? JSON.stringify(formDataPairs) : formDataPairs);
    if (thisRequest.response) {
        return thisRequest.response;
    }
    return thisRequest.responseText;
};
AJAXPOST.zSetNullBlank = function (valueIn) {
    ///<summary>NOT FOR EXTERNAL USE**changes null or undefined string variables to empty string</summary>
    ///<param name="valueIn" type="String">The value to check</param>
    ///<returns type="String" />
    "use strict";
    return (valueIn === undefined || valueIn === null ? "" : valueIn);
};
AJAXPOST.zcreateIFrame = function (reqType, dataReadObj, onload) {
    ///<summary>NOT FOR EXTERNAL USE**Creates an IFrame for use with posting asynchronously</summary>
    ///<param name="reqType" type="String">The command to send to ajaxpost.aspx</param>
    ///<param name="dataReadObj" type="Object">Literal object to send to server as JSON with the key of dataRead</param>
    ///<param name="onload" type="String">(Optional)The script to run after iFrame is loaded</param>
    ///<returns type="Element">The form element</returns>
    "use strict";
    var obj1, obj2, obj3, attr, formId, hidReqTypeId, hidDataReadId;
    formId = "frmAjax";
    hidReqTypeId = "reqType";
    hidDataReadId = "dataRead";
    obj1 = document.getElementById(AJAXPOST.iFrameId);
    if (!obj1) {
        obj1 = document.createElement("iframe");
        obj1.id = AJAXPOST.iFrameId;
        attr = { "name": obj1.id, "width": "0", "height": "0", "border": "0", "src": "", "style": "display:none;" };
        COMMON.addAttribute(obj1, attr, null, true);
        document.body.appendChild(obj1);
    }
    if (onload !== undefined && onload !== null) {
        obj1.setAttribute("onload", onload);
    } else {
        obj1.setAttribute("onload", "");
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
    obj2.innerHTML += "<input type=\"hidden\" id=\"" + hidReqTypeId + "\" name=\"" + hidReqTypeId + "\" value=\"" + reqType + "\" />";
    //on ie9 you cannot stringify a JSON using innerHTML, you have to use this notation below so the whole object gets sent to the server. otherwise, the value property of the hidden field "dataRead" will only be "{"
    obj3 = document.createElement("input");
    obj3.type = "hidden";
    obj3.id = hidDataReadId;
    obj3.value = JSON.stringify(dataReadObj);
    obj3.setAttribute("name", obj3.id);
    obj2.appendChild(obj3);
    return obj2;
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
AJAXPOST.callQuery = function (QueryIndex, Parameters, noResult) {
    ///<summary>calls remoteq.aspx to query SQL and return an XML file containing a JSON formatted string that is converted into the arrays AJAXPOST.columnNames and AJAXPOST.dataResults</summary>
    ///<param name="QueryIndex" type="String">The Name of the query described in the SQLConnect SQLS enum in the file SQLConnect.cs</param>
    ///<param name="Parameters" type="Object|String"> (Optional) Parameters used in the SQL query in SQLConnect.cs</param>
    ///<param name="noResult" type="Boolean">(Optional) Set to true if the query run does not return any results</param>
    "use strict";
    //parameters will be passed as an array
    var sendVars, objJSON, i, JSONText, docOutObj;
    //create and object (sendVars) that can be turned into a JSON string
    sendVars = {};
    sendVars.queryid = String(QueryIndex);
    sendVars.optvals = [];
    sendVars.noresult = (noResult ? "1" : "0");
    if (Parameters && typeof Parameters === "string") { Parameters = [Parameters]; }
    if (Parameters && Parameters.length > 0) {
        for (i = 0; i < Parameters.length; i++) {
            Parameters[i] = String(Parameters[i]).replace("'", "&#39;");
        }
        sendVars.optvals = Parameters;
    }
    sendVars = JSON.stringify(sendVars);
    //add items to request Doc
    docOutObj = { "reqType": "query", "dataRead": sendVars };
    //send request to server with post
    JSONText = AJAXPOST.zdoPost(docOutObj);
    //process the reply from the server
    if (noResult) { return; } //no result needed if there isn't any
    //turn the result into a JSON object (generic object) that was predefined in remoteq.aspx.cs
    objJSON = JSON.parse(JSONText);
    AJAXPOST.columnNames = null;
    AJAXPOST.dataResults = [];
    if (objJSON.columns && objJSON.columns.length > 0) { AJAXPOST.columnNames = objJSON.columns; }//add columns to global AJAXPOST.columnNames
    if (!objJSON.rows || objJSON.rows.length === 0) { return; }//no rows then exit
    for (i = 0; i < objJSON.rows.length; i++) {
        AJAXPOST.dataResults.push(objJSON.rows[i]);
    }
};
AJAXPOST.uploadFile = function (fileControlID, destinationPath, action, destinationFileName, optionalData, onload) {
    ///<summary>Called to upload a file to the server</summary>
    ///<param name="fileControlId" type="String">The id of the file element</param>
    ///<param name="destinationPath" type="String">The path the file will be stored in the server relative to the web application</param>
    ///<param name="action" type="String">(Optional) a command to the server to run prior to saving the file</param>
    ///<param name="destinationFileName" type="String">(Optional) the name of the file when saved if omitted, the file will be named the same as the original name</param>
    ///<param name="optionalData" type="String">(Optional) any additional data to send to server, can be JSON.stringify</param>
    ///<param name="onload" type="String">(Optional)The script to run after iFrame is loaded, ignored if ie version >= 10</param>
    ///<returns type="String">A message from the server after completion</return>
    "use strict";
    var docObj, sendVars, fileToSend;
    action = AJAXPOST.zSetNullBlank(action);
    destinationFileName = AJAXPOST.zSetNullBlank(destinationFileName);
    optionalData = AJAXPOST.zSetNullBlank(optionalData);
    sendVars = { 'destinationPath': destinationPath, 'action': action, 'destinationFileName': destinationFileName, 'optionalData': optionalData, 'fileControlId': fileControlID };
    if (window.FormData === undefined) {
        AJAXPOST.zIframeFormUpload(fileControlID, sendVars, onload);
        return document.getElementById(AJAXPOST.iFrameId).body.innerHTML;
    }
    docObj = new FormData();
    docObj.append("reqType", "fileupload");
    fileToSend = COMMON.getFileValue(fileControlID).file;
    docObj.append(fileControlID, fileToSend);
    docObj.append("dataRead", JSON.stringify(sendVars));
    return AJAXPOST.zdoPost(docObj);
};
AJAXPOST.saveImageToSQL = function (fileControlId, queryId, spParameters, indexOfImageInParameters, action, onload) {
    ///<summary>Will upload an image file to the server and save it to SQL database</summary>
    ///<param name="fileControlId" type="String">The id of the file upload element (input type=file)</param>
    ///<param name="queryId" type="String">The name of the stored procedure, omitting pr_</param>
    ///<param name="spParameters" type="Array">An array containing the parameters to the stored procedure, including the parameter for the image</param>
    ///<param name="indexOfImageInParameters" type="Integer">The index of the parameter where the image will be sent to the SQL server</param>
    ///<param name="action" type="String">(Optional) an additional command to be sent to the server for custom action</param>
    ///<param name="onload" type="String">(Optional)The script to run after iFrame is loaded, ignored if ie version >= 10</param>
    "use strict";
    var docObj, sendVars, ajaxForm, obj1, fileToSend;
    action = AJAXPOST.zSetNullBlank(action);
    sendVars = { "spName": queryId, "spParameters": spParameters, "indexOfImageInParameters": indexOfImageInParameters, "fileControlId": fileControlId, "action": action };
    if (window.FormData === undefined) {
        //ie 9 or less        
        ajaxForm = AJAXPOST.zcreateIFrame("imagetosql", sendVars, onload);
        obj1 = document.getElementById(fileControlId);
        ajaxForm.appendChild(obj1);
        ajaxForm.submit();
        return;
    }
    docObj = new FormData();
    docObj.append("reqType", "imagetosql");
    fileToSend = COMMON.getFileValue(fileControlId).file;
    docObj.append(fileControlId, fileToSend);
    docObj.append("dataRead", JSON.stringify(sendVars));
    AJAXPOST.zdoPost(docObj);
};
AJAXPOST.downloadPDF = function (relativePathAndFileName, overrideFileName, action, optionalData) {
    ///<summary>downloads PDF files from server</summary>
    ///<param name="relativePathAndFileName" type="String">The path and file name relative to the calling web page</param>
    ///<param name="overrideFileName" type="String">(Optional) overrides the name of the file for client download</param>
    ///<param name="action" type="String">(Optional) a command to the server to run prior to downloading the file</param>
    ///<param name="optionalData" type="String">(Optional) any additional data to send to server, can be JSON.stringify</param>
    "use strict";
    var sendVars, ajaxForm;
    overrideFileName = AJAXPOST.zSetNullBlank(overrideFileName);
    action = AJAXPOST.zSetNullBlank(action);
    optionalData = AJAXPOST.zSetNullBlank(optionalData);
    sendVars = { "pathAndFile": relativePathAndFileName, "action": action, "overrideFileName": overrideFileName, "optionalData": optionalData };
    ajaxForm = AJAXPOST.zcreateIFrame("downloadPDF", sendVars);
    ajaxForm.submit();
};
AJAXPOST.getFileList = function (parentFolder, includeSubFolders, extensionFilter) {
    ///<summary>Gets a list of files that are in a directory</summary>
    ///<param name="parentFolder" type="String">the relative path to the folder where the files are stored</param>
    ///<param name="includeSubFolders" type="Boolean">(Optional) True will also list files from subfolders</param>
    ///<param name="extensionFilter" type="String">(Optional) a string represent the file extenstion search pattern filter (e.g. "*.txt")</param>
    ///<returns type="Object">JSON object with an array listing all files</returns>
    "use strict";
    var sendVars, objJSON, JSONText, docOutObj;
    //create and object (sendVars) that can be turned into a JSON string
    sendVars = { "parentFolder": parentFolder, "includeSubFolders": (includeSubFolders !== undefined && includeSubFolders !== null && includeSubFolders), "extensionFilter": (extensionFilter === undefined || extensionFilter === null ? "*.*" : extensionFilter) };
    sendVars = JSON.stringify(sendVars);
    //add items to request Doc
    docOutObj = { "reqType": "fileList", "dataRead": sendVars };
    //send request to server with post
    JSONText = AJAXPOST.zdoPost(docOutObj);
    //process the reply from the server
    //turn the result into a JSON object (generic object) that was predefined in remoteq.aspx.cs
    //public String parentFolder = "";
    //public Boolean includeSubFolders = false;
    //public String extensionFilter = "";
    //public List<string> fileList = null;
    objJSON = JSON.parse(JSONText);
    return objJSON;
};