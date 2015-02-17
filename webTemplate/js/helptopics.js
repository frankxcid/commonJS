/*jslint browser: true  plusplus: true  */
/*bonus Structure Help Topics*/
var HELPTOPICS = {};
HELPTOPICS["0"] = function () {
    "use strict";
    //topic 0
    var obj, content;
    obj = {};
    obj.title = "Home Page";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "This pages shows that calculated payout of the group you are assigned to and those of your subordinates.  Select the quarter you wish to display from the list of calculated quarters. Use the menu to display navigate to other components of the application." });
    content.push({ "tag": "h3", "ih": "Columns" });
    content.push({ "tag": "ul", "ih": ["Metric Rule - The name of the rule for which the data is displayed.", "Max Payout - (Set by administrator in Metrics Setup-->Quarterly Max Payouts) The maximum payout posible", "Total target - (Set by Administrator in Metrics Setup-->Quarterly Targets) The total of target values of all metrics in this rule.", "Total Actual (Set by Administrator in Metrics Setup-->Quarterly Targets) The total of all actual values of all metrics in this rule", "Ratio Basis - (Set by Administrator in Metric Setup-->Metric Payout Rules) Determines how the ratio is calculated that is compared with rule to determine the percentage of the max payout", "Percentage To Target - Calculated based on the ratio basis.", "Payout Percentage - Calculated by comparing the Percentage to Target and the thresholds in the Metrics rule.", "Calculated Payout - The result when the payout percentage is multiplied by the max payout"] });
    obj.content = content;
    return obj;
};
HELPTOPICS["1"] = function () {
    "use strict";
    //topic 1
    var obj, content;
    obj = {};
    obj.title = "Manage Employees/Users";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Displays a listing of all user/Employees of this application. From here you can Edit, delete and add users.  You can also disable employees" });
    content.push({ "tag": "h3", "ih": "User Actions" });
    content.push({ "tag": "ul", "ih": ["Edit - Enables you to change aspects of an individual user", "Change Status - Click this button to disable active employees so they can no longer use this application and will no longer be available for selection in other location of the application", "Delete - Allows you to delete a user.  You can only delete employees that are not assigned to a group"] });
    content.push({ "tag": "h3", "ih": "Edit a User/Create New User" });
    content.push({ "tag": "div", "ih": "Enter all required information on fields marked with *. Users must have a group assignment, Name, Login Name." });
    obj.content = content;
    return obj;
};
HELPTOPICS["2"] = function () {
    "use strict";
    //topic 2
    var obj, content;
    obj = {};
    obj.title = "Manage Groups";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Displays a listing of groups. You can ad groups, change the name and status, delete the group, add metrics rules to a specific group or view the employees who are members of this group. To change the group name, change the text in the box provided and click Save.  Click &quot;Add New Group&quot; to add a group. Enter the name and click save.  The Group will now appear in the listing. " });
    content.push({ "tag": "h3", "ih": "User Actions" });
    content.push({ "tag": "ul", "ih": ["Change Status - Click this button to disable an active group or return an in-active group back to active status", "Delete - Allows you to delete a Group.  You can only delete groups that are not assigned to a user or have rule attached to them", "Manage Group Rules - Allows you to add rules to this group. Rules are configured in Metric Setup-->Metric Payout rules from the menu.", "Group Members - Displays a listing of which employees are assigned to the group."] });
    obj.content = content;
    return obj;
};
HELPTOPICS["9"] = function () {
    "use strict";
    //topic 9
    var obj, content;
    obj = {};
    obj.title = "Manage Group Rules";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Displays a listing of rules assigned to a particular group. You can add rules by clicking on the Add Rule button, selecting a rule that is not already in this group and clicking save.  Rules can be removed by clicking on the Delete button. Group Rules that have payout data cannot be deleted. You can change the active status by clicking on the Change Status button. Inactive Group rules will no longer be displayed elsewhere in the application" });
    obj.content = content;
    return obj;
};
HELPTOPICS["3"] = function () {
    "use strict";
    //topic 3
    var obj, content;
    obj = {};
    obj.title = "Manage Metrics";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Displays a listing of all metrics in use in this application. Metrics are the basic blocks of Metrics Rules. From this page you can change how a metric behaves within a Rule. You can add a metric, change the data of an existing metric and see which rule contain a particular metric" });
    content.push({ "tag": "h3", "ih": "Metric Columns" });
    content.push({ "tag": "ul", "ih": ["Name - identifies the metric", "Description - a brief description of the metric", "Priority Position - The order in which a metric will be used in a rule", "Metric Type - Designates if this metric will affect the target or actual total of a rule. Assets are positive and Liability is negative. For example AP Days will be removed from the totals of AR days in a rule that has both because AP days is a liability"] });
    content.push({ "tag": "h3", "ih": "User Actions Buttons" });
    content.push({ "tag": "ul", "ih": ["Move UP, Move Down, Change Priority - Use the buttons to affect the Priority Position of the metric in comparison to its neighbors", "Delete - You can delete the metric as long as it is not part of a rule or used historically", "Info - Shows which rule has this metric and which groups have the rule"] });
    obj.content = content;
    return obj;
};
HELPTOPICS["4"] = function () {
    "use strict";
    //topic 4
    var obj, content;
    obj = {};
    obj.title = "Manage Metric Payout Rules";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Displays a listing of Rules that are used to calculate payout for groups. One or more rules can be assigned to a group.  Rules describe the rational relationship between the target goal of a metric and the actual value.  It also gathers the value of one or more metrics. Finally, a rule describes the comparison between the target-actual ratio and the thresholds for payout percentages. From this page you can add a new rule or affect existing rules" });
    content.push({ "tag": "h3", "ih": "Rule Columns" });
    content.push({ "tag": "ul", "ih": ["Rule Name - Identifies the rule", "Rule Basis - Describe the rational relationship between target goal and actual value for metrics within this rule", "Status - Shows whether the rule is active or not. Inactive rules will not be displayed elsewhere in the application."] });
    content.push({ "tag": "h3", "ih": "User Actions Buttons" });
    content.push({ "tag": "ul", "ih": ["Edit - Displays the edit rule page, allows you to changes rule settings", "Change Status - Change the active status of the rule", "Delete - Allows you to delete a rule. Rule cannot be deleted if it has be used to calculate a payout in the past, consider setting the status of the rule to inactive instead", "Show Groups - Displays a list of groups that have this rule assigned"] });
    obj.content = content;
    return obj;
};
HELPTOPICS["5"] = function () {
    "use strict";
    //topic 5
    var obj, content;
    obj = {};
    obj.title = "Edit Rule";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Change the settings of a rule from this page.  Change the name and ratio basis if neede and click save. You can add or remove metrics from this rule. Finally, you can add, remove or edit thresholds from the rule." });
    content.push({ "tag": "h3", "ih": "Metrics" });
    content.push({ "tag": "div", "ih": "The grid shows a listing of metrics assign to this rule. Add a metric by clicking on the &quot;Add Metric to this rule&quot; button, select a metric and click save. Remove metrics by clicking on the button.  You cannot remove metrics from rules if the metrics was used to calculate a payout in the past. Consider disabling the rule and creating a new rule to maintain historical data" });
    content.push({ "tag": "h3", "ih": "Thresholds" });
    content.push({ "tag": "div", "ih": "The threshold grid is a listing of threshold aspects of this rule.  You can add, remove or edit existing thresholds.  Add a new threshold by clicking on the &quot;Add a New Threshold to this rule&quot; button. Enter the information and click save. Edit an existing threshold by changing the data in the grid and click the Save Changes button. Finally, remove a threshold by clicking on the Remove button. You cannot remove a threshold that was historically used in calculating a payout. Consider disabling the rule and creating a new one to maintain historical integrity." });
    content.push({ "tag": "h3", "ih": "Threshold Description" });
    content.push({ "tag": "ul", "ih": ["Beings At Percent - this is the begining of the threshold. When comparing with the actual-to-target ratio, the threshold applies if the ratio is greater than or equal to this percentage and is lower than the next higher threshold.  If there is no more higher thresholds, the upper limit is considered to be infinity so it will capture all values including ratios greater than 100&#37;", "Max Payout Percent - Denotes the highest payout percent that can be obtained when this threshold is in effect.", "Payout Style - describes how the max payout percentage will be applied. Fixed means that all values that have this threshold in effect will be given the max payout percentage. Scaled will calculate the percentage of the max payout percent multiplied by the ratio of (target_to_actual_ratio - begins_at_Percent)/(next_higher_threshold_or_100 - begins_at_percent)"] });
    obj.content = content;
    return obj;
};
HELPTOPICS["6"] = function () {
    "use strict";
    //topic 6
    var obj, content;
    obj = {};
    obj.title = "Quarterly Actual-Target Values";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "This page allows you to enter metric values for each quarter. It is here where an administrator can create a new quarter for payout calculations. Existing quarters are listed in the grid, but you can add data for new quarters.  Add a new quarter by selecting the quarter from the list and clicking save.  Creating a new quarter creates records for all metrics that are active and blank payout records for each group-rule so the administrator can enter max payout. Locked quarters can be viewed but not edited." });
    obj.content = content;
    return obj;
};
HELPTOPICS["7"] = function () {
    "use strict";
    //topic 7
    var obj, content;
    obj = {};
    obj.title = "Edit Metric Values";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Enter Target and Actual values for each metric on this page.  Make changes and add values as required and click Save.  Click the Info button to view the rules and groups the metric belongs to." });
    obj.content = content;
    return obj;
};
HELPTOPICS["8"] = function () {
    "use strict";
    //topic 8
    var obj, content;
    obj = {};
    obj.title = "Manage Group Rule Payout Max Amount";
    content = [];
    content.push({ "tag": "h2", "ih": "Introduction" });
    content.push({ "tag": "div", "ih": "Use this page to enter the max payout for each rule within each group. When you change data and click Save and Calculate, the Max payout will be saved and Final payout calculated. Select the Group and the quarter, enter the max payout for each rule and click &quot;Save and Calculate&quot;. You can click Save and Calculate even without making any changes to refresh calculated payout such as when a rule is changed, or metric values have been changed.  This is the only place where the final calculated payout is set." });
    obj.content = content;
    return obj;
};