<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="webTemplate.index" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">    
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="PRAGMA" content="NO-CACHE" />
    <title></title>
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link href="css/calendar.css" rel="stylesheet" />
    <link href="css/fillinform.css" rel="stylesheet" />
    <link href="css/displaygrid.css" rel="stylesheet" />
    <link href="css/main.css" rel="stylesheet" />
    <link href="css/menu.css" rel="stylesheet" />
    <script src="js/ajaxpost.js"></script>
    <script src="js/calendar.js"></script>
    <script src="js/common.js"></script>
    <script src="js/displaygrid.js"></script>
    <script src="js/fillinform.js"></script>
    <script src="js/helptopics.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/timepicker.js"></script>
    <script src="js/main.js"></script>
</head>
<body>
    <div id="divHeader" style="text-align:left;"></div>
    <form id="amain" runat="server">
    <asp:Panel ID="pnMess" runat="server">&nbsp;</asp:Panel>
    <!--On Post Back, txtObject has the name of the button which caused the post back-->
        <asp:HiddenField ID="txtObject" runat="server" />
        <!--Used by help to determine what page the user is currently looking at to display appropriate help page-->
        <asp:HiddenField ID="txtCurrentPage" runat="server" />        
        <!--Maintains an array (in JSON string form) with page history, used to control back and next page browser buttons-->
        <asp:HiddenField ID="txtPageHistory" runat="server" />
        <!--Used by scripts Current User Name-->
        <asp:HiddenField ID="txtCurrentUserName" runat="server" />
        <!--Used by scripts to send data to server as JSON-->
        <asp:HiddenField ID="txtData1" runat="server" />
        <!--User Data-->
        <asp:HiddenField ID="txtUserData" runat="server" />
        <!--Keep the search string stored-->
        <asp:HiddenField ID="txtSearchStore" runat="server" />

        <asp:Panel ID="pnMainTop" runat="server" ></asp:Panel>       
        <script>
            MAIN.initPage();
        </script>       
        <asp:Panel ID="pnScript" runat="server"></asp:Panel> 
    </form>
</body>
</html>
