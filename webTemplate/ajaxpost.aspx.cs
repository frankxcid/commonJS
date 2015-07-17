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
using Microsoft.Win32;

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
        CommandObject commandObj = null;

        private int MaxFileSize = 5000000; //5MB is max size of uploaded files

        protected void Page_Load(object sender, EventArgs e)
        {
            String input = "";
            InitialObj initObj = null;
            if (Request.Params["commandObj"] == null)
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
                initObj.commandObj = Request.Params["commandObj"];
                initObj.sendVars = Request.Params["sendVars"];
            }
            commandObj = System.Web.Helpers.Json.Decode(initObj.commandObj, typeof(CommandObject));

            switch (commandObj.reqType)
            {
                case "query":
                    queryRequested(initObj.sendVars);
                    return;
                case "fileupload":
                    doFileUpload(initObj.sendVars);
                    return;
                case "downloadPDF":
                    doDownloadPDF(initObj.sendVars);
                    return;
                case "fileList":
                    getFileList(initObj.sendVars);
                    return;
                case "fileListMedia":
                    getFileListMedia(initObj.sendVars);
                    return;
                case "imagetosql":
                    doImageToSQL(initObj.sendVars);
                    return;
                case "crystalReportStream":
                    executeReport(initObj.sendVars);
                    return;
                case "crystalReportSave":
                    executeReportSaveFile(initObj.sendVars);
                    return;
                default:
                    doCustomRequest(initObj.sendVars);
                    return;
            }

        }
        private class InitialObj
        {
            public String commandObj = "";
            public String sendVars = "";
        }
        private class CommandObject
        {
            public String reqType = "";
            public String tokenId = "";
            public Boolean iframePost = false;
        }
        private void sendResponse(String message)
        {
            if (message != "")
            {
                Response.Write(message);
            }
            var myCookie = new System.Web.HttpCookie(commandObj.tokenId);
            myCookie.Value = commandObj.tokenId;
            Response.Cookies.Add(myCookie);
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
        #region "SQL Query"
        private void queryRequested(String JSONData)
        {
            //init SQLHelper
            SQLHelper.SQLServerName = "";
            SQLHelper.SQLServerDatabaseName = "";
            //change the incoming JSON text stream to a dr object
            //the JSON object has 3 values
            //1 - queryid, type = string - stored procedure name, can exclude "pr_"
            //2 - optvals, type = String Array - the variable values place in SQL statement in SQLConnect
            //3 - noResult, type = Boolean/Bit (allowable values (1, 0, null, undefined) - true if the SQL statement returns no values otherwise false. If this value is missing (null, undefined) assume false

            DataRead dr = System.Web.Helpers.Json.Decode(JSONData, typeof(DataRead));
            //set global variables
            queryId = dr.queryid;
            optvals = dr.optvals;
            HasNoOutput = (dr.noresult == 1);
            //do query
            if (!SQLHelper.doSPQuery(queryId, optvals, (HasNoOutput ? SQLConnect.outputType.noOutput : SQLConnect.outputType.forRemoteQ))) { return; }
            //return result if available
            if (!HasNoOutput)
            {
                //convert the object to JSON
                String strOut = SQLHelper.JSONResults;
                strOut = strOut.Replace("&", "&amp;");
                sendResponse(strOut);
            }
            else
            {
                sendResponse("SQL Command Processed");
            }
            Response.End();
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
        #endregion
        #region "Custom Request"
        private void doCustomRequest(String JSONData)
        {
            Payload param = System.Web.Helpers.Json.Decode(JSONData, typeof(Payload));
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            String outPut = "Command Complete";
            switch (commandObj.reqType)
            {
                case "videostarted":
                    outPut = HttpContext.Current.User.Identity.Name.ToString();
                    break;

            }
            sendResponse(outPut);
            Response.End();
        }
        private class Payload
        {
            public String[] param = null;
        }
        #endregion
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
                String appPath = setPathName();
                if (ad.destinationPath.Substring(0, 1) == "\\") { ad.destinationPath = ad.destinationPath.Substring(1); }
                String destinationPath = System.IO.Path.Combine(appPath, ad.destinationPath);

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
            sendResponse(exceptionMessage);
            Response.End();
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
            sendResponse("Upload Successful");
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
            sendResponse("Download Complete");
            var fi = new System.IO.FileInfo(pd.pathAndFile);
            switch (fi.Extension)
            {
                case ".pdf":
                    Response.ContentType = "application/pdf";
                    Response.AppendHeader("content-disposition", "attachment; filename = " + fileName);
                    Response.WriteFile(fullPath);
                    Response.Flush();
                    Response.End();
                    return;
                case ".mp4":
                    Response.ContentType = "video/mp4";
                    Response.AppendHeader("content-disposition", "attachment; filename = " + fileName);
                    System.IO.FileStream sourceFile = new System.IO.FileStream(fullPath, System.IO.FileMode.Open);
                    long fileSize = sourceFile.Length;
                    byte[] getContent = new byte[(int)fileSize];
                    sourceFile.Read(getContent, 0, (int)sourceFile.Length);
                    sourceFile.Close();
                    Response.BinaryWrite(getContent);
                    break;
            }
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

            String reportPath = setPathName() + "\\" + cd.pathAndFile;
            List<Object> param = new List<Object>();
            if (cd.parameters != null && cd.parameters.Length > 0)
            {
                for (int i = 0; i < cd.parameters.Length; i++)
                {
                    param.Add(cd.parameters[i]);
                }
            }
            sendResponse("Report Created");
            Response.ContentType = "Application/pdf";
            ReportRunner.execute(reportPath, Response, "W3b4pp5", cd.outputFileName, param);
            Response.Flush();
            Response.End();
        }
        private void executeReportSaveFile(String JSONData)
        {
            CRData cd = System.Web.Helpers.Json.Decode(JSONData, typeof(CRData));
            cd.outputFileName = setPathName() + "\\" + cd.outputFileName;

            //Optional action to perform in the pattern: if (cd.action == [actionName] && !Boolean function(cd.optionalData)) { return; }
            if ((cd.action == "checkexists" && !System.IO.File.Exists(cd.outputFileName)) || (cd.action == ""))
            {

                String reportPath = setPathName() + "\\" + cd.pathAndFile;
                List<Object> param = new List<Object>();
                if (cd.parameters != null && cd.parameters.Length > 0)
                {
                    for (int i = 0; i < cd.parameters.Length; i++)
                    {
                        param.Add(cd.parameters[i]);
                    }
                }
                if (!ReportRunner.executeSave(reportPath, cd.outputFileName, "W3b4pp5", param))
                {
                    var sw = new System.IO.StreamWriter(setPathName() + "\\rpt\\output\\err.log");
                    sw.WriteLine(ReportRunner.ErrorMessage);
                    sw.Close();
                }
            }
            sendResponse("Report Created");
            if (cd.downloadFile)
            {
                Response.ContentType = "Application/pdf";
                Response.AppendHeader("content-disposition", "attachment; filename = " + (new System.IO.FileInfo(cd.outputFileName).Name));
                Response.WriteFile(cd.outputFileName);
            }
            Response.End();
        }
        private class CRData
        {
            public String pathAndFile = "";
            public String[] parameters = null;
            public String action = "";
            public String outputFileName = "";
            public String optionalData = "";
            public String fileId = "";
            public String cookieName = "";
            public Boolean downloadFile = false;
        }
        #endregion
        #region "getFileListMedia"
        private List<String> getMediaInfo(String FileFullName)
        {
            System.Diagnostics.Process proc = new System.Diagnostics.Process();
            System.Diagnostics.ProcessStartInfo psi = new System.Diagnostics.ProcessStartInfo();
            psi.FileName = "\"" + setPathName() + "\\bin\\mediainfo.exe\"";
            psi.Arguments = "--Output=XML \"" + FileFullName + "\"";
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.CreateNoWindow = true;
            proc.StartInfo = psi;
            proc.Start();
            XmlDocument doc = new XmlDocument();
            doc.Load(proc.StandardOutput);
            proc.WaitForExit();
            proc.Close();
            var strOut = new List<String>();
            strOut.Add(fixMediaInfo(doc.SelectSingleNode("/Mediainfo/File").ChildNodes[1].SelectSingleNode("Width___________________________________").InnerXml));
            strOut.Add(fixMediaInfo(doc.SelectSingleNode("/Mediainfo/File").ChildNodes[1].SelectSingleNode("Height__________________________________").InnerXml));

            return strOut;
        }
        private void createThumbnails(String FileFullName)
        {
            String thumbnailFileName = FileFullName.Replace(".mp4", ".jpg");
            thumbnailFileName = thumbnailFileName.Substring(thumbnailFileName.LastIndexOf("\\") + 1);
            thumbnailFileName = setPathName() + "\\images\\" + thumbnailFileName;
            if (System.IO.File.Exists(thumbnailFileName)) { return; }
            System.Diagnostics.Process proc = new System.Diagnostics.Process();
            System.Diagnostics.ProcessStartInfo psi = new System.Diagnostics.ProcessStartInfo();
            psi.FileName = "\"" + setPathName() + "\\bin\\ffmpeg.exe\"";
            psi.Arguments = "-i \"" + FileFullName + "\" -ss 00:00:30 -s 75X75 -f image2 \"" + thumbnailFileName + "\"";
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.CreateNoWindow = true;
            proc.StartInfo = psi;
            proc.Start();
            proc.WaitForExit();
            proc.Close();
        }
        private String fixMediaInfo(String str)
        {
            str = str.Replace("pixels", "");
            str = str.Replace(" ", "");
            return str;
        }
        private void directoryFileRecurseMedia(FileListParamsMedia fl, String parentDir)
        {
            var thisDir = new System.IO.DirectoryInfo(setPathName() + "\\" + parentDir);


            foreach (System.IO.FileInfo thisFile in thisDir.GetFiles(fl.extensionFilter))
            {
                if (fl.fileList == null) { fl.fileList = new List<OneFile>(); }
                String path = thisFile.DirectoryName;
                if (path.Length > (setPathName() + "\\" + fl.parentFolder).Length)
                {
                    path = path.Substring((setPathName() + "\\" + fl.parentFolder).Length) + "/";
                }
                else
                {
                    path = "";
                }
                var onef = new OneFile((path + thisFile.Name).Replace("\\", "/"));
                List<String> strOut = getMediaInfo(thisFile.FullName);
                createThumbnails(thisFile.FullName);
                onef.frameWidth = strOut[0];
                onef.frameHeight = strOut[1];
                fl.fileList.Add(onef);
            }
            if (fl.includeSubFolders && thisDir.GetDirectories().Length > 0)
            {
                foreach (System.IO.DirectoryInfo thisSubDir in thisDir.GetDirectories())
                {
                    directoryFileRecurseMedia(fl, thisSubDir.FullName);
                }
            }
        }
        private void getFileListMedia(String JSONData)
        {
            FileListParamsMedia fl = System.Web.Helpers.Json.Decode(JSONData, typeof(FileListParamsMedia));
            if (fl.extensionFilter == "") { fl.extensionFilter = "*.*"; }
            directoryFileRecurseMedia(fl, fl.parentFolder);
            var flo = fl.fileList.ToArray();
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            String strOut = oSerializer.Serialize(flo); //JSON.stringify
            strOut = strOut.Replace("&", "&amp;");
            Response.Write(strOut);
            Response.End();
        }
        private class FileListParamsMedia
        {
            public String parentFolder = "";
            public Boolean includeSubFolders = false;
            public String extensionFilter = "";
            public List<OneFile> fileList = null;

        }
        private class OneFile
        {
            public String filename = "";
            public String frameHeight = "";
            public String frameWidth = "";
            public OneFile(String _fileName)
            {
                this.filename = _fileName;
            }
        }
        #endregion
        #region "getFileList"
        private void directoryFileRecurse(FileListParams fl, String parentDir)
        {
            var thisDir = new System.IO.DirectoryInfo(setPathName() + "\\" + parentDir);
            foreach (System.IO.FileInfo thisFile in thisDir.GetFiles(fl.extensionFilter))
            {
                if (fl.fileList == null) { fl.fileList = new List<FileListOut>(); }
                String path = thisFile.DirectoryName;
                if (path.Length > (setPathName() + "\\" + fl.parentFolder).Length)
                {
                    path = path.Substring((setPathName() + "\\" + fl.parentFolder).Length) + "/";
                }
                else
                {
                    path = "";
                }
                var oneFile = new FileListOut();
                oneFile.filename = thisFile.Name;
                oneFile.filetype = getFileType(thisFile.Extension);
                oneFile.filesize = (thisFile.Length / 1028).ToString("0");
                oneFile.filedate = thisFile.LastWriteTime.ToString("M/d/yyyy");
                oneFile.pathname = path.Replace("\\", "/");
                fl.fileList.Add(oneFile);
            }
            if (fl.includeSubFolders && thisDir.GetDirectories().Length > 0)
            {
                foreach (System.IO.DirectoryInfo thisSubDir in thisDir.GetDirectories())
                {
                    directoryFileRecurse(fl, thisSubDir.FullName);
                }
            }
        }
        private String getFileType(String extension)
        {
            String strOut = "Unknown";
            try
            {
                RegistryKey thisKey = Registry.ClassesRoot.OpenSubKey(extension);
                String fType = thisKey.GetValue("").ToString();
                thisKey = Registry.ClassesRoot.OpenSubKey(fType);
                String desc = thisKey.GetValue("").ToString();
                strOut = desc;
            }
            catch
            {
                strOut = "Unknown";
            }
            if (strOut == "Unknown" && extension.ToUpper() == "PDF") { return "Portable Document Format (PDF)"; }
            return strOut;

        }
        private void getFileList(String JSONData)
        {
            FileListParams fl = System.Web.Helpers.Json.Decode(JSONData, typeof(FileListParams));
            if (fl.extensionFilter == "") { fl.extensionFilter = "*.*"; }
            directoryFileRecurse(fl, fl.parentFolder);
            if (fl.fileList == null)
            {
                //no files found
                sendResponse("[]");
                return;
            }
            var flo = fl.fileList.ToArray();
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            String strOut = oSerializer.Serialize(flo); //JSON.stringify
            strOut = strOut.Replace("&", "&amp;");
            sendResponse(strOut);
        }
        private class FileListParams
        {
            public String parentFolder = "";
            public Boolean includeSubFolders = false;
            public String extensionFilter = "";
            public List<FileListOut> fileList = null;

        }
        private class FileListOut
        {
            public String filename = "";
            public String filetype = "";
            public String filesize = "";
            public String filedate = "";
            public String pathname = "";
        }
        #endregion
    }
}