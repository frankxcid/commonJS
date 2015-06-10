///<reference path="../js/common.js"/>
test("get the diff in months 11/30/1969, 03/01/1970", function () {
    var sdate = new Date("11/30/1969");
    var edate = new Date("03/01/1970");
    var res = COMMON.dateDiff("M", sdate, edate);
    equal(res, 4, "should be 4");
});
test("get the diff in months 03/01/1970, 11/30/1969", function () {
    var edate = new Date("11/30/1969");
    var sdate = new Date("03/01/1970");
    var res = COMMON.dateDiff("M", sdate, edate);
    equal(res, -4, "should be -4");
});
test("get the diff in days 11/30/1969, 03/01/1970", function () {
    var sdate = new Date("11/30/1969");
    var edate = new Date("03/01/1970");
    var res = COMMON.dateDiff("D", sdate, edate);
    equal(res, 91, "should be 91");
});
test("get the diff in days 03/01/1970, 11/30/1969", function () {
    var edate = new Date("11/30/1969");
    var sdate = new Date("03/01/1970");
    var res = COMMON.dateDiff("D", sdate, edate);
    equal(res, -91, "should be -91");
});
test("get the diff in years 11/30/1969, 03/01/1970", function () {
    var sdate = new Date("11/30/1969");
    var edate = new Date("03/01/1970");
    var res = COMMON.dateDiff("Y", sdate, edate);
    equal(res, 1, "should be 1");
});
test("get the diff in years 03/01/1970, 11/30/1969", function () {
    var edate = new Date("11/30/1969");
    var sdate = new Date("03/01/1970");
    var res = COMMON.dateDiff("Y", sdate, edate);
    equal(res, -1, "should be -1");
});
test("get the diff in days set to today", function () {
    var sdate = new Date("06/10/2015"); //change this to today
    var edate = new Date();
    var res = COMMON.dateDiff("D", sdate, edate);
    equal(res, 0, "should be 0");
});