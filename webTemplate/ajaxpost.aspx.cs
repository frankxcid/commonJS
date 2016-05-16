using System;
using System.Collections.Generic;
using System.Web;
using System.Text;
using System.Xml;
using SQLConnectLibrary;
using CrystalReportOutput;
using Microsoft.Win32;
using System.Collections;
using System.Collections.ObjectModel;
using System.Linq;
using System.Dynamic;
using System.Web.Script.Serialization;
using System.IO;
/// <summary>
/// Frank Cedeno 04/08/2016
/// Version 1.2
/// </summary>
namespace webTemplate
{
    public partial class ajaxpost : System.Web.UI.Page
    {
        //***********************************************************************************//
        // Requires Reference to Extension System.Web.Helpers and Microsoft.CSharp           //
        //***********************************************************************************//


        private string appPath = "";
        private IDictionary<string, object> commandObj = null;
        private IDictionary<string, object> payload = null;
        private GenericResponse resp = null;
        private bool download = false;
        private string optionalData = "";
        private string action = "";
        protected void Page_Load(object sender, EventArgs e)
        {
            SQLHelper.SQLServerDatabaseName = "ISEQ";
            SQLHelper.SQLServerName = "FASSQL1";
            appPath = System.Reflection.Assembly.GetExecutingAssembly().CodeBase;
            appPath = appPath.Substring(8);
            appPath = appPath.Replace('/', '\\');
            appPath = appPath.Substring(0, appPath.LastIndexOf("\\"));
            appPath = appPath.Substring(0, appPath.LastIndexOf("\\"));
            if (!readRequest()) { return; }
            switch (commandObj["command"].ToString())
            {
                case "query":
                    runQuery();
                    return;
                case "fileupload":
                    fileupload();
                    return;
                case "downloadfile":
                    downloadFile();
                    return;
                case "fileList":
                    getFileList();
                    return;
                case "imagetosql":
                    imageToSQL();
                    return;
                case "crystalreport":
                    doCrystalReport();
                    return;
                case "gridexcel":
                    gridExcel();
                    return;
                case "excel":
                    basicExcel();
                    return;
                default:
                    custom();
                    return;
            }
        }

        #region SQL Query
        private void runQuery()
        {
            string sp = payload["sp"].ToString();
            bool noresult = Convert.ToBoolean(payload["noresult"]);
            string[] param = null;
            if (payload["parameters"] != null)
            {
                param = (payload["parameters"] as ArrayList).ToArray(typeof(string)) as string[];
            }
            if (!SQLHelper.doSPQuery(sp, param, (noresult ? SQLConnect.outputType.noOutput : SQLConnect.outputType.forRemoteQ)))
            {
                resp.SetError(GenericResponse.errorLevels.SQLError);
            }
            else
            {
                if (!noresult)
                {
                    resp.payload = SQLHelper.JSONResults.Replace("&", "&amp;");
                }
            }
            sendResponse();
            Response.End();

        }
        #endregion

        #region fileupload
        private void fileupload()
        {
            doFileupload();
            sendResponse();
            Response.End();
        }
        private void doFileupload()
        {
            int MaxFileSize = 5000000; //5MB is max size of uploaded files
            //place action function here in the format: if (action == [actionname]) { if (!actionfunction()){resp.SetError(); return resp;}}
            string action = payload["action"].ToString();


            var postedFile = Request.Files[payload["controlid"].ToString()] as HttpPostedFile;
            if (postedFile == null)
            {
                resp.SetError(GenericResponse.errorLevels.fileNotInRequest);
                return;
            }

            //destinateion filename
            string destinationFileName = postedFile.FileName;
            if (destinationFileName.IndexOf("\\") >= 0) { destinationFileName = destinationFileName.Substring(destinationFileName.LastIndexOf("\\") + 1); }
            string overrideFileName = payload["destinationfilename"].ToString();
            if (overrideFileName != "") { destinationFileName = overrideFileName; }

            //destination path
            string destPath = payload["destinationpath"].ToString();
            if (destPath.Substring(0, 1) == "\\") { destPath = destPath.Substring(1); }
            destPath = Path.Combine(appPath, destPath);

            //check file size
            if (postedFile.ContentLength > MaxFileSize)
            {
                resp.SetError(GenericResponse.errorLevels.fileTooLarge);
                return;
            }

            try
            {
                postedFile.SaveAs(destPath + "\\" + destinationFileName);
            }
            catch (Exception ex)
            {
                resp.SetError(GenericResponse.errorLevels.fileWriteError, ex.Message);
            }
            return;
        }

