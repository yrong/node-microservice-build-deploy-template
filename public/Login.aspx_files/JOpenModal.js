function Flow() {
    $("#showImg").fancybox({
        'width': '100%',
        'height': '100%',
        'transitionIn': 'elastic',
        'imageScale': true,
        'overlayShow': true,
        'speedIn': 600,
        'overlayOpacity': 0.7,
        'autoScale': false
    });
}
function OpenUser(url) {
    
    var ret = window.showModalDialog(url, null, "dialogHeight:500px;dialogWidth:450px;status:no;help:no");
    if (ret != null) {
        var value = ret;
        if (value == 'Change') {
            window.location = '/Views/WFHandlerMgmt/WFMonitor.aspx';
        } else if (value != '') {
           
            window.location = '/Views/WFHandlerMgmt/WFApplyView.aspx?TmpID=' + value;
        } else {
            window.location = '/Views/FlowCommon/WFToDoAll.aspx';
        }
    }
}

function ShowUser(url) {
    var ret = window.showModalDialog(url, null, "dialogHeight:500px;dialogWidth:450px;status:no;help:no");
    if (ret != null) {
        return ret;
    }
}

// 小写金额转大写金额，P1:输入的小写金额，P2:精度，保留的小数位数
function AmountInWords(dValue, maxDec) {
    // 验证输入金额数值或数值字符串：
    dValue = dValue.toString().replace(/,/g, ""); dValue = dValue.replace(/^0+/, ""); // 金额数值转字符、移除逗号、移除前导零
    if (dValue == "") { return "零元整"; } // （错误：金额为空！）
    else if (isNaN(dValue)) { return "错误：金额不是合法的数值！"; }

    var minus = ""; // 负数的符号“-”的大写：“负”字。可自定义字符，如“（负）”。
    var CN_SYMBOL = ""; // 币种名称（如“人民币”，默认空）
    if (dValue.length > 1) {
        if (dValue.indexOf('-') == 0) { dValue = dValue.replace("-", ""); minus = "负"; } // 处理负数符号“-”
        if (dValue.indexOf('+') == 0) { dValue = dValue.replace("+", ""); } // 处理前导正数符号“+”（无实际意义）
    }

    // 变量定义：
    var vInt = ""; var vDec = ""; // 字符串：金额的整数部分、小数部分
    var resAIW; // 字符串：要输出的结果
    var parts; // 数组（整数部分.小数部分），length=1时则仅为整数。
    var digits, radices, bigRadices, decimals; // 数组：数字（0~9——零~玖）；基（十进制记数系统中每个数字位的基是10——拾,佰,仟）；大基（万,亿,兆,京,垓,杼,穰,沟,涧,正）；辅币（元以下，角/分/厘/毫/丝）。
    var zeroCount; // 零计数
    var i, p, d; // 循环因子；前一位数字；当前位数字。
    var quotient, modulus; // 整数部分计算用：商数、模数。

    // 金额数值转换为字符，分割整数部分和小数部分：整数、小数分开来搞（小数部分有可能四舍五入后对整数部分有进位）。
    var NoneDecLen = (typeof (maxDec) == "undefined" || maxDec == null || Number(maxDec) < 0 || Number(maxDec) > 5); // 是否未指定有效小数位（true/false）
    parts = dValue.split('.'); // 数组赋值：（整数部分.小数部分），Array的length=1则仅为整数。
    if (parts.length > 1) {
        vInt = parts[0]; vDec = parts[1]; // 变量赋值：金额的整数部分、小数部分

        if (NoneDecLen) { maxDec = vDec.length > 5 ? 5 : vDec.length; } // 未指定有效小数位参数值时，自动取实际小数位长但不超5。
        var rDec = Number("0." + vDec);
        rDec *= Math.pow(10, maxDec); rDec = Math.round(Math.abs(rDec)); rDec /= Math.pow(10, maxDec); // 小数四舍五入
        var aIntDec = rDec.toString().split('.');
        if (Number(aIntDec[0]) == 1) { vInt = (Number(vInt) + 1).toString(); } // 小数部分四舍五入后有可能向整数部分的个位进位（值1）
        if (aIntDec.length > 1) { vDec = aIntDec[1]; } else { vDec = ""; }
    }
    else { vInt = dValue; vDec = ""; if (NoneDecLen) { maxDec = 0; } }
    if (vInt.length > 44) { return "错误：金额值太大了！整数位长【" + vInt.length.toString() + "】超过了上限——44位/千正/10^43（注：1正=1万涧=1亿亿亿亿亿，10^40）！"; }

    // 准备各字符数组 Prepare the characters corresponding to the digits:
    digits = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); // 零~玖
    radices = new Array("", "拾", "佰", "仟"); // 拾,佰,仟
    bigRadices = new Array("", "万", "亿", "兆", "京", "垓", "杼", "穰", "沟", "涧", "正"); // 万,亿,兆,京,垓,杼,穰,沟,涧,正
    decimals = new Array("角", "分", "厘", "毫", "丝"); // 角/分/厘/毫/丝

    resAIW = ""; // 开始处理

    // 处理整数部分（如果有）
    if (Number(vInt) > 0) {
        zeroCount = 0;
        for (i = 0; i < vInt.length; i++) {
            p = vInt.length - i - 1; d = vInt.substr(i, 1); quotient = p / 4; modulus = p % 4;
            if (d == "0") { zeroCount++; }
            else {
                if (zeroCount > 0) { resAIW += digits[0]; }
                zeroCount = 0; resAIW += digits[Number(d)] + radices[modulus];
            }
            if (modulus == 0 && zeroCount < 4) { resAIW += bigRadices[quotient]; }
        }
        resAIW += "元";
    }

    // 处理小数部分（如果有）
    for (i = 0; i < vDec.length; i++) { d = vDec.substr(i, 1); if (d != "0") { resAIW += digits[Number(d)] + decimals[i]; } }

    // 处理结果
    if (resAIW == "") { resAIW = "零" + "元"; } // 零元
    if (vDec == "") { resAIW += "整"; } // ...元整
    resAIW = CN_SYMBOL + minus + resAIW; // 人民币/负......元角分/整
    return resAIW;

    // 备注：
    /**********************************************************************************
    毫 .... 10^-4 ...... 0.0001
    厘 .... 10^-3 ...... 0.001
    分 .... 10^-2 ...... 0.01
    角 .... 10^-1 ...... 0.1
    -----------------------------
    个位（元）10^0 1
    -----------------------------
    拾 .... 10^1 ...... 10
    佰 .... 10^2 ...... 100
    仟 .... 10^3 ...... 1,000
    万 .... 10^4 ...... 10,000
    亿 .... 10^8 ...... 100,000,000
    兆 .... 10^12 ..... 1,000,000,000,000
    京 .... 10^16 ..... 10,000,000,000,000,000
    垓 .... 10^20 ..... 100,000,000,000,000,000,000 gāi
    杼 .... 10^24 ..... 1,000,000,000,000,000,000,000,000 zhù  
    穰 .... 10^28 ..... 10,000,000,000,000,000,000,000,000,000 rǎng 国际制用“艾可萨”,简称“艾”,符号E 
    沟 .... 10^32 ..... 100,000,000,000,000,000,000,000,000,000,000
    涧 .... 10^36 ..... 1,000,000,000,000,000,000,000,000,000,000,000,000
    正 .... 10^40 ..... 10,000,000,000,000,000,000,000,000,000,000,000,000,000
    载 .... 10^44
    极 .... 10^48
    恒河沙 ..... 10^52
    阿僧祇 ..... 10^56
    那由他 ..... 10^60
    不可思议 ... 10^64
    无量 ....... 10^68
    大数 ....... 10^72
    **********************************************************************************/
}

// txtMoneyFromID： 输入金额txt控件ID, lblMoneyUpperID: 显示大写的lbl控件ID, hdfMoneyUpperID 
// rblExchangeRateID:选择币种的rbl控件ID，lblMoneyUSID:   显示等值美元的lbl控件ID, hdfMoneyUSID
function ShowMoneyUpperAndEqualUS(txtMoneyFromID, lblMoneyUpperID, hdfMoneyUpperID, rblExchangeRateID, lblMoneyUSID, hdfMoneyUSID) {
    var mFromValue;
    var mFrom = document.getElementById(txtMoneyFromID);
    var mUpper = document.getElementById(lblMoneyUpperID);
    var mUS = document.getElementById(lblMoneyUSID);
    if (mFrom) {
        mFromValue = mFrom.value;
        if (mFromValue) {
            if (mUpper) {
                mUpper.innerHTML = document.getElementById(hdfMoneyUpperID).value = AmountInWords(mFrom.value)
            };
        }
        else {
            if (mUpper) { mUpper.innerHTML = document.getElementById(hdfMoneyUpperID).value = "please input money!" }
            if (mUS) { mUS.innerHTML = document.getElementById(hdfMoneyUSID).value = "please input money!"; }
            return;
        }
    }
    var rblRate = document.getElementById(rblExchangeRateID);
    var Rate = null;
    if (rblRate) {
        for (var i = 0; i < rblRate.cells.length; i++) {
            var rblItem = document.getElementById(rblExchangeRateID + "_" + [i]);
            if (rblItem && rblItem.checked) {
                Rate = rblItem.value;
                if (Rate) {
                    var ss = Rate.split("*");
                    if (ss.length == 2) Rate = ss[1].toString();
                }
            }
        }
    }
    if (mUS) {
        if (Rate) {
            var dmFrom = parseFloat(mFromValue);
            var dRate = parseFloat(Rate);
            mUS.innerHTML = (parseFloat(dmFrom / dRate)).toFixed(2);
        }
        else { mUS.innerHTML = "Please select curreny!"; }
        document.getElementById(hdfMoneyUSID).value = mUS.innerHTML;
    }
}

