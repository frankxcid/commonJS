using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using SQLConnectLibrary;

namespace webTemplate
{
    public partial class index : System.Web.UI.Page
    {
        UserData currentUser = null;
        protected void Page_Load(object sender, EventArgs e)
        {
            //init SQLHelper
            SQLHelper.SQLServerName = "";
            SQLHelper.SQLServerDatabaseName = "";
            currentUser = new UserData(HttpContext.Current.User.Identity.Name.ToString());
            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            String strOut = oSerializer.Serialize(currentUser); //JSON.stringify
            strOut = strOut.Replace("&", "&amp;");
            txtUserData.Value = strOut;
        }
    }
    public class UserData
    {
        //Constructor
        public UserData(String _username)
        {
            if (_username == null || _username == "") { return; }//exit if bad name
            if (_username.IndexOf('\\') >= 0) { _username = _username.Substring(_username.IndexOf('\\') + 1); } //remove domain if present
            String[] param = { _username };
            
            if (!SQLHelper.doSPQuery("getUserData", param, SQLConnectLibrary.SQLConnect.outputType.arrayOutput)) { return; }
            if (SQLHelper.Results == null) { return; }//no results
            firstName = SQLHelper.Results[0, 0];
            LastName = SQLHelper.Results[1, 0];
            email = SQLHelper.Results[2, 0];
            userName = SQLHelper.Results[3, 0];
            domain = SQLHelper.Results[4, 0];
            city = SQLHelper.Results[5, 0];
            companyName = SQLHelper.Results[6, 0];
            fullName = SQLHelper.Results[7, 0];
            isAdmin = (SQLHelper.Results[8, 0] == "1");
            limit = decimal.Parse(SQLHelper.Results[9, 0]);
            roleId = int.Parse(SQLHelper.Results[10, 0]);
            roleName = SQLHelper.Results[11, 0];
            roleDescription = SQLHelper.Results[12, 0];
            hasSignature = (SQLHelper.Results[13, 0] == "1");
            isBuyer = (SQLHelper.Results[14, 0] == "1");
            isValidUser = true;
        }

        //Public Properties
        public String firstName = "";
        public String LastName = "";
        public String email = "";
        public String userName = "";
        public String domain = "";
        public String city = "";
        public String companyName = "";
        public String fullName = "";
        public Boolean isAdmin = false;
        public Boolean isBuyer = false;
        public Decimal limit = 0;
        public int roleId = -1;
        public String roleName = "";
        public String roleDescription = "";
        public Boolean hasSignature = false;
        public Boolean isValidUser = false;
    }
}