using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;
using System.Xml;
using SQLConnectLibrary;
using CrystalReportOutput;

namespace webTemplate
{
    public partial class ajaxpost : System.Web.UI.Page
    {
        //***********************************************************************************//
        // Requires Reference to Extension System.Web.Helpers and Microsoft.CSharp           //
        //***********************************************************************************//
        Boolean HasNoOutput = false; //from the request, whether the query has an output or not
        String queryId = ""; //from the request, the query to run
        String[] optvals = null; //the parameters of the query
        SQLConnect.DataOut DOResults = null;
        private int MaxFileSize = 5000000; //5MB is max size of uploaded files

        protected void Page_Load(object sender, EventArgs e)
        {
            String input = "";
            InitialObj initObj = null;
            if (Request.Params["reqType"] == null)
            {
                int streamLen = Convert.ToInt32(Request.InputStream.Length);
                if (streamLen > 0)
                {
                    var StreamBytes = new Byte[streamLen];
                    int bytesRead = Request.InputStream.Read(StreamBytes, 0, streamLen);
                    for (int i = 0; i < streamLen; i++)
                    {
                        input += Convert.ToChar(StreamBytes[i]).ToString();
                    }
                    initObj = System.Web.Helpers.Json.Decode(input, typeof(InitialObj));
                }
            }
            else
            {
                initObj = new InitialObj();
                initObj.reqType = Request.Params["reqType"];
                initObj.dataRead = Request.Params["dataRead"];
            }
            switch (initObj.reqType)
            {
                case "query":
                    queryRequested(initObj.dataRead);
                    return;
                case "fileupload":
                    doFileUpload(initObj.dataRead);
                    return;
                case "downloadPDF":
                    doDownloadPDF(initObj.dataRead);
                    return;
                case "fileList":
                    getFileList(initObj.dataRead);
                    return;
                case "imagetosql":
                    doImageToSQL(initObj.dataRead);
                    return;
            }

        }
        private class InitialObj
        {
            public String reqType = "";
            public String dataRead = "";
        }
        private void queryRequested(String JSONData)
        {
            //change the incoming JSON text stream to a dr object
            //the JSON object has 3 values
            //1 - queryid, type = number - the enum name or enum number of the query to use in SQLConnect
            //2 - optvals, type = String Array - the variable values place in SQL statement in SQLConnect
            //3 - noResult, type = Boolean/Bit (allowable values (1, 0, null, undefined) - true if the SQL statement returns no values otherwise false. If this value is missing (null, undefined) assume false
            DataRead dr = System.Web.Helpers.Json.Decode(JSONData, typeof(DataRead));
            //set global variables
            queryId = dr.queryid;
            optvals = dr.optvals;
            HasNoOutput = (dr.noresult == 1);
            //do query
            if (!runQuery()) { return; }
            //return result if available
            if (!HasNoOutput)
            {
                //convert the object to JSON
                var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                String strOut = oSerializer.Serialize(DOResults); //JSON.stringify
                strOut = strOut.Replace("&", "&amp;");
                Response.Write(strOut);
                Response.End();
            }
        }

        
        private Boolean runQuery()
        {
            //custom queries in the pattern if (queryId == "[queryname]") { return function boolean(); }

            //queries that have sqls
            SQLHelper.SQLS thisSQL;
            if (Enum.TryParse<SQLHelper.SQLS>(queryId, false, out thisSQL))
            {
                if (HasNoOutput)
                {
                    return SQLHelper.doQuery(thisSQL, optvals, SQLConnectLibrary.SQLConnect.outputType.noOutput);
                }
                if (!SQLHelper.doQuery(thisSQL, optvals, SQLConnectLibrary.SQLConnect.outputType.forRemoteQ)) { return false; }
                DOResults = SQLHelper.DOResults;
                return true;
            }

            //run the query
            if (HasNoOutput)
            {
                return SQLHelper.doSPQuery(queryId, optvals, SQLConnect.outputType.noOutput);
            }
            if (!SQLHelper.doSPQuery(queryId, optvals, SQLConnect.outputType.forRemoteQ)) { return false; }
            DOResults = SQLHelper.DOResults;
            return true;
        }
        private class DataRead
        {
            //object version of incomming JSON string
            private List<String> pOptvals = new List<string>();
            public String queryid = "";
            public int noresult = 0;
            public string[] optvals
            {
                get
                {
                    return (pOptvals.Count == 0 ? null : pOptvals.ToArray());
                }
                set
                {
                    setArray(value);
                }
            }
            private void setArray(String[] strInput)
            {
                if (strInput != null && strInput.GetLength(0) > 0)
                {
                    for (int i = 0; i < strInput.GetLength(0); i++)
                    {
                        pOptvals.Add(strInput[i]);
                    }
                }
            }
        }
        #region "File Upload"
        private void doFileUpload(String JSONData)
        {
            ActionData ad = System.Web.Helpers.Json.Decode(JSONData, typeof(ActionData));
            //the POST will contain parameters and a file
            //parameters:
            //  detinationPath - the relative path to where the file will be stored
            //  action - (Optional) if given, will redirect so that additional action will be performed on the data.  A function should be created that returns true in order to continue and proceed to saving the file
            //  destinationFileName - (Optional) if given, the file will be named with the given string instead of the name of the source file
            //  optionalData - (Optional) a JSON string that can be serialized to help the action item

            //init error message
            errorLevels errLev = errorLevels.noError;
            String exceptionMessage = "";

            //place action function here in the format: if (action == [actionname]) { if (!actionfunction(optionalData)){errlev = errorLevels.actionFalse;}}
            //action = ad.action
            String strJSON = ad.optionalData;

            if (errLev == errorLevels.noError)
            {
                //determine destination name
                var pf = (HttpPostedFile)Request.Files[ad.fileControlId];
                String destinationFileName = pf.FileName;
                if (destinationFileName.IndexOf("\\") >= 0) { destinationFileName = destinationFileName.Substring(destinationFileName.LastIndexOf("\\") + 1); }
                String overrideFileName = ad.destinationFileName;
                if (overrideFileName != "") { destinationFileName = overrideFileName; }

                //determine destination path
                String destinationPath = setPathName() + ad.destinationPath;

                //check file size
                if (pf.ContentLength > MaxFileSize)
                {
                    errLev = errorLevels.fileTooLarge;
                }

                if (errLev == errorLevels.noError)
                {
                    //save the file to the harddrive
                    try
                    {
                        pf.SaveAs(destinationPath + "\\" + destinationFileName);
                    }
                    catch (Exception ex)
                    {
                        errLev = errorLevels.fileWriteError;
                        exceptionMessage = " " + ex.Message;
                    }
                }
            }

            exceptionMessage = getErrorMessage(errLev) + exceptionMessage;
            Response.Write(exceptionMessage);
            Response.End();

        }
        private static String setPathName()
        {
            String appPath = "";
            appPath = System.Reflection.Assembly.GetExecutingAssembly().CodeBase;
            appPath = appPath.Substring(8);
            appPath = appPath.Replace('/', '\\');
            appPath = appPath.Substring(0, appPath.LastIndexOf("\\"));
            appPath = appPath.Substring(0, appPath.LastIndexOf("\\"));
            return appPath;
        }
        private enum errorLevels
        {
            noError,
            actionFalse,
            fileTooLarge,
            fileWriteError
        };
        private String getErrorMessage(errorLevels errorLev)
        {
            switch (errorLev)
            {
                case errorLevels.noError:
                    return "Upload Successful";
                case errorLevels.actionFalse:
                    return "Action was not successful";
                case errorLevels.fileTooLarge:
                    return "File size too large exceeded " + (MaxFileSize / 1000).ToString("#,##0") + "KB.";
                case errorLevels.fileWriteError:
                    return "There was an error writing to disk";
            }
            return "";
        }
        private class ActionData
        {
            public String destinationPath = "";
            public String action = "";
            public String destinationFileName = "";
            public String optionalData = "";
            public String fileControlId = "";
        }
        #endregion
        #region Upload Image To SQL
        private String bytesToSQLBinary(byte[] byteIn)
        {
            String strOut = "";
            for (int n = 0; n <= byteIn.GetUpperBound(0); n++)
            {
                strOut += byteIn[n].ToString("x").PadLeft(2, '0');
            }
            return strOut;
        }
        private void doImageToSQL(String JSONData)
        {
            ImageToSQL its = System.Web.Helpers.Json.Decode(JSONData, typeof(ImageToSQL));
            var pf = (HttpPostedFile)Request.Files[its.fileControlId];
            var br = new System.IO.BinaryReader(pf.InputStream);
            var imageData = br.ReadBytes(pf.ContentLength);
            var strImage = bytesToSQLBinary(imageData);
            its.spParameters[its.indexOfImageInParameters] = "0x" + strImage;
            SQLHelper.doSPQuery(its.spName, its.spParameters, SQLConnect.outputType.noOutput);
            Response.Write("Upload Successful");
            Response.End();
        }
        private class ImageToSQL
        {
            public String spName = "";
            public String[] spParameters = null;
            public int indexOfImageInParameters = -1;
            public String fileControlId = "";
            public String action = "";
        }
        #endregion
        #region "Download PDF"
        private void doDownloadPDF(String JSONData)
        {
            PDFData pd = System.Web.Helpers.Json.Decode(JSONData, typeof(PDFData));

            //Optional action to perform in the pattern: if (pd.action == [actionName] && !Boolean function(pd.optionalData)) { return; }

            String fullPath = setPathName() + "\\" + pd.pathAndFile;
            if (!System.IO.File.Exists(fullPath)) { return; }
            String fileName = new System.IO.FileInfo(fullPath).Name;
            if (pd.overrideFileName != "") { fileName = pd.overrideFileName; }
            Response.AppendHeader("content-disposition", "attachment; filename = " + fileName);
            Response.WriteFile(fullPath);
            Response.Flush();
            Response.End();
        }
        private class PDFData
        {
            public String pathAndFile = "";
            public String action = "";
            public String overrideFileName = "";
            public String optionalData = "";
        }
        #endregion
        #region "Crystal Report"
        private void executeReport(String JSONData)
        {
            CRData cd = System.Web.Helpers.Json.Decode(JSONData, typeof(CRData));

            //Optional action to perform in the pattern: if (cd.action == [actionName] && !Boolean function(cd.optionalData)) { return; }

            String reportPath = setPathName() + cd.pathAndFile;
            List<Object> param = new List<Object>();
            if (cd.parameters != null && cd.parameters.Length > 0)
            {
                for (int i = 0; i < cd.parameters.Length; i++)
                {
                    param.Add(cd.parameters[i]);
                }
            }
            System.IO.MemoryStream myStream = new System.IO.MemoryStream();
            if (!ReportRunner.execute(reportPath, ref myStream, param)) { return; }
            Response.Clear();
            Response.ContentType = "Application/pdf";
            Response.AppendHeader("content-disposition", "attachment; filename=" + cd.outputFileName);
            myStream.WriteTo(Response.OutputStream);
            Response.Flush();
            Response.Close();
            Response.End();
        }
        private class CRData
        {
            public String pathAndFile = "";
            public String[] parameters = null;
            public String action = "";
            public String outputFileName = "";
            public String optionalData = "";
        }
        #endregion
        #region "getFileList"
        private void directoryFileRecurse(FileListParams fl, String parentDir)
        {
            var thisDir = new System.IO.DirectoryInfo(setPathName() + "\\" + parentDir);
            foreach (System.IO.FileInfo thisFile in thisDir.GetFiles())
            {
                if (fl.fileList == null) { fl.fileList = new List<string>(); }
                String path = thisFile.DirectoryName;
                if (path.Length > (setPathName() + "\\" + fl.parentFolder).Length)
                {
                    path = path.Substring((setPathName() + "\\" + fl.parentFolder).Length) + "/";
                }
                else
                {
                    path = "";
                }
                fl.fileList.Add((path + thisFile.Name).Replace("\\", "/"));
            }
            if (fl.includeSubFolders && thisDir.GetDirectories().Length > 0)
            {
                foreach (System.IO.DirectoryInfo thisSubDir in thisDir.GetDirectories())
                {
                    directoryFileRecurse(fl, thisSubDir.FullName);
                }
            }
        }
        private void getFileList(String JSONData)
        {
            FileListParams fl = System.Web.Helpers.Json.Decode(JSONData, typeof(FileListParams));
            if (fl.extensionFilter == "") { fl.extensionFilter = "*.*"; }
            directoryFileRecurse(fl, fl.parentFolder);
            var flo = new FileListOut();
            flo.fileList = fl.fileList.ToArray();
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            String strOut = oSerializer.Serialize(flo); //JSON.stringify
            strOut = strOut.Replace("&", "&amp;");
            Response.Write(strOut);
            Response.End();
        }
        private class FileListParams
        {
            public String parentFolder = "";
            public Boolean includeSubFolders = false;
            public String extensionFilter = "";
            public List<string> fileList = null;
        }
        private class FileListOut
        {
            public String[] fileList = null;
        }
        #endregion
    }
}