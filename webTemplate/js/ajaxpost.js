///<reference path="common.js" />
/*jslint browser: true, for: true, white: true, this: true*/
/*global FILLIN, COMMON, window*/
/*Ver 3.0 4/08/2016*/
var AJAXPOST = {};
///<var>array that holds the column names in orders from the query. deprecated but retained for backwards compatibility.  Use AJAXPost.responseContainer[tokenid].columnnames</var>
AJAXPOST.columnNames = null;
///<var>results in 2 dimensional array (array of arrays). deprecated but retained for backwards compatibility.  Use AJAXPost.responseContainer[tokenid].dataResults</var>
AJAXPOST.dataResults = null;
///<var>The id of the iFrame</var>
AJAXPOST.iFrameId = "ifrAjax";
///<var>The default ajax listener</var>
AJAXPOST.defaultListener = "ajaxpost.aspx";
///<var>The result which can be read in the continuing function</var>
AJAXPOST.responseText = "";
///<var>holds responses from server by tokenid</var>
AJAXPOST.responseContainer = {};
///<var>holds the default id for file upload control</var>
AJAXPOST.defaultFileControlId = "dfuAjaxPost";
///<var>holds the default id for the control that has the ajax command</var>
AJAXPOST.defaultCommandId = "commandobj";

AJAXPOST.protectedFunctions = {

    doPost: function (objectToSend, listener, continuingFunction) {
        /// <summary>NOT FOR EXTERNAL USE**Creates the post object</summary>
        /// <param name="objectToSend" type="Object Literal">The object that will post with the properties: command (string) - the command for the AJAX receiver, download (bool) downloading a file, payload (string) - a JSON stringified object unless this is a file upload where it will either be the control id or the control value as object</param>
        /// <param name="listener" type="string">The URL of the ajax listener</param>
        /// <param name="continuingFunction" type="Function Object">(Optional) The function to run once the ajax call is complete in the form function(response, optionalData){}</param>
        /// <returns type="Number">The Token id that is used to identify this call</returns>
        "use strict";
        //post that are for ie 9 and older or download type post need to be sent via iframe.
        //iframe posts can only be detected via checking a cookie for the unique token
        //iframe body will have the response from the call
        //other posts use XMLHttpRequest where the call and the response come from that object

        if (!COMMON.exists(listener) || listener === "") { listener = AJAXPOST.defaultListener; }
        AJAXPOST.responseContainer[objectToSend.tokenid] = {};
        if ((COMMON.ieVer <= 9 && objectToSend.upload) || objectToSend.download) {
            objectToSend.iframe = true;
            var ajaxForm = AJAXPOST.protectedFunctions.createIFrame(objectToSend, listener);
            ajaxForm.submit();
            if (COMMON.exists(continuingFunction)) {
                var postCompleteDetector = new AJAXPOST.protectedFunctions.PostCompleteDetector(objectToSend, continuingFunction, objectToSend.optionaldata);
                postCompleteDetector.startDetection();//continuing function is called from the postCompleteDetector
            }
            return objectToSend.tokenid;
        }

        var req = new XMLHttpRequest();
        req.open("POST", listener, false);
        if (COMMON.ieVer <= 9) {
            req.send(JSON.stringify(objectToSend));
        } else {
            var docObj = new FormData();
            if (objectToSend.upload) {
                var fileToSend = null;
                fileToSend = objectToSend.payload.fileobj.files[0];
                docObj.append(AJAXPOST.defaultFileControlId, fileToSend);
                objectToSend.payload.fileobj = null;
            }
            docObj.append(AJAXPOST.defaultCommandId, JSON.stringify(objectToSend));
            req.send(docObj);
        }
        if (COMMON.exists(req.response)) {
            AJAXPOST.responseContainer[objectToSend.tokenid].response = req.response;
        } else {
            AJAXPOST.responseContainer[objectToSend.tokenid].response = req.responseText;
        }
        if (COMMON.exists(continuingFunction)) {
            continuingFunction(AJAXPOST.responseContainer[objectToSend.tokenid].response, objectToSend.optionaldata);
        }
        return objectToSend.tokenid;
    },

    PostCompleteDetector: function (objectToSend, continuingFunction) {
        /// <summary>NOT FOR EXTERNAL USE***Creates an instance of the postCompleteDetector that checks the cookie to see that the post finished and calls the continuing function.  IFrame will post Async so a continuing function is required</summary>
        /// <param name="objectToSend" type="Object">Object Containing properties</param>
        /// <param name="continuingFunction" type="Function Object">(Optional) The function to run once the ajax call is complete in the formation function(response, optionalData){} where tokenid is a string that identifies the response</param>
        "use strict";
        var cookieChecker = function () {
            var cookieObj = COMMON.readCookie(objectToSend.tokenid);
            if (COMMON.exists(cookieObj) && cookieObj.tokenid === String(objectToSend.tokenid)) {
                if (COMMON.exists(AJAXPOST.responseContainer[objectToSend.tokenid].intervalHandle)) { window.clearInterval(AJAXPOST.responseContainer[objectToSend.tokenid].intervalHandle); }
                AJAXPOST.responseContainer[objectToSend.tokenid].response = cookieObj;
                continuingFunction(AJAXPOST.responseContainer[objectToSend.tokenid].response, objectToSend.optionalata);
            }
        };
        this.startDetection = function () {
            AJAXPOST.responseContainer[objectToSend.tokenid].intervalHandle = window.setInterval(cookieChecker, 100);
        };
    },

    createIFrame: function (objectToSend, listener) {
        /// <summary>NOT FOR EXTERNAL USE**Creates an iframe in the current document and posts the items</summary>
        /// <param name="objectToSend" type="Object Literal">The object that will post with the properties: command (string) - the command for the AJAX receiver, upload (bool) - uploading a file, download (bool) downloading a file, payload (string) - a JSON stringified object</param>
        /// <param name="listener" type="string">The URL of the ajax listener</param>
        /// <returns type="Element">The form element</returns>
        "use strict";
        var formId = "frmAjax";
        var attr;
        var iFrameObj = document.getElementById(AJAXPOST.iFrameId);
        if (!COMMON.exists(iFrameObj)) {
            iFrameObj = document.createElement("iframe");
            iFrameObj.id = AJAXPOST.iFrameId;
            attr = { "name": iFrameObj.id, "width": "0", "height": "0", "border": "0", "src": "", "style": "display:none;" };
            COMMON.addAttribute(iFrameObj, attr, null, true);
            document.body.appendChild(iFrameObj);
        }
        var formObj = document.getElementById(formId);
        if (!COMMON.exists(formObj)) {
            formObj = document.createElement("form");
            formObj.id = formId;
            attr = { "target": AJAXPOST.iFrameId, "action": listener, "method": "post", "style": "display:none;", "enctype": "multipart/form-data", "encoding": "multipart/form-data", "name": formObj.id };
            COMMON.addAttribute(formObj, attr, null, true);
            document.body.appendChild(formObj);
        }
        COMMON.clearParent(formId);
        //on ie9 you cannot stringify a JSON using innerHTML, you have to use this notation below so the whole object gets sent to the server. otherwise, the value property of the hidden field "dataRead" will only be "{"
        //for file upload, the object to send will have a string in the objectToSend.payload which will be the id of the control or will have the control value (as object)
        var hdObj = document.createElement("input");
        hdObj.type = "hidden";
        hdObj.id = AJAXPOST.defaultCommandId;
        hdObj.setAttribute("name", hdObj.id);
        if (objectToSend.upload) {
            formObj.appendChild(objectToSend.payload.fileobj);
        }
        hdObj.value = JSON.stringify(objectToSend);
        formObj.appendChild(hdObj);
        return formObj;
    },

    createObjectToSend: function (command, payload, action, optionaldata, download, upload) {
        "use strict";
        return {
            "command": command,
            "payload": payload,
            "download": (download === true),
            "upload": (upload === true),
            "action": (COMMON.exists(action) ? JSON.stringify(action) : ""),
            "optionaldata": (COMMON.exists(optionaldata) ? JSON.stringify(optionaldata) : ""),
            "tokenid": command + String((new Date()).getTime()),
            "iframe": false
        };
    },

    gridExcel: function (data, title, columnnames, numberformatcolumns) {
        ///<summary>Creates an Excel Download from tabular data</summary>
        ///<param name="data" type="Array of String Arrays">The data to display</param>
        ///<param name="title" type="String">The name of the spreadsheet</param>
        ///<param name="columnnames" type="Array of Strings">(Optional) Column header labels</param>
        ///<param name="numberformatcolumns" type="Array of Numbers">(Optional)Designates the columns that contain numerical data. First column is 0</param>
        ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
        "use strict";
        var objectToSend = this.createObjectToSend(
                "gridexcel",
                {
                    "columnnames": columnnames,
                    "title": (COMMON.exists(title) ? title : ""),
                    "data": (COMMON.exists(data) ? data : null),
                    "numbercolumns": (COMMON.exists(numberformatcolumns) ? numberformatcolumns : null)
                },
                null,
                null,
                true
            );
        this.doPost(objectToSend);
    }
};
AJAXPOST.reset = function () {
    ///<summary>Clears the response container and stops any intervals</summary>
    "use strict";
    if (!COMMON.objectIsEmpty(AJAXPOST.responseContainer)) {
        var keys = Object.keys(AJAXPOST.responseContainer);
        var i;
        for (i = 0; i < keys.length; i += 1) {
            window.clearInterval(AJAXPOST.responseContainer[keys[i]].intervalHandle);
        }
    }
    AJAXPOST.responseContainer = {};
};
AJAXPOST.getResponse = function (TokenId) {
    ///<summary>Returns the server response if any for a POST identified by the tokenId</summary>
    ///<param name="tokenId" type="String">The tokenId that represents the POST</param>
    ///<returns type="String">The response from the POST that may be the payload but may include error messaages</returns>
    "use strict";
    if (!COMMON.exists(AJAXPOST.responseContainer[TokenId]) || !COMMON.exists(AJAXPOST.responseContainer[TokenId].response)) { return null; }
    return AJAXPOST.responseContainer[TokenId].response;
};
AJAXPOST.callQuery = function (StoredProcedureName, Parameters, NoResult, ContinuingFunction, OptionalData, Listener) {
    ///<summary>sends SQL stored Procedure calls only</summary>
    ///<param name="StoredProcedureName" type="String">The Name of the Stored Procedure without the leading pr_</param>
    ///<param name="Parameters" type="Array|String"> (Optional) Parameters of the stored procedure</param>
    ///<param name="NoResult" type="Boolean">(Optional) Set to true if the query run does not return any results</param>
    ///<param name="ContinuingFunction" type="Function">(Optional)The script to run after the query completes the pattern of  function(response, optionalData){} see the returns field for information on the return object format</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param>
    ///<returns type="Object">response object as {haserror:bool, errormessage:string, payload:{columns:[array of column name], "rows": [array of row arrays]}}</returns>
    "use strict";
    //handle parameters
    var i;
    if (COMMON.exists(Parameters) && typeof Parameters === "string") { Parameters = [Parameters]; }
    if (COMMON.exists(Parameters) && Parameters.length > 0) {
        for (i = 0; i < Parameters.length; i += 1) {
            Parameters[i] = String(Parameters[i]).replace(/\'/g, "&#39;");
        }
    } else {
        Parameters = null;
    }
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "query",
            {
                "sp": StoredProcedureName,
                "noresult": (NoResult === true),
                "parameters": Parameters
            },
            null,
            OptionalData
        );
    AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction, OptionalData);
    var resp = JSON.parse(AJAXPOST.getResponse(objectToSend.tokenid));
    var JSONRes = {};
    if (NoResult) {
        resp.payload = JSONRes;
        return resp;
    }
    var results = JSON.parse(resp.payload);
    JSONRes.columns = (COMMON.exists(results.columns) ? results.columns : null);
    JSONRes.rows = (COMMON.exists(results.rows) ? results.rows : null);
    resp.payload = JSONRes;

    //this section to be deprecated but kept for backwards compatability
    AJAXPOST.columnNames = null;
    AJAXPOST.dataResults = [];
    if (COMMON.exists(results.columns) && results.columns.length > 0) { AJAXPOST.columnNames = results.columns; }//add columns to global AJAXPOST.columnNames
    if (COMMON.exists(results.rows) && results.rows.length > 0) {
        for (i = 0; i < results.rows.length; i += 1) {
            AJAXPOST.dataResults.push(results.rows[i]);
        }
    }
    return resp;
};
AJAXPOST.uploadFile = function (FileControlIDorObj, DestinationPath, Action, DestinationFileName, OptionalData, ContinuingFunction, Listener) {
    ///<summary>Called to upload a file to the server. if ie version <= 9, will be an async iframe post.  Use continuing function to get results</summary>
    ///<param name="FileControlIDorObj" type="String">The id of the file element or the value of the element</param>
    ///<param name="DestinationPath" type="String">The path the file will be stored in the server relative to the web application</param>
    ///<param name="Action" type="String">(Optional) a command to the server to run prior to saving the file</param>
    ///<param name="DestinationFileName" type="String">(Optional) the name of the file when saved if omitted, the file will be named the same as the original name</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after the query completes the pattern of function(response, optionalData){} see the returns field for information on the return object format</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param>
    ///<returns type="Object">response object as {haserror:bool, errormessage:string, payload:string}</returns>
    "use strict";
    var fileObj = null;
    if (typeof FileControlIDorObj === "string") {
        fileObj = document.getElementById(FileControlIDorObj);
    } else {
        fileObj = FileControlIDorObj.obj;
    }
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "fileupload",
            {
                "destinationpath": DestinationPath,
                "destinationfilename": (COMMON.exists(DestinationFileName) ? DestinationFileName : ""),
                "fileobj": fileObj,
                "controlid": AJAXPOST.defaultFileControlId
            },
            Action,
            OptionalData,
            false,
            true
        );
    AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction, OptionalData);
    return JSON.parse(AJAXPOST.getResponse(objectToSend.tokenid));
};
AJAXPOST.downloadFile = function (RelativePathAndFileName, OverrideFileName, Action, OptionalData, ContinuingFunction, Listener) {
    "use strict";
    ///<summary>downloads files from server (PDF, MP4 supported only) Always an async IFrame post.  Use continuingFunction to detect result</summary>
    ///<param name="RelativePathAndFileName" type="String">The path and file name relative to the calling web page</param>
    ///<param name="OverrideFileName" type="String">(Optional) overrides the name of the file for client download</param>
    ///<param name="Action" type="String">(Optional) a command to the server to run prior to downloading the file</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of function(response, optionalData){}.</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param>
    ///<returns type="sring">Token Id of the response</returns>
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "downloadfile",
            {
                "pathandfile": RelativePathAndFileName,
                "overridefilename": (COMMON.exists(OverrideFileName) ? OverrideFileName : "")
            },
            Action,
            OptionalData,
            true
        );
    return AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction, OptionalData);
};
AJAXPOST.downloadPDF = function (relativePathAndFileName, overrideFileName, action, optionalData, continuingFunction) {
    ///<summary>DEPRECATED, use AJAXPOST.downloadFile</summary>
    ///<param name="relativePathAndFileName" type="String">The path and file name relative to the calling web page</param>
    ///<param name="overrideFileName" type="String">(Optional) overrides the name of the file for client download</param>
    ///<param name="action" type="String">(Optional) a command to the server to run prior to downloading the file</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="continuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of function(response, optionalData){}.</param>
    ///<returns type="String">TokenId</return>
    "use strict";
    return AJAXPOST.downloadFile(relativePathAndFileName, overrideFileName, action, optionalData, continuingFunction);
};
AJAXPOST.getFileList = function (ParentFolder, IncludeSubFolders, ExtensionFilter, ContinuingFunction, OptionalData, WithMedia, Listener) {
    ///<summary>Gets a list of files that are in a directory</summary>
    ///<param name="ParentFolder" type="String">the relative path to the folder where the files are stored</param>
    ///<param name="IncludeSubFolders" type="Boolean">(Optional) True will also list files from subfolders</param>
    ///<param name="ExtensionFilter" type="String">(Optional) a string represent the file extenstion search pattern filter (e.g. "*.txt")</param>
    ///<param name="ContinuingFunction" type="Function">(Optional)The script to run after iFrame is loaded. In the pattern of format function(tokenId, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="WithMedia" type="Boolean">(Optional)Returns additional media data for videos</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param>    
    ///<returns type="Object">response object as {haserror:bool, errormessage:string, payload:array of objects} payload object has string properties: filename, filetype, filesize, filedate, path, frameheight, framewidth</returns>
    "use strict";
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "filelist",
            {
                "parentfolder": ParentFolder,
                "includesubfolders": (IncludeSubFolders === true),
                "extensionfilter": (COMMON.exists(ExtensionFilter) ? ExtensionFilter : "*.*"),
                "withmedia": (WithMedia === true)
            },
            null,
            OptionalData
        );
    AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction, OptionalData);
    var results = JSON.parse(AJAXPOST.getResponse(objectToSend.tokenid));
    var payload = JSON.parse(results.payload);
    results.payload = payload;
    return results;
};
AJAXPOST.saveImageToSQL = function (FileControlIDorObj, StoredProcedureName, Parameters, ImageParameterIndex, Action, OptionalData, ContinuingFunction, Listener) {
    ///<summary>Will upload an image file to the server and save it to SQL database</summary>
    ///<param name="FileControlIDorObj" type="String">The id of the file element or the value of the element</param>
    ///<param name="StoredProcedureName" type="String">The name of the stored procedure, omitting pr_</param>
    ///<param name="Parameters" type="Array">An array containing the parameters to the stored procedure, Leave the parameter of the image empty</param>
    ///<param name="ImageParameterIndex" type="Integer">The index of the parameter where the image will be sent to the SQL server</param>
    ///<param name="Action" type="String">(Optional) an additional command to be sent to the server for custom action</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="ContinuingFunction" type="Function">(Optional)The script to run after command is completed. In the pattern of function(response, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<returns type="Object">response object as {haserror:bool, errormessage:string, payload:string}</returns>
    "use strict";
    var fileObj = null;
    if (typeof FileControlIDorObj === "string") {
        fileObj = document.getElementById(FileControlIDorObj);
    } else {
        fileObj = FileControlIDorObj.obj;
    }
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "imagetosql",
            {
                "sp": StoredProcedureName,
                "fileobj": fileObj,
                "parameters": Parameters,
                "imageparameterindex": ImageParameterIndex,
                "controlid": AJAXPOST.defaultFileControlId
            },
            Action,
            OptionalData,
            false,
            true
        );
    AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction, OptionalData);
    return JSON.parse(AJAXPOST.getResponse(objectToSend.tokenid));
};
AJAXPOST.crystalReport = function (RelativeReportFileName, Parameters, OutputFileName, SaveFile, OutputPath, DownloadFile, Action, OptionalData, ContinuingFunction, Listener) {
    ///<summary>Runs a crystal report and sends it to user via response stream</summary>
    ///<param name="RelativeReportFileName" type="String">The relative path and name of the report file</param>
    ///<param name="Params" type="Array">The array containing the parameters for the report</param>
    ///<param name="OutputFileName" type="String">The Name of the file when user downloads it</param>
    ///<param name="SaveFile" type="Boolean">(Optional) If true will save the file on Server, requires Output path if true</param>
    ///<param name="OutputPath" type="String">(Optional) Ignored if SaveFile is not true. The relative path the file will be saved to</param>
    ///<param name="DownloadFile" type="boolean">(Optional) Ignored if SaveFile is not true. If true will download the file after saving</param>
    ///<param name="Action" type="String">(Optional) an additional command to be sent to the server for custom action</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="ContinuingFunction" type="Function">(Optional)The script to run after command is completed. In the pattern of function(response, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param> 
    ///<returns type="string">Token Id of the response</returns>
    "use strict";
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "crystalreport",
            {
                "reportfile": RelativeReportFileName,
                "parameters": Parameters,
                "outputfilename": OutputFileName,
                "savefile": (SaveFile === true && COMMON.exists(OutputPath) && OutputPath !== ""),
                "outputpath": (COMMON.exists(OutputPath) ? OutputPath : "")
            },
            Action,
            OptionalData,
            DownloadFile
        );
    return AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction, OptionalData);
};
AJAXPOST.getCrystalReportStream = function (relativeReportFileName, params, outputFileName, action, optionalData, downloadCompleteFunction) {
    ///<summary>Deprecated. Use AJAXPOST.crystalReport</summary>
    ///<param name="relativeReportFileName" type="String">The relative path and name of the report file</param>
    ///<param name="params" type="Array">The array containing the parameters for the report</param>
    ///<param name="outputFileName" type="String">The Name of the file when user downloads it</param>
    ///<param name="action" type="String">(Optional) A code used by ajaxpost.aspx for custom data</param>
    ///<param name="optionalData" type="String">(Optional) data sent to ajaxpost.aspx for custom application</param>
    ///<param name="downloadCompleteFunction" type="Object">(Optional) The function object that will run when file download is completed</param>
    ///<returns type="String">TokenId</returns>
    "use strict";
    return AJAXPOST.crystalReport(relativeReportFileName, params, outputFileName, false, null, null, action, optionalData, downloadCompleteFunction);
};
AJAXPOST.getCrystalReportSaveFile = function (relativeReportFileName, params, outputFileName, downloadFile, action, optionalData, downloadCompleteFunction) {
    ///<summary>>Deprecated. Use AJAXPOST.crystalReport</summary>
    ///<param name="relativeReportFileName" type="String">The relative path and name of the report file</param>
    ///<param name="params" type="Array">The array containing the parameters for the report</param>
    ///<param name="outputFileName" type="String">The relative path and name of the output file</param>
    ///<param name="downloadFile" type="Boolean">(Optional) If true will allow user to download the file after saved to hard drive</param>
    ///<param name="action" type="String">(Optional) A code used by ajaxpost.aspx for custom data</param>
    ///<param name="optionalData" type="String">(Optional) data sent to ajaxpost.aspx for custom application</param>
    ///<param name="downloadCompleteFunction" type="Object">(Optional) The function object that will run when file download is completed</param>
    "use strict";
    return AJAXPOST.crystalReport(relativeReportFileName, params, outputFileName, true, "", downloadFile, action, optionalData, downloadCompleteFunction);
};
AJAXPOST.excel = function (StoredProcedure, Parameters, Title, NumberColumns, OutputFileName, Action, OptionalData, ContinuingFunction, Listener) {
    ///<summary>Creates an Excel File from a SQL result set</summary>
    ///<param name="StoredProcedureName" type="String">The name of the stored procedure, omitting pr_</param>
    ///<param name="Parameters" type="Array">An array containing the parameters to the stored procedure, Leave the parameter of the image empty</param
    ///<param name="Title" type="String">(Optional) Title for the top of the Spreadsheet</param>
    ///<param name="NumberColumns" type="Array">An array of numbers which shows which columns will be formatted as numbers, zero based index</param>
    ///<paran name="OutputFileName" type="String">The name of the excel file after downloading</param> 
    ///<param name="Action" type="String">(Optional) an additional command to be sent to the server for custom action</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="ContinuingFunction" type="Function">(Optional)The script to run after command is completed. In the pattern of function(response, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param> 
    ///<returns type="string">Token Id of the response</returns>
    "use strict";
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            "excel",
            {
                "storedprocedure": StoredProcedure,
                "parameters": (COMMON.exists(Parameters) ? Parameters : null),
                "title": (COMMON.exists(Title) ? Title : ""),
                "numbercolumns": (COMMON.exists(NumberColumns) ? NumberColumns : null),
                "filename": OutputFileName
            },
            Action,
            OptionalData,
            true
        );
    return AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction);
};
AJAXPOST.customRequest = function (Command, Parameters, Download, OptionalData, ContinuingFunction, Listener) {
    ///<summary>Send a Custom command to Listener. requires code change in Listener</summary>
    ///<param name="Command" type="String">The Action</param>
    ///<param name="Parameters" type="Array">Any data to send to server</param>
    ///<param name="Download" type="Boolean">(Optional) Set to true if the command causes a download</param>
    ///<param name="OptionalData" type="String">(Optional)Any additional data to pass to the server and the continuing function</param>
    ///<param name="ContinuingFunction" type="Function">(Optional)The script to run after command is completed. In the pattern of function(response, optionalData){}. Use token id in AJAXPOST.getResponse(tokenId) to get the response</param>
    ///<param name="Listener" type="String">(Optional)Defaults to AJAXPOST.defaultListener.  The URL the listens to the AJAX post</param> 
    ///<returns type="Object|String">response object as {haserror:bool, errormessage:string, payload:string} unless this action causes a download which will return only the token id</returns>
    "use strict";
    if (COMMON.exists(Parameters)) {
        Parameters.forEach(function (item, index) {
            Parameters[index] = String(item);
        });
    }
    var objectToSend = AJAXPOST.protectedFunctions.createObjectToSend(
            Command,
            {
                "parameters": (COMMON.exists(Parameters) ? Parameters : null)
            },
            null,
            OptionalData,
            (Download === true)
        );
    AJAXPOST.protectedFunctions.doPost(objectToSend, Listener, ContinuingFunction);
    if (Download === true) {
        return objectToSend.tokenid;
    }
    return JSON.parse(AJAXPOST.getResponse(objectToSend.tokenid));
};