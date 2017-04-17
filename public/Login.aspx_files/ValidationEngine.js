/* 验证非空*/
function ValidateIsNull(controlID, showMsgControlID, message, result1) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    else {
        document.getElementById(showMsgControlID).style.visibility = 'hidden';
        document.getElementById(showMsgControlID).innerText = "";
    }
    return result1;
}

/* 验证数字*/
function ValidateIsNumber(controlID, showMsgControlID, message, result1) {
    var _controlValue = document.getElementById(controlID).value;

    if (trim(_controlValue).length == 0) {
        return result1;
    }
    var _NumRg = /^\d+(\.\d+)?$/; /* 验证数字*/
    if (!_NumRg.test(_controlValue)) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    else {
        document.getElementById(showMsgControlID).style.visibility = 'hidden';
        document.getElementById(showMsgControlID).innerText = "";
    }
    return result1;
}

/* 验证邮件*/
function ValidateIsEmail(controlID, showMsgControlID, message, result1) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        return result1;
    }
    var _rg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;
    if (!_rg.test(_controlValue)) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    else {
        document.getElementById(showMsgControlID).style.visibility = 'hidden';
        document.getElementById(showMsgControlID).innerText = "";
    }
    return result1;
}

/* 验证日期*/
function ValidateIsDate(controlID, showMsgControlID, message, result1) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        return result1;
    }
    var _rg = new RegExp(/^(\d{1,4})\-(\d{1,2})\-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/); /*验证日期*/
    if (!_rg.test(_controlValue)) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    else {
        document.getElementById(showMsgControlID).style.visibility = 'hidden';
        document.getElementById(showMsgControlID).innerText = "";
    }
    return result1;
}

/* 验证日期*/
function ValidateIsDateNoTime(controlID, showMsgControlID, message, result1) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        return result1;
    }
    var _rg = new RegExp(/^\d{4}-\d{1,2}-\d{1,2}$/); /*验证日期*/
    if (!_rg.test(_controlValue)) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    else {
        document.getElementById(showMsgControlID).style.visibility = 'hidden';
        document.getElementById(showMsgControlID).innerText = "";
    }
    return result1;
}

/* 验证时间：15:00*/
function ValidateIsTime(controlID, showMsgControlID, message, result1) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        return result1;
    }
    var _rg = new RegExp(/([0-1]?[0-9]|2[0-3]):([0-5][0-9])/); /* 验证时间：15:00*/
    if (!_rg.test(_controlValue)) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    else {
        document.getElementById(showMsgControlID).style.visibility = 'hidden';
        document.getElementById(showMsgControlID).innerText = "";
    }
    return result1;
}

/* 比较日期大小*/
function ValidateComareDate(startControlID, endControlID, showMsgControlID, message, result1) {
    var _startControlValue = document.getElementById(startControlID).value;
    var _endControlValue = document.getElementById(endControlID).value;

    var _rg = new RegExp(/^\d{4}-\d{1,2}-\d{1,2}$/); /*验证日期*/
    if (trim(_startControlValue).length == 0) {
        return result1;
    }
    if (trim(_endControlValue).length == 0) {
        return result1;
    }

    if (!_rg.test(_startControlValue)) {

        return result1;
    }
    if (!_rg.test(_endControlValue)) {

        return result1;
    }
    var _startDate = new Date(_startControlValue.replace(/-/g, "/"));
    var _endDate = new Date(_endControlValue.replace(/-/g, "/"));
    if (Date.parse(_startDate) - Date.parse(_endDate) > 0) {
        document.getElementById(showMsgControlID).style.visibility = 'visible';
        document.getElementById(showMsgControlID).innerText = message.toString();
        result1 = false;
    }
    return result1;
}


//jquery check   wengjm    2010-3-16
//Compare Time
function opinionStartTimeEndTime(stime, etime) {
    var qstrat = $("#" + stime).val();
    var qend = $("#" + etime).val();
    if (qend != null && qend != "" && qstrat != "" && qstrat != null) {
        tmpBeginTime = new Date(qstrat.replace(/-/g, "\/"));
        tmpEndTime = new Date(qend.replace(/-/g, "\/"));
        if (tmpBeginTime > tmpEndTime) {
            alert("开始时间大于结束时间");
            $("#" + stime).val("");
            $("#" + etime).val("");
            return false;
        }
    }
    else {
        return true;
    }
}

//GridView CheckDelete  
function delcheck() {
    var flage = false;
    var num = $(":checkbox:checked").not(":checkbox[name=chSelectall]").size();
    if (num > 0) {
        flage = true;
    }
    if (!flage) {
        alert("请选择要操作的项！");
        return false;
    }
    else {
        if (confirm("确认要操作吗？")) {
            return true;
        }
        else {
            return false;
        }
    }
}

//IsNull
function ValidateIsNull(txtvalue, alertinfo) {
    var flage = false;
    if ($("#" + txtvalue).val() == "" || $("#" + txtvalue).val() == null) {
        flage = true;
    }
    if (flage) {
        return alertinfo;
    }
    else {
        return "";
    }
}

//Number
function ValidateIsNumber(txtValue, message) {
    var _control = document.getElementById(txtValue);
    if (_control != null) {
        _value = _control.value;
        if (trim(_value).length != 0) {
            var exp = /^([1-9][0-9]*|0)$/;
            if (!exp.test(_value)) {
                _control.value = 0;
                return message;
            }
        }
        return "";
    }
    else {
        alert(controlID + " is not definition!\n")
    }

}
// Number
function ValidateValIsNumber(value, alertinfo) {
    var flage = false;
    if (value != "") {
        var exp = /^([1-9][0-9]*|0)$/;
        if (!exp.test(value)) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}
/* 验证非空*/
function ValidateIsNullForAlert(controlID, showMsg) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        return showMsg;
    }
    return "";
}

function ValidateIsDecimal(controlID, message) {
    var _control = document.getElementById(controlID);
    if (_control != null) {
        _value = _control.value;
        if (trim(_value).length != 0) {
            //            var _NumRg = /^(\d{1,18})(\.\d{1,2})?$/;
            var _NumRg = /^[\d]+\.?[\d]*$/;
            if (!_NumRg.test(_value)) {
                _control.value = 0;
                return message;
            }
        }
        return "";
    }
    else {
        alert(controlID + " is not definition!\n")
    }
}
function ValidateValIsDecimal(value, message) {
    var flage = false;
    if (value != "") {
        var exp = /^[\d]+\.?[\d]*$/;
        if (!exp.test(value)) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}
function trim(str) {
    if (str != null) {
        return str.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
    }
}

/* 验证非空*/
function ValidateIsNullForDDL(controlID, showMsg) {
    var _controlValue = document.getElementById(controlID).value;
    if (trim(_controlValue).length == 0) {
        return showMsg;
    }
    else if (_controlValue == 0) {
        return showMsg;
    }
    return "";
}
//Email
function ValidateIsEmail(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//QQ
function ValidateIsQQ(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /[1-9]\d{4,12}/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//Phone and Fax
function ValidateIsPhone(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /^(\d{3,4}-?)?\d{7,9}$/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//Mobile
function ValidateIsMobile(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//PostCode
function ValidateIsPostCode(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /[1-9]\d{5}(?!\d)/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//CardNO
function ValidateIsCardNO(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /\d{15}|\d{18}/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//Number or  Letter
function ValidateIsNumberOrLetter(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /^[A-Za-z0-9]+$/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

//Money 1 point
function ValidateIsMoney(txtValue, alertinfo) {
    var flage = false;
    if ($("#" + txtValue).val() != "") {
        var exp = /^(0|[1-9]\d*)$|^(0|[1-9]\d*)\.(\d{0,2})$/;
        if (!exp.test($("#" + txtValue).val())) {
            return alertinfo;
        }
        else {
            return "";
        }
    }
    else {
        return "";
    }
}

function checkenable(obj, messages) {
    if (!obj.disabled) {
        if (confirm(messages)) {
            return true;
        }
    }
    return false;
}

function cleartextbox(txtvalue, txthidden) {
    if (confirm("是否要清空？")) {
        $("#" + txtvalue).val("");
        $("#" + txthidden).val("");
    }
}