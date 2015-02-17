using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace webTemplate
{
    public partial class index : System.Web.UI.Page
    {
        UserData currentUser = null;
        protected void Page_Load(object sender, EventArgs e)
        {
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
            if (SQLHelper.results == null) { return; }//no results
            firstName = SQLHelper.results[0, 0];
            LastName = SQLHelper.results[1, 0];
            email = SQLHelper.results[2, 0];
            userName = SQLHelper.results[3, 0];
            domain = SQLHelper.results[4, 0];
            city = SQLHelper.results[5, 0];
            companyName = SQLHelper.results[6, 0];
            fullName = SQLHelper.results[7, 0];
            isAdmin = (SQLHelper.results[8, 0] == "1");
            limit = decimal.Parse(SQLHelper.results[9, 0]);
            roleId = int.Parse(SQLHelper.results[10, 0]);
            roleName = SQLHelper.results[11, 0];
            roleDescription = SQLHelper.results[12, 0];
            hasSignature = (SQLHelper.results[13, 0] == "1");
            isBuyer = (SQLHelper.results[14, 0] == "1");
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