/*jslint browser: true  plusplus: true  */
/*Help Topics*/
/// <reference path="common.js" />
//HELPTOPICS object contains various function object that return a single object
//The Object returns has the folloing structure
//{
//  content: Array of Objects (see structure below) containing the content to be displayed
//  title: String containing the titel of the topic
//}
//The structure of content:
//{
//  tag: String containing the name of the tag to create includes h2, h3, div, p, and ul
//  ih: String containing the text to add to the innerHTML of the tag except for ul where it is an Array of strings where each element of the array is a list item
//}
var HELPTOPICS = {};
HELPTOPICS["0"] = function () {
    "use strict";
    //topic 0
    var obj, content;
    obj = {};
    obj.title = "Work Order List";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "This is the main page where you can see all work orders that are in the system.  You can use the filters to help search for a particular work order, use the sorting button or the drop down filters located under the headers"));
    content.push(COMMON.createHelpContentObj("div", "<img style=\"border:0; padding:0; margin:0;\" src=\"jpg/help0figure1.jpg\" alt=\"Image shows Sort Button and Column filter\" />"));
    content.push(COMMON.createHelpContentObj("p", "Click the sort button once to sort ascending, click the same button to sort descending. The Column filters contain a list of every value displayed. Select All to display all items or one value to display records that have the value selected.  There is also a search dialog that will show records that contain the text entered in any one column"));
    content.push(COMMON.createHelpContentObj("p", "You can view details or Add notes to existing work orders. Logged in users can Edit some aspects of existing work orders.</p><p>from this screen you can Log In if you are in the maintenance department or create a new work order."));
    content.push(COMMON.createHelpContentObj("p", "Search Work orders by typing anything from the work order in the Search text box.  A list of work orders matching your search criteria will appear where you can select the appropriate work order.  See the help topic on the search screen for more information."));
    content.push(COMMON.createHelpContentObj("h3", "Create a New Work Order"));
    content.push(COMMON.createHelpContentObj("p", "Work order can be initiated by any user whether logged in or not. Enter your name, contact email or phone, select the work location, work type and priority. Enter a Summary that will tell the maintenance department about the issue. All fields except for New Note are required and need a value selected or entered. Use New Note to enter any details you want to attach to the work order"))
    obj.content = content;
    return obj;
};
HELPTOPICS["1"] = function () {
    "use strict";
    //topic 1
    var obj, content;
    obj = {};
    obj.title = "Search Work Orders";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "After entering a search term in the Search text box you may get results of Work Orders that match. Use the Clear Search button to return to the Home Page view"));
    obj.content = content;
    return obj;
};
HELPTOPICS["2"] = function () {
    "use strict";
    //topic 2
    var obj, content;
    obj = {};
    obj.title = "Loging In";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "Users of the Maintenance department are the only users required to log in. Most users do not need to log in. Enter your username and password in the text boxes provided. Check the check box labelled &quot;Keep me logged in&quot; to keep the session open for 20 hours or you will be logged out once you close your browser window"));
    obj.content = content;
    return obj;
};
HELPTOPICS["3"] = function () {
    "use strict";
    //topic 3
    var obj, content;
    obj = {};
    obj.title = "Settings";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "Use this screen to edit user selections when they enter a new work order. You Have to be supervisor security level to be able to manage these lists.  Select the list you want to edit by choosing it from the drop down list. The list are Priority, work location, work type and Notification Recipients. Add a new item to the list by entering the Sort Order and Item in the blank text box at the top of the page. Sort Order is used for sorting the list items. Edit existing item by typing in the text boxes in the grid at the botom of the page. In addition, you can select whether the list item is enabled or not. Disabled list items will not appear in the drop down list.  You can also delete the items by clicking on the button provided. The only list items that can be deleted are items that are not being used else where in the database.  If you cannot delete the list item, disabling will result in the item not being displayed for new work orders. Just like any grid, you can sort the items by clicking on the column headers. Click a second time to reverse sort the item. You can also filter items by choosing the item to be filtered from the drop down list just under the column headings"));
    obj.content = content;
    return obj;
};
HELPTOPICS["4"] = function () {
    "use strict";
    //topic 4
    var obj, content;
    obj = {};
    obj.title = "Manage Users";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "From here you can review existing users, create new users, edit existing users and Deactivate existing users all by clicking the appropraite button. If the user is locked for entering too many wrong password, you can unlock him by using the provided button. Deactivated users cannon log in and can be reactivated by using the button provided</p><p>As with any grid you can sort the list by using the header buttons and filter by using the drop down lists below the header buttons"));
    content.push(COMMON.createHelpContentObj("h3", "Create New User"))
    content.push(COMMON.createHelpContentObj("p", "Enter as must information as possible in the text boxes provided, select the desired security role and click Save to save. Fields marked with * are required"))
    obj.content = content;
    return obj;
};
HELPTOPICS["5"] = function () {
    "use strict";
    //topic 5
    var obj, content;
    obj = {};
    obj.title = "Edit Work Order";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "Use this screen to see the status and any notes associated with the work order.  You can also add your own notes to this work order.  The maintenance department will be notified of new notes added to the work order"));
    content.push(COMMON.createHelpContentObj("p", "Enter the note and click save to continue. Click on Print Work Order to print the work order.  This requires popups."));
    obj.content = content;
    return obj;
};
HELPTOPICS["9"] = function () {
    "use strict";
    //topic 5
    var obj, content;
    obj = {};
    obj.title = "Edit Work Order";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "Use this screen to see the status and any notes associated with the work order.  You can also add your own notes to this work order. Enter the note and click save to continue"));
    content.push(COMMON.createHelpContentObj("p", "A work order can be cancelled if needed. You can also state that the work has been completed and ready for supervisor approval by clicking on the Maintenance Completed button. Only work orders assigned to any maintenance worker can be flag as maintenance completed by any worker. Work orders can also be rejected by the supervisor.  A work order with rejected status can be resubmitted by clicking the Maintenance Completed button. Enter notes as appropriated to explain any changes. Click on Print Work Order to print the work order.  This requires popups."));
    obj.content = content;
    return obj;
};
HELPTOPICS["10"] = function () {
    "use strict";
    //topic 5
    var obj, content;
    obj = {};
    obj.title = "Edit Work Order";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "Use this screen to see the status and any notes associated with the work order.  You can also add your own notes to this work order. Enter the note and click save to continue"));
    content.push(COMMON.createHelpContentObj("p", "On work orders that have been assigned, you can cancel the work order or click on Maintenance Completed to flag the work order as ready to be inspected. On work orders marked as &quot;Maintenance Completed&quot; the supervisor can reject or close the work order. Rejecting the work order notifies the maintenance worker that some action needs to be done before closing the work order. Closing the work order signifies that all work has been completed on the work order. The supervisor can re-open a closed work order. Click on Print Work Order to print the work order.  This requires popups."));
    obj.content = content;
    return obj;
};
HELPTOPICS["11"] = function () {
    "use strict";
    //topic 5
    var obj, content;
    obj = {};
    obj.title = "Add New Work Order";
    content = [];
    content.push(COMMON.createHelpContentObj("p", ">Work order can be initiated by any user whether logged in or not. Enter your name, contact email or phone, select the work location, work type and priority. Enter a Summary that will tell the maintenance department about the issue. All fields except for New Note are required and need a value selected or entered. Use New Note to enter any details you want to attach to the work order"));
    obj.content = content;
    return obj;
};
HELPTOPICS["6"] = function () {
    "use strict";
    //topic 6
    var obj, content;
    obj = {};
    obj.title = "Manage Notifications";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "Use this screen to manage what events will cause a notification email to be sent.  The notification list shows the email addresses that will receive a notification.  This is control in Settings. Place a check mark by the event you want to have notification sent."));
    obj.content = content;
    return obj;
};
HELPTOPICS["7"] = function () {
    "use strict";
    //topic 7
    var obj, content;
    obj = {};
    obj.title = "Equipment Part";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "This screen helps you control parts that have been ordered for maintenance. A part may or may not be associated with a work order. This screen list part orders based on the filter selected. You can filter by order date or the type.  Add a new Equipemnt Part Order by clicking on the button or select an existing order to manage it."));
    obj.content = content;
    return obj;
};
HELPTOPICS["8"] = function () {
    "use strict";
    //topic 8
    var obj, content;
    obj = {};
    obj.title = "Manage Part Order";
    content = [];
    content.push(COMMON.createHelpContentObj("p", "This screen allows you to add parts to an order and manage existing part orders. To add a new order, click on the add new button. Once added, part orders can be managed by receiving parts or you can delete any part order that has not received any parts."));
    obj.content = content;
    return obj;
};