        #endregion

        #region download file
        private void downloadFile()
        {
            string pathandfile = payload["pathandfile"].ToString();
            string fullPath = (appPath + "\\" + pathandfile).Replace("/", "\\");
            if (!File.Exists(fullPath))
            {
                resp.SetError(GenericResponse.errorLevels.fileMissing);
                sendResponse();
                Response.End();
                return;
            }
            sendResponse();
            completeDownload(fullPath);
        }
        private void completeDownload(string fullPath)
        {
            var fi = new FileInfo(fullPath);
            string fileName = fi.Name;
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
                    FileStream sourceFile = new FileStream(fullPath, FileMode.Open);
                    long fileSize = sourceFile.Length;
                    byte[] getContent = new byte[(int)fileSize];
                    sourceFile.Read(getContent, 0, (int)sourceFile.Length);
                    sourceFile.Close();
                    Response.BinaryWrite(getContent);
                    break;
            }
        }
        #endregion

        #region fileList
        private class OneFileItem
        {
            public string filename { get; set; }
            public string filetype { get; set; }
            public string filesize { get; set; }
            public string filedate { get; set; }
            public string urlpath { get; set; }
            public string frameheight { get; set; }
            public string framewidth { get; set; }
        }

        private void getFileList()
        {
            string parentFolder = appPath + "\\" + payload["parentfolder"].ToString();
            if (!Directory.Exists(parentFolder))
            {
                resp.SetError(GenericResponse.errorLevels.dirMissing);
                sendResponse();
                Response.End();
                return;
            }
            List<OneFileItem> filedata = new List<OneFileItem>();
            var di = new DirectoryInfo(parentFolder);
            crawlFile(di, ref filedata);
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            resp.payload = oSerializer.Serialize(filedata).Replace("&", "&amp;");
            sendResponse();
            Response.End();
        }
        private void crawlFile(DirectoryInfo parentFolder, ref List<OneFileItem> filedata)
        {
            foreach (FileInfo fi in parentFolder.GetFiles(payload["extensionfilter"].ToString()))
            {
                string urlPath = fi.DirectoryName;
                if (urlPath.Length > (appPath + "\\" + payload["parentfolder"].ToString()).Length)
                {
                    urlPath = urlPath.Substring((appPath + "\\" + payload["parentfolder"].ToString()).Length) + "/";
                }
                else
                {
                    urlPath = "";
                }
                var thisFile = new OneFileItem()
                {
                    filename = fi.Name,
                    filetype = getFileType(fi.Extension),
                    filesize = (fi.Length / 1028).ToString("0"),
                    filedate = fi.LastWriteTime.ToString("M/d/yyyy"),
                    urlpath = urlPath.Replace("\\", "/")
                };
                if (Convert.ToBoolean(payload["withmedia"]) && fi.Extension.ToUpper() == "MP4")
                {
                    var mediaInfo = getMediaInfo(fi.FullName);
                    createThumbnails(fi.FullName);
                    thisFile.framewidth = mediaInfo[0];
                    thisFile.frameheight = mediaInfo[1];
                }
                filedata.Add(thisFile);
            }
            if (!Convert.ToBoolean(payload["includesubfolders"])) { return; }
            foreach (DirectoryInfo di in parentFolder.GetDirectories())
            {
                crawlFile(di, ref filedata);
            }
        }
        private string getFileType(string extension)
        {
            string output = "Unknown";
            try
            {
                RegistryKey thisKey = Registry.ClassesRoot.OpenSubKey(extension);
                string fType = thisKey.GetValue("").ToString();
                thisKey = Registry.ClassesRoot.OpenSubKey(fType);
                string desc = thisKey.GetValue("").ToString();
                output = desc;
            }
            catch
            {
                output = "Unknown";
            }
            if (output == "Unknown" && extension.ToUpper() == "PDF") { return "Portable Document Format (PDF)"; }
            return output;
        }
        private List<string> getMediaInfo(string fullName)
        {
            var proc = new System.Diagnostics.Process();
            var psi = new System.Diagnostics.ProcessStartInfo()
            {
                FileName = "\"" + appPath + "\\bin\\mediainfo.exe\"",
                Arguments = "--Output=XML \"" + fullName + "\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };
            proc.StartInfo = psi;
            proc.Start();
            XmlDocument doc = new XmlDocument();
            doc.Load(proc.StandardOutput);
            proc.WaitForExit();
            proc.Close();
            var output = new List<string>();
            output.Add(fixMediaInfo(doc.SelectSingleNode("/Mediainfo/File").ChildNodes[1].SelectSingleNode("Width___________________________________").InnerXml));
            output.Add(fixMediaInfo(doc.SelectSingleNode("/Mediaingo/File").ChildNodes[1].SelectSingleNode("Height__________________________________").InnerXml));
            return output;
        }
        private void createThumbnails(string fullName)
        {
            string thumbnailFileName = fullName.Replace(".mp4", ".jpg");
            thumbnailFileName = thumbnailFileName.Substring(thumbnailFileName.LastIndexOf("\\") + 1);
            thumbnailFileName = appPath + "\\images\\" + thumbnailFileName;
            if (File.Exists(thumbnailFileName)) { return; }//do not create if it exists already
            if (!Directory.Exists(appPath + "\\images")) { return; }//images dir must exist
            var proc = new System.Diagnostics.Process();
            var psi = new System.Diagnostics.ProcessStartInfo()
            {
                FileName = "\"" + appPath + "\\bin\\ffmped.exe\"",
                Arguments = "-i \"" + fullName + "\" -ss 00:00:30 -s 75X75 -f image2 \"" + thumbnailFileName + "\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };
            proc.StartInfo = psi;
            proc.Start();
            proc.WaitForExit();
            proc.Close();
        }
        private string fixMediaInfo(string input)
        {
            return input.Replace("pixels", "").Replace(" ", "");
        }
        #endregion

        #region image to SQL
        private string bytesToSQLBinary(byte[] bytesIn)
        {
            string output = "";
            for (int n = 0; n < bytesIn.Length; n += 1)
            {
                output += bytesIn[n].ToString("x").PadLeft(2, '0');
            }
            return output;
        }
        private void imageToSQL()
        {
            var postedFile = Request.Files[payload["controlid"].ToString()];
            var br = new BinaryReader(postedFile.InputStream);
            var imageData = br.ReadBytes(postedFile.ContentLength);
            var strImage = bytesToSQLBinary(imageData);
            string[] param = (payload["parameters"] as ArrayList).ToArray(typeof(string)) as string[];
            param[int.Parse(payload["imageparameterindex"].ToString())] = "0x" + strImage;
            if (!SQLHelper.doSPQuery(payload["sp"].ToString(), param, SQLConnect.outputType.noOutput))
            {
                resp.SetError(GenericResponse.errorLevels.SQLError);
            }
            sendResponse();
            Response.End();
        }
        #endregion

        #region Crystal Report
        private void doCrystalReport()
        {
            string outputFile = payload["outputfilename"].ToString();
            string outputPath = "";
            if (Convert.ToBoolean(payload["savefile"]))
            {
                outputPath = payload["outputpath"].ToString();
                bool complete = crystalReport(outputFile, outputPath, true);
                sendResponse();
                if (complete && Convert.ToBoolean(commandObj["download"]))
                {
                    string outputFullPath = appPath + "\\" + outputPath + "\\" + outputFile;
                    completeDownload(outputFullPath);
                }
            }
            else
            {
                crystalReport(outputFile, "", false);
            }
            Response.End();
        }
        private bool crystalReport(string outputFile, string outputPath, bool savefile)
        {
            string reportName = appPath + "\\" + payload["reportfile"].ToString();

            string[] param = null;
            List<Object> reportParameters = new List<object>();
            if (payload["parameters"] != null)
            {
                param = (payload["parameters"] as ArrayList).ToArray(typeof(string)) as string[];
                for (int i = 0; i < param.Length; i += 1)
                {
                    reportParameters.Add(param[i]);
                }
            }
            if (savefile)
            {
                string outputFullPath = appPath + "\\" + outputPath + "\\" + outputFile;
                if (!ReportRunner.executeSave(reportName, outputFullPath, "W3b4pp5", reportParameters))
                {
                    resp.SetError(GenericResponse.errorLevels.reportError);
                    return false;
                }
            }
            else
            {
                sendResponse();
                Response.ContentType = "Application/pdf";
                ReportRunner.execute(reportName, Response, "W3b4pp5", outputFile, reportParameters);
                Response.Flush();
            }
            return true;
        }
        #endregion

        #region Excel
        private void basicExcel()
        {
            string sp = payload["storedprocedure"].ToString();
            string[] parameters = (payload.ContainsKey("parameters") ? (payload["parameters"] as ArrayList).ToArray(typeof(string)) as string[] : null);
            if (!SQLHelper.doSPQuery(sp, parameters, SQLConnect.outputType.arrayOutput))
            {
                resp.SetError(GenericResponse.errorLevels.SQLError);
                sendResponse();
                Response.End();
                return;
            }
            var data = new List<string[]>();
            if (SQLHelper.Results.GetLength(1) > 0)
            {
                for (int i = 0; i < SQLHelper.Results.GetLength(1); i++)
                {
                    var row = new List<string>();
                    for (int n = 0; n < SQLHelper.Results.GetLength(0); n++)
                    {
                        row.Add(SQLHelper.Results[n, i]);
                    }
                    data.Add(row.ToArray());
                }
            }
            string title = (payload.ContainsKey("title") ? payload["title"].ToString() : "");
            int[] numbercolumns = (payload.ContainsKey("numbercolumns") ? (payload["numbercolumns"] as ArrayList).ToArray(typeof(int)) as int[] : null);
            createReport(SQLHelper.ColumnNames, data, title, payload["filename"].ToString(), numbercolumns);
        }
        private void gridExcel()
        {
            string[] columnname = (payload.ContainsKey("columnnames") ? (payload["columnnames"] as ArrayList).ToArray(typeof(string)) as string[] : null);
            var alData = (payload["data"] as ArrayList);
            List<string[]> data = new List<string[]>(alData.Count);
            foreach (ArrayList row in alData)
            {
                String[] strRow = (String[])row.ToArray(typeof(string));
                data.Add(strRow);
            }
            string title = (payload.ContainsKey("title") ? payload["title"].ToString() : "Grid Export");
            string fn = title + " " + DateTime.Now.ToString("Mdyyyyhhmmss") + ".xlsx";
            HashSet<char> invalid = new HashSet<char>(System.IO.Path.GetInvalidFileNameChars());
            char[] chrFN = fn.ToCharArray();

            for (int i = 0; i < chrFN.Length; i++)
            {
                if (invalid.Contains(chrFN[i]))
                {
                    chrFN[i] = ' ';
                }
            }
            fn = new string(chrFN);
            int[] numbercolumns = (payload.ContainsKey("numbercolumns") ? (payload["numbercolumns"] as ArrayList).ToArray(typeof(int)) as int[] : null);
            createReport(columnname, data, title, fn, numbercolumns);
        }
        private void createReport(string[] columnnames, List<string[]> data, string title, string filename, int[] numbercolumns)
        {
            var rpt = new OpenXMLExcel.OpenXMLExcel();
            if (title == null) { title = ""; }
            string tabtitle = title;
            if (tabtitle.Length > 30) { tabtitle = tabtitle.Substring(0, 30); }
            if (tabtitle == "") { tabtitle = "Sheet1"; }
            var wkid = rpt.AddWorkSheet(tabtitle, true, true);
            var reportData = new List<string[]>();
            string[] s = { title, "", "", "", "", "printed: " + DateTime.Now.ToString("M/d/yyyy hh:mm") };
            reportData.Add(s);
            if (columnnames != null && columnnames.Length > 0)
            {
                reportData.Add(columnnames);
                rpt.AddCommonFontStyle(wkid, OpenXMLExcel.CommonFontStyles.Calibri14Bold, 0, 1, 1, columnnames.Length);
                rpt.AddCommonBorderStyle(wkid, OpenXMLExcel.CommonBorderStyles.Bottom_DoubleLine, 0, 1, 1, columnnames.Length);
                rpt.AddCommonFillStyle(wkid, OpenXMLExcel.CommonFillStyles.LightSilver, 0, 1, 1, columnnames.Length);
            }
            if (data != null && data.Count > 0)
            {
                foreach (string[] row in data)
                {
                    reportData.Add(row);
                }
            }
            else
            {
                string[] nodata = { "no data" };
                reportData.Add(nodata);
            }
            rpt.AddWorksheetData(wkid, reportData);
            rpt.AddCommonFontStyle(wkid, OpenXMLExcel.CommonFontStyles.Calibri16Bold, 0, 0, 1, 1);
            rpt.AddMergeCell(wkid, 0, 0, 1, 5);
            if (numbercolumns != null && numbercolumns.Length > 0 && data.Count > 0)
            {
                foreach (int col in numbercolumns)
                {
                    rpt.AddCommonNumberFormatStyle(wkid, OpenXMLExcel.CommonNumberStyles.financeComma, col, 2, data.Count, 1);
                }
            }
            sendResponse();
            rpt.HTTPDownload(filename, Response);
            Response.End();

        }
        #endregion

        #region Custom
        private void custom()
        {
            string command = commandObj["command"].ToString();
            string[] parameters = (payload["parameters"] as ArrayList).ToArray(typeof(string)) as string[];
            if (download)//on download, send response prior to download
            {
                sendResponse();
            }
            //run command

            if (!download)
            {
                sendResponse();
            }
            Response.End();
        }
        #endregion

        #region send response
        private void sendResponse()
        {
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string mess = oSerializer.Serialize(resp);
            if (Convert.ToBoolean(commandObj["iframe"]))
            {
                var myCookie = new System.Web.HttpCookie(commandObj["tokenid"].ToString());
                myCookie.Value = mess;
                Response.Cookies.Add(myCookie);
            }
            if (!download)
            {
                Response.Write(mess);
            }
        }

        private class GenericResponse
        {
            public string tokenid { get; set; }
            public string errormessage { get; set; }
            public bool haserror { get; set; }
            public string payload { get; set; }

            public GenericResponse(string _tokenid)
            {
                tokenid = _tokenid;
                SetError(errorLevels.noError);
                payload = "";
            }

            public enum errorLevels
            {
                noError,
                actionFalse,
                fileTooLarge,
                fileWriteError,
                fileNotInRequest,
                customError,
                fileMissing,
                dirMissing,
                SQLError,
                reportError
            };
            public void SetError(errorLevels ErrorLevel, string CustomMessage = "")
            {
                if (!haserror && ErrorLevel != errorLevels.noError) { haserror = true; }
                switch (ErrorLevel)
                {
                    case errorLevels.noError:
                        errormessage = "Request Successful";
                        break;
                    case errorLevels.actionFalse:
                        errormessage = "Action was not successful";
                        break;
                    case errorLevels.fileTooLarge:
                        errormessage = "File size too large exceeded " + CustomMessage; ;
                        break;
                    case errorLevels.fileWriteError:
                        errormessage = "There was an error writing to disk: " + CustomMessage;
                        break;
                    case errorLevels.fileNotInRequest:
                        errormessage = "The file is not in the http request";
                        break;
                    case errorLevels.fileMissing:
                        errormessage = "File not found";
                        break;
                    case errorLevels.dirMissing:
                        errormessage = "Directory not found";
                        break;
                    case errorLevels.SQLError:
                        errormessage = "SQL Error";
                        break;
                    case errorLevels.reportError:
                        errormessage = "Report Error";
                        break;
                    case errorLevels.customError:
                        errormessage = CustomMessage;
                        break;
                }
            }
        }
        #endregion

        #region read request
        private bool readRequest()
        {
            string JSONString = "";
            if (Request.Params["commandobj"] == null)
            {
                int streamLen = Convert.ToInt32(Request.InputStream.Length);
                if (streamLen > 0)
                {
                    var StreamBytes = new Byte[streamLen];
                    int bytesRead = Request.InputStream.Read(StreamBytes, 0, streamLen);
                    var sb = new StringBuilder();
                    for (int i = 0; i < streamLen; i++)
                    {
                        sb.Append(Convert.ToChar(StreamBytes[i]).ToString());
                    }
                    JSONString = sb.ToString();
                }
            }
            else
            {
                JSONString = Request.Params["commandobj"];
            }
            if (JSONString == "") { return false; }
            commandObj = JSONToDictionary(JSONString).getResult() as IDictionary<string, object>;
            payload = commandObj["payload"] as IDictionary<string, object>;
            download = Convert.ToBoolean(commandObj["download"]);
            optionalData = commandObj["optionaldata"].ToString();
            action = commandObj["action"].ToString();
            resp = new GenericResponse(commandObj["tokenid"].ToString());
            return true;
        }
        #endregion

        #region JSON Deserializer
        private dynamic JSONToDictionary(string JSONString)
        {
            var jss = new JavaScriptSerializer();
            jss.RegisterConverters(new JavaScriptConverter[] { new DynamicJsonConverter() });
            return jss.Deserialize(JSONString, typeof(object)) as dynamic;
        }
        internal class DynamicJsonObj : DynamicObject
        {
            private IDictionary<string, object> Dict { get; set; }
            public DynamicJsonObj(IDictionary<string, object> dict)
            {
                this.Dict = dict;
            }
            public override bool TryGetMember(GetMemberBinder binder, out object result)
            {
                result = this.Dict[binder.Name];
                if (result is IDictionary<string, object>)
                {
                    result = new DynamicJsonObj(result as IDictionary<string, object>);
                }
                else if (result is ArrayList)
                {
                    var resultList = (result as ArrayList);
                    if (resultList.Count > 0 && resultList[0] is IDictionary<string, object>)
                    {
                        result = new List<DynamicJsonObj>((result as ArrayList).ToArray().Select(x => new DynamicJsonObj(x as IDictionary<string, object>)));
                    }
                    else
                    {
                        result = new List<object>((result as ArrayList).ToArray());
                    }
                }
                else if (result is ArrayList)
                {
                    result = new List<Object>((result as ArrayList).ToArray());
                }

                return this.Dict.ContainsKey(binder.Name);
            }
            public IDictionary<string, object> getResult()
            {
                return this.Dict;
            }
        }
        public class DynamicJsonConverter : JavaScriptConverter
        {
            public override object Deserialize(IDictionary<string, object> dictionary, Type type, JavaScriptSerializer serializer)
            {
                if (dictionary == null)
                    throw new ArgumentNullException("dictionary");

                if (type == typeof(object))
                {
                    return new DynamicJsonObj(dictionary);
                }
                return null;
            }
            public override IDictionary<string, object> Serialize(object obj, JavaScriptSerializer serializer)
            {
                throw new NotImplementedException();
            }
            public override IEnumerable<Type> SupportedTypes
            {
                get { return new ReadOnlyCollection<Type>(new List<Type>(new Type[] { typeof(object) })); }
            }
        }
        #endregion
    }
}