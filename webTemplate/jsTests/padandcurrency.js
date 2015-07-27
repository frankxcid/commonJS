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