///<reference path="../js/common.js"/>
test("pad zero", function () {
    var str = "ThisOne";
    var chars = 0;
    var res = str.padRight("0", 0);
    equal(res, str, "should not change");
});
test("do parens none", function () {
    var amount = "25.75";
    var res = COMMON.formatCurrency(amount, null, 3, true);
    equal(res, "25.750", "three decimals");
});
test("do parens show", function () {
    var amount = "-25.75";
    var res = COMMON.formatCurrency(amount, null, 3, true);
    console.log(res);
    equal(res, "(25.750)", "three decimals with parens");
});
test("do not parens positive", function () {
    var amount = "25.75";
    var res = COMMON.formatCurrency(amount, null, 3);
    equal(res, "25.750", "three decimals");
});
test("do not parens negative", function () {
    var amount = "-25.75";
    var res = COMMON.formatCurrency(amount, null, 3);
    console.log(res);
    equal(res, "-25.750", "three decimals with negative");
});
test("return a string that has comma and parens intact", function () {
    var val = "This is, (not to me, here), and some more";
    var res = COMMON.unformatNumber(val);
    console.log("1: " + res);
    equal(res, val, "should not change");
});
test("return a string that has comma and parens intact surrounded", function () {
    var val = "(This is, (not to me, here)1234, and some more)";
    var res = COMMON.unformatNumber(val);
    console.log("2: " + res);
    equal(res, val, "should not change");
});
test("number with commas", function () {
    var val = "123,000.1";
    var res = COMMON.unformatNumber(val);
    console.log("3: " + res);
    equal(res, "123000.1", "remove commas");
});
test("number with commas negative", function () {
    var val = "-123,000.1";
    var res = COMMON.unformatNumber(val);
    console.log("4: " + res);
    equal(res, "-123000.1", "remove commas");
});
test("number not properly formated", function () {
    var val = "(-123,000.1)";
    var res = COMMON.unformatNumber(val);
    console.log("5: " + res);
    equal(res, val, "same as input");
});
test("number with commas negative with parens", function () {
    var val = "(123,000.1)";
    var res = COMMON.unformatNumber(val);
    console.log("6: " + res);
    equal(res, "-123000.1", "remove commas");
});
test("number with no commas negative parens", function () {
    var val = "(123.1)";
    var res = COMMON.unformatNumber(val);
    console.log("7: " + res);
    equal(res, "-123.1", "remove commas");
});
test("number not properly formated 2", function () {
    var val = "(123,000.1";
    var res = COMMON.unformatNumber(val);
    console.log("8: " + res);
    equal(res, val, "same as input");
});
test("number with no commas negative", function () {
    var val = "-123.1";
    var res = COMMON.unformatNumber(val);
    console.log("9: " + res);
    equal(res, "-123.1", "remove commas");
});
test("positive number no commas", function () {
    var val = "123.1";
    var res = COMMON.unformatNumber(val);
    console.log("10: " + res);
    equal(res, "123.1", "same as input");
});
test("with number", function () {
    var val = 4123.1;
    var res = COMMON.unformatNumber(val);
    console.log("11: " + res);
    equal(res, "4123.1", "same as input but string");
});