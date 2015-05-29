using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SQLConnectLibrary;

namespace webTemplate
{
    public class SQLHelper
    {
        private static dbTypes databaseType;
        private static String SQLServerName = "";
        private static String SQLServerDatabaseName = "";
        private static String AS400UID = "";
        private static String AS400PWD = "";
        public static String errMess = "";
        public static String[] QueryHeaders = null;
        public static String[,] results = null;
        public static SQLConnect.DataOut DOResults = null;
        private static String[] optvals = null;
        private static String getConnectionString()
        {
            switch (databaseType)
            {
                case dbTypes.BPCS:
                    //return "DRIVER=iSeries Access ODBC Driver;COMPRESSION=0;LAZYCLOSE=1;PKG=BPCS405CDF/DEFAULT(IBM),2,0,1,0,512;LANGUAGEID=ENU;DFTPKGLIB=BPCS405CDF;DBQ=BPCS405CDF bpcscdusrt bpcscdusr bpcscdptf1 bpcs405cdf bpcs405cdo sequel sqlpgm qgpl qtemp;SYSTEM=NSW400;UID=" + AS400UID + ";PWD=" + AS400PWD;
                    return "DRIVER=iSeries Access ODBC Driver;COMPRESSION=0;LAZYCLOSE=1;PKG=TLXF/DEFAULT(IBM),2,0,1,0,512;LANGUAGEID=ENU;DFTPKGLIB=TLXF;DBQ=TLXF LXUSRF LXUSRO LXPTF LXO sequel sqlpgm qgpl qtemp;SYSTEM=NSW400;UID=" + AS400UID + ";PWD=" + AS400PWD;
                case dbTypes.BPCS_PO:
                    //return "DRIVER=iSeries Access ODBC Driver;COMPRESSION=0;LAZYCLOSE=1;PKG=QGPL/DEFAULT(IBM),2,0,1,0,512;LANGUAGEID=ENU;DFTPKGLIB=QGPL;DBQ=BPCSCDUSRF bpcscdusr bpcscdptf1 bpcs405cdf bpcs405cdo sequel sqlpgm qgpl qtemp;SYSTEM=NSW400;UID=" + AS400UID + ";PWD=" + AS400PWD;
                    return "DRIVER=iSeries Access ODBC Driver;COMPRESSION=0;LAZYCLOSE=1;PKG=QGPL/DEFAULT(IBM),2,0,1,0,512;LANGUAGEID=ENU;DFTPKGLIB=QGPL;DBQ=LXUSRF LXUSRO LXPTF TLXF LXO sequel sqlpgm qgpl qtemp;SYSTEM=NSW400;UID=" + AS400UID + ";PWD=" + AS400PWD;
                case dbTypes.BPCSF:
                    //return "DRIVER=iSeries Access ODBC Driver;COMPRESSION=0;LAZYCLOSE=1;PKG=BPCSCDUSRF/DEFAULT(IBM),2,0,1,0,512;LANGUAGEID=ENU;DFTPKGLIB=BPCSCDUSRF;DBQ=BPCSCDUSRF;SYSTEM=NSW400;UID=" + AS400UID + ";PWD=" + AS400PWD;
                    return "DRIVER=iSeries Access ODBC Driver;COMPRESSION=0;LAZYCLOSE=1;PKG=LXUSRF/DEFAULT(IBM),2,0,1,0,512;LANGUAGEID=ENU;DFTPKGLIB=LXUSRF;DBQ=LXUSRF;SYSTEM=NSW400;UID=" + AS400UID + ";PWD=" + AS400PWD;

            }
            return "";
        }
        private static String getSQL(SQLS SQL)
        {
            //injections not killed because all queries in here will be called by program on server side
            //SQLConnect.killSQLInjections(ref optvals);
            //switch (SQL)
            //{
               
            //}
            return "";
        }
        private enum dbTypes
        {
            access,
            BPCS,
            BPCSF,
            BPCS_PO,
            SQLServer,
            SP
        }
        public enum SQLS
        {
        };
        private static SQLConnect init()
        {
            return new SQLConnect(SQLServerName, SQLServerDatabaseName);
        }
        private static Boolean execute(ref SQLConnect _SQLConnect, String SQLStatement, SQLConnect.outputType _outputType)
        {
            Boolean success = true;
            switch (databaseType)
            {
                case dbTypes.access:
                    success = _SQLConnect.runQuery(getConnectionString(), SQLStatement, SQLConnect.connectionType.OleConnection, _outputType);
                    break;
                case dbTypes.BPCS:
                case dbTypes.BPCS_PO:
                case dbTypes.BPCSF:
                    success = _SQLConnect.runQuery(getConnectionString(), SQLStatement, SQLConnect.connectionType.OdbcConnection, _outputType);
                    break;
                case dbTypes.SQLServer:
                    success = _SQLConnect.runMSSQLQuery(SQLStatement, _outputType);
                    break;
                case dbTypes.SP:
                    success = _SQLConnect.runSPQuery(SQLStatement, optvals, _outputType);
                    break;
            }
            if (!success)
            {
                errMess = _SQLConnect.ErrorMessage;
                return false;
            }
            return true;
        }

        private static Boolean doWork(String SQLStatement, SQLConnect.outputType _outputType)
        {
            var SQLObj = init();
            if (!execute(ref SQLObj, SQLStatement, _outputType)) { return false; }
            switch (_outputType)
            {
                case SQLConnect.outputType.arrayOutput:
                    results = SQLObj.results;
                    QueryHeaders = SQLObj.columnNames;
                    break;
                case SQLConnect.outputType.forRemoteQ:
                    DOResults = SQLObj.DOresults;
                    break;
            }
            return true;
        }

        public static Boolean doQuery(SQLS SQL, String[] _optvals, SQLConnect.outputType _outputType)
        {
            optvals = _optvals;
            String SQLState = getSQL(SQL);
            return doQuery(SQLState, _outputType);
        }
        public static Boolean doQuery(String SQL, SQLConnect.outputType _outputType)
        {
            return doWork(SQL, _outputType);
        }
        public static Boolean doSPQuery(String storedProcedureName, String[] parameters, SQLConnect.outputType _outputType)
        {
            optvals = parameters;
            databaseType = dbTypes.SP;
            return doWork(storedProcedureName, _outputType);
        }
        public static String[,] cloneResults()
        {
            if (results == null) { return null; }
            var strOut = new String[results.GetLength(0), results.GetLength(1)];
            for (int i = 0; i < results.GetLength(1); i++)
            {
                for (int n = 0; n < results.GetLength(0); n++)
                {
                    strOut[n, i] = results[n, i];
                }
            }
            return strOut;
        }
    }
}
