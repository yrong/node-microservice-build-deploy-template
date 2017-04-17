function ULSA13() {
    var a = {};
    a.ULSTeamName = "Microsoft SharePoint Foundation";
    a.ULSFileName = "init.js";
    return a
}
var L_Infobar_Send_Error_Text = "Failed to send JavaScript error report. Please see original error details below.",
    ULS;
if (!ULS) ULS = {};
ULS.OriginalOnError = window.onerror;
window.onerror = ULSOnError;

function ULSTrim(a) {
    a: ;
    a = a.replace(/^\s*/, "");
    a = a.replace(/\s*$/, "");
    return a
}
function ULSEncodeXML(a) {
    a: ;
    a = String(a);
    a = a.replace(/&/g, "&amp;");
    a = a.replace(/</g, "&lt;");
    a = a.replace(/>/g, "&gt;");
    a = a.replace(/'/g, "&apos;");
    a = a.replace(/"/g, "&quot;");
    return a
}
function ULSStripPII(a) {
    a: ;
    if (a.indexOf("?") != -1) a = a.substring(0, a.indexOf("?"));
    if (window.location) a = a.replace(window.location.hostname, "[server]");
    return a
}
function ULSGetFunction(e, c) {
    a: ;
    var d = e.toString(),
        a = ULSTrim(d.substring(0, d.indexOf("{")));
    if (a.indexOf("function") == 0) a = ULSTrim(a.substring(8));
    var b = "<function ";
    if (c >= 0) b += 'depth="' + c + '" ';
    b += 'signature="' + a + '">';
    if (c == 0 || a.indexOf("anonymous") == 0 || a.indexOf("(") == 0) b += "\n<![CDATA[" + d + "]]>\n";
    b += "</function>";
    return b
}
function ULSGetMetadataFromFrame(oCS) {
    a: ;
    var sFunctionText = oCS.toString(),
        iOpeningBrace = sFunctionText.indexOf("{");
    if (iOpeningBrace == -1) return false;
    sFunctionText = sFunctionText.substr(iOpeningBrace + 1);
    var iFirstStatement = sFunctionText.search(/[^\s]/);
    if (iFirstStatement == -1) return false;
    var reMatch = sFunctionText.match(/ULS[^\s;]*:/);
    if (reMatch == null || reMatch.index != iFirstStatement) return false;
    var sLabelName = reMatch[0];
    sLabelName = sLabelName.substr(0, sLabelName.length - 1);
    try {
        var o = eval(sLabelName + "()");
        if (typeof o == "undefined") return false;
        ULS.teamName = o.ULSTeamName;
        ULS.originalFile = o.ULSFileName;
        return true
    } catch (e) {
        return false
    }
}
function ULSGetCallstack(b) {
    a: ;
    var e = "";
    try {
        if (b) {
            var d = false,
                a = b,
                c = 0;
            while (a && c < 20) {
                if (!d) d = ULSGetMetadataFromFrame(a);
                e += ULSGetFunction(a, c, b) + "\n";
                a = a.caller;
                c++
            }
        }
    } catch (f) { }
    return e
}
function ULSGetClientInfo() {
    a: ;
    var a = "";
    try {
        var b = navigator.browserLanguage;
        if (!b) b = navigator.language;
        if (!b) b = navigator.systemLanguage;
        var c = navigator.userAgent.toLowerCase(),
            e = navigator.appName,
            d = parseFloat(navigator.appVersion);
        if (c.indexOf("msie ") != -1) d = parseFloat(c.substring(c.indexOf("msie ") + 5));
        if (c.indexOf("firefox/") != -1) {
            e = "Firefox";
            d = parseFloat(c.substring(c.indexOf("firefox/") + 8))
        }
        a += '<browser name="' + ULSEncodeXML(e) + '" version="' + ULSEncodeXML(d) + '" />\n';
        a += "<useragent>" + ULSEncodeXML(navigator.userAgent) + "</useragent>\n";
        if (b) a += "<language>" + ULSEncodeXML(b) + "</language>\n";
        if (document.referrer) {
            var g = ULSStripPII(document.referrer);
            a += "<referrer>" + ULSEncodeXML(g) + "</referrer>\n"
        }
        if (window.location) {
            var f = ULSStripPII(window.location.toString());
            a += "<location>" + ULSEncodeXML(f) + "</location>\n"
        }
        if (ULS.Correlation) a += "<correlation>" + ULSEncodeXML(ULS.Correlation) + "</correlation>\n"
    } catch (h) { }
    return a
}
function ULSHandleWebServiceResponse() {
    a: ;
    ULS.request.readyState == 4 && ULS.request.status == 200 && ULSFinishErrorHandling();
    (ULS.request.readyState == 0 || ULS.request.readyState == 4) && ULS.request.status > 200 && ULSFinishErrorHandling()
}
function ULSFinishErrorHandling() {
    a: ;
    ULS.message = null
}
function ULSGetWebServiceUrl() {
    a: ;
    var a = "",
        b = document.URL.indexOf("://");
    if (b > 0) {
        var c = document.URL.indexOf("/", b + 3);
        if (c > 0) a = document.URL.substring(0, c);
        else a = document.URL
    }
    if (a.charAt(a.length - 1) != "/") a += "/";
    a += "_vti_bin/diagnostics.asmx";
    return a
}
function ULSSendReport() {
    a: ;
    if (XMLHttpRequest) ULS.request = new XMLHttpRequest;
    else ULS.request = new ActiveXObject("MSXML2.XMLHTTP");
    ULS.request.onreadystatechange = ULSHandleWebServiceResponse;
    ULS.request.open("POST", ULSGetWebServiceUrl(), true);
    ULS.request.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    ULS.request.setRequestHeader("SOAPAction", ULS.WebServiceNS + "SendClientScriptErrorReport");
    ULS.request.send('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SendClientScriptErrorReport xmlns="' + ULS.WebServiceNS + '"><message>' + ULSEncodeXML(ULS.message) + "</message><file>" + ULSEncodeXML(ULS.file) + "</file><line>" + ULS.line + "</line><stack>" + ULSEncodeXML(ULS.callStack) + "</stack><client>" + ULSEncodeXML(ULS.clientInfo) + "</client><team>" + ULSEncodeXML(ULS.teamName) + "</team><originalFile>" + ULSEncodeXML(ULS.originalFile) + "</originalFile></SendClientScriptErrorReport></soap:Body></soap:Envelope>")
}
function ULSSendExceptionImpl(c, a, b, d) {
    a: ;
    if (ULS && ULS.enable) {
        ULS.enable = false;
        window.onerror = ULS.OriginalOnError;
        ULS.WebServiceNS = "http://schemas.microsoft.com/sharepoint/diagnostics/";
        try {
            ULS.message = c;
            if (a.indexOf("?") != -1) a = a.substr(0, a.indexOf("?"));
            ULS.file = a.substr(a.lastIndexOf("/") + 1);
            ULS.line = b;
            ULS.teamName = "";
            ULS.originalFile = "";
            ULS.callStack = "<stack>\n" + ULSGetCallstack(d) + "</stack>";
            ULS.clientInfo = "<client>\n" + ULSGetClientInfo() + "</client>";
            ULSSendReport()
        } catch (e) { }
    }
    if (ULS && ULS.OriginalOnError) return ULS.OriginalOnError(c, a, b);
    else return false
}
function ULSOnError(b, c, a) {
    a: ;
    return ULSSendExceptionImpl(b, c, a, ULSOnError.caller)
}
function ULSSendException(b) {
    a: ;
    var a = b.message;
    if (typeof a == "undefined") a = b;
    ULSSendExceptionImpl(a, document.location.href, 0, ULSSendException.caller)
}
function Browseris() {
    a: ;
    var a = navigator.userAgent.toLowerCase();
    this.osver = 1;
    if (a) {
        var g = a.substring(a.indexOf("windows ") + 11);
        this.osver = parseFloat(g)
    }
    this.major = parseInt(navigator.appVersion);
    this.nav = a.indexOf("mozilla") != -1 && (a.indexOf("spoofer") == -1 && a.indexOf("compatible") == -1);
    this.nav6 = this.nav && this.major == 5;
    this.nav6up = this.nav && this.major >= 5;
    this.nav7up = false;
    if (this.nav6up) {
        var b = a.indexOf("netscape/");
        if (b >= 0) this.nav7up = parseInt(a.substring(b + 9)) >= 7
    }
    this.ie = a.indexOf("msie") != -1;
    this.aol = this.ie && a.indexOf(" aol ") != -1;
    if (this.ie) {
        var e = a.substring(a.indexOf("msie ") + 5);
        this.iever = parseInt(e);
        this.verIEFull = parseFloat(e)
    } else this.iever = 0;
    this.ie4up = this.ie && this.major >= 4;
    this.ie5up = this.ie && this.iever >= 5;
    this.ie55up = this.ie && this.verIEFull >= 5.5;
    this.ie6up = this.ie && this.iever >= 6;
    this.ie7down = this.ie && this.iever <= 7;
    this.ie7up = this.ie && this.iever >= 7;
    this.ie8standard = this.ie && document.documentMode && document.documentMode == 8;
    this.winnt = a.indexOf("winnt") != -1 || a.indexOf("windows nt") != -1;
    this.win32 = this.major >= 4 && navigator.platform == "Win32" || a.indexOf("win32") != -1 || a.indexOf("32bit") != -1;
    this.win64bit = a.indexOf("win64") != -1;
    this.win = this.winnt || this.win32 || this.win64bit;
    this.mac = a.indexOf("mac") != -1;
    this.w3c = this.nav6up;
    this.safari = a.indexOf("webkit") != -1;
    this.safari125up = false;
    this.safari3up = false;
    if (this.safari && this.major >= 5) {
        var b = a.indexOf("webkit/");
        if (b >= 0) this.safari125up = parseInt(a.substring(b + 7)) >= 125;
        var f = a.indexOf("version/");
        if (f >= 0) this.safari3up = parseInt(a.substring(f + 8)) >= 3
    }
    this.firefox = this.nav && a.indexOf("firefox") != -1;
    this.firefox3up = false;
    this.firefox36up = false;
    if (this.firefox && this.major >= 5) {
        var d = a.indexOf("firefox/");
        if (d >= 0) {
            var c = a.substring(d + 8);
            this.firefox3up = parseInt(c) >= 3;
            this.firefox36up = parseFloat(c) >= 3.6
        }
    }
}
var browseris = new Browseris,
    bis = browseris;

function byid(a) {
    a: ;
    return document.getElementById(a)
}
function newE(a) {
    a: ;
    return document.createElement(a)
}
function wpf() {
    a: ;
    return document.forms[MSOWebPartPageFormName]
}
function startReplacement() { }
function AttachEvent(c, b, a) {
    a: ;
    if (!a) a = window;
    if (c == "domLoad") c = a.addEventListener && browseris.nav ? "DOMContentLoaded" : "load";
    if (typeof b == "string") b = new Function(b);
    if (a.addEventListener) a.addEventListener(c, b, false);
    else a.attachEvent("on" + c, b)
}
function DetachEvent(c, b, a) {
    a: ;
    if (!a) a = window;
    if (c == "domLoad") c = a.removeEventListener && browseris.nav ? "DOMContentLoaded" : "load";
    if (typeof b == "string") b = new Function(b);
    if (a.removeEventListener) a.removeEventListener(c, b, false);
    else a.detachEvent("on" + c, b)
}
function CancelEvent(a) {
    a: ;
    a.cancelBubble = true;
    a.preventDefault && a.preventDefault();
    a.stopPropogation && a.stopPropogation();
    a.returnValue = false;
    return false
}
function GetEventSrcElement(a) {
    a: ;
    if (browseris.nav) return a.target;
    else return a.srcElement
}
function GetEventKeyCode(a) {
    a: ;
    if (browseris.nav) return a.which;
    else return a.keyCode
}
function GetInnerText(a) {
    a: ;
    if (browseris.safari && browseris.major < 5) return a.innerHTML;
    else if (browseris.nav) return a.textContent;
    else return a.innerText
}
typeof Sys != "undefined" && Sys && Sys.Application && Sys.Application.notifyScriptLoaded();
typeof NotifyScriptLoadedAndExecuteWaitingJobs == "function" && NotifyScriptLoadedAndExecuteWaitingJobs("owsbrows.js");
var g_cde = {};

function GetCachedElement(b) {
    a: ;
    var a = null;
    if (!(a = g_cde[b])) {
        a = document.getElementById(b);
        g_cde[b] = a
    }
    return a
}
var UTF8_1ST_OF_2 = 192,
    UTF8_1ST_OF_3 = 224,
    UTF8_1ST_OF_4 = 240,
    UTF8_TRAIL = 128,
    HIGH_SURROGATE_BITS = 55296,
    LOW_SURROGATE_BITS = 56320,
    SURROGATE_6_BIT = 64512,
    SURROGATE_ID_BITS = 63488,
    SURROGATE_OFFSET = 65536;

function escapeProperlyCoreCore(f, g, h, i) {
    a: ;
    var c = "",
        b = "",
        d = 0,
        k = " \"%<>'&";
    if (typeof f == "undefined") return "";
    for (d = 0; d < f.length; d++) {
        var a = f.charCodeAt(d),
            e = f.charAt(d);
        if (g && (e == "#" || e == "?")) {
            c += f.substr(d);
            break
        }
        if (h && e == "&") {
            c += e;
            continue
        }
        if (a <= 127) {
            if (i) c += e;
            else if (a >= 97 && a <= 122 || a >= 65 && a <= 90 || a >= 48 && a <= 57 || g && (a >= 32 && a <= 95) && k.indexOf(e) < 0) c += e;
            else if (a <= 15) c += "%0" + a.toString(16).toUpperCase();
            else if (a <= 127) c += "%" + a.toString(16).toUpperCase()
        } else if (a <= 2047) {
            b = UTF8_1ST_OF_2 | a >> 6;
            c += "%" + b.toString(16).toUpperCase();
            b = UTF8_TRAIL | a & 63;
            c += "%" + b.toString(16).toUpperCase()
        } else if ((a & SURROGATE_6_BIT) != HIGH_SURROGATE_BITS) {
            b = UTF8_1ST_OF_3 | a >> 12;
            c += "%" + b.toString(16).toUpperCase();
            b = UTF8_TRAIL | (a & 4032) >> 6;
            c += "%" + b.toString(16).toUpperCase();
            b = UTF8_TRAIL | a & 63;
            c += "%" + b.toString(16).toUpperCase()
        } else if (d < f.length - 1) {
            var a = (a & 1023) << 10;
            d++;
            var j = f.charCodeAt(d);
            a |= j & 1023;
            a += SURROGATE_OFFSET;
            b = UTF8_1ST_OF_4 | a >> 18;
            c += "%" + b.toString(16).toUpperCase();
            b = UTF8_TRAIL | (a & 258048) >> 12;
            c += "%" + b.toString(16).toUpperCase();
            b = UTF8_TRAIL | (a & 4032) >> 6;
            c += "%" + b.toString(16).toUpperCase();
            b = UTF8_TRAIL | a & 63;
            c += "%" + b.toString(16).toUpperCase()
        }
    }
    return c
}
function escapeProperly(a) {
    a: ;
    return escapeProperlyCoreCore(a, false, false, false)
}
function escapeProperlyCore(b, a) {
    a: ;
    return escapeProperlyCoreCore(b, a, false, false)
}
function escapeUrlForCallback(a) {
    a: ;
    var c = a.indexOf("#"),
        b = a.indexOf("?");
    if (c > 0 && (b == -1 || c < b)) {
        var d = a.substr(0, c);
        if (b > 0) d += a.substr(b);
        a = d
    }
    return escapeProperlyCoreCore(a, true, false, true)
}
function PageUrlValidation(a) {
    a: ;
    if (a.substr(0, 4) == "http" || a.substr(0, 1) == "/" || a.indexOf(":") == -1) return a;
    else {
        var L_InvalidPageUrl_Text = "无效的网页 URL: ";
        alert(L_InvalidPageUrl_Text);
        return ""
    }
}
function SelectRibbonTab(b, c) {
    a: ;
    var a = null;
    try {
        a = SP.Ribbon.PageManager.get_instance().get_ribbon()
    } catch (d) { }
    if (!a) typeof _ribbonStartInit == "function" && _ribbonStartInit(b, false, null);
    else (c || a.get_selectedTabId() == "Ribbon.Read") && a.selectTabById(b)
}
function FV4UI() {
    a: ;
    return typeof _fV4UI != "undefined" && _fV4UI
}
var itemTable = null,
    currentCtx = null,
    g_OfflineClient = null;

function TakeOfflineDisabled(d, b, c, a) {
    a: ;
    try {
        if (g_OfflineClient == null) if (document.cookie.indexOf("OfflineClientInstalled") == -1) {
            if (IsSupportedMacBrowser()) g_OfflineClient = CreateMacPlugin();
            else g_OfflineClient = new ActiveXObject("SharePoint.OfflineClient");
            document.cookie = "OfflineClientInstalled=1"
        } else if (GetCookie("OfflineClientInstalled") == "1") if (IsSupportedMacBrowser()) g_OfflineClient = CreateMacPlugin();
        else g_OfflineClient = new ActiveXObject("SharePoint.OfflineClient");
        if (g_OfflineClient != null && g_OfflineClient.IsOfflineAllowed(d, b, c, a)) return false;
        else return true
    } catch (e) {
        document.cookie = "OfflineClientInstalled=0";
        g_OfflineClient = null
    }
    return true
}
function GoToHistoryLink(b, d) {
    a: ;
    if (b.href == null) return;
    var c = b.href,
        f = b.href.indexOf("?") >= 0 ? "&" : "?",
        e = f + "VersionNo=" + d,
        a = GetSource();
    if (a != null && a != "") a = "&Source=" + a;
    var c = b.href + e + a;
    if (isPortalTemplatePage(c)) window.top.location = STSPageUrlValidation(c);
    else window.location = STSPageUrlValidation(c)
}
function GetGotoLinkUrl(b) {
    a: ;
    if (b.href == null) return null;
    var d = b.href.indexOf("?") >= 0 ? "&" : "?",
        a = GetSource();
    if (a != null && a != "") a = d + "Source=" + a;
    var c = b.href + a;
    return c
}
function GoToLink(b) {
    a: ;
    var a = GetGotoLinkUrl(b);
    if (a == null) return;
    if (isPortalTemplatePage(a)) window.top.location = STSPageUrlValidation(a);
    else window.location = STSPageUrlValidation(a)
}
function GoToLinkOrDialogNewWindow(a) {
    a: ;
    if (a.href == null) return;
    if (window.location.search.match("[?&]IsDlg=1")) window.open(a.href);
    else GoToLink(a)
}
function GoToDiscussion(b) {
    a: ;
    var c = b.indexOf("?") >= 0 ? "&" : "?",
        a = GetSource();
    if (a != null && a != "") b += c + "TopicsView=" + a;
    STSNavigate(b)
}
function GetCurrentEltStyle(b, c) {
    a: ;
    if (b.currentStyle) return b.currentStyle[c];
    else if (window && window.getComputedStyle) {
        var a = window.getComputedStyle(b, null);
        if (a && a.getPropertyValue) return a.getPropertyValue(c)
    } else return null
}
function EEDecodeSpecialChars(b) {
    a: ;
    var a = b.replace(/&quot;/g, '"');
    a = a.replace(/&gt;/g, ">");
    a = a.replace(/&lt;/g, "<");
    a = a.replace(/&#39;/g, "'");
    a = a.replace(/&amp;/g, "&");
    return a
}
function DeferCall() {
    a: ;
    if (arguments.length == 0) return null;
    var args = arguments,
        fn = null;
    if (browseris.ie5up || browseris.nav6up) eval("if (typeof(" + args[0] + ")=='function') { fn=" + args[0] + "; }");
    if (fn == null) return null;
    if (args.length == 1) return fn();
    else if (args.length == 2) return fn(args[1]);
    else if (args.length == 3) return fn(args[1], args[2]);
    else if (args.length == 4) return fn(args[1], args[2], args[3]);
    else if (args.length == 5) return fn(args[1], args[2], args[3], args[4]);
    else if (args.length == 6) return fn(args[1], args[2], args[3], args[4], args[5]);
    else if (args.length == 7) return fn(args[1], args[2], args[3], args[4], args[5], args[6]);
    else if (args.length == 8) return fn(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
    else if (args.length == 9) return fn(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
    else if (args.length == 10) return fn(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
    else {
        var L_TooManyDefers_Text = "传递到 DeferCall 的参数太多";
        alert(L_TooManyDefers_Text)
    }
    return null
}
var L_ContainIllegalChar_Text = "^1 包含非法字符“^2”。",
    L_ContainIllegalString_Text = "^1 包含非法字符或子字符串。",
    LegalUrlChars = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, true, false, false, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, true, false, true, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

function AdmBuildParam(b) {
    a: ;
    for (var c, a = 1; a < AdmBuildParam.arguments.length; a++) {
        c = new RegExp("\\^" + a);
        b = b.replace(c, AdmBuildParam.arguments[a])
    }
    return b
}
function IndexOfIllegalCharInUrlLeafName(b) {
    a: ;
    for (var a = 0; a < b.length; a++) {
        var c = b.charCodeAt(a);
        if (b.charAt(a) == "." && (a == 0 || a == b.length - 1)) return a;
        if (c < 160 && (b.charAt(a) == "/" || !LegalUrlChars[c])) return a
    }
    return -1
}
function IndexOfIllegalCharInUrlPath(b) {
    a: ;
    for (var a = 0; a < b.length; a++) {
        var c = b.charCodeAt(a);
        if (c < 160 && !LegalUrlChars[c]) return a
    }
    return -1
}
function UrlContainsIllegalStrings(a) {
    a: ;
    if (a.indexOf("..") >= 0 || a.indexOf("//") >= 0 || a.indexOf("./") >= 0 || a.indexOf("/.") >= 0 || a.indexOf(".") == 0 || a.lastIndexOf(".") == a.length - 1) return true;
    return false
}
function UrlLeafNameValidate(a, b) {
    a: ;
    var c = "";
    if (typeof a.MessagePrefix == "string") c = a.MessagePrefix;
    else c = a.id;
    var d = IndexOfIllegalCharInUrlLeafName(b.Value);
    if (d >= 0) {
        if (typeof a.errormessage == "string") a.errormessage = AdmBuildParam(L_ContainIllegalChar_Text, c, b.Value.charAt(d));
        b.IsValid = false
    } else if (UrlContainsIllegalStrings(b.Value)) {
        if (typeof a.errormessage == "string") a.errormessage = AdmBuildParam(L_ContainIllegalString_Text, c);
        b.IsValid = false
    } else b.IsValid = true
}
function UrlPathValidate(a, b) {
    a: ;
    var c = "";
    if (typeof a.MessagePrefix == "string") c = a.MessagePrefix;
    else c = a.id;
    var d = IndexOfIllegalCharInUrlPath(b.Value);
    if (d >= 0) {
        if (typeof a.errormessage == "string") a.errormessage = AdmBuildParam(L_ContainIllegalChar_Text, c, b.Value.charAt(d));
        b.IsValid = false
    } else if (UrlContainsIllegalStrings(b.Value)) {
        if (typeof a.errormessage == "string") a.errormessage = AdmBuildParam(L_ContainIllegalString_Text, c);
        b.IsValid = false
    } else b.IsValid = true
}
function IsCheckBoxListSelected(a) {
    a: ;
    if (a == null) return false;
    var c = a.length;
    if (c == null) return a.checked;
    else for (var b = 0; b < c; b++) if (a[b].checked) return true;
    return false
}
function STSValidatorEnable(d, b, c) {
    a: ;
    var a = document.getElementById(d);
    if (a == null) return;
    if (c == true || a.getAttribute("AlwaysEnableSilent") == true) a.enabled = b == true;
    else ValidatorEnable(a, b)
}
typeof Sys != "undefined" && Sys && Sys.Application && Sys.Application.notifyScriptLoaded();
typeof NotifyScriptLoadedAndExecuteWaitingJobs == "function" && NotifyScriptLoadedAndExecuteWaitingJobs("commonvalidation.js");

function encodeScriptQuote(f) {
    a: ;
    for (var c = new String(f), b = [], a = 0, e = c.length, a = 0; a < e; a++) {
        var d = c.charAt(a);
        b.push(d == "'" ? "%27" : d)
    }
    return b.join("")
}
function STSHtmlEncode(b) {
    a: ;
    if (null == b || typeof b == "undefined") return "";
    for (var d = new String(b), a = [], c = 0, f = d.length, c = 0; c < f; c++) {
        var e = d.charAt(c);
        switch (e) {
            case "<":
                a.push("&lt;");
                break;
            case ">":
                a.push("&gt;");
                break;
            case "&":
                a.push("&amp;");
                break;
            case '"':
                a.push("&quot;");
                break;
            case "'":
                a.push("&#39;");
                break;
            default:
                a.push(e)
        }
    }
    return a.join("")
}
function StAttrQuote(a) {
    a: ;
    a = a.toString();
    a = a.replace(/&/g, "&amp;");
    a = a.replace(/\"/g, "&quot;");
    a = a.replace(/\r/g, "&#13;");
    return '"' + a + '"'
}
function STSScriptEncode(e) {
    a: ;
    if (null == e || typeof e == "undefined") return "";
    for (var d = new String(e), a = [], c = 0, g = d.length, c = 0; c < g; c++) {
        var b = d.charCodeAt(c);
        if (b > 4095) a.push("\\u" + b.toString(16).toUpperCase());
        else if (b > 255) a.push("\\u0" + b.toString(16).toUpperCase());
        else if (b > 127) a.push("\\u00" + b.toString(16).toUpperCase());
        else {
            var f = d.charAt(c);
            switch (f) {
                case "\n":
                    a.push("\\n");
                    break;
                case "\r":
                    a.push("\\r");
                    break;
                case '"':
                    a.push("\\u0022");
                    break;
                case "%":
                    a.push("\\u0025");
                    break;
                case "&":
                    a.push("\\u0026");
                    break;
                case "'":
                    a.push("\\u0027");
                    break;
                case "(":
                    a.push("\\u0028");
                    break;
                case ")":
                    a.push("\\u0029");
                    break;
                case "+":
                    a.push("\\u002b");
                    break;
                case "/":
                    a.push("\\u002f");
                    break;
                case "<":
                    a.push("\\u003c");
                    break;
                case ">":
                    a.push("\\u003e");
                    break;
                case "\\":
                    a.push("\\\\");
                    break;
                default:
                    a.push(f)
            }
        }
    }
    return a.join("")
}
function STSScriptEncodeWithQuote(a) {
    a: ;
    return '"' + STSScriptEncode(a) + '"'
}
var L_Language_Text = "2052",
    L_ClickOnce1_text = "您已尝试过保存此项。如果尝试再次保存此项，则可能会产生重复信息。是否再次保存此项?",
    L_STSRecycleConfirm_Text = "是否确实要将项目发送到网站回收站?",
    L_STSRecycleConfirm1_Text = "是否确实要将此文件夹及其所有内容发送到网站回收站?",
    L_STSRecycleConfirm2_Text = "是否确实要将此文档集及其所有内容发送到网站回收站中?",
    L_STSDelConfirm_Text = "是否确实要永久删除项目?",
    L_STSDelConfirm1_Text = "是否确实要永久删除此文件夹及其所有内容?",
    L_STSDelConfirm2_Text = "是否确实要永久删除此文档集及其所有内容?",
    L_NewDocLibTb1_Text = "无法创建该文档。\n可能是所需的应用程序安装不正确，或者是无法打开此文档库的模板。\n\n请尝试以下操作:\n1. 在此文档库的“常规设置”中检查该模板的名称，并安装打开该模板所需的应用程序。如果该应用程序设置为在首次使用时安装，请运行该应用程序，然后再尝试新建文档。\n\n2.  如果您拥有修改此文档库的权限，请转到该库的“常规设置”，然后配置新模板。",
    L_NewDocLibTb2_Text = "“新建文档”需要使用与 Microsoft SharePoint Foundation 兼容的应用程序和 Web 浏览器。要向此文档库添加文档，请单击“上载文档”按钮。",
    L_CheckoutConfirm = "您正准备签出选定文件。",
    L_DiscardCheckoutConfirm = "您正准备放弃对选定的已签出文件进行的所有更改。",
    L_NewFormLibTb1_Text = "无法创建该文档。\n可能是所需的应用程序安装不正确，或者是无法打开此文档库的模板。\n\n请尝试以下操作:\n1. 在此文档库的“常规设置”中检查该模板的名称，并安装打开该模板所需的应用程序。如果该应用程序设置为在首次使用时安装，请运行该应用程序，然后再次尝试新建文档。\n\n2. 如果您拥有修改此文档库的权限，请转到该库的“常规设置”，然后配置新模板。",
    L_NewFormLibTb2_Text = "此功能需要使用 Microsoft Internet Explorer 7.0 或更高版本和与 Microsoft SharePoint Foundation 兼容的 XML 编辑器，例如 Microsoft InfoPath。",
    L_ConfirmCheckout_Text = "更改之前必须先签出此项目。是否立即签出此项目?",
    L_MustCheckout_Text = "更改之前必须先签出此项目。",
    L_CheckOutRetry_Text = "签出失败，是否要重新尝试从服务器签出?",
    L_CannotEditPropertyForLocalCopy_Text = "如果文档已被签出并且正在进行脱机修改，则无法编辑该文档的属性。",
    L_CannotEditPropertyCheckout_Text = "如果此文档已由另一用户签出或锁定进行编辑，则无法编辑该文档的属性。",
    L_NewFormClickOnce1_Text = "新建文件夹",
    L_EnterValidCopyDest_Text = "请输入有效的文件夹 URL 和文件名。文件夹 URL 必须以“http:”或“https:”开头。",
    L_ConfirmUnlinkCopy_Text = "由于此项目是一个副本，因此它仍可接收来自源的更新。应确保此项目已从源的更新项目列表中删除，否则此项目可能会继续接收更新。是否确实要取消链接此项目?",
    L_CopyingOfflineVersionWarning_Text = "当前已在本地签出此文档。只能复制存储在服务器上的版本。若要复制最新的次要版本，请单击“确定”。若要复制当前已签出的版本，请单击“取消”，签入此文档，然后重试复制操作。",
    L_Loading_Text = "正在加载...",
    L_Loading_Error_Text = "提取数据时发生错误。请刷新网页并重试。",
    L_Inplview_PageNotYetSaved = "页面尚未保存",
    L_WarnkOnce_text = "此项目包含自定义的定期模式。如果保存更改，将无法还原为以前的模式。",
    L_WebFoldersRequired_Text = "正在加载资源管理器视图，请稍候。如果资源管理器视图未显示，则可能是因为浏览器不支持它。",
    L_WebFoldersError_Text = "客户端不支持使用 Windows 资源管理器打开此列表。",
    L_NoExplorerView_Text = "要查看您的文档，请导航到库并选择“使用资源管理器打开”操作。如果“使用资源管理器打开”操作不可用，则您的系统可能不支持该操作。",
    L_WikiWebPartNoClosedOrUploaded = "不支持“已关闭的 Web 部件”和“已上载的 Web 部件”。",
    L_AccessibleMenu_Text = "菜单",
    L_SubMenu_Text = "子菜单",
    L_NewBlogPost_Text = "此功能需要使用 Microsoft Internet Explorer 7.0 或更高版本和与 Microsoft SharePoint Foundation 兼容的博客编辑器，如 Microsoft Word 2007 或更高版本。",
    L_NewBlogPostFailed_Text = "无法连接到博客程序，可能是博客程序忙或缺少博客程序。请检查博客程序，然后重试。",
    recycleBinEnabled = 0,
    cascadeDeleteWarningMessage = "",
    bIsFileDialogView = false,
    g_ViewIdToViewCounterMap = [],
    g_ctxDict = [];

function NotifyBrowserOfAsyncUpdate() {
    a: ;
    var b = "__spAjaxIframe",
        a = document.getElementById(b);
    if (a == null) {
        a = document.createElement("IFRAME");
        a.name = a.id = b;
        a.width = a.height = 0;
        a.src = "about:blank";
        a.style.display = "none";
        document.body.appendChild(a)
    }
    a.contentWindow.document.location.replace("/_layouts/images/blank.gif")
}
function UpdateAccessibilityUI() {
    a: ;
    var a = document.getElementById("TurnOnAccessibility"),
        b = document.getElementById("TurnOffAccessibility");
    if (IsAccessibilityFeatureEnabled()) {
        if (a != null) a.style.display = "none";
        if (b != null) b.style.display = ""
    } else {
        if (a != null) a.style.display = "";
        if (b != null) b.style.display = "none"
    }
}
function SetIsAccessibilityFeatureEnabled(c) {
    a: ;
    if (c) document.cookie = "WSS_AccessibilityFeature=true;path=/;";
    else document.cookie = "WSS_AccessibilityFeature=false;path=/;";
    var a = document.getElementById("HiddenAnchor"),
        b;
    if (browseris.ie) b = {
        srcElement: a,
        fakeEvent: 1,
        enableStatus: c
    };
    else b = {
        target: a,
        fakeEvent: 1,
        enableStatus: c
    };
    if (a == null || a.onclick == null) return;
    a.onclick(b)
}
function DeleteCookie(a) {
    a: ;
    document.cookie = a + "=; expires=Thu, 01-Jan-70 00:00:01 GMT"
}
function GetCookie(d) {
    a: ;
    for (var c = document.cookie.split("; "), b = 0; b < c.length; b++) {
        var a = c[b].split("=");
        if (d == a[0]) if (a.length > 1) return unescapeProperly(a[1]);
        else return null
    }
    return null
}
function IsAccessibilityFeatureEnabled() {
    a: ;
    return GetCookie("WSS_AccessibilityFeature") == "true"
}
function escapeForSync(e) {
    a: ;
    for (var b = "", d = 0, c = 0, g = "\\&|[]", d = 0; d < e.length; d++) {
        var a = e.charCodeAt(d),
            f = e.charAt(d);
        if (c && a <= 127) {
            b += "]";
            c = 0
        }
        if (!c && a > 127) {
            b += "[";
            c = 1
        }
        if (g.indexOf(f) >= 0) b += "|";
        if (a >= 97 && a <= 122 || a >= 65 && a <= 90 || a >= 48 && a <= 57) b += f;
        else if (a <= 15) b += "%0" + a.toString(16).toUpperCase();
        else if (a <= 127) b += "%" + a.toString(16).toUpperCase();
        else if (a <= 255) b += "00" + a.toString(16).toUpperCase();
        else if (a <= 4095) b += "0" + a.toString(16).toUpperCase();
        else b += a.toString(16).toUpperCase()
    }
    if (c) b += "]";
    return b
}
var g_rgdwchMinEncoded = new Array([0, 128, 2048, 65536, 2097152, 67108864, 2147483648]);

function Vutf8ToUnicode(e) {
    a: ;
    var f = 0,
        a = "",
        b, h, c, d, g;
    while (f < e.length) if (e[f] <= 127) a += String.fromCharCode(e[f++]);
    else {
        c = e[f++];
        d = c & 32 ? c & 16 ? 3 : 2 : 1;
        g = d;
        b = c & 255 >>> 2 + d;
        while (d && f < e.length) {
            --d;
            c = e[f++];
            if (c == 0) return a;
            if ((c & 192) != 128) {
                a += "?";
                break
            }
            b = b << 6 | c & 63
        }
        if (d) {
            a += "?";
            break
        }
        if (b < g_rgdwchMinEncoded[g]) {
            a += "?";
            break
        } else if (b <= 65535) a += String.fromCharCode(b);
        else if (b <= 1114111) {
            b -= SURROGATE_OFFSET;
            a += String.fromCharCode(HIGH_SURROGATE_BITS | b >>> 10);
            a += String.fromCharCode(LOW_SURROGATE_BITS | b & 1023)
        } else a += "?"
    }
    return a
}
function unescapeProperlyInternal(c) {
    a: ;
    if (c == null) return "null";
    var e = 0,
        g = 0,
        d = "",
        f = [],
        a = 0,
        b, h;
    while (e < c.length) if (c.charAt(e) == "%") if (c.charAt(++e) == "u") {
        b = "";
        for (g = 0; g < 4 && e < c.length; ++g) b += c.charAt(++e);
        while (b.length < 4) b += "0";
        h = parseInt(b, 16);
        if (isNaN(h)) d += "?";
        else d += String.fromCharCode(h)
    } else {
        b = "";
        for (g = 0; g < 2 && e < c.length; ++g) b += c.charAt(e++);
        while (b.length < 2) b += "0";
        h = parseInt(b, 16);
        if (isNaN(h)) {
            if (a) {
                d += Vutf8ToUnicode(f);
                a = 0;
                f.length = a
            }
            d += "?"
        } else f[a++] = h
    } else {
        if (a) {
            d += Vutf8ToUnicode(f);
            a = 0;
            f.length = a
        }
        d += c.charAt(e++)
    }
    if (a) {
        d += Vutf8ToUnicode(f);
        a = 0;
        f.length = a
    }
    return d
}
function unescapeProperly(b) {
    a: ;
    var a = null;
    if ((browseris.ie55up || browseris.nav6up) && typeof decodeURIComponent != "undefined") a = decodeURIComponent(b);
    else a = unescapeProperlyInternal(b);
    return a
}
function navigateMailToLink(a) {
    a: ;
    window.location = "mailto:?body=" + escapeProperly(a)
}
function navigateMailToLinkWithMessage(b, a) {
    a: ;
    window.location = "mailto:" + escapeProperly(b) + "?body=" + escapeProperly(escapeProperlyCoreCore(a, false, false, true))
}
function newBlogPostOnClient(b, d, c) {
    a: ;
    var a, e;
    a = StsOpenEnsureEx("SharePoint.OpenDocuments.3");
    if (a == null) {
        alert(L_NewBlogPost_Text);
        return
    }
    try {
        e = a.NewBlogPost(b, d, c)
    } catch (f) {
        alert(L_NewBlogPostFailed_Text)
    }
}
function GetUrlFromWebUrlAndWebRelativeUrl(b, c) {
    a: ;
    var a = b == null || b.length <= 0 ? "/" : b;
    if (a.charAt(a.length - 1) != "/") a += "/";
    a += c;
    return a
}
var g_updateFormDigestPageLoaded = new Date;

function UpdateFormDigest(e, j) {
    a: ;
    try {
        if (g_updateFormDigestPageLoaded == null || typeof g_updateFormDigestPageLoaded != "object") return;
        var l = new Date;
        if (l.getTime() - g_updateFormDigestPageLoaded.getTime() < j) return;
        if (e == null || e.length <= 0) return;
        var b = document.getElementsByName("__REQUESTDIGEST")[0];
        if (b == null || b.tagName.toLowerCase() != "input" || b.type.toLowerCase() != "hidden" || b.value == null || b.value.length <= 0) return;
        var a = null;
        try {
            a = new ActiveXObject("Msxml2.XMLHTTP")
        } catch (h) {
            a = null
        }
        if (a == null) try {
            a = new XMLHttpRequest
        } catch (h) {
            a = null
        }
        if (a == null) return;
        a.open("POST", GetUrlFromWebUrlAndWebRelativeUrl(e, "_vti_bin/sites.asmx"), false);
        a.setRequestHeader("Content-Type", "text/xml");
        a.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetUpdatedFormDigest");
        a.send('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">  <soap:Body>    <GetUpdatedFormDigest xmlns="http://schemas.microsoft.com/sharepoint/soap/" />  </soap:Body></soap:Envelope>');
        var c = a.responseText;
        if (c == null || c.length <= 0) return;
        var g = "<GetUpdatedFormDigestResult>",
            k = "</GetUpdatedFormDigestResult>",
            d = c.indexOf(g),
            i = c.indexOf(k, d + g.length),
            f = null;
        if (d >= 0 && i > d) var f = c.substring(d + g.length, i);
        if (f == null || f.length <= 0) return;
        var m = b.value;
        b.value = f;
        g_updateFormDigestPageLoaded = new Date
    } catch (h) { }
}
function IsSupportedFirefoxOnWin() {
    a: ;
    return (browseris.winnt || browseris.win32 || browseris.win64bit) && browseris.firefox3up
}
function IsFirefoxOnWindowsPluginInstalled() {
    a: ;
    return navigator.mimeTypes && navigator.mimeTypes["application/x-sharepoint"] && navigator.mimeTypes["application/x-sharepoint"].enabledPlugin
}
function CreateFirefoxOnWindowsPlugin() {
    a: ;
    var b = null;
    if (IsSupportedFirefoxOnWin()) try {
        b = document.getElementById("winFirefoxPlugin");
        if (!b && IsFirefoxOnWindowsPluginInstalled()) {
            var a = document.createElement("object");
            a.id = "winFirefoxPlugin";
            a.type = "application/x-sharepoint";
            a.width = 0;
            a.height = 0;
            a.style.setProperty("visibility", "hidden", "");
            document.body.appendChild(a);
            b = document.getElementById("winFirefoxPlugin")
        }
    } catch (c) {
        b = null
    }
    return b
}
function IsSupportedMacBrowser() {
    a: ;
    return browseris.mac && (browseris.firefox3up || browseris.safari3up)
}
function IsBrowserPluginInstalled(a) {
    a: ;
    return navigator.mimeTypes && navigator.mimeTypes[a] && navigator.mimeTypes[a].enabledPlugin
}
function IsMacPluginInstalled() {
    a: ;
    var a = IsBrowserPluginInstalled("application/x-sharepoint-webkit"),
        b = IsBrowserPluginInstalled("application/x-sharepoint");
    if (browseris.safari3up && a) return true;
    return b
}
function CreateMacPlugin() {
    a: ;
    var b = null;
    if (IsSupportedMacBrowser()) {
        b = document.getElementById("macSharePointPlugin");
        if (b == null && IsMacPluginInstalled()) {
            var c = null;
            if (browseris.safari3up && IsBrowserPluginInstalled("application/x-sharepoint-webkit")) c = "application/x-sharepoint-webkit";
            else c = "application/x-sharepoint";
            var a = document.createElement("object");
            a.id = "macSharePointPlugin";
            a.type = c;
            a.width = 0;
            a.height = 0;
            a.style.setProperty("visibility", "hidden", "");
            document.body.appendChild(a);
            b = document.getElementById("macSharePointPlugin")
        }
    }
    return b
}
var g_objStssync;

function GetStssyncHandler(a) {
    a: ;
    if (!IsSupportedMacBrowser()) try {
        g_objStssync = new ActiveXObject("SharePoint.StssyncHandler" + a)
    } catch (b) {
        g_objStssync = null
    } else g_objStssync = CreateMacPlugin()
}
function GetStssyncData(d, f, e, h) {
    a: ;
    var a = null;
    if (document.cookie.indexOf("stsSyncAppName") == -1 && document.cookie.indexOf("stsSyncIconPath") == -1) {
        if (IsSupportedMacBrowser()) {
            var g = GetStssyncHandler("");
            if (g == null || !g.StssyncEnabled) {
                document.cookie = "stsSyncAppName=0;";
                document.cookie = "stsSyncIconPath=0;";
                return a
            }
        }
        if (browseris.ie5up && browseris.win32 || IsSupportedMacBrowser()) {
            var b, c;
            d != "" && GetStssyncHandler(".3");
            if (!g_objStssync) {
                if (d != "" && d != "calendar" && d != "contacts") {
                    document.cookie = "stsSyncAppName=0;";
                    document.cookie = "stsSyncIconPath=0;";
                    return a
                }
                GetStssyncHandler(".2");
                if (!g_objStssync || !(b = g_objStssync.GetStssyncAppName())) {
                    document.cookie = "stsSyncAppName=0;";
                    document.cookie = "stsSyncIconPath=0;";
                    return a
                }
            } else if (!(b = g_objStssync.GetStssyncAppNameForType(d))) {
                document.cookie = "stsSyncAppName=0;";
                document.cookie = "stsSyncIconPath=0;";
                return a
            }
            document.cookie = "stsSyncAppName=" + escapeProperly(b) + ";";
            try {
                c = g_objStssync.GetStssyncIconName();
                c = h + c;
                document.cookie = "stsSyncIconPath=" + escapeProperly(c) + ";"
            } catch (i) {
                document.cookie = "stsSyncIconPath=0;";
                c = e
            }
        } else {
            b = f;
            c = e;
            document.cookie = "stsSyncAppName=" + escapeProperly(f);
            document.cookie = "stsSyncIconPath=" + escapeProperly(e)
        }
    } else {
        b = GetCookie("stsSyncAppName");
        c = GetCookie("stsSyncIconPath");
        if (b == "0") return a
    }
    var L_LinkToBefore_Text = "连接到 ",
        L_LinkToAfter_Text = "";
    b = L_LinkToBefore_Text + b + L_LinkToAfter_Text;
    a = {};
    a.BtnText = b;
    a.BtnImagePath = c;
    return a
}
function GetStssyncAppName(b) {
    a: ;
    var a = GetStssyncData("", b, "", "");
    return a.BtnText
}
function makeAbsUrl(a) {
    a: ;
    if (a.length > 0 && "/" == a.substr(0, 1)) a = window.location.protocol + "//" + window.location.host + a;
    return a
}
function ExportHailStorm(o, k, n, c, b, m, r, l, i, j) {
    a: ;
    var h = GetCookie("stsSyncAppName"),
        q = GetCookie("stsSyncIconPath");
    if (h != null && h != "0") {
        var g = 500,
            a = 20,
            d = "stssync://sts/?ver=1.1&type=" + escapeProperly(o) + "&cmd=add-folder&base-url=" + escapeForSync(k) + "&list-url=" + escapeForSync("/" + makeAbsUrl(m).substr(k.length + 1) + "/") + "&guid=" + escapeProperly(n);
        if (window.self.offlineBtnUser != undefined) d += "&user-id=" + offlineBtnUser;
        var f = "&site-name=" + escapeForSync(c) + "&list-name=" + escapeForSync(b),
            e = "";
        if (i) e += "&folder-url=" + escapeForSync("/" + i.substr(l.length + 1));
        if (j) e += "&folder-id=" + j;
        if (d.length + f.length + e.length > g && (c.length > a || b.length > a)) {
            if (c.length > a) c = c.substring(0, a - 1) + "...";
            if (b.length > a) b = b.substring(0, a - 1) + "...";
            f = "&site-name=" + escapeForSync(c) + "&list-name=" + escapeForSync(b)
        }
        d = d + f + e;
        var L_StssyncTooLong_Text = "此网站或列表的标题太长。请缩短标题，然后重试。";
        if (d.length > g) alert(L_StssyncTooLong_Text);
        else try {
            window.location.href = d
        } catch (p) { }
    }
}
var g_objDiagramLaunch;

function GetDiagramLaunchInstalled() {
    a: ;
    var a = "";
    if (document.cookie.indexOf("digInstalled") == -1) try {
        g_objDiagramLaunch = new ActiveXObject("DiagramLaunch.DiagramLauncher");
        a = g_objDiagramLaunch.EnsureDiagramApplication();
        document.cookie = "digInstalled=" + escapeProperly(a) + ";"
    } catch (b) {
        g_objDiagramLaunch = null;
        document.cookie = "digInstalled=0;"
    } else {
        a = GetCookie("digInstalled");
        if (a == "0") a = ""
    }
    return a
}
var g_objProjectTaskLaunch = null;

function GetProjectTaskLaunchInstalled() {
    a: ;
    if (document.cookie.indexOf("projInstalled") == -1) {
        var a = "";
        try {
            g_objProjectTaskLaunch = new ActiveXObject("TaskLaunch.TaskLauncher");
            a = g_objProjectTaskLaunch.EnsureTaskApplication();
            document.cookie = "projInstalled=" + escapeProperly(a) + ";"
        } catch (b) {
            document.cookie = "projInstalled=0;";
            g_objProjectTaskLaunch = null
        }
    } else {
        a = GetCookie("projInstalled");
        if (a == "0") a = ""
    }
    return a
}
var g_expDatabase;

function GetDataBaseInstalled() {
    a: ;
    var a = "",
        c = "";
    if (document.cookie.indexOf("databaseBtnText") == -1 || document.cookie.indexOf("databaseBtnDesc") == -1) try {
        g_expDatabase = new ActiveXObject("SharePoint.ExportDatabase");
        if (g_expDatabase && g_expDatabase.IsDBProgramInstalled()) {
            document.cookie = "databaseBtnText=" + escapeProperly(g_expDatabase.MenuTitle) + ";";
            document.cookie = "databaseBtnDesc=" + escapeProperly(g_expDatabase.MenuDescription) + ";"
        } else {
            document.cookie = "databaseBtnText=0;";
            document.cookie = "databaseBtnDesc=0;";
            g_expDatabase = null
        }
    } catch (d) {
        document.cookie = "databaseBtnText=0;";
        document.cookie = "databaseBtnDesc=0;";
        g_expDatabase = null
    } else {
        a = GetCookie("databaseBtnText");
        c = GetCookie("databaseBtnDesc");
        if (a != "0" && a != "0") {
            var b = {};
            b.MenuTitle = a;
            b.MenuDescription = c;
            return b
        } else g_expDatabase = null
    }
    return g_expDatabase
}
var g_ssImporterObj, g_fSSImporter = false;

function EnsureSSImportInner() {
    a: ;
    if (browseris.ie5up && browseris.win32) try {
        g_ssImporterObj = new ActiveXObject("SharePoint.SpreadsheetLauncher.2");
        if (g_ssImporterObj) g_fSSImporter = true
    } catch (a) {
        try {
            g_ssImporterObj = new ActiveXObject("SharePoint.SpreadsheetLauncher.1");
            if (g_ssImporterObj) g_fSSImporter = true
        } catch (a) {
            g_fSSImporter = false
        }
    } else if (IsSupportedMacBrowser()) {
        g_ssImporterObj = CreateMacPlugin();
        if (g_ssImporterObj) g_fSSImporter = true;
        else g_fSSImporter = false
    }
}
function EnsureSSImporter(a) {
    a: ;
    a = typeof a == undefined ? false : a;
    if (document.cookie.indexOf("EnsureSSImporter") == -1 || a) {
        EnsureSSImportInner();
        document.cookie = "EnsureSSImporter=" + g_fSSImporter + ";"
    } else g_fSSImporter = GetCookie("EnsureSSImporter") == "true" ? true : false;
    return g_fSSImporter
}
function ShowHideSection(c, d) {
    a: ;
    var a = document.getElementById(c),
        b = document.getElementById(d);
    if (a == null) return;
    if (a.style.display != "none") {
        a.style.display = "none";
        b.src = "/_layouts/images/plus.gif"
    } else {
        a.style.display = "";
        b.src = "/_layouts/images/minus.gif"
    }
}
function ShowSection(b, c) {
    a: ;
    var a = document.getElementById(b),
        d = document.getElementById(c);
    if (a == null) return;
    if (a.style.display == "none") {
        a.style.display = "";
        d.src = "/_layouts/images/minus.gif"
    }
}
function ShowHideInputFormSection(c, d) {
    a: ;
    var a = document.getElementById(c);
    if (a != null) a.style.display = d ? "" : "none";
    for (var b = 1; b < 3; b++) {
        a = document.getElementById(c + "_tablerow" + b);
        if (a != null) a.style.display = d ? "" : "none"
    }
}
function ShowHideInputFormControl(id, bHide, bDisableValidators, bSilent) {
    a: ;
    var displaySetting = "";
    if (bHide == true) displaySetting = "none";
    var validators = eval(id + "_validators");
    if (validators != null) for (var i = 0; i < validators.length; i++) STSValidatorEnable(validators[i], !bDisableValidators, bSilent);
    for (var i = 1; i <= 5; i++) {
        var rowId = id + "_tablerow" + i,
            row = document.getElementById(rowId);
        if (row != null && !browseris.mac) row.style.display = displaySetting
    }
}
function HideMenuControl(menuControlId) {
    a: ;
    if (typeof menuControlId == "undefined" || menuControlId == null) return;
    var menu = document.getElementById(menuControlId);
    if (typeof menu == "undefined" || menu == null) return;
    var menuItems = menu.getElementsByTagName("ie:menuitem");
    if (typeof menuItems == "undefined" || menuItems == null) return;
    for (var i = 0; i < menuItems.length; i++) {
        var menuItem = menuItems[i],
            hiddenScript = menuItem.getAttribute("hidden");
        if (typeof hiddenScript == "undefined" || hiddenScript == null || !eval(hiddenScript)) return
    }
    menu.style.display = "none"
}
function SetControlDisabledStatus(a, b) {
    a: ;
    try {
        a.setAttribute && a.setAttribute("disabled", b);
        !b && a.removeAttribute && a.removeAttribute("disabled")
    } catch (c) { }
}
function SetControlDisabledStatusRecursively(a, c) {
    a: ;
    if (a == null) return;
    SetControlDisabledStatus(a, c);
    for (var d = a.childNodes, b = 0; d.length > b; b++) SetControlDisabledStatusRecursively(d.item(b), c)
}
function SetChildControlsDisabledStatus(d, c) {
    a: ;
    for (var b = d.childNodes, a = 0; a < b.length; a++) SetControlDisabledStatusRecursively(b.item(a), c)
}
var g_PNGImageIds, g_PNGImageSources;

function displayPNGImage(e, d, b, a, f) {
    a: ;
    if (g_PNGImageIds == null) g_PNGImageIds = [];
    if (g_PNGImageSources == null) g_PNGImageSources = [];
    var c = null;
    document.write("<IMG id='" + e + "' ");
    b && b > 0 && document.write("width='" + b + "' ");
    a && a > 0 && document.write("height='" + a + "' ");
    document.write("alt='" + f + "' ");
    c && document.write("style='" + c + "' ");
    document.write(" src='" + d + "' />");
    g_PNGImageIds.push(e);
    g_PNGImageSources.push(d)
}
function ProcessPNGImages() {
    a: ;
    var c = browseris.ie && browseris.ie55up && browseris.verIEFull < 7;
    if (g_PNGImageIds != null && c) for (var a = 0; a < g_PNGImageIds.length; a++) {
        var b = document.getElementById(g_PNGImageIds[a]);
        if (b != null && g_PNGImageSources[a] != null) {
            b.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + g_PNGImageSources[a] + "),sizingMethod=scale);";
            b.src = "/_layouts/images/blank.gif"
        }
    }
}
var CTXTYPE_EDITMENU = 0,
    CTXTYPE_VIEWSELECTOR = 1;

function ContextInfo() {
    a: ;
    this.listBaseType = null;
    this.listTemplate = null;
    this.listName = null;
    this.view = null;
    this.listUrlDir = null;
    this.HttpPath = null;
    this.HttpRoot = null;
    this.serverUrl = null;
    this.imagesPath = null;
    this.PortalUrl = null;
    this.RecycleBinEnabled = null;
    this.isWebEditorPreview = null;
    this.rootFolderForDisplay = null;
    this.isPortalTemplate = null;
    this.isModerated = false;
    this.recursiveView = false;
    this.displayFormUrl = null;
    this.editFormUrl = null;
    this.newFormUrl = null;
    this.ctxId = null;
    this.CurrentUserId = null;
    this.isForceCheckout = false;
    this.EnableMinorVersions = false;
    this.ModerationStatus = 0;
    this.verEnabled = 0;
    this.isVersions = 0;
    this.WorkflowsAssociated = false;
    this.ExternalDataList = false;
    this.HasRelatedCascadeLists = 0;
    this.CascadeDeleteWarningMessage = null;
    this.ContentTypesEnabled = false;
    this.SendToLocationName = "";
    this.SendToLocationUrl = "";
    this.StateInitDone = false;
    this.TotalListItems = null;
    this.CurrentSelectedItems = null;
    this.LastSelectableRowIdx = null;
    this.SelectAllCbx = null;
    this.TableCbxFocusHandler = null;
    this.TableMouseoverHandler = null
}
function ctxInitItemState(a) {
    a: ;
    a.TotalListItems = 0;
    a.CurrentSelectedItems = 0;
    a.LastSelectableRowIdx = 0;
    a.StateInitDone = true
}
function STSPageUrlValidation(a) {
    a: ;
    return PageUrlValidation(a)
}
function GetSource(a) {
    a: ;
    var c = DeferCall("GetSource2", a, null);
    if (c == null) {
        var b = GetUrlKeyValue("Source");
        if (b == "") if (a != null && a != "") b = a;
        else b = window.location.href;
        c = b
    }
    return escapeProperly(STSPageUrlValidation(c))
}
function GetUrlKeyValue(d, e, a) {
    a: ;
    var c = "";
    if (a == null) a = window.location.href + "";
    var b;
    b = a.indexOf("#");
    if (b >= 0) a = a.substr(0, b);
    b = a.indexOf("&" + d + "=");
    if (b == -1) b = a.indexOf("?" + d + "=");
    if (b != -1) {
        ndx2 = a.indexOf("&", b + 1);
        if (ndx2 == -1) ndx2 = a.length;
        c = a.substring(b + d.length + 2, ndx2)
    }
    if (e) return c;
    else return unescapeProperlyInternal(c)
}
function LoginAsAnother(a, b) {
    a: ;
    document.cookie = "loginAsDifferentAttemptCount=0";
    if (b == "1") GoToPage(a);
    else {
        var c = a.indexOf("?") >= 0 ? "&" : "?";
        a += c + "Source=" + escapeProperly(window.location.href);
        STSNavigate(a)
    }
}
function isPortalTemplatePage(a) {
    a: ;
    if (GetUrlKeyValue("PortalTemplate") == "1" || GetUrlKeyValue("PortalTemplate", a) == "1" || currentCtx != null && currentCtx.isPortalTemplate) return true;
    else return false
}
function CLVPFromEvent(a) {
    a: ;
    return DeferCall("CLVPFromEventReal", a)
}
function STSNavigateToView(b, a) {
    a: ;
    STSNavigate(a)
}
function STSNavigate2(b, a) {
    a: ;
    STSNavigate(a)
}
function STSNavigate(a) {
    a: ;
    if (window.location.search.indexOf("IsDlg=1") != -1) if (a.indexOf("?") != -1) if (a.match("&$") != "&") a = a + "&IsDlg=1";
    else a = a + "IsDlg=1";
    else a = a + "?IsDlg=1";
    if (isPortalTemplatePage(a)) window.top.location = STSPageUrlValidation(a);
    else window.location = STSPageUrlValidation(a)
}
function GoToPage(a) {
    a: ;
    var c = a.indexOf("?") >= 0 ? "&" : "?";
    if (GetUrlKeyValue("Source", true, a).length == 0) {
        var b = GetSource();
        if (b != null && b != "") if (a.length + b.length <= 1950) a += c + "Source=" + b
    }
    STSNavigate(a)
}
function TrimSpaces(c) {
    a: ;
    var a, b;
    c = c.toString();
    var d = c.length;
    for (a = 0; a < d; a++) if (c.charAt(a) != " ") break;
    if (a == d) return "";
    for (b = d - 1; b > a; b--) if (c.charAt(b) != " ") break;
    b++;
    return c.substring(a, b)
}
function TrimWhiteSpaces(c) {
    a: ;
    var a, b;
    c = c.toString();
    var d = c.length;
    for (a = 0; a < d; a++) {
        ch = c.charAt(a);
        if (ch != " " && ch != "\t" && ch != "\n" && ch != "\r" && ch != "\f") break
    }
    if (a == d) return "";
    for (b = d - 1; b > a; b--) {
        ch = c.charAt(b);
        if (ch != " " && ch != "\t" && ch != "\n" && ch != "\r" && ch != "\f") break
    }
    b++;
    return c.substring(a, b)
}
function GetAttributeFromItemTable(a, d, c) {
    a: ;
    var b = a != null ? a.getAttribute(d) : null;
    if (b == null && a != null && c != null) b = a.getAttribute(c);
    return b
}
function ShowMtgNavigatorPane() {
    a: ;
    document.getElementById("MeetingNavigatorPane").style.display = "block"
}
function HideMtgNavigatorPane() {
    a: ;
    document.getElementById("MeetingNavigatorPane").style.display = "none"
}
function HideMtgDesc() {
    a: ;
    document.getElementById("MeetingDescription").style.display = "none"
}
function GetMultipleUploadEnabled() {
    a: ;
    try {
        if (browseris.ie5up && !browseris.mac && new ActiveXObject("STSUpld.UploadCtl")) return true
    } catch (a) { }
    return false
}
function SetUploadPageTitle() {
    a: ;
    if (GetUrlKeyValue("Type") == 1) {
        document.title = L_NewFormClickOnce1_Text;
        if (browseris.ie || browseris.nav6up) {
            var a = document.getElementById("onetidTextTitle");
            if (a != null) a.innerHTML = L_NewFormClickOnce1_Text
        }
    }
}
function GetSelectedValue(a) {
    a: ;
    if (a && a.selectedIndex > -1) return a.options[a.selectedIndex].value;
    else return ""
}
function GetSelectedText(a) {
    a: ;
    if (a && a.selectedIndex > -1) return a.options[a.selectedIndex].text;
    else return ""
}
function MtgShowTimeZone() {
    a: ;
    GetCookie("MtgTimeZone") == "1" && MtgToggleTimeZone()
}
function FormatDate(a, b, c, d) {
    a: ;
    var L_Date_Text = "<b>日期:</b>",
        L_Time_Text = "<b>时间:</b>",
        L_DateSeparator = " - ";
    if (browseris.win32 && a == c) L_DateSeparator = "-‎";
    if (a == c) {
        document.write(L_Date_Text + " " + a);
        if (b != d) document.write(" " + L_Time_Text + " " + b + L_DateSeparator + d);
        else document.write(" " + L_Time_Text + " " + b)
    } else document.write(L_Date_Text + " " + a + " (" + b + ")" + L_DateSeparator + c + " (" + d + ")")
}
function GetAlertText(c) {
    a: ;
    var L_DETACHEDSINGLEEXCEPT_Text = "此会议日期不再与日历和计划程序中的会议关联。此会议日期可能已被取消，或者已从计划会议中删除了指向工作区的链接。",
        L_DETACHEDCANCELLEDEXCEPT_Text = "此会议日期已从日历和计划程序中取消。若要指定要对工作区中的相关联信息执行的操作，请执行以下操作: 在“会议序列”窗格中，指向会议日期，然后在下拉列表中，单击“保留”、“删除”或“移动”。",
        L_DETACHEDUNLINKEDSINGLE_Text = "此会议日期不再与日历和计划程序中的关联会议链接。若要指定要对工作区中的信息执行的操作，请执行以下操作: 在“会议序列”窗格中，指向会议日期，然后在下拉列表中，单击“保留”、“删除”或“移动”。",
        L_DETACHEDCANCELLEDSERIES_Text = "此会议序列已从日历和计划程序中取消。",
        L_DETACHEDUNLINKEDSERIES_Text = "此会议序列不再与日历和计划程序中的关联会议序列链接。您可保留或删除工作区。如果保留工作区，则不能将该工作区链接到其他计划会议。",
        L_DETACHEDSERIESNOWSINGLE_Text = "此会议已在日历和计划程序中从定期会议更改为非定期会议。您可保留或删除工作区。如果保留工作区，则不能将该工作区链接到其他计划会议。",
        L_DETACHEDSINGLENOWSERIES_Text = "此会议已在日历和计划程序中从非定期会议更改为定期会议。当前工作区不支持定期会议。请在计划程序中取消会议与该工作区的链接，然后再将会议链接到新的工作区。新工作区将自动支持定期会议。",
        L_DETACHEDNONGREGORIANCAL_Text = "创建此会议所使用的日历和计划程序仅支持对会议工作区的系列更新。在该程序中所做的单个会议更改将不会在该工作区中显示。",
        L_DETACHEDPASTEXCPMODIFIED_Text = "已在日历和计划程序中修改或取消了这个过去的会议日期。若要保留，删除或移动工作区中的会议，请使用“会议序列”窗格中会议日期旁的下拉菜单。若要更新工作区中会议的计划信息，请使用计划程序更新特定会议事件。",
        a = c & 16 - 1,
        b = c - a;
    if (a) switch (a) {
        case 1:
            return g_meetingCount == 1 ? L_DETACHEDSINGLEEXCEPT_Text : L_DETACHEDCANCELLEDEXCEPT_Text;
        case 2:
            return L_DETACHEDCANCELLEDSERIES_Text;
        case 3:
            return L_DETACHEDCANCELLEDEXCEPT_Text;
        case 4:
            return g_meetingCount == 1 ? L_DETACHEDSINGLEEXCEPT_Text : L_DETACHEDUNLINKEDSINGLE_Text;
        case 5:
            return L_DETACHEDUNLINKEDSERIES_Text;
        case 6:
            return L_DETACHEDSERIESNOWSINGLE_Text;
        case 7:
            return L_DETACHEDSINGLENOWSERIES_Text;
        case 8:
            return L_DETACHEDPASTEXCPMODIFIED_Text
    } else if (b) switch (b) {
        case 16:
            return L_DETACHEDNONGREGORIANCAL_Text
    }
    return null
}
function retrieveCurrentThemeLink() {
    a: ;
    for (var c, b = document.getElementsByTagName("link"), a = 0; a < b.length; a++) if (b[a].type == "text/css" && b[a].id == "onetidThemeCSS") c = b[a];
    if (c) {
        var f = /(\.\.\/)+/,
            d = c.href,
            e = d.replace(f, "/");
        return e
    }
}
function StBuildParam(b) {
    a: ;
    for (var c, a = 1; a < StBuildParam.arguments.length; a++) {
        c = new RegExp("\\^" + a);
        b = b.replace(c, StBuildParam.arguments[a])
    }
    return b
}
JSRequest = {
    QueryString: null,
    FileName: null,
    PathName: null,
    EnsureSetup: function () {
        a: ;
        if (JSRequest.QueryString != null) return;
        JSRequest.QueryString = [];
        for (var e = window.location.search.substring(1), c = e.split("&"), a = 0; a < c.length; a++) {
            var b = c[a].indexOf("=");
            if (b > -1) {
                var g = c[a].substring(0, b),
                    f = c[a].substring(b + 1);
                JSRequest.QueryString[g] = f
            }
        }
        var d = JSRequest.PathName = window.location.pathname,
            b = d.lastIndexOf("/");
        if (b > -1) JSRequest.FileName = d.substring(b + 1);
        else JSRequest.PageName = d
    }
};
var ExpGroupWPListName = "WSS_ExpGroupWPList",
    ExpGroupCookiePrefix = "WSS_ExpGroup_",
    ExpGroupCookieDelimiter = "&",
    ExpGroupMaxWP = 11,
    ExpGroupMaxCookieLength = 3960,
    g_ExpGroupQueue = [],
    g_ExpGroupInProgress = false,
    g_ExpInitializing = false,
    g_ExpGroupTable = [],
    g_ExpGroupNeedsState = false,
    g_ExpGroupParseStage = false;

function ExpCollGroup(c, h, m, l) {
    a: ;
    if (m != null) g_ExpGroupNeedsState = true;
    if (document.getElementById("titl" + c) == null) return;
    viewTable = document.getElementById("titl" + c).parentNode;
    if (viewTable == null) return;
    var o = c.substr(0, c.indexOf("-")),
        b = window["ctx" + o];
    if (!b) return;
    !b.StateInitDone && ctxInitItemState(b);
    if (b.SelectAllCbx == null) b.SelectAllCbx = getSelectAllCbxFromTable(viewTable);
    tbodyTags = viewTable.getElementsByTagName("TBODY");
    numElts = tbodyTags.length;
    len = c.length;
    img = document.getElementById(h);
    if (img == null) return;
    srcPath = img.src;
    index = srcPath.lastIndexOf("/");
    h = srcPath.slice(index + 1);
    var d = false;
    if (h == "plus.gif" || g_ExpInitializing) {
        d = true;
        displayStr = "";
        img.src = "/_layouts/images/minus.gif"
    } else {
        d = false;
        displayStr = "none";
        img.src = "/_layouts/images/plus.gif"
    }
    for (var j = 0; j < numElts; j++) {
        var a = tbodyTags[j];
        if (a.id != null && a.id.length > len + 4 && c == a.id.slice(4).substr(0, len)) {
            if (d) {
                index = a.id.indexOf("_", len + 4);
                if (index != -1) {
                    index = a.id.indexOf("_", index + 1);
                    if (index != -1) continue
                }
            }
            var n = a.style.display;
            a.style.display = displayStr;
            var g = 0;
            if (a.getAttribute("selectableRows")) g = Number(a.getAttribute("selectableRows"));
            if (typeof FV4UI != "undefined" && FV4UI() && g) if (!d) {
                if (n != "none") b.TotalListItems -= g;
                DeselectCollapsedGroup(b, a);
                UpdateSelectAllCbx(b, true)
            } else {
                b.TotalListItems += g;
                UpdateSelectAllCbx(b, false)
            }
            if (d && a.id.substr(0, 4) == "titl") {
                imgObj = document.getElementById("img_" + a.id.slice(4));
                imgObj.src = "/_layouts/images/plus.gif"
            }
            var k = "tbod" + c;
            if (a.id.substr(0, k.length) == k) {
                if (l) for (var e = 0; e < a.childNodes.length; e++) {
                    var i = a.childNodes[e];
                    i.style.display = displayStr
                }
                if (a.childNodes.length == 0) {
                    var f = a.nextSibling;
                    if (f != null && f.tagName == "TBODY" && f.id == "") for (var e = 0; e < f.childNodes.length; e++) {
                        var i = f.childNodes[e];
                        i.style.display = displayStr;
                        if (typeof FV4UI != "undefined" && FV4UI()) {
                            HandleSingleGroupByRow(b, i, d);
                            UpdateSelectAllCbx(b, true)
                        }
                    }
                }
            }
        }
    }
    EnsureScript("core.js", TypeofFullName("UpdateCtxLastSelectableRow"), function () {
        a: ;
        typeof FV4UI != "undefined" && FV4UI() && UpdateCtxLastSelectableRow(b, viewTable)
    });
    if (!l && !g_ExpGroupParseStage) {
        if (g_ExpGroupNeedsState && ExpGroupFetchWebPartID(c) != null) if (d) AddGroupToCookie(c);
        else RemoveGroupFromCookie(c);
        if (d) {
            tbody = document.getElementById("tbod" + c + "_");
            if (tbody != null) {
                isLoaded = tbody.getAttribute("isLoaded");
                isLoaded == "false" && ExpGroupFetchData(c, m)
            }
        }
    }
}
function ExpGroupFetchData(a, b) {
    a: ;
    var d = '<tr><td colspan="100" class="ms-gbload">' + L_Loading_Text + "</td></tr>";
    ExpGroupRenderData(d, a, "false");
    if (!g_ExpGroupInProgress) {
        var c = ExpGroupFetchGroupString(a);
        if (c == null) {
            var d = '<tr><td></td><td class="ms-gbload">' + L_Loading_Error_Text + "</td></tr>";
            ExpGroupRenderData(d, a, "false");
            g_ExpGroupQueue.length > 0 && ExpGroupFetchData(g_ExpGroupQueue.shift());
            return
        }
        if (typeof InitAllClvps == "undefined" && b != null) g_ExpInitializing = true;
        else {
            g_ExpInitializing = false;
            g_ExpGroupInProgress = true
        }
        if (!ExpGroupCallServer(c, a, b)) g_ExpGroupQueue.length > 0 && b == null && ExpGroupFetchData(g_ExpGroupQueue.shift())
    } else g_ExpGroupQueue.push(a)
}
function ExpGroupCallServer(groupString, groupName, evt) {
    a: ;
    if (evt != null) if (evt == "PageLoad") {
        var obj = {};
        obj.fakeEvent = true;
        var defd;
        try {
            defd = typeof inplview.ExpGroup
        } catch (e) {
            defd = "undefined"
        }
        if (defd != "undefined") inplview.ExpGroup(obj, groupName);
        else {
            var str = "inplview.ExpGroup",
                rg = str.split(".");
            if (rg.length > 1) {
                var fnd = function () {
                    a: ;
                    inplview.ExpGroup(obj, groupName)
                };
                EnsureScript(rg[0], defd, fnd)
            }
        }
    } else ExpGroup(evt, groupName);
    else {
        var viewCounter = groupName.substring(0, groupName.indexOf("-")),
            ctx = window["ctx" + viewCounter],
            webPartID = ExpGroupFetchWebPartID(groupName);
        if (webPartID != null) {
            var functionName = "ExpGroupCallServer" + webPartID;
            if (ctx != null && ctx.clvp != null) {
                var strFilter = ctx.clvp.FilterString();
                if (strFilter != null) groupString += "|" + strFilter
            }
            var functionCall = functionName + "('" + groupString + "','" + groupName + "')";
            eval(functionCall)
        }
    }
}
function ExpGroup(b, c) {
    a: ;
    if (typeof InitAllClvps != "undefined") {
        var a;
        try {
            a = typeof inplview.ExpGroup
        } catch (g) {
            a = "undefined"
        }
        if (a != "undefined") inplview.ExpGroup(b, c);
        else {
            var f = "inplview.ExpGroup",
                d = f.split(".");
            if (d.length > 1) {
                var e = function () {
                    a: ;
                    inplview.ExpGroup(b, c)
                };
                EnsureScript(d[0], a, e)
            }
        }
    } else SodDispatchEvent("inplview", typeof InitAllClvps, b)
}
function DoPagingCallback(webPartID, pagingParam) {
    a: ;
    if (webPartID != null) {
        var functionName = "DoPagingCallback" + webPartID,
            functionCall = functionName + "('" + pagingParam + "')";
        eval(functionCall)
    }
}
function ExpGroupReceiveData(a, c) {
    a: ;
    var d = "ctx" + c.substring(0, c.indexOf("-")),
        e = a.indexOf('CTXName="');
    if (e != -1) if (d != "ctx1") a = a.replace(/ CTXName=\"ctx1\" /g, ' CTXName="' + d + '" ');
    var b = false;
    if (a.length < 4) b = true;
    else if (a.substring(0, 3) != "<tr") b = true;
    if (b) a = "<TR><TD>" + a + "</TD></TR>";
    ExpGroupRenderData(a, c, "true");
    ProcessImn();
    g_ExpGroupInProgress = false;
    g_ExpGroupQueue.length > 0 && ExpGroupFetchData(g_ExpGroupQueue.shift())
}
function ExpGroupRenderData(d, a, e) {
    a: ;
    var c = document.getElementById("tbod" + a + "_"),
        b = document.createElement("DIV"),
        f = a.split("-");
    b.innerHTML = '<TABLE><TBODY id="tbod' + a + '_" isLoaded="' + e + '">' + d + "</TBODY></TABLE>";
    c.parentNode.replaceChild(b.firstChild.firstChild, c)
}
function ExpGroupFetchGroupString(b) {
    a: ;
    titlTbody = document.getElementById("titl" + b);
    if (titlTbody == null) return null;
    else {
        var a = titlTbody.getAttribute("groupString");
        return a
    }
}
function ExpGroupFetchWebPartID(b) {
    a: ;
    var c = b.substring(0, b.indexOf("-")),
        a = document.getElementById("GroupByWebPartID" + c);
    if (a == null) return null;
    return a.getAttribute("webPartID")
}
function RenderActiveX(a) {
    a: ;
    document.write(a)
}
function OnItem(a) {
    a: ;
    DeferCall("OnItemDeferCall", a)
}
function OnChildItem(c) {
    a: ;
    for (var b = 0; b < c.childNodes.length; b++) {
        var a = c.childNodes[b];
        if (a.nodeType == 1 && a.tagName == "TABLE" && a.getAttribute("NameOrTitle")) break;
        if (a.nodeType == 1 && a.tagName == "DIV" && a.style.display != "none" && a.style.visibility != "hidden") {
            OnItem(a);
            break
        }
    }
}
function OnLink(a) {
    a: ;
    DeferCall("OnLinkDeferCall", a)
}
function MMU_PopMenuIfShowing(a) {
    a: ;
    DeferCall("MMU_PopMenuIfShowingDeferCall", a)
}
function OnMouseOverFilter(a) {
    a: ;
    DeferCall("OnMouseOverFilterDeferCall", a)
}
function OnChildColumn(c) {
    a: ;
    for (var b = 0; b < c.childNodes.length; b++) {
        var a = c.childNodes[b];
        if (a.nodeType == 1 && a.tagName == "DIV" && a.getAttribute("CtxNum") != null) {
            OnMouseOverFilter(a);
            break
        }
    }
}
function MMU_EcbTableMouseOverOut(b, a) {
    a: ;
    DeferCall("MMU_EcbTableMouseOverOutDeferCall", b, a)
}
function OnMouseOverAdHocFilter(b, a) {
    a: ;
    DeferCall("OnMouseOverAdHocFilterDeferCall", b, a)
}
function MMU_EcbLinkOnFocusBlur(c, b, a) {
    a: ;
    DeferCall("MMU_EcbLinkOnFocusBlurDeferCall", c, b, a)
}
function GetElementByClassName(a, d) {
    a: ;
    if (a.className) if (a.className.indexOf(d) > -1) return a;
    for (var b, c = 0; c < a.childNodes.length; c++) {
        b = GetElementByClassName(a.childNodes[c], d);
        if (b != null) return b
    }
    return null
}
function AddWhiteBG() {
    a: ;
    if (searcharea.className.indexOf(" " + whitebgclass) == -1) {
        var a = searcharea.className.trim() + " " + whitebgclass;
        a = a.trim();
        searcharea.className = a
    }
}
function RemoveWhiteBG() {
    a: ;
    if (locked) return;
    searcharea.className = searcharea.className.replace(" " + whitebgclass, "")
}
var locked = false;

function LockBG() {
    a: ;
    locked = !locked;
    if (locked) AddWhiteBG();
    else RemoveWhiteBG()
}
var searcharea, searchbox, searchimage, whitebgclass;

function InitSearchBoxStyleEvents(c, d, a, b) {
    a: ;
    searcharea = document.getElementById(c);
    searchbox = document.getElementById(d);
    searchimage = GetElementByClassName(searcharea, a);
    whitebgclass = b;
    if (searchbox == null || searchimage == null) return;
    searchbox.onfocus = LockBG;
    searchbox.onmouseover = AddWhiteBG;
    searchbox.onblur = LockBG;
    searchbox.onmouseout = RemoveWhiteBG;
    searchimage.onmouseover = AddWhiteBG;
    searchimage.onmouseout = RemoveWhiteBG
}
function IsFullNameDefined(c) {
    a: ;
    if (!c) return false;
    for (var d = c.split("."), e = d.length, a = window, b = 0; b < e; b++) {
        a = a[d[b]];
        if (typeof a == "undefined") return false
    }
    return true
}
function TypeofFullName(c) {
    a: ;
    if (!c) return "undefined";
    for (var d = c.split("."), e = d.length, a = window, b = 0; b < e; b++) {
        a = a[d[b]];
        if (typeof a == "undefined") return "undefined"
    }
    return typeof a
}
var _v_dictSod = [],
    Sods = {
        missing: 1,
        loading: 2,
        pending: 3,
        loaded: 4
    },
    _v_qsod = [],
    _v_sodctx = {
        document: document,
        window: window
    };

function Sod(a) {
    a: ;
    this.url = a;
    this.loaded = false;
    this.depkeys = null;
    this.state = Sods.missing;
    this.qfn = null
}
function RegisterSod(a, c) {
    a: ;
    a = NormalizeSodKey(a);
    var b = new Sod(c);
    _v_dictSod[a] = b
}
function RegisterSodDep(b, c) {
    a: ;
    b = NormalizeSodKey(b);
    var a = _v_dictSod[b];
    if (a == null) return;
    if (a.depkeys == null) a.depkeys = [];
    a.depkeys.push(c)
}
function LoadSodByKey(c, b) {
    a: ;
    var a = _v_dictSod[c];
    if (b != null && a != null) {
        if (a.qfn == null) a.qfn = [];
        a.qfn.push(b)
    }
    return LoadSod(a)
}
function LoadSod(a) {
    a: ;
    if (a == null) return Sods.missing;
    if (a.state == Sods.loaded || a.state == Sods.loading) return a.state;
    a.state = Sods.pending;
    var e = [];
    if (a.depkeys != null) {
        for (var g = true, f = a.depkeys.length, b = 0; b < f; b++) {
            var c = _v_dictSod[a.depkeys[b]];
            if (c == null) continue;
            if (c.state != Sods.loaded) {
                g = false;
                e.push(c)
            }
        }
        if (!g) {
            _v_qsod.push(a);
            f = e.length;
            for (b = 0; b < f; b++) {
                var c = e[b];
                c.state != Sods.loaded && c.state != Sods.loading && LoadSod(c)
            }
            return a.state
        }
    }
    if (a.state == Sods.loaded || a.state == Sods.loading) return a.state;
    a.state = Sods.loading;
    var d = document.createElement("SCRIPT");
    d.type = "text/javascript";
    d.src = a.url;
    var h = GetOnLoad(a, d);
    if (browseris.ie) d.onreadystatechange = h;
    else d.onload = h;
    document.getElementsByTagName("HEAD")[0].appendChild(d);
    return a.state
}
function GetOnLoad(a, b) {
    a: ;
    var c = function () {
        a: ;
        var e = false;
        if (typeof b.readyState != "undefined") e = b.readyState == "complete" || b.readyState == "loaded";
        else e = true;
        if (e) {
            b.onreadystatechange = null;
            b.onload = null;
            var c = a.url,
                    d = c.lastIndexOf("/");
            if (d > -1) c = c.substr(d + 1);
            d = c.indexOf("?");
            if (d > -1) c = c.substr(0, d);
            c = c.toLowerCase();
            c = c.replace(".debug.js", ".js");
            var f = function () {
                a: ;
                a.state = Sods.loaded;
                while (_v_qsod.length > 0) {
                    var b = _v_qsod.pop();
                    if (b.state == Sods.pending) {
                        LoadSod(b);
                        break
                    }
                }
                if (a.qfn != null) while (a.qfn.length > 0) {
                    var c = a.qfn.shift();
                    c()
                }
            };
            if (c.indexOf(".js") > 0) ExecuteOrDelayUntilScriptLoaded(f, c);
            else f()
        }
    };
    return c
}
function EnsureScript(a, c, b) {
    a: ;
    if (c != "undefined") {
        b != null && b();
        return true
    }
    a = NormalizeSodKey(a);
    LoadSodByKey(a, b);
    return false
}
function EnsureScriptFunc(a, b, c) {
    a: ;
    EnsureScript(a, TypeofFullName(b), c)
}
function EnsureScriptParams() {
    a: ;
    if (arguments.length < 2) return;
    var a = arguments,
        c = Array.prototype.shift.call(a),
        b = Array.prototype.shift.call(a),
        d = function () {
            a: ;
            for (var e = b.split("."), c = window, d = 0, f = e.length; d < f; d++) c = c[e[d]];
            c.apply(null, a)
        };
    EnsureScriptFunc(c, b, d)
}
function NormalizeSodKey(a) {
    a: ;
    var b = a.toLowerCase(),
        d = b.length;
    if (d >= 3 && ".js" == b.substr(d - 3)) a = b;
    else if (b.indexOf(".resx") > 0) {
        var c = b.indexOf(".resx");
        a = a.substr(0, c + 5).toLowerCase() + a.substr(c + 5)
    }
    return a
}
function SodCloneEvent(b) {
    a: ;
    var a;
    if (browseris.ie) a = document.createEventObject(b);
    else {
        a = document.createEvent("MouseEvents");
        a.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    }
    return a
}
function SodDispatchEvent(d, e, a) {
    a: ;
    var c = SodCloneEvent(a),
        b;
    if (browseris.ie) b = function () {
        a: ;
        c.srcElement.fireEvent("onclick", c)
    };
    else {
        var f = a.target;
        b = function () {
            a: ;
            f.dispatchEvent(c)
        }
    }
    if (!EnsureScript(d, e, b)) if (browseris.ie) a.cancelBubble = true;
    else a.stopPropagation()
}
function AddTabHeadHandler(b, c) {
    a: ;
    var a = document.getElementById(b);
    if (a != null) {
        var d = a.getElementsByTagName("A")[0];
        AddEvtHandler(d, "onclick", c)
    }
}
function LoadWPAdderOnDemand() {
    a: ;
    if (typeof loadWPAdderCallback == "function") {
        var a;
        try {
            a = typeof WPAdderClass.load
        } catch (e) {
            a = "undefined"
        }
        if (a != "undefined") WPAdderClass.load(loadWPAdderCallback);
        else {
            var d = "WPAdderClass.load",
                b = d.split(".");
            if (b.length > 1) {
                var c = function () {
                    a: ;
                    WPAdderClass.load(loadWPAdderCallback)
                };
                EnsureScript(b[0], a, c)
            }
        }
    }
}
function showSaveConflictDialog(d, c, e, b, g, f) {
    a: ;
    var a;
    try {
        a = typeof ribbon.showSaveConflictDialog
    } catch (k) {
        a = "undefined"
    }
    if (a != "undefined") ribbon.showSaveConflictDialog(d, c, e, b, g, f);
    else {
        var j = "ribbon.showSaveConflictDialog",
            h = j.split(".");
        if (h.length > 1) {
            var i = function () {
                a: ;
                ribbon.showSaveConflictDialog(d, c, e, b, g, f)
            };
            EnsureScript(h[0], a, i)
        }
    }
}
function ClkElmt(a) {
    a: ;
    if (browseris.ie) a.click();
    else FFClick(a)
}
function EnsureSelectionHandlerOnFocus(c, b, a) {
    a: ;
    DeferCall("EnsureSelectionHandlerOnFocusDeferred", c, b, a)
}
function EnsureSelectionHandler(b, c, a) {
    a: ;
    DeferCall("EnsureSelectionHandlerDeferred", b, c, a)
}
function StopEvt(a) {
    a: ;
    !browseris.ie && a.stopPropagation()
}
function FFGetElementsById(e, c) {
    a: ;
    var b = [],
        a = e.getElementById(c);
    while (a != null) {
        b.push(a);
        a.id = "";
        a = e.getElementById(c)
    }
    for (var d = 0; d < b.length; d++) b[d].id = c;
    return b
}
function GetElementsByName(b) {
    a: ;
    var a = document.getElementsByName(b);
    if (a.length == 0 && window.XMLHttpRequest) a = FFGetElementsById(document, b);
    return a
}
function AddEvtHandler(c, a, b) {
    a: ;
    if (browseris.ie) c.attachEvent(a, b);
    else c.addEventListener(a.substr(2), b, false)
}
function HideListViewRows(a) {
    a: ;
    var c = document.getElementById(a);
    if (c == null) return;
    resetSelectAllCbx(c);
    var b = window.location.hash;
    if (b.length <= 56 || b.indexOf("InplviewHash=") != 1) return;
    b = b.substr(14, 42);
    b = b.replace(/--/g, "-");
    if (a.length == 77) a = a.substr(39);
    else {
        var e, d;
        if (a.indexOf("onetidDoclibViewTbl") != 0) return;
        a = a.substr(19);
        if (a == "0") {
            if (c.className.indexOf("ms-emptyView") >= 0) return;
            for (e in g_ctxDict) {
                d = g_ctxDict[e];
                a = d.view;
                break
            }
        } else {
            d = g_ctxDict["ctx" + a];
            a = d.view
        }
    }
    if (b != a) return;
    if (c.className.length > 0) c.className += " s4-hide-tr";
    else c.className = "s4-hide-tr"
}
function resetSelectAllCbx(b) {
    a: ;
    var a = getSelectAllCbxFromTable(b);
    if (a) a.checked = false
}
function getSelectAllCbxFromTable(e) {
    a: ;
    if (e == null) return null;
    var a = e.rows;
    if (a && a.length > 0) {
        var b = a[0];
        if (!b.className.indexOf("ms-viewheadertr")) {
            var c = b.cells;
            if (c.length > 0) {
                var d = c[0].getElementsByTagName("INPUT")[0];
                if (d) return d
            }
        }
    }
    return null
}
function WpClick(d) {
    a: ;
    var h = GetEventSrcElement(d),
        a = h;
    while (a != null && (a.className == null || a.className.indexOf("s4-wpcell") < 0)) {
        if (a.tagName == "A") return;
        if (a.tagName == "DIV" && a.className != null && a.className.indexOf("s4-ctx") != -1) return;
        if (a.tagName == "TH" && a.className != null && a.className.indexOf("ms-vh2") != -1) return;
        a = a.parentNode
    }
    typeof ChevronContainer != "undefined" && ChevronContainer != null && RemoveCtxImg(ChevronContainer);
    if (a != null) {
        var b;
        try {
            b = typeof ribbon.SelectWp
        } catch (g) {
            b = "undefined"
        }
        if (b != "undefined") ribbon.SelectWp(a);
        else {
            var f = "ribbon.SelectWp",
                c = f.split(".");
            if (c.length > 1) {
                var e = function () {
                    a: ;
                    ribbon.SelectWp(a)
                };
                EnsureScript(c[0], b, e)
            }
        }
    }
}
function WpKeyUp(b) {
    a: ;
    var a = GetEventSrcElement(b);
    b.keyCode == 32 && a && a.tagName == "INPUT" && (HasCssClass(a, "s4-selectAllCbx") || HasCssClass(a, "s4-itm-cbx")) && WpClick(b)
}
function WzClick(e, c) {
    a: ;
    var i = GetEventSrcElement(e),
        a = i;
    while (a != null) {
        var j = a.getAttribute("ZoneID");
        if (j == c) break;
        if (a.tagName == "A") return;
        a = a.parentNode
    }
    if (a != null) {
        var b;
        try {
            b = typeof ribbon.SelectWz
        } catch (h) {
            b = "undefined"
        }
        if (b != "undefined") ribbon.SelectWz(a, c);
        else {
            var g = "ribbon.SelectWz",
                d = g.split(".");
            if (d.length > 1) {
                var f = function () {
                    a: ;
                    ribbon.SelectWz(a, c)
                };
                EnsureScript(d[0], b, f)
            }
        }
    }
}
function WpCbxSelect(b) {
    a: ;
    var c = GetEventSrcElement(b),
        e = c.checked;
    if (!e) WpClick(b);
    else {
        var a;
        try {
            a = typeof ribbon.DeselectWpWz
        } catch (h) {
            a = "undefined"
        }
        if (a != "undefined") ribbon.DeselectWpWz();
        else {
            var g = "ribbon.DeselectWpWz",
                d = g.split(".");
            if (d.length > 1) {
                var f = function () {
                    a: ;
                    ribbon.DeselectWpWz()
                };
                EnsureScript(d[0], a, f)
            }
        }
    }
    TrapMenuClick(b);
    if (b.type != "keyup") c.className = "ms-WPHeaderCbxHidden"
}
function WpCbxKeyHandler(b) {
    a: ;
    var a;
    if (browseris.ie) a = b.keyCode;
    else a = b.which;
    a == 13 && WpCbxSelect(b)
}
function PopoutMenuMaybeSwapImage(b, c, d) {
    a: ;
    var a = document.getElementById(b);
    if (a && typeof a != "undefined") {
        if (a.rel == "_spPopoutMenuIsOpen") return;
        SwapImage(c, d)
    }
}
function PopoutMenuMaybeSwapImageClustered(d, f, h, i, j, e, g) {
    a: ;
    var a = document.getElementById(d);
    if (a && typeof a != "undefined") {
        if (a.rel == "_spPopoutMenuIsOpen") return;
        var b = document.getElementById(f),
            c = b.firstChild;
        SwapImageInternal(c, h);
        b.style.height = e + "px";
        b.style.width = g + "px";
        c.style.top = "-" + j + "px";
        c.style.left = "-" + i + "px"
    }
}
function SwapImage(c, b) {
    a: ;
    var a = document.getElementById(c);
    SwapImageInternal(a, b)
}
function SwapImageInternal(a, b) {
    a: ;
    if (a && typeof a != "undefined") a.src = b
}
function GetViewportHeight() {
    a: ;
    if (typeof window.innerHeight != "undefined") viewportHeight = window.innerHeight;
    else viewportHeight = document.documentElement.clientHeight;
    return viewportHeight
}
function GetViewportWidth() {
    a: ;
    if (typeof window.innerWidth != "undefined") viewportWidth = window.innerWidth;
    else viewportWidth = document.documentElement.clientWidth;
    return viewportWidth
}
var g_viewportHeight = null,
    g_viewportWidth = null,
    g_wpadderHeight = 0,
    g_setWidth, g_setWidthInited = false,
    g_workspaceResizedHandlers = [],
    g_setScrollPos = false,
    g_frl = false;

function FixRibbonAndWorkspaceDimensionsForResize() {
    a: ;
    if (g_frl) return;
    var a = GetViewportHeight(),
        b = GetViewportWidth();
    if (g_viewportHeight == a && g_viewportWidth == b) return;
    g_viewportHeight = a;
    g_viewportWidth = b;
    window.setTimeout(FixRibbonAndWorkspaceDimensions, 0)
}
function FixRibbonAndWorkspaceDimensions() {
    a: ;
    g_frl = true;
    var b = GetCachedElement("s4-ribbonrow"),
        a = GetCachedElement("s4-workspace"),
        f = GetCachedElement("s4-titlerow"),
        c = GetCachedElement("s4-bodyContainer");
    if (!b || !a || !c) return;
    if (!g_setWidthInited) {
        var h = true;
        if (a.className.indexOf("s4-nosetwidth") > -1) h = false;
        g_setWidth = h;
        g_setWidthInited = true
    } else var h = g_setWidth;
    var l = RibbonIsMinimized() ? 44 : 135,
        j = l + g_wpadderHeight;
    if (GetCurrentEltStyle(b, "visibility") == "hidden") j = 0;
    b.style.height = j + "px";
    var d = g_viewportHeight;
    if (null === d) {
        d = GetViewportHeight();
        g_viewportHeight = d
    }
    var e = d - b.offsetHeight - AbsTop(b);
    if (e < 0) e = 0;
    a.style.height = e + "px";
    if (h) {
        a.style.width = document.documentElement.clientWidth + "px";
        if (c.offsetWidth < a.clientWidth) c.style.width = a.clientWidth + "px";
        if (f) {
            f.style.width = Math.max(c.offsetWidth - 1, 0) + "px";
            f.className += " ms-titlerowborder"
        }
    }
    var m = browseris.ie && browseris.iever == 7 && !browseris.ie8standard;
    if (!g_setScrollPos) {
        browseris.firefox && browseris.firefox36up && window.scroll(0, 0);
        if (window.location.search.match("[?&]IsDlg=1")) if (!m || a.scrollHeight < a.clientHeight) a.style.overflowY = "auto";
        var g = document.getElementById("_maintainWorkspaceScrollPosition");
        if (g != null && g.value != null) a.scrollTop = g.value;
        g_setScrollPos = true
    }
    for (var k = [].concat(g_workspaceResizedHandlers), i = 0, n = k.length; i < n; i++) k[i]();
    g_frl = false
}
function RibbonIsMinimized() {
    a: ;
    if (g_spribbon.isInited) return g_spribbon.isMinimized;
    else if (typeof _ribbon == "undefined" || null === _ribbon) return true;
    else return _ribbon.buildMinimized
}
var g_spribbon = {};
g_spribbon.isMinimized = true;
g_spribbon.isInited = false;
g_spribbon.minimizedHeight = "44px";
g_spribbon.maximizedHeight = "135px";

function OnRibbonMinimizedChanged(b) {
    a: ;
    var c = GetCachedElement("s4-ribbonrow"),
        a = GetCachedElement("s4-titlerow");
    if (c) {
        c.className = c.className.replace("s4-ribbonrowhidetitle", "");
        if (a) {
            a.className = a.className.replace("s4-titlerowhidetitle", "");
            if (b) a.style.display = "block";
            else a.style.display = "none"
        }
    }
    var e = g_spribbon.isInited;
    g_spribbon.isInited = true;
    var d = g_spribbon.isMinimized;
    g_spribbon.isMinimized = b;
    (d != b || !e) && FixRibbonAndWorkspaceDimensions()
}
function setInnerText(a, b) {
    a: ;
    var c = a.ownerDocument;
    if (c.createTextNode) {
        var d = c.createTextNode(b);
        a.innerHTML = "";
        a.appendChild(d)
    } else a.innerText = b
}
function setInnerText(a, b) {
    a: ;
    var c = a.ownerDocument;
    if (c.createTextNode) {
        var d = c.createTextNode(b);
        a.innerHTML = "";
        a.appendChild(d)
    } else a.innerText = b
}
function CatchCreateError() {
    a: ;
    return true
}
if (typeof ExpandBody == "undefined") {
    var preventSafariParseError = true;

    function ExpandBody(c, b) {
        a: ;
        var a = document.forms[MSOWebPartPageFormName];
        a.CAML_Expand.value = a.CAML_Expand.value.concat(c);
        a.action = a.action.concat("#" + b);
        a.submit();
        return false
    }
}
if (typeof CollapseBody == "undefined") {
    var preventSafariParseError = true;

    function CollapseBody(c, d) {
        a: ;
        var a = document.forms[MSOWebPartPageFormName],
            b = new RegExp("{", "g");
        c = c.replace(b, "\\{");
        b = new RegExp("}", "g");
        c = c.replace(b, "\\}");
        b = new RegExp(c, "g");
        a.CAML_Expand.value = a.CAML_Expand.value.replace(b, "");
        a.CAML_ShowOriginalEmailBody.value = a.CAML_ShowOriginalEmailBody.value.replace(b, "");
        a.action = a.action.concat("#" + d);
        a.submit();
        return false
    }
}
if (typeof ShowQuotedText == "undefined") {
    var preventSafariParseError = true;

    function ShowQuotedText(c, b) {
        a: ;
        var a = document.forms[MSOWebPartPageFormName];
        a.CAML_ShowOriginalEmailBody.value = a.CAML_ShowOriginalEmailBody.value.concat(c);
        if (a.action.indexOf("#") > 0) a.action = a.action.substr(0, a.action.indexOf("#"));
        a.action = a.action.concat("#" + b);
        a.submit();
        return false
    }
}
if (typeof HideQuotedText == "undefined") {
    var preventSafariParseError = true;

    function HideQuotedText(b, d) {
        a: ;
        var a = document.forms[MSOWebPartPageFormName],
            c = new RegExp("{", "g");
        b = b.replace(c, "\\{");
        c = new RegExp("}", "g");
        b = b.replace(c, "\\}");
        c = new RegExp(b, "g");
        a.CAML_ShowOriginalEmailBody.value = a.CAML_ShowOriginalEmailBody.value.replace(c, "");
        if (a.action.indexOf("#") > 0) a.action = a.action.substr(0, a.action.indexOf("#"));
        a.action = a.action.concat("#" + d);
        a.submit();
        return false
    }
}
function GetSelectedItemsDict(a) {
    a: ;
    if (a != null && a.dictSel != null) return a.dictSel;
    return null
}
function RemoveOnlyPagingArgs(a) {
    a: ;
    var e = /&*Paged=TRUE/gi;
    a = a.replace(e, "");
    var b = /&*PagedPrev=TRUE/gi;
    a = a.replace(b, "");
    var d = /&p_[^&]*/gi;
    a = a.replace(d, "");
    var f = /&PageFirstRow=[^&]*/gi;
    a = a.replace(f, "");
    var c = /&PageLastRow=[^&]*/gi;
    a = a.replace(c, "");
    return a
}
function RemovePagingArgs(a) {
    a: ;
    a = RemoveOnlyPagingArgs(a);
    var c = /\?Filter=1&*/gi;
    a = a.replace(c, "?");
    var d = /&Filter=1/gi;
    a = a.replace(d, "");
    var b = /\?$/;
    a = a.replace(b, "");
    return a
}
var v_stsOpenDoc2 = null,
    v_strStsOpenDoc2 = null;

function StsOpenEnsureEx2(a) {
    a: ;
    if (v_stsOpenDoc2 == null || v_strStsOpenDoc2 != a) {
        v_stsOpenDoc2 = null;
        v_strStsOpenDoc2 = null;
        if (window.ActiveXObject) try {
            v_stsOpenDoc2 = new ActiveXObject(a);
            v_strStsOpenDoc2 = a
        } catch (c) {
            v_stsOpenDoc2 = null;
            v_strStsOpenDoc2 = null
        } else if (IsSupportedMacBrowser() && a.indexOf("SharePoint.OpenDocuments") >= 0) {
            var b = CreateMacPlugin();
            if (b != null) {
                v_stsOpenDoc2 = b;
                v_strStsOpenDoc2 = "SharePoint.MacPlugin"
            }
        } else if (IsSupportedFirefoxOnWin() && a.indexOf("SharePoint.OpenDocuments") >= 0) {
            var b = CreateFirefoxOnWindowsPlugin();
            if (b != null) {
                v_stsOpenDoc2 = b;
                v_strStsOpenDoc2 = "SharePoint.FFWinPlugin"
            }
        }
    }
    return v_stsOpenDoc2
}
function StURLSetVar2(a, c, g) {
    a: ;
    var b = c + "=" + g,
        e = new CUrl(a),
        a = e.query,
        f = a.indexOf("?");
    if (f != -1) {
        var d = a.indexOf("?" + c + "=", f);
        if (d == -1) {
            d = a.indexOf("&" + c + "=", f);
            if (d != -1) b = "&" + b
        } else b = "?" + b;
        if (d != -1) {
            var h = new RegExp("[&?]" + c + "=[^&]*", "");
            a = a.replace(h, b)
        } else a = a + "&" + b
    } else a = a + "?" + b;
    e.query = a;
    return e.ToString()
}
function CUrl(b) {
    a: ;
    var c = b.indexOf("?"),
        a = b.indexOf("#");
    if (a >= 0 && a < c) a = -1;
    this.path = b;
    this.query = "";
    this.hash = "";
    if (c >= 0) {
        this.path = b.substr(0, c);
        if (a >= c) this.query = b.substr(c, a - c);
        else this.query = b.substr(c)
    }
    if (a >= 0) {
        if (c < 0) this.path = b.substr(0, a);
        this.hash = b.substr(a)
    }
}
CUrl.prototype.ToString = CUrlToString;

function CUrlToString() {
    a: ;
    var a = this.path + this.query + this.hash;
    return a
}
function RemoveQueryParameterFromUrl(a, c) {
    a: ;
    var d = new RegExp("[&?]" + c + "=[^&]*", "");
    a = a.replace(d, "");
    if (a.indexOf("?") == -1) {
        var b = a.indexOf("&");
        if (b != -1) a = a.substring(0, b) + "?" + a.substring(b + 1)
    }
    return a
}
function HasValidUrlPrefix(b) {
    a: ;
    var a = b.toLowerCase();
    if (-1 == a.search("^http://") && -1 == a.search("^https://")) return false;
    return true
}
function AbsLeft(c) {
    a: ;
    var b = c.offsetLeft,
        a = c.offsetParent;
    while (a != null && a.tagName != "BODY") {
        b += a.offsetLeft;
        a = a.offsetParent
    }
    if (a != null) b += a.offsetLeft;
    return b
}
function AbsTop(c) {
    a: ;
    var b = c.offsetTop,
        a = c.offsetParent;
    while (a != null && a.tagName != "BODY") {
        b += a.offsetTop;
        a = a.offsetParent
    }
    if (a != null) b += a.offsetTop;
    return b
}
var deleteInstance = 0;

function DeleteItemConfirmation() {
    a: ;
    var a = "";
    if (typeof ItemIsCopy != "undefined") if (ItemIsCopy) a = L_NotifyThisIsCopy_Text;
    if (cascadeDeleteWarningMessage != "") a += cascadeDeleteWarningMessage;
    if (recycleBinEnabled == 1 && deleteInstance != 1) a += L_STSRecycleConfirm_Text;
    else a += L_STSDelConfirm_Text;
    return confirm(a)
}
function DeleteInstanceConfirmation() {
    a: ;
    deleteInstance = 1;
    return DeleteItemConfirmation()
}
function CancelMultiPageConfirmation(b) {
    a: ;
    var L_DeletePartialResponse1_text = "已保存部分调查答复。单击“确定”可删除该部分调查答复。如果希望稍后继续此调查，请单击“取消”。可以在“所有答复”调查视图中找到您的部分答复。\n\n是否要将该部分答复发送到网站回收站?",
        L_DeletePartialResponse2_text = "已保存部分调查答复。单击“确定”可删除该部分调查答复。如果希望稍后继续此调查，请单击“取消”。可以在“所有答复”调查视图中找到您的部分答复。\n\n是否要删除该部分答复?",
        a = "";
    if (recycleBinEnabled == 1) a = L_DeletePartialResponse1_text;
    else a = L_DeletePartialResponse2_text;
    if (confirm(a) == true) return true;
    else STSNavigate(b);
    return false
}
function RestoreItemVersionConfirmation() {
    a: ;
    var L_Version_Restore_Confirm_Text = "您将用所选版本替换当前版本。",
        a = L_Version_Restore_Confirm_Text;
    return confirm(a)
}
function DeleteItemVersionConfirmation(a) {
    a: ;
    var L_Version_Delete_Confirm_Text = "是否确实要删除此版本?",
        L_Version_Recycle_Confirm_Text = "是否确实要将此版本发送到网站回收站?";
    if (a) return confirm(L_Version_Recycle_Confirm_Text);
    else return confirm(L_Version_Delete_Confirm_Text)
}
function DeleteUserInfoItemConfirmation() {
    a: ;
    var L_User_Delete_Confirm_Text = "您将删除此用户。",
        a = L_User_Delete_Confirm_Text;
    return confirm(a)
}
function UnlinkCopyConfirmation() {
    a: ;
    return confirm(L_ConfirmUnlinkCopy_Text)
}
function SupportsNavigateHttpFolder() {
    a: ;
    return browseris.ie5up && browseris.win32
}
function MtgDeletePageConfirm() {
    a: ;
    var L_DeleteGlobalConfirm_Text = "此网页将从与此工作区关联的所有会议中删除。",
        L_DeleteConfirm_Text = "是否确实要删除此页?",
        a;
    if (document.getElementById("MtgTlPart_PageType").value == "MtgTlPart_LocalPage") a = L_DeleteConfirm_Text;
    else a = L_DeleteGlobalConfirm_Text + L_DeleteConfirm_Text;
    return confirm(a)
}
function IsImgLibJssLoaded() {
    a: ;
    if (typeof fImglibJssLoaded != "undefined") return fImglibJssLoaded;
    return false
}
function GetFirstChildElement(b) {
    a: ;
    for (var a = 0; a < b.childNodes.length; a++) if (b.childNodes[a].nodeType == 1) return b.childNodes[a];
    return null
}
function TestGCObject(a) {
    a: ;
    if (browseris.ie55up && typeof a == "undefined" || a == null || a.object == null) return false;
    return true
}
function MMU_GetMenuFromClientId(a) {
    a: ;
    return document.getElementById(a)
}
function MMU_EcbLinkOnKeyDown(f, b, a) {
    a: ;
    if (a == null) {
        a = window.event;
        if (a == null) return
    }
    var e = b.href != null && b.href.length > 0;
    if ((a.shiftKey || !e) && GetEventKeyCode(a) == 13 || a.altKey && GetEventKeyCode(a) == 40) {
        var c = byid(b.id + "_ti");
        if (c == null) {
            var d = b.getAttribute("serverclientid");
            if (d != null && d.length > 0) c = byid(d + "_ti")
        }
        if (c != null && c.getAttribute("onclick") != null) c.onclick();
        else b.getAttribute("onclick") != null && b.onclick();
        return false
    } else return true
}
var firstCalled = true,
    _callbackinitdelayed = false;

function DeferWebFormInitCallback() {
    a: ;
    if (typeof WebForm_InitCallback == "function") window["_WebForm_InitCallback"] = window["WebForm_InitCallback"];
    window["WebForm_InitCallback"] = function () {
        a: ;
        if (firstCalled) {
            firstCalled = false;
            _callbackinitdelayed = true;
            _spBodyOnLoadFunctionNames.push("WebForm_InitCallback")
        } else {
            _callbackinitdelayed = false;
            typeof window._WebForm_InitCallback == "function" && window._WebForm_InitCallback()
        }
    };
    if (typeof WebForm_DoCallback == "function") window["_WebForm_DoCallback"] = window["WebForm_DoCallback"];
    window["WebForm_DoCallback"] = function (e, c, d, g, b, f) {
        a: ;
        if (_callbackinitdelayed) {
            _callbackinitdelayed = false;
            if (_spBodyOnLoadFunctionNames != null) for (var h = _spBodyOnLoadFunctionNames.length, a = 0; a < h; a++) if (_spBodyOnLoadFunctionNames[a] == "WebForm_InitCallback") {
                _spBodyOnLoadFunctionNames.splice(a, 1);
                break
            }
            typeof window._WebForm_InitCallback == "function" && window._WebForm_InitCallback()
        }
        window._WebForm_DoCallback(e, c, d, g, b, f)
    }
}
function _ribbonShouldFixRtlHeaders(a) {
    a: ;
    return browseris.ie && browseris.iever == 7 && !browseris.ie8standard && a
}
var IMNControlObj = null,
    bIMNControlInited = false,
    IMNDictionaryObj = null,
    bIMNSorted = false,
    bIMNOnloadAttached = false,
    IMNOrigScrollFunc = null,
    bIMNInScrollFunc = false,
    IMNSortableObj = null,
    IMNHeaderObj = null,
    IMNNameDictionaryObj = null,
    IMNShowOfflineObj = null;

function GetCurrentEvent(a) {
    a: ;
    if (!IsSupportedMacBrowser()) return window.event;
    if (a) return a;
    return window.event
}
function GetEventTarget(a) {
    a: ;
    if (!IsSupportedMacBrowser()) return a.srcElement;
    if (a.srcElement) return a.srcElement;
    return a.target
}
function EnsureIMNControl() {
    a: ;
    if (!bIMNControlInited) {
        if (typeof g_presenceEnabled != "undefined" && g_presenceEnabled) if (IsSupportedMacBrowser()) IMNControlObj = CreateMacPlugin();
        else if (browseris.ie5up) if (window.ActiveXObject) try {
            IMNControlObj = new ActiveXObject("Name.NameCtrl.1");
            if (IMNControlObj) if (IsSupportedMacBrowser()) IMNControlObj.OnStatusChange = "IMNOnStatusChange";
            else IMNControlObj.OnStatusChange = IMNOnStatusChange
        } catch (a) {
            IMNControlObj = null
        }
        bIMNControlInited = true
    }
    return IMNControlObj
}
function IMNImageInfo() {
    a: ;
    this.img = null;
    this.alt = ""
}
var L_IMNOnline_Text = "空闲",
    L_IMNOffline_Text = "脱机",
    L_IMNAway_Text = "离开",
    L_IMNBusy_Text = "忙碌",
    L_IMNDoNotDisturb_Text = "请勿打扰",
    L_IMNIdle_Text = "可能已离开",
    L_IMNBlocked_Text = "阻止",
    L_IMNOnline_OOF_Text = "空闲(OOF)",
    L_IMNOffline_OOF_Text = "脱机(OOF)",
    L_IMNAway_OOF_Text = "离开(OOF)",
    L_IMNBusy_OOF_Text = "忙碌(OOF)",
    L_IMNDoNotDisturb_OOF_Text = "请勿打扰(OOF)",
    L_IMNIdle_OOF_Text = "可能已离开(OOF)";

function IMNGetStatusImage(e, d) {
    a: ;
    var b = "blank.gif",
        a = "";
    switch (e) {
        case 0:
            b = "imnon.png";
            a = L_IMNOnline_Text;
            break;
        case 11:
            b = "imnonoof.png";
            a = L_IMNOnline_OOF_Text;
            break;
        case 1:
            if (d) {
                b = "imnoff.png";
                a = L_IMNOffline_Text
            } else {
                b = "blank.gif";
                a = ""
            }
            break;
        case 12:
            if (d) {
                b = "imnoffoof.png";
                a = L_IMNOffline_OOF_Text
            } else {
                b = "blank.gif";
                a = ""
            }
            break;
        case 2:
            b = "imnaway.png";
            a = L_IMNAway_Text;
            break;
        case 13:
            b = "imnawayoof.png";
            a = L_IMNAway_OOF_Text;
            break;
        case 3:
            b = "imnbusy.png";
            a = L_IMNBusy_Text;
            break;
        case 14:
            b = "imnbusyoof.png";
            a = L_IMNBusy_OOF_Text;
            break;
        case 4:
            b = "imnaway.png";
            a = L_IMNAway_Text;
            break;
        case 5:
            b = "imnbusy.png";
            a = L_IMNBusy_Text;
            break;
        case 6:
            b = "imnaway.png";
            a = L_IMNAway_Text;
            break;
        case 7:
            b = "imnbusy.png";
            a = L_IMNBusy_Text;
            break;
        case 8:
            b = "imnaway.png";
            a = L_IMNAway_Text;
            break;
        case 9:
            b = "imndnd.png";
            a = L_IMNDoNotDisturb_Text;
            break;
        case 15:
            b = "imndndoof.png";
            a = L_IMNDoNotDisturb_OOF_Text;
            break;
        case 10:
            b = "imnbusy.png";
            a = L_IMNBusy_Text;
            break;
        case 16:
            b = "imnidle.png";
            a = L_IMNIdle_Text;
            break;
        case 17:
            b = "imnidleoof.png";
            a = L_IMNIdle_OOF_Text;
            break;
        case 18:
            b = "imnblocked.png";
            a = L_IMNBlocked_Text;
            break;
        case 19:
            b = "imnidlebusy.png";
            a = L_IMNBusy_Text;
            break;
        case 20:
            b = "imnidlebusyoof.png";
            a = L_IMNBusy_OOF_Text
    }
    var c = new IMNImageInfo;
    c.img = b;
    c.alt = a;
    return c
}
function IMNGetHeaderImage() {
    a: ;
    var a = new IMNImageInfo;
    a.img = "imnhdr.gif";
    a.alt = "";
    return a
}
function IMNIsOnlineState(a) {
    a: ;
    if (a == 1) return false;
    return true
}
function IMNSortList(e, c, d) {
    a: ;
    var a = null,
        b = null;
    if (IMNSortableObj && IMNSortableObj[e]) {
        b = document.getElementById(e);
        while (b && !(b.tagName == "TR" && typeof b.Sortable != "undefined")) b = b.parentNode;
        a = b;
        while (a && a.tagName != "TABLE") a = a.parentNode;
        if (a != null && b != null) {
            if (a.rows[1].style.display == "none") for (i = 1; i < 4; i++) a.rows[i].style.display = "block";
            if (!IMNIsOnlineState(c) && IMNIsOnlineState(d)) {
                a.rows[2].style.display = "none";
                i = 3;
                while (a.rows[i].id != "Offline" && a.rows[i].innerText < b.innerText) i++;
                a.moveRow(b.rowIndex, i);
                if (a.rows[a.rows.length - 3].id == "Offline") a.rows[a.rows.length - 2].style.display = "block"
            } else if (IMNIsOnlineState(c) && !IMNIsOnlineState(d)) {
                if (b.rowIndex == 3 && a.rows[b.rowIndex + 1].id == "Offline") a.rows[2].style.display = "block";
                if (a.rows[a.rows.length - 3].id == "Offline") a.rows[a.rows.length - 2].style.display = "none";
                i = a.rows.length - 2;
                while (a.rows[i - 1].id != "Offline" && a.rows[i].innerText > b.innerText) i--;
                a.moveRow(b.rowIndex, i)
            }
        }
    }
}
function IMNOnStatusChange(d, b, a) {
    a: ;
    if (IMNDictionaryObj) {
        var c = IMNGetStatusImage(b, IMNSortableObj[a] || IMNShowOfflineObj[a]);
        if (IMNDictionaryObj[a] != b) {
            bIMNSorted && IMNSortList(a, IMNDictionaryObj[a], b);
            IMNUpdateImage(a, c);
            IMNDictionaryObj[a] = b
        }
    }
}
function IMNUpdateImage(j, d) {
    a: ;
    var a = document.images[j];
    if (a) {
        var e = d.img,
            i = d.alt,
            c = a.src;
        if (typeof a.src == "undefined") c = a.item(0).src;
        var g = c.lastIndexOf("/"),
            b = c.slice(0, g + 1);
        b += e;
        if (c == b && e != "blank.gif") return;
        if (a.altbase) a.alt = a.altbase;
        else a.alt = i;
        var f = browseris.ie && browseris.ie55up && browseris.verIEFull < 7,
            h = b.toLowerCase().indexOf(".png") > 0;
        if (f) if (h) {
            a.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + b + "),sizingMethod=scale,enabled=true);";
            a.src = "/_layouts/images/blank.gif"
        } else {
            a.style.filter = "";
            a.src = b
        } else a.src = b
    }
}
function IMNHandleAccelerator(b) {
    a: ;
    if (IMNControlObj) {
        var a = GetCurrentEvent(b);
        a.altKey && a.shiftKey && a.keyCode == 121 && IMNControlObj.DoAccelerator()
    }
}
function IMNImageOnClick(a) {
    a: ;
    if (IMNControlObj) {
        IMNShowOOUIKyb(a);
        IMNControlObj.DoAccelerator()
    }
}
function IMNGetOOUILocation(i) {
    a: ;
    var e = {},
        a = i,
        d = i,
        g = 0,
        h = 0,
        n = 0,
        o = document.dir == "rtl";
    while (a && a.tagName != "SPAN" && a.tagName != "TABLE") {
        if (a.tagName == "TD" && a.className.indexOf("ms-vb") >= 0) break;
        a = a.parentNode
    }
    if (a) {
        var b = a.tagName == "TABLE" ? a.rows(0).cells(0).firstChild : a.firstChild;
        while (b != null) {
            if (b.tagName == "IMG" && b.id) {
                d = b;
                break
            }
            if (b.tagName == "A" && b.childNodes.length > 0 && b.firstChild.tagName == "IMG" && b.firstChild.id) {
                d = b.firstChild;
                break
            }
            b = b.nextSibling
        }
    }
    i = d;
    h = d.getBoundingClientRect().top - 5;
    g = d.getBoundingClientRect().left - 5;
    try {
        var c = window;
        while (c && c != c.parent) {
            var j = c.frameElement,
                f = j ? j.getBoundingClientRect() : null,
                l = f ? f.top : 0,
                k = f ? f.left : 0;
            h += l;
            g += k;
            c = c.parent
        }
    } catch (m) { }
    e.objSpan = a;
    e.objOOUI = d;
    e.oouiX = g;
    e.oouiY = h;
    return e
}
function IMNShowOOUIMouse(a) {
    a: ;
    IMNShowOOUI(a, 0)
}
function IMNShowOOUIKyb(a) {
    a: ;
    IMNShowOOUI(a, 1)
}
function IMNShowOOUI(i, h) {
    a: ;
    if (browseris.ie5up || IsSupportedMacBrowser()) {
        var g = GetCurrentEvent(i),
            c = GetEventTarget(g),
            b = c,
            d = c,
            e = 0,
            f = 0;
        if (EnsureIMNControl() && IMNNameDictionaryObj) {
            var a = IMNGetOOUILocation(c);
            b = a.objSpan;
            d = a.objOOUI;
            e = a.oouiX;
            f = a.oouiY;
            var j = IMNNameDictionaryObj[d.id];
            if (b) b.onkeydown = IMNHandleAccelerator;
            IMNControlObj.ShowOOUI(j, h, e, f)
        }
    }
}
function IMNHideOOUI() {
    a: ;
    if (IMNControlObj) {
        IMNControlObj.HideOOUI();
        return false
    }
    return true
}
function IMNScroll() {
    a: ;
    if (!bIMNInScrollFunc) {
        bIMNInScrollFunc = true;
        IMNHideOOUI()
    }
    bIMNInScrollFunc = false;
    if (IMNOrigScrollFunc == IMNScroll) return true;
    return IMNOrigScrollFunc ? IMNOrigScrollFunc() : true
}
var imnCount = 0,
    imnElems, imnElemsCount = 0,
    imnMarkerBatchSize = 4,
    imnMarkerBatchDelay = 40;

function ProcessImn() {
    a: ;
    imnCount = 0;
    imnElems = document.getElementsByName("imnmark");
    imnElemsCount = imnElems.length;
    if (EnsureIMNControl() && IMNControlObj.PresenceEnabled) ProcessImnMarkers();
    else RemoveImnAnchors()
}
function RemoveImnAnchors() {
    a: ;
    for (var d = 0; d < imnElemsCount; d++) {
        var c = imnElems[d],
            a = c.parentNode,
            e = a.nextSibling,
            b = a.parentNode;
        if (a != null && a.tagName == "A" && a.childNodes.length == 1 && b != null) {
            if (e != null) b.insertBefore(c, e);
            else b.appendChild(c);
            b.removeChild(a)
        }
    }
}
function ProcessImnMarkers() {
    a: ;
    for (var a = 0; a < imnMarkerBatchSize; ++a) {
        if (imnCount == imnElemsCount) return;
        if (IsSupportedMacBrowser()) IMNRC(imnElems[imnCount].getAttribute("sip"), imnElems[imnCount]);
        else IMNRC(imnElems[imnCount].sip, imnElems[imnCount]);
        imnCount++
    }
    setTimeout("ProcessImnMarkers()", imnMarkerBatchDelay)
}
function IMNRC(e, g) {
    a: ;
    if (e == null || e == "") return;
    if (typeof g_presenceEnabled == "undefined" || !g_presenceEnabled) return;
    if (browseris.ie5up || IsSupportedMacBrowser()) {
        var b = g ? g : window.event.srcElement,
            c = b,
            a = b.id;
        if (!IMNDictionaryObj) {
            IMNDictionaryObj = {};
            IMNNameDictionaryObj = {};
            IMNSortableObj = {};
            IMNShowOfflineObj = {};
            if (!IMNOrigScrollFunc) {
                IMNOrigScrollFunc = window.onscroll;
                window.onscroll = IMNScroll
            }
        }
        if (IMNDictionaryObj) {
            if (!IMNNameDictionaryObj[a]) IMNNameDictionaryObj[a] = e;
            if (typeof IMNDictionaryObj[a] == "undefined") IMNDictionaryObj[a] = 1;
            if (!IMNSortableObj[a] && typeof b.Sortable != "undefined") {
                IMNSortableObj[a] = b.Sortable;
                if (!bIMNOnloadAttached) {
                    EnsureIMNControl() && IMNControlObj.PresenceEnabled && AttachEvent("load", IMNSortTable, window);
                    bIMNOnloadAttached = true
                }
            }
            if (!IMNShowOfflineObj[a] && typeof b.ShowOfflinePawn != "undefined") IMNShowOfflineObj[a] = b.ShowOfflinePawn;
            if (EnsureIMNControl() && IMNControlObj.PresenceEnabled) {
                var d = 1,
                    h;
                d = IMNControlObj.GetStatus(e, a);
                if (IMNIsOnlineState(d) || IMNSortableObj[a] || IMNShowOfflineObj[a]) {
                    h = IMNGetStatusImage(d, IMNSortableObj[a] || IMNShowOfflineObj[a]);
                    IMNUpdateImage(a, h);
                    IMNDictionaryObj[a] = d
                }
            }
        }
        var f = IMNGetOOUILocation(b);
        SetImnOnClickHandler(f.objOOUI);
        c = f.objSpan;
        if (c) {
            c.onmouseover = IMNShowOOUIMouse;
            c.onfocusin = IMNShowOOUIKyb;
            c.onmouseout = IMNHideOOUI;
            c.onfocusout = IMNHideOOUI
        }
    }
}
function SetImnOnClickHandler(c) {
    a: ;
    var b = c.parentNode;
    if (b.tagName == "A") {
        if (typeof b.onclick == "undefined") b.onclick = IMNImageOnClickHandler
    } else {
        var a = document.createElement("a");
        a.onclick = IMNImageOnClickHandler;
        a.className = "ms-imnlink";
        a.href = "javascript:;";
        b.insertBefore(a, c);
        a.appendChild(c)
    }
}
function IMNImageOnClickHandler(a) {
    a: ;
    IMNImageOnClick(a);
    return false
}
function IMNSortTable() {
    a: ;
    var a;
    for (a in IMNDictionaryObj) IMNSortList(a, 1, IMNDictionaryObj[a]);
    bIMNSorted = true
}
function IMNRegisterHeader(d) {
    a: ;
    if (browseris.ie5up || IsSupportedMacBrowser()) {
        var c = GetCurrentEvent(d),
            e = GetEventTarget(c);
        if (!IMNHeaderObj) IMNHeaderObj = {};
        if (IMNHeaderObj) {
            var a = e.id;
            IMNHeaderObj[a] = a;
            var b;
            b = IMNGetHeaderImage();
            IMNUpdateImage(a, b)
        }
    }
}
var _spBodyOnLoadFunctionNames, _spBodyOnLoadCalled = false;
if (_spBodyOnLoadFunctionNames == null) {
    _spBodyOnLoadFunctionNames = [];
    _spBodyOnLoadFunctionNames.push("_spBodyOnLoad");
    _spBodyOnLoadFunctionNames.push("_spRestoreScrollForDiv_rscr")
}
var _spOriginalFormAction, _spEscapedFormAction, _spFormOnSubmitCalled = false,
    _spBodyOnPageShowRegistered = false;

function _spBodyOnPageShow() {
    a: ;
    _spFormOnSubmitCalled = false
}
function _spResetFormOnSubmitCalledFlag() {
    a: ;
    _spFormOnSubmitCalled = false
}
function _ribbonReadyForInit() {
    a: ;
    return _spBodyOnLoadCalled
}
var _spBodyOnLoadCalled = false;

function _spBodyOnLoadWrapper() {
    a: ;
    _spBodyOnLoadCalled = true;
    if (!_spBodyOnPageShowRegistered && typeof browseris != "undefined" && !browseris.ie && typeof window.addEventListener == "function") {
        window.addEventListener("pageshow", _spBodyOnPageShow, false);
        _spBodyOnPageShowRegistered = true
    }
    if (typeof Sys != "undefined" && typeof Sys.WebForms != "undefined" && typeof Sys.WebForms.PageRequestManager != "undefined") {
        var a = Sys.WebForms.PageRequestManager.getInstance();
        if (!_spPageLoadedRegistered && a != null) {
            a.add_pageLoaded(_spPageLoaded);
            _spPageLoadedRegistered = true
        }
    } !_spPageLoadedRegistered && _spPageLoaded();
    _spFormOnSubmitCalled = false;
    typeof Sys != "undefined" && typeof Sys.Net != "undefined" && typeof Sys.Net.WebRequestManager != "undefined" && Sys.Net.WebRequestManager.add_invokingRequest(_spResetFormOnSubmitCalledFlag);
    typeof NotifyBodyLoadedAndExecuteWaitingJobs != "undefined" && NotifyBodyLoadedAndExecuteWaitingJobs();
    ExecuteOrDelayUntilScriptLoaded(ProcessDefaultOnLoad, "core.js");
    if (typeof g_prefetch == "undefined" || g_prefetch == 1) {
        var b = _spGetQueryParam("prefetch");
        b != 0 && _spPreFetch()
    }
}
function _spPreFetch() {
    a: ;
    window.setTimeout(function () {
        a: ;
        if (_v_dictSod) {
            var a = _v_dictSod["core.js"];
            typeof a != "undefined" && a && LoadSod(a);
            if (typeof ribbon == "undefined") {
                var b = _v_dictSod["ribbon"];
                typeof b != "undefined" && b && LoadSod(b)
            }
        }
    }, 0);
    typeof _ribbon != "undefined" && _ribbon && window.setTimeout(function () {
        a: ;
        if (document.images && IsFullNameDefined("_spPageContextInfo.currentLanguage")) {
            imgRibbon32x32 = new Image;
            imgRibbon32x32.src = "/_layouts/" + _spPageContextInfo.currentLanguage + "/images/formatmap32x32.png";
            imgRibbon16x16 = new Image;
            imgRibbon16x16.src = "/_layouts/" + _spPageContextInfo.currentLanguage + "/images/formatmap16x16.png"
        }
    }, 0)
}
function _spGetQueryParam(f) {
    a: ;
    var b = window.location.search.substring(1);
    if (b && b.length > 2) for (var c = b.split("&"), e = c.length, a = 0; a < e; a++) {
        var d = c[a].split("=");
        if (d[0].toLowerCase() == f) return d[1]
    }
}
var _spSuppressFormOnSubmitWrapper = false;

function _spFormOnSubmitWrapper() {
    a: ;
    if (_spSuppressFormOnSubmitWrapper) return true;
    if (_spFormOnSubmitCalled) return false;
    if (typeof _spFormOnSubmit == "function") {
        var b = _spFormOnSubmit(),
            a = false;
        if (typeof b == typeof a && b == a) return false
    }
    _spFormOnSubmitCalled = true;
    return true
}
var _inlineEditString = null,
    _spPageLoadedRegistered = false;

function _spPageLoaded() {
    a: ;
    _spOriginalFormAction = null;
    EscapeFormAction();
    RefreshInplViewState();
    RefreshHeroButtonState();
    InlineEditSetDefaultFocus()
}
function InlineEditSetDefaultFocus() {
    a: ;
    if (_inlineEditString != null) {
        var c = _inlineEditString.indexOf("#");
        if (c <= 0) return;
        for (var i = _inlineEditString.substring(0, c), d = document.getElementsByTagName("TR"), b = 0; b < d.length; b++) if (d[b].getAttribute("automode") == i) {
            for (var h = _inlineEditString.substring(c + 1), f = h.split(","), a = d[b], e = 0; e < f.length; e++) {
                if (a == null) break;
                a = a.firstChild;
                for (var g = 0; g < f[e]; g++) {
                    if (a == null) break;
                    a = a.nextSibling
                }
            }
            a != null && focusControl(a);
            break
        }
        _inlineEditString = null
    }
}
function focusControl(b) {
    a: ;
    if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
        var a = b;
        if (a && typeof a.contentEditable !== "undefined") {
            oldContentEditableSetting = a.contentEditable;
            a.contentEditable = false
        } else a = null;
        try {
            b.focus()
        } catch (c) { }
        if (a) a.contentEditable = oldContentEditableSetting
    } else b.focus()
}
function EscapeFormAction() {
    a: ;
    if (document.forms.length > 0 && !_spOriginalFormAction) {
        _spOriginalFormAction = document.forms[0].action;
        var a = window.location.href,
            b = a.indexOf("://");
        if (b >= 0) {
            var c = a.substring(b + 3);
            b = c.indexOf("/");
            if (b >= 0) a = c.substring(b);
            if (a.length > 2 && a.charAt(0) == "/" && a.charAt(1) == "/") a = a.substring(1)
        }
        _spEscapedFormAction = escapeUrlForCallback(a);
        document.forms[0].action = _spEscapedFormAction;
        document.forms[0]._initialAction = document.forms[0].action
    }
}
function RefreshHeroButtonState() {
    a: ;
    if (typeof _spWebPartComponents != "undefined") for (var d in _spWebPartComponents) if (d.length > 7) {
        var b = d.substr(7),
            a = window["heroButtonWebPart" + b];
        if (typeof a != "undefined" && a != null && a == true) {
            var c = document.getElementById("Hero-" + b);
            if (c != null) c.style.display = ""
        }
    }
}
function RefreshInplViewState() {
    a: ;
    if (typeof ctx != "undefined" && ctx.clvp != null && (ctx.clvp.tab == null || ctx.clvp.tab != null && (ctx.clvp.tab.parentNode == null || ctx.clvp.tab.parentNode.innerHTML == null))) {
        FixDroppedOrPastedClvps(null);
        if (ctx.dictSel != null) {
            ctx.dictSel = [];
            ctx.CurrentSelectedItems = 0
        }
    }
}
function RestoreToOriginalFormAction() {
    a: ;
    if (_spOriginalFormAction != null) {
        if (_spEscapedFormAction == document.forms[0].action) {
            document.forms[0].action = _spOriginalFormAction;
            document.forms[0]._initialAction = document.forms[0].action
        }
        _spOriginalFormAction = null;
        _spEscapedFormAction = null
    }
}
function DefaultFocus() {
    a: ;
    if (typeof _spUseDefaultFocus != "undefined") {
        var a = document.getElementsByName("_spFocusHere"),
            c = null;
        if (a == null || a.length <= 0) c = document.getElementById("_spFocusHere");
        else if (a != null && a.length > 0) c = a[0];
        if (c != null) {
            var b = c.getElementsByTagName("a");
            if (b != null && b.length > 0) for (var d = 0; d < b.length; d++) if (b[d].style.visibility != "hidden") {
                try {
                    b[d].focus()
                } catch (e) { }
                break
            }
        }
    }
}
function ProcessDefaultOnLoad() {
    a: ;
    ProcessPNGImages();
    UpdateAccessibilityUI();
    window.setTimeout("ProcessImn()", 10);
    ProcessOnLoadFunctions(_spBodyOnLoadFunctionNames);
    typeof _spUseDefaultFocus != "undefined" && DefaultFocus()
}
function ProcessOnLoadFunctions(onLoadFunctionNames) {
    a: ;
    for (var i = 0; i < onLoadFunctionNames.length; i++) {
        var expr = "if(typeof(" + onLoadFunctionNames[i] + ")=='function'){" + onLoadFunctionNames[i] + "();}";
        eval(expr)
    }
    onLoadFunctionNames = []
}
function CoreInvoke(a) {
    a: ;
    var b = Array.prototype.slice.call(arguments, 1),
        c = function () {
            a: ;
            window[a].apply(null, b)
        };
    if (TypeofFullName(a) == "function") return window[a].apply(null, b);
    else {
        EnsureScript("core.js", "undefined", c);
        return false
    }
}
function ToggleDeveloperDashboard() {
    a: ;
    if (GetCookie("WSS_DeveloperDashboard") == "true") {
        document.cookie = "WSS_DeveloperDashboard=false";
        window.location.reload(true)
    } else {
        document.cookie = "WSS_DeveloperDashboard=true";
        window.location.reload(true)
    }
}
function ToggleTrace() {
    a: ;
    if (GetCookie("WSS_DeveloperDashboardTrace") == "true") {
        document.cookie = "WSS_DeveloperDashboardTrace=false";
        window.location.reload(true)
    } else {
        document.cookie = "WSS_DeveloperDashboardTrace=true";
        window.location.reload(true)
    }
}
function DevDashMoveTrace() {
    a: ;
    var a = document.getElementById("__asptrace"),
        c = document.getElementById("DeveloperDashboard");
    if (typeof c != "undefined" && c) if (typeof a != "undefined" && a) {
        var b = a.parentNode;
        if (typeof b != "undefined" && b) {
            b.removeChild(a);
            c.appendChild(a)
        }
    }
}
function SetSqlWindowText(h, j, g, e, i, f) {
    a: ;
    var b = document.sqlWindow;
    if (!b || b.closed) {
        b = window.open("", "", "width=800,height=770,status=yes,location=no,scrollbar=yes,resize=yes");
        document.sqlWindow = b
    }
    var a = b.document,
        d = a.getElementById("sqlText"),
        c = a.getElementById("sqlStack");
    if (typeof d == "undefined" || !d) {
        a.open();
        a.write('<html><head><link rel="stylesheet" type="text/css" href="/_layouts/1033/styles/layouts.css"/></head><body><div class="ms-developerdashboard"><table width="100%"><tr><td style="font-weight:bold">');
        a.write(h);
        a.write('</td></tr><tr><td><textarea id="sqlText" rows="18" cols="94"></textarea></td></tr>');
        if (typeof e != "undefined" && e) {
            a.write('<tr><td style="font-weight:bold">');
            a.write(g);
            a.write('</td></tr><tr><td><textarea id="sqlStack" rows="14" cols="94"></textarea></td></tr>')
        }
        if (typeof f != "undefined" && f) {
            a.write('<tr><td style="font-weight:bold">');
            a.write(i);
            a.write('</td></tr><tr><td><textarea id="sqlIO" rows="8" cols="94"></textarea></td></tr>')
        }
        a.write("</table></div></body></html>");
        a.close();
        d = a.getElementById("sqlText");
        c = a.getElementById("sqlStack");
        sqlIO = a.getElementById("sqlIO")
    }
    d.value = j;
    if (typeof c != "undefined" && c) c.value = e;
    if (typeof sqlIO != "undefined" && sqlIO) sqlIO.value = f;
    b.focus()
}
var flyoutsAllowed = false;

function enableFlyoutsAfterDelay() {
    a: ;
    setTimeout("flyoutsAllowed=true;", 25)
}
function overrideMenu_HoverStatic(b) {
    a: ;
    if (!flyoutsAllowed) setTimeout(delayMenu_HoverStatic(b), 50);
    else {
        var c = Menu_HoverRoot(b),
            a = Menu_GetData(b);
        if (!a) return;
        __disappearAfter = a.disappearAfter;
        Menu_Expand(c, a.horizontalOffset, a.verticalOffset)
    }
}
function delayMenu_HoverStatic(a) {
    a: ;
    return function () {
        a: ;
        overrideMenu_HoverStatic(a)
    }
}
var g_ExecuteOrWaitJobs = {};

function ExecuteOrDelayUntilEventNotified(b, c) {
    a: ;
    var d = false,
        a = g_ExecuteOrWaitJobs[c];
    if (a == null || typeof a == "undefined") {
        a = {};
        a.notified = false;
        a.jobs = [];
        a.jobs.push(b);
        g_ExecuteOrWaitJobs[c] = a
    } else if (a.notified) {
        b();
        d = true
    } else a.jobs.push(b);
    return d
}
function NotifyEventAndExecuteWaitingJobs(c) {
    a: ;
    if (!g_ExecuteOrWaitJobs) return;
    var a = g_ExecuteOrWaitJobs[c];
    if (a == null || typeof a == "undefined") {
        a = {};
        a.notified = true;
        a.jobs = [];
        g_ExecuteOrWaitJobs[c] = a
    } else {
        if (a.jobs != null) for (var b = 0; b < a.jobs.length; b++) {
            var d = a.jobs[b];
            d()
        }
        a.notified = true;
        a.jobs = []
    }
}
function ExecuteOrDelayUntilScriptLoaded(c, a) {
    a: ;
    a = a.toLowerCase();
    var b = "sp.scriptloaded-" + a;
    return ExecuteOrDelayUntilEventNotified(c, b)
}
function NotifyScriptLoadedAndExecuteWaitingJobs(a) {
    a: ;
    a = a.toLowerCase();
    var b = "sp.scriptloaded-" + a;
    NotifyEventAndExecuteWaitingJobs(b)
}
function ExecuteOrDelayUntilBodyLoaded(b) {
    a: ;
    var a = "sp.bodyloaded";
    return ExecuteOrDelayUntilEventNotified(b, a)
}
function NotifyBodyLoadedAndExecuteWaitingJobs() {
    a: ;
    var a = "sp.bodyloaded";
    NotifyEventAndExecuteWaitingJobs(a)
}
function FFClick(b) {
    a: ;
    var a = document.createEvent("MouseEvents");
    a.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    b.dispatchEvent(a)
}
var L_ErrorMessage_InitializeError = "无法下载 Silverlight 应用程序。",
    L_ErrorMessage_PluginNotLoadedError = "无法下载 Silverlight 应用程序或 Silverlight 插件未加载。";

function _spOnSilverlightError(a, c, b) {
    a: ;
    b.errorType == "InitializeError" && _spSetSLErrorMessage(a, L_ErrorMessage_InitializeError)
}
function _spSetSLPluginNotLoadedErrorMessage(a) {
    a: ;
    _spSetSLErrorMessage(a, L_ErrorMessage_PluginNotLoadedError)
}
function _spSetSLErrorMessage(a, e) {
    a: ;
    var b = "SilverlightRuntimeErrorMessage_" + a,
        c = "WebPartDefaultConfigurationMessage_" + a,
        d = "SilverlightObjectDiv_" + a;
    document.getElementById(d).style.display = "none";
    document.getElementById(b).style.display = "block";
    document.getElementById(b).innerHTML = e;
    document.getElementById(c).style.display = "block"
}
var cuiKeyHash = {};
cuiKeyHash[219] = 91;
cuiKeyHash[221] = 93;
cuiKeyHash[51] = 35;
cuiKeyHash[186] = 59;
cuiKeyHash[187] = 61;
cuiKeyHash[188] = 44;
cuiKeyHash[189] = 45;
cuiKeyHash[190] = 46;
cuiKeyHash[191] = 47;
cuiKeyHash[222] = 39;

function _processKeyCodes(a) {
    a: ;
    if (cuiKeyHash[a]) return cuiKeyHash[a];
    return a
}
var g_fhs;

function _ribbonScaleHeader(h, c) {
    a: ;
    var d = h.childNodes[1],
        i = d.childNodes.length,
        a = null,
        b = null;
    if (typeof c == "undefined") c = false;
    if (typeof g_fhs == "undefined") if (typeof _ribbonShouldFixRtlHeaders == "function") g_fhs = _ribbonShouldFixRtlHeaders(c);
    else g_fhs = false;
    for (var f = 0; f < i; f++) {
        var e = d.childNodes[f];
        if (e.className.indexOf("ms-cui-tts") != -1) a = e;
        else if (e.className.indexOf("ms-cui-TabRowRight") != -1) b = e
    }
    a && "undefined" == typeof a._widthAdded && g_fhs && _ribbonFixHeaderWidth(a);
    if (!a || !b) return;
    b.style.display = "block";
    var g = _ribbonNeedsHeaderScaling(d, a, b, c);
    if (g) {
        _ribbonHeaderScaleDown(a);
        _ribbonNeedsHeaderScaling(d, a, b, c) && _ribbonHeaderScaleDown(a)
    } else {
        if (_ribbonGetScaleStep(a) == 0) return;
        _ribbonHeaderScaleUp(a);
        if (_ribbonNeedsHeaderScaling(d, a, b, c)) {
            _ribbonHeaderScaleDown(a);
            return
        }
        if (_ribbonGetScaleStep(a) == 0) return;
        _ribbonHeaderScaleUp(a);
        _ribbonNeedsHeaderScaling(d, a, b, c) && _ribbonHeaderScaleDown(a)
    }
    if (_ribbonNeedsHeaderScaling(d, a, b, c)) b.style.display = "none"
}
function _ribbonNeedsHeaderScaling(d, c, b, a) {
    a: ;
    if (c.offsetWidth > 0 && b.offsetWidth > 0 && _ribbonElementsWrap(c, b, a)) return true;
    if (!g_fhs && _ribbonChildNodesWrapped(b, a)) return true;
    if (_ribbonChildNodesWrapped(d, a)) return true;
    return _ribbonChildNodesWrapped(c, a)
}
function _ribbonChildNodesWrapped(e, g) {
    a: ;
    if (e.offsetWidth == 0) return false;
    for (var c = [], f = e.childNodes.length, a = 0; a < f; a++) {
        var b = e.childNodes[a];
        b && b.nodeName != "#text" && b.offsetWidth > 0 && b.offsetHeight > 0 && c.push(b)
    }
    f = c.length;
    for (var a = 0; a < f; a++) {
        var b = c[a],
            d = c[a + 1];
        if (typeof d != "undefined" && d && _ribbonElementsWrap(b, d, g)) return true
    }
    return false
}
function _ribbonElementsWrap(b, a, c) {
    a: ;
    if (!c && b.offsetLeft + b.offsetWidth > a.offsetLeft) return true;
    else if (c && a.offsetLeft + a.offsetWidth > b.offsetLeft) return true;
    return false
}
function _ribbonGetScaleStep(a) {
    a: ;
    if ("undefined" == typeof a._scaleStep) {
        a._scaleStep = 0;
        if (a.className.indexOf("ms-cui-tts-scale1") != -1) a._scaleStep = 1;
        else if (a.className.indexOf("ms-cui-tts-scale2") != -1) a._scaleStep = 2
    }
    return a._scaleStep
}
function _ribbonSetScaleStep(b, a) {
    a: ;
    b._scaleStep = a
}
function _ribbonHeaderScaleDown(a) {
    a: ;
    var b = _ribbonGetScaleStep(a);
    if (b == 0) _ribbonHeaderScaleIndex(a, 1);
    else (b == 1 || b == 2) && _ribbonHeaderScaleIndex(a, 2)
}
function _ribbonHeaderScaleUp(a) {
    a: ;
    var b = _ribbonGetScaleStep(a);
    if (b == 1) _ribbonHeaderScaleIndex(a, 0);
    else b == 2 && _ribbonHeaderScaleIndex(a, 1)
}
var g_ribbonHeaderScaleClass = ["ms-cui-tts", "ms-cui-tts-scale-1", "ms-cui-tts-scale-2"];

function _ribbonHeaderScaleIndex(a, b) {
    a: ;
    a.className = g_ribbonHeaderScaleClass[b];
    _ribbonSetScaleStep(a, b);
    _ribbonFixHeaderWidth(a)
}
function _ribbonFixHeaderWidth(a) {
    a: ;
    if (!g_fhs) return;
    var b = _ribbonCalculateWidth(a);
    a.style.width = b + "px";
    a._widthAdded = true
}
function _ribbonCalculateWidth(g) {
    a: ;
    for (var a = 0, f = g.childNodes, h = f.length, d = 0; d < h; d++) {
        var b = f[d];
        if (b && b.nodeName == "LI" && b.offsetWidth > 0) {
            var c = b.childNodes[1];
            if (c && c.nodeName == "UL") {
                var e = _ribbonCalculateWidth(c);
                c.style.width = e + "px";
                a = a + e + 4
            } else a = a + b.offsetWidth + 2
        }
    }
    return a
}
function _ribbonOnStartInit(c) {
    a: ;
    OnRibbonMinimizedChanged(c.initialTabId == "Ribbon.Read");
    var d = document.getElementById("Ribbon");
    if (!d || c && c.buildMinimized) return;
    var b = document.createElement("div");
    b.className = "ms-cui-tabContainer";
    var a = document.createElement("ul");
    a.id = "Ribbon.BlankTab";
    a.className = "ms-cui-tabBody";
    a.innerHTML = '<span class="ms-ribbontabswitchloading"><img src="/_layouts/images/loadingcirclests16.gif" alt=""/><span>' + L_Loading_Text + "</span></span>";
    b.appendChild(a);
    d.appendChild(b)
}
var L_Status_Text = "状态",
    L_StatusBarRed_Text = "非常重要",
    L_StatusBarYellow_Text = "重要",
    L_StatusBarGreen_Text = "成功",
    L_StatusBarBlue_Text = "信息",
    StatusIdWithTopPriority = null,
    StatusColorWithTopPriority = null,
    StatusPriority = {
        red: 4,
        yellow: 3,
        green: 2,
        blue: 1
    },
    StatusBarClassNames = {
        4: "s4-status-s4",
        3: "s4-status-s3",
        2: "s4-status-s2",
        1: "s4-status-s1"
    },
    StatusTitle = {
        4: L_StatusBarRed_Text,
        3: L_StatusBarYellow_Text,
        2: L_StatusBarGreen_Text,
        1: L_StatusBarBlue_Text
    },
    g_uniqueIndex = 0;

function getUniqueIndex() {
    a: ;
    g_uniqueIndex++;
    return g_uniqueIndex
}
function addStatus(f, g, e) {
    a: ;
    var a = document.getElementById("pageStatusBar");
    if (a != null) {
        a.setAttribute("aria-live", "polite");
        a.setAttribute("aria-relevant", "all");
        var b = _createStatusMarkup(f, g, true);
        if (!e) a.appendChild(b);
        else {
            var c = a.getElementsByTagName("SPAN"),
                d = c.length > 0 ? c[0] : null;
            if (d != null) a.insertBefore(b, d);
            else a.appendChild(b)
        }
        if (a.childNodes.length == 1) {
            StatusIdWithTopPriority = b.id;
            StatusColorWithTopPriority = 1
        }
        a.style.display = "block";
        return b.id
    }
}
function appendStatus(f, d, e) {
    a: ;
    var c = document.getElementById("pageStatusBar"),
        a = document.getElementById(f);
    if (c != null && a != null) {
        var b = null;
        if (a.lastChild && a.lastChild.tagName == "BR") {
            a.removeChild(a.lastChild);
            b = _createStatusMarkup(d, e, true)
        } else b = _createStatusMarkup(d, e, false);
        if (a.nextSibling != null) c.insertBefore(b, a.nextSibling);
        else c.appendChild(b);
        return b.id
    }
}
function _createStatusMarkup(c, e, d) {
    a: ;
    var b = document.createElement("SPAN");
    b.id = "status_" + getUniqueIndex();
    var a = [];
    a.push("<span id='");
    a.push(b.id);
    a.push("_hiddenPriMsg");
    a.push("' class='ms-hidden'>");
    a.push(StatusTitle[1] + L_Status_Text);
    a.push("</span>");
    if (c.length != 0) {
        a.push("<b>");
        a.push(c);
        a.push("</b>&#160;")
    }
    a.push("<span id='");
    a.push(b.id);
    a.push("_body");
    a.push("'>");
    a.push(e);
    a.push("</span>&#160;&#160;");
    d && a.push("<br/>");
    b.innerHTML = a.join("");
    b.setAttribute("role", "alert");
    b.priorityColor = 1;
    b.title = StatusTitle[1];
    b.tabIndex = 0;
    return b
}
function removeAllStatus(b) {
    a: ;
    var a = document.getElementById("pageStatusBar");
    if (a != null) {
        a.innerHTML = "";
        a.className = StatusBarClassNames[1];
        StatusColorWithTopPriority = null;
        StatusIdWithTopPriority = null;
        if (b) a.style.display = "none"
    }
}
function setStatusPriColor(b, d) {
    a: ;
    var a = document.getElementById(b);
    if (a != null && typeof d == "string") {
        if (d in StatusPriority) {
            a.priorityColor = StatusPriority[d];
            a.title = StatusTitle[a.priorityColor]
        } else {
            a.priorityColor = 1;
            a.title = StatusTitle[1]
        }
        var c = a.firstChild;
        if (c != null && c.id == b + "_hiddenPriMsg") c.innerHTML = a.title + L_Status_Text;
        if (b == StatusIdWithTopPriority) if (a.priorityColor >= StatusColorWithTopPriority) StatusColorWithTopPriority = a.priorityColor;
        else _selectStatusWithTopPriority();
        else if (a.priorityColor > StatusColorWithTopPriority) {
            StatusIdWithTopPriority = b;
            StatusColorWithTopPriority = a.priorityColor
        }
        var e = document.getElementById("pageStatusBar");
        if (e) e.className = StatusBarClassNames[StatusColorWithTopPriority]
    }
}
function _selectStatusWithTopPriority() {
    a: ;
    var f = document.getElementById("pageStatusBar");
    if (f != null) {
        for (var e = null, b = 1, d = f.childNodes, g = d.length, a = null, c = 0; c < g; c++) {
            a = d[c];
            if (a.priorityColor > b) {
                b = a.priorityColor;
                e = a.id
            }
        }
        StatusIdWithTopPriority = e;
        StatusColorWithTopPriority = b
    }
}
function updateStatus(d, b) {
    a: ;
    var c = d + "_body",
        a = document.getElementById(c);
    if (a) a.innerHTML = b
}
function removeStatus(d) {
    a: ;
    var a = document.getElementById(d);
    if (a != null) {
        if (a.lastChild && a.lastChild.tagName == "BR") {
            var c = a.previousSibling;
            if (c && c.lastChild && c.lastChild.tagName != "BR") {
                var e = document.createElement("BR");
                c.appendChild(e)
            }
        }
        a.parentNode.removeChild(a);
        var b = document.getElementById("pageStatusBar");
        if (b) if (b.getElementsByTagName("SPAN").length == 0) {
            b.className = StatusBarClassNames[1];
            StatusColorWithTopPriority = null;
            StatusIdWithTopPriority = null;
            b.style.display = "none"
        } else if (d == StatusIdWithTopPriority) {
            _selectStatusWithTopPriority();
            b.className = StatusBarClassNames[StatusColorWithTopPriority]
        }
    }
}
var g_dlgWndTop = null;

function _dlgWndTop() {
    a: ;
    if (g_dlgWndTop) return g_dlgWndTop;
    try {
        var a = window.parent.g_DialogWindowTop;
        if (a) g_dlgWndTop = window.parent
    } catch (b) { } finally {
        if (!g_dlgWndTop) {
            window.self.g_DialogWindowTop = true;
            g_dlgWndTop = window.self
        }
    }
    return g_dlgWndTop
}
function commonShowModalDialog(n, b, c, m) {
    a: ;
    if (document.getElementById("__spPickerHasReturnValue") != null) document.getElementById("__spPickerHasReturnValue").value = "";
    if (document.getElementById("__spPickerReturnValueHolder") != null) document.getElementById("__spPickerReturnValueHolder").value = "";
    commonModalDialogReturnValue.clear();
    var h;
    if (window.showModalDialog && !browseris.safari125up) {
        h = window.showModalDialog(n, m, b);
        c && invokeModalDialogCallback(c, h)
    } else {
        var l = 500,
            k = 550,
            p = "yes";
        if (!b) b = "width=" + l + ",height=" + k;
        else {
            function r() {
                a: ;
                return []
            }
            function d(a, b, c) {
                a: ;
                a.push(b);
                a[b] = c
            }
            function q(b) {
                a: ;
                for (var c = [], a = 0; a < b.length; a++) c.push(b[a]);
                return c
            }
            var a = r(),
                j, f;
            if (b.search(/^(\s*\w+\s*:\s*.+?\s*)(;\s*\s*\w+\s*:\s*.+?\s*)*(;\s*)?$/) != -1) {
                j = /^\s*(\w+)\s*:\s*(.+?)\s*$/;
                f = b.split(/\s*;\s*/)
            } else {
                j = /^\s*(\w+)\s*=\s*(.+?)\s*$/;
                f = b.split(/\s*,\s*/)
            }
            for (var s in f) {
                var g = j.exec(f[s]);
                g && g.length == 3 && d(a, g[1].toLowerCase(), g[2])
            } !a["width"] && d(a, "width", a["dialogwidth"] || l);
            !a["height"] && d(a, "height", a["dialogheight"] || k);
            !a["scrollbars"] && d(a, "scrollbars", a["scroll"] || p);
            b = "";
            var i = q(a);
            for (var o in i) {
                if (b) b += ",";
                b += i[o] + "=" + a[i[o]]
            }
        }
        var e = window.open(n, "_blank", b + ",modal=yes,dialog=yes");
        e.dialogArguments = m;
        window.onfocus = function () {
            a: ;
            var a = document.getElementById("__spPickerHasReturnValue") != null && document.getElementById("__spPickerHasReturnValue").value == "1" || commonModalDialogReturnValue.isSet();
            if (e && !e.closed && !a) e.focus();
            else {
                window.onfocus = null;
                c && invokeModalDialogCallback(c, h)
            }
        };
        if (!browseris.ie) if (window.frameElement != null) window.fndlgClose = c
    }
    return h
}
function invokeModalDialogCallback(b, a) {
    a: ;
    if (typeof a != "undefined" && a != null) b(a);
    else if (commonModalDialogReturnValue.isSet()) {
        a = commonModalDialogReturnValue.get();
        b(a);
        commonModalDialogReturnValue.clear()
    } else if (document.getElementById("__spPickerHasReturnValue") != null && document.getElementById("__spPickerHasReturnValue").value == "1" && document.getElementById("__spPickerReturnValueHolder") != null) {
        a = document.getElementById("__spPickerReturnValueHolder").value;
        b(a)
    }
    return a
}
function setModalDialogReturnValue(a, b) {
    a: ;
    if (a.opener != null && typeof b == "string" && a.opener.document.getElementById("__spPickerHasReturnValue") != null && a.opener.document.getElementById("__spPickerReturnValueHolder") != null) {
        a.opener.document.getElementById("__spPickerHasReturnValue").value = "1";
        a.opener.document.getElementById("__spPickerReturnValueHolder").value = b
    } else setModalDialogObjectReturnValue(a, b);
    if (browseris.safari125up) a.opener != null && a.opener.fndlgClose != null && a.opener.fndlgClose(b)
}
function setModalDialogObjectReturnValue(a, b) {
    a: ;
    if (a.showModalDialog && !browseris.safari125up) a.returnValue = b;
    else a.opener != null && a.opener.commonModalDialogReturnValue.set(b)
}
function CommonGlobalDialogReturnValue() {
    a: ;
    var a = false,
        b = null;
    this.set = function (a) {
        a: ;
        if (typeof a != "undefined") {
            this.retVal = a;
            this.hasRetval = true
        }
    };
    this.isSet = function () {
        a: ;
        return this.hasRetval
    };
    this.get = function () {
        a: ;
        if (this.hasRetval) return this.retVal
    };
    this.clear = function () {
        a: ;
        this.hasRetval = false;
        this.retVal = null
    }
}
var commonModalDialogReturnValue = new CommonGlobalDialogReturnValue;

function commonModalDialogOpen(e, a, c, d) {
    a: ;
    var f = function () {
        a: ;
        a.url = e;
        a.dialogReturnValueCallback = c;
        a.args = d;
        var b = SP.UI.ModalDialog.showModalDialog(a);
        b.get_frameElement().commonModalDialogClose = commonModalDialogClose
    },
        b;
    try {
        b = typeof SP.UI.ModalDialog.showModalDialog
    } catch (g) {
        b = "undefined"
    }
    EnsureScript("SP.UI.Dialog.js", b, f)
}
function commonModalDialogClose(b, c) {
    a: ;
    var a = _dlgWndTop().g_childDialog;
    if (a) {
        a.set_returnValue(c);
        a.close(b)
    }
}
function commonModalDialogGetArguments() {
    a: ;
    var a = _dlgWndTop().g_childDialog;
    if (a && typeof a.get_args != "undefined") return a.get_args();
    return null
}
function ShowPopupDialog(a) {
    a: ;
    ShowPopupDialogWithCallback(a, PopupDialogCallback)
}
function ShowPopupDialogWithCallback(b, c) {
    a: ;
    var d = function () {
        a: ;
        if (FV4UI()) {
            var a = {};
            a.url = b;
            a.dialogReturnValueCallback = c;
            var d = SP.UI.ModalDialog.showModalDialog(a);
            d.get_frameElement().commonModalDialogClose = commonModalDialogClose
        } else STSNavigate(b)
    },
        a;
    try {
        a = typeof SP.UI.ModalDialog.showModalDialog
    } catch (e) {
        a = "undefined"
    }
    EnsureScript("SP.UI.Dialog.js", a, d)
}
function PopupDialogCallback(a) {
    a: ;
    a == 1 && STSNavigate(_dlgWndTop().location.href)
}
function SelectField(b, a) {
    a: ;
    CoreInvoke("_SelectField", b, a)
}
function FilterField(d, b, a, c) {
    a: ;
    CoreInvoke("_FilterField", d, b, a, c)
}
function SetControlValue(a, b) {
    a: ;
    CoreInvoke("_SetControlValue", a, b)
}
function SubmitFormPost(c, b, a) {
    a: ;
    CoreInvoke("_SubmitFormPost", c, b, a)
}
function GoToPageRelative(a) {
    a: ;
    CoreInvoke("_GoToPageRelative", a)
}
function EnterFolder(a) {
    a: ;
    CoreInvoke("_EnterFolder", a)
}
function HandleFolder(o, n, p, e, a, d, i, g, m, k, b, h, j, f, c, l) {
    a: ;
    CoreInvoke("_HandleFolder", o, n, p, e, a, d, i, g, m, k, b, h, j, f, c, l)
}
function VerifyFolderHref(g, f, h, c, b, e, d, a) {
    a: ;
    CoreInvoke("_VerifyFolderHref", g, f, h, c, b, e, d, a)
}
function VerifyHref(e, d, b, c, a) {
    a: ;
    CoreInvoke("_VerifyHref", e, d, b, c, a)
}
function DispEx(o, n, e, a, d, i, g, m, k, b, h, j, f, c, l) {
    a: ;
    CoreInvoke("_DispEx", o, n, e, a, d, i, g, m, k, b, h, j, f, c, l)
}
function EditItemWithCheckoutAlert(g, h, f, a, d, e, c, b) {
    a: ;
    CoreInvoke("_EditItemWithCheckoutAlert", g, h, f, a, d, e, c, b)
}
function STSNavigateWithCheckoutAlert(g, f, a, d, e, c, b) {
    a: ;
    CoreInvoke("_STSNavigateWithCheckoutAlert", g, f, a, d, e, c, b)
}
function NewItem2(a, b) {
    a: ;
    CoreInvoke("_NewItem2", a, b)
}
function NewItem(a) {
    a: ;
    CoreInvoke("_NewItem", a)
}
function EditItem2(a, b) {
    a: ;
    CoreInvoke("_EditItem2", a, b)
}
function EditItem(a) {
    a: ;
    CoreInvoke("_EditItem", a)
}
function RefreshPageTo(b, c, a) {
    a: ;
    CoreInvoke("_RefreshPageTo", b, c, a)
}
function AddGroupToCookie(a) {
    a: ;
    CoreInvoke("_AddGroupToCookie", a)
}
function RemoveGroupFromCookie(a) {
    a: ;
    CoreInvoke("_RemoveGroupFromCookie", a)
}
function ExpGroupBy(a) {
    a: ;
    CoreInvoke("_ExpGroupBy", a)
}
function DispDocItem(b, a) {
    a: ;
    CoreInvoke("_DispDocItem", b, a)
}
function DispDocItemExWithServerRedirect(h, g, d, a, c, f, e, b) {
    a: ;
    CoreInvoke("_DispDocItemExWithServerRedirect", h, g, d, a, c, f, e, b)
}
function DispDocItemEx(e, c, a, b, d) {
    a: ;
    CoreInvoke("_DispDocItemEx", e, c, a, b, d)
}
function PortalPinToMyPage(c, b, a) {
    a: ;
    CoreInvoke("_PortalPinToMyPage", c, b, a)
}
function PortalPinToMyPage(h, f, d, e, a, c, g, b) {
    a: ;
    CoreInvoke("_PortalPinToMyPage", h, f, d, e, a, c, g, b)
}
function MoveToViewDate(b, a, c) {
    a: ;
    CoreInvoke("_MoveToViewDate", b, a, c)
}
function MoveToDate(a, b) {
    a: ;
    CoreInvoke("_MoveToDate", a, b)
}
function ClickDay(a) {
    a: ;
    CoreInvoke("_ClickDay", a)
}
function GetMonthView(a) {
    a: ;
    CoreInvoke("_GetMonthView", a)
}
function OptLoseFocus(a) {
    a: ;
    CoreInvoke("_OptLoseFocus", a)
}
function SetCtrlFromOpt(a, b) {
    a: ;
    CoreInvoke("_SetCtrlFromOpt", a, b)
}
function ChangeLayoutMode(a, b) {
    a: ;
    CoreInvoke("_ChangeLayoutMode", a, b)
}
function MSOLayout_ChangeLayoutMode(a, b) {
    a: ;
    ChangeLayoutMode(a, b)
}
function WebPartMenuKeyboardClick(d, a, b, c) {
    a: ;
    CoreInvoke("_WebPartMenuKeyboardClick", d, a, b, c)
}
function ShowToolPane2Wrapper(a, b, c) {
    a: ;
    CoreInvoke("_ShowToolPane2Wrapper", a, b, c)
}
function EditInSPD(a, b) {
    a: ;
    CoreInvoke("_EditInSPD", a, b)
}
function SetupFixedWidthWebParts() {
    a: ;
    CoreInvoke("_SetupFixedWidthWebParts")
}
function ToggleAllItems(c, b, a) {
    a: ;
    CoreInvoke("_ToggleAllItems", c, b, a)
}
function CommandUIExecuteCommand(a) {
    a: ;
    CoreInvoke("_CommandUIExecuteCommand", a)
}
function PopMenuFromChevron(a) {
    a: ;
    CoreInvoke("_PopMenuFromChevron", a)
}
function NavigateToSubNewAspx(a, b) {
    a: ;
    CoreInvoke("_NavigateToSubNewAspx", a, b)
}
function NavigateToManagePermsPage(a, c, b) {
    a: ;
    CoreInvoke("_NavigateToManagePermsPage", a, c, b)
}
function DoNavigateToTemplateGallery(a, b) {
    a: ;
    CoreInvoke("_DoNavigateToTemplateGallery", a, b)
}
function RefreshPage(a) {
    a: ;
    CoreInvoke("_RefreshPage", a)
}
function OpenPopUpPage(d, a, c, b) {
    a: ;
    CoreInvoke("_OpenPopUpPage", d, a, c, b)
}
function OpenCreateWebPageDialog(a) {
    a: ;
    CoreInvoke("_OpenCreateWebPageDialog", a)
}
function EditLink2(b, a) {
    a: ;
    CoreInvoke("_EditLink2", b, a)
}
function GoBack(a) {
    a: ;
    CoreInvoke("_GoBack", a)
}
function ReplyItem(d, a, c, b) {
    a: ;
    CoreInvoke("_ReplyItem", d, a, c, b)
}
function ExportToDatabase(b, c, d, a) {
    a: ;
    CoreInvoke("_ExportToDatabase", b, c, d, a)
}
function ExportList(a) {
    a: ;
    CoreInvoke("_ExportList", a)
}
function ClearSearchTerm(a) {
    a: ;
    CoreInvoke("_ClearSearchTerm", a)
}
function SubmitSearchForView(a) {
    a: ;
    CoreInvoke("_SubmitSearchForView", a)
}
function SubmitSearchRedirect(a) {
    a: ;
    CoreInvoke("_SubmitSearchRedirect", a)
}
function AlertAndSetFocus(b, a) {
    a: ;
    CoreInvoke("_AlertAndSetFocus", b, a)
}
function AlertAndSetFocusForDropdown(b, a) {
    a: ;
    CoreInvoke("_AlertAndSetFocusForDropdown", b, a)
}
function AddSilverlightWebPart(c, b, a) {
    a: ;
    CoreInvoke("_AddSilverlightWebPart", c, b, a)
}
function UserSelectionOnClick(b, a) {
    a: ;
    CoreInvoke("_UserSelectionOnClick", b, a)
}
function OnIframeLoad() {
    a: ;
    CoreInvoke("_OnIframeLoad")
}
function OnFocusFilter(a) {
    a: ;
    CoreInvoke("_OnFocusFilter", a)
}
function TopHelpButtonClick(a) {
    a: ;
    CoreInvoke("_TopHelpButtonClick", a)
}
function HelpWindowKey(a) {
    a: ;
    CoreInvoke("_HelpWindowKey", a)
}
function HelpWindowUrl(a) {
    a: ;
    CoreInvoke("_HelpWindowUrl", a)
}
function HelpWindow() {
    a: ;
    CoreInvoke("_HelpWindow")
}
function OnClickFilter(a, b) {
    a: ;
    return CoreInvoke("_OnClickFilter", a, b)
}
function GCActivateAndFocus(a) {
    a: ;
    CoreInvoke("_GCActivateAndFocus", a)
}
function GCNavigateToNonGridPage() {
    a: ;
    CoreInvoke("_GCNavigateToNonGridPage")
}
function _EnsureJSClass(f, e) {
    a: ;
    for (var d = f.split("."), a, c = 0, g = d.length; c < g; c++) {
        var b = d[c];
        if (typeof a == "undefined") a = window;
        if (typeof a[b] == "undefined") a[b] = {};
        a = a[b];
        if (e) a.__namespace = true
    }
}
function _EnsureJSNamespace(a) {
    a: ;
    _EnsureJSClass(a, true)
}
_EnsureJSNamespace("SP");
_EnsureJSClass("SP.SOD");
SP.SOD.execute = EnsureScriptParams;
SP.SOD.executeFunc = EnsureScriptFunc;
SP.SOD.registerSod = RegisterSod;
SP.SOD.registerSodDep = RegisterSodDep;
SP.SOD.executeOrDelayUntilScriptLoaded = ExecuteOrDelayUntilScriptLoaded;
SP.SOD.executeOrDelayUntilEventNotified = ExecuteOrDelayUntilEventNotified;
SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs = NotifyScriptLoadedAndExecuteWaitingJobs;
SP.SOD.notifyEventAndExecuteWaitingJobs = NotifyEventAndExecuteWaitingJobs;
SP.SOD.get_prefetch = function () {
    a: ;
    return g_prefetch
};
SP.SOD.set_prefetch = function (a) {
    a: ;
    g_prefetch = a
};
_EnsureJSNamespace("SP.UI");
_EnsureJSClass("SP.UI.Workspace");
SP.UI.Workspace.add_resized = function (a) {
    a: ;
    g_workspaceResizedHandlers.push(a)
};
SP.UI.Workspace.remove_resized = function (c) {
    a: ;
    for (var b = -1, a = 0, d = g_workspaceResizedHandlers.length; a < d; a++) if (c == g_workspaceResizedHandlers[a]) {
        b = a;
        break
    }
    b != -1 && g_workspaceResizedHandlers.splice(b, 1)
};
_EnsureJSClass("SP.UI.ModalDialog");
var _SP_UI_ModalDialog = SP.UI.ModalDialog;
_SP_UI_ModalDialog.ShowPopupDialog = ShowPopupDialog;
_SP_UI_ModalDialog.OpenPopUpPage = OpenPopUpPage;
_SP_UI_ModalDialog.commonModalDialogOpen = commonModalDialogOpen;
_SP_UI_ModalDialog.commonModalDialogClose = commonModalDialogClose;
_SP_UI_ModalDialog.RefreshPage = RefreshPage;
typeof Sys != "undefined" && Sys && Sys.Application && Sys.Application.notifyScriptLoaded();
NotifyScriptLoadedAndExecuteWaitingJobs("init.js")


function ULSrLq() {
    var a = {};
    a.ULSTeamName = "Microsoft SharePoint Foundation";
    a.ULSFileName = "core.js";
    return a
}
function GetXMLHttpRequestObject() {
    a: ;
    return new XMLHttpRequest
}
function insertAdjacentElement(a, c, b) {
    a: ;
    if (a.insertAdjacentElement) return a.insertAdjacentElement(c, b);
    switch (c) {
        case "beforeBegin":
            return a.parentNode.insertBefore(b, a);
            break;
        case "afterBegin":
            return a.insertBefore(b, a.firstChild);
            break;
        case "beforeEnd":
            return a.appendChild(b);
            break;
        case "afterEnd":
            if (a.nextSibling) return a.parentNode.insertBefore(b, a.nextSibling);
            else return a.parentNode.appendChild(b)
    }
}
function insertAdjacentHTML(a, c, b) {
    a: ;
    if (a.insertAdjacentHTML) return a.insertAdjacentHTML(c, b);
    var d = a.ownerDocument.createRange();
    d.setStartBefore(a);
    var e = d.createContextualFragment(b);
    return insertAdjacentElement(a, c, e)
}
function insertAdjacentText(a, c, b) {
    a: ;
    if (a.insertAdjacentText) return a.insertAdjacentText(c, b);
    var d = document.createTextNode(b);
    return insertAdjacentElement(a, c, d)
}
function contains(c, a) {
    a: ;
    var b = false;
    do {
        if (b = c == a) break;
        a = a.parentNode
    } while (a != null);
    return b
}
function getFirstElementByName(b, c) {
    a: ;
    if (b.name == c) return b;
    var a = b.firstChild;
    while (a && a != "undefined") {
        var d = getFirstElementByName(a, c);
        if (d) return d;
        a = a.nextSibling
    }
}
function documentGetElementsByName(c) {
    a: ;
    if (!browseris.ie && document.getElementsByName) return document.getElementsByName(c);
    for (var d = [], b = document.getElementsByTagName("*"), e = b.length, a = 0; a < e; a++) (b[a].name == c || typeof b[a].getAttribute != "unknown" && b[a].getAttribute && b[a].getAttribute("name") == c) && d.push(b[a]);
    return d
}
function getFirstChild(b) {
    a: ;
    var a = b.firstChild;
    while (a && a.nodeType == 3) a = a.nextSibling;
    return a
}
var IsMenuShown = false,
    ChevronContainer = null,
    itemTableDeferred = null,
    imageCell = null,
    onKeyPress = false,
    downArrowText = null,
    currentEditMenu = null,
    currentItemID = null,
    currentItemAppName = null,
    currentItemProgId = null,
    currentItemIcon = null,
    currentItemOpenControl = null,
    currentItemFileUrl = null,
    currentItemFSObjType = null,
    currentItemContentTypeId = null,
    currentItemCheckedOutUserId = null,
    currentItemCheckoutExpires = null,
    currentItemModerationStatus = null,
    currentItemUIString = null,
    currentItemCheckedoutToLocal = null,
    bIsCheckout = 0,
    currentItemCanModify = null,
    currentItemPermMaskH = null,
    currentItemPermMaskL = null,
    currentItemEvtType = 0,
    currentItemIsEventsExcp = null,
    currentItemIsEventsDeletedExcp = null,
    currentItemContentTypeId = null;
String.prototype.trim = function () {
    a: ;
    return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "")
};
var L_Edit_Text = "编辑",
    L_SharepointSearch_Text = "搜索此网站...",
    L_CreateWebPageDialogWidth_Text = "400",
    L_CreateWebPageDialogHeight_Text = "250",
    g_MaximumSelectedItemsAllowed = 100,
    L_BulkSelection_TooManyItems = "您不能同时选择超过 100 个项目。",
    g_ExpGroupWPState = new LRUCache,
    DocOpen = {
        CLIENT: 0,
        BROWSER: 1
    };

function FilterNoteField(b, d, e, j) {
    a: ;
    if (j != 13) return;
    event.returnValue = false;
    var a = window.location.href;
    pagedPart = /&Paged=TRUE&p_[^&]*&PageFirstRow=[^&]*/gi;
    a = a.replace(pagedPart, "");
    viewGuid = GetUrlKeyValue("View", true);
    if (viewGuid == "") {
        a = StURLSetVar2(a, "View", b);
        viewGuid = b
    }
    if (b.toUpperCase() != viewGuid.toUpperCase()) {
        var g = escapeProperly(b);
        if (g.toUpperCase() != viewGuid.toUpperCase()) {
            var k = /\?[^?]*/i,
                f = a.indexOf("?");
            if (f != -1) a = a.replace(k, "?View=" + b);
            else a = a + "?View=" + b
        }
    }
    var c = a.match("FilterField([0-9]+)=" + d);
    if (!c) {
        var f = a.indexOf("?");
        if (f != -1) a = a + "&";
        else a = a + "?";
        i = 0;
        do {
            i++;
            FilterArray = a.match("FilterField" + i + "=[^&]*&FilterValue" + i + "=[^&]*")
        } while (FilterArray);
        a = a + "FilterField" + i + "=" + d + "&FilterValue" + i + "=" + escapeProperly(e);
        a = a.replace("Filter=1&", "")
    } else {
        filterNo = parseInt(c[1]);
        var h = a.match("&FilterValue" + filterNo + "=[^&]*");
        strTemp = "&" + c[0] + h[0];
        strNewFilter = "&FilterField" + c[1] + "=" + d + "&FilterValue" + c[1] + "=" + escapeProperly(e);
        a = a.replace(strTemp, strNewFilter);
        a = a.replace("Filter=1&", "")
    }
    window.location.href = STSPageUrlValidation(a)
}
function _SelectField(b, k) {
    a: ;
    var a = window.location.href,
        g = window.location.hash,
        c = false,
        f = /\#.*/i;
    a = a.replace(f, "");
    viewGuid = GetUrlKeyValue("View", true);
    pageView = GetUrlKeyValue("PageView", true);
    var h = GetUrlKeyValue("ID", true),
        e = GetUrlKeyValue("ContentTypeId", true);
    if (b.toUpperCase() != viewGuid.toUpperCase()) {
        var i = escapeProperly(b);
        if (i.toUpperCase() != viewGuid.toUpperCase()) {
            var f = /\?[^?]*/i,
                j = a.indexOf("?");
            if (j != -1) a = a.replace(f, "?View=" + b);
            else a = a + "?View=" + b;
            c = true
        }
    }
    if (!c && GetUrlKeyValue("SelectedID") != "") {
        var d = /&SelectedID=[^&]*/gi;
        a = a.replace(d, "");
        d = /\?SelectedID=[^&]*&?/;
        a = a.replace(d, "?")
    }
    a = a + "&SelectedID=";
    a = a + k;
    if (c && pageView != "") a = a + "&PageView=" + pageView;
    if (h != "") a = a + "&ID=" + h;
    if (e != "") a = a + "&ContentTypeId=" + e;
    if (g != "") a = a + g;
    _SubmitFormPost(a);
    return false
}
function _FilterField(d, b, a, c) {
    a: ;
    return FilterFieldV3(d, b, a, c, false)
}
function FilterFieldV3(e, k, o, q, u) {
    a: ;
    var a = CanonicalizeUrlEncodingCase(window.location.href),
        l = new CUrl(a);
    a = l.query;
    var b = a.match("[&?]Paged=TRUE[^&]*");
    if (b) {
        var c = /&p_[^&]*/gi;
        a = a.replace(c, "");
        c = /&PageFirstRow=[^&]*/gi;
        a = a.replace(c, "");
        c = /&PageLastRow=[^&]*/gi;
        a = a.replace(c, "");
        c = /&PagedPrev=TRUE[^&]*/i;
        a = a.replace(c, "");
        b = a.match("[?]Paged=TRUE[^&]*");
        if (b) {
            var f = a.substr(b["index"]).indexOf("&");
            if (f != -1) a = a.substr(0, b["index"] + 1) + a.substr(f + b["index"] + 1);
            else a = a.substr(0, b["index"])
        } else {
            c = /&Paged=TRUE[^&]*/i;
            a = a.replace(c, "")
        }
    }
    viewGuid = GetUrlKeyValue("View", true);
    if (viewGuid == "") {
        a = StURLSetVar2(a, "View", e);
        viewGuid = e
    }
    if (e.toUpperCase() != viewGuid.toUpperCase()) {
        var t = escapeProperly(e);
        if (t.toUpperCase() != viewGuid.toUpperCase()) {
            var v = /\?[^?]*/i,
                f = a.indexOf("?");
            if (f != -1) a = a.replace(v, "?View=" + e);
            else a = a + "?View=" + e
        }
    }
    b = a.match("FilterField([0-9]+)=" + k + "&");
    if (!b) if (0 == q) {
        a = a.replace("Filter=1&", "");
        a = a.replace("?Filter=1", "")
    } else {
        var f = a.indexOf("?");
        if (f != -1) a = a + "&";
        else a = a + "?";
        i = 0;
        do {
            i++;
            FilterArray = a.match("FilterField" + i + "=[^&]*")
        } while (FilterArray);
        a = a + "FilterField" + i + "=" + k + "&FilterValue" + i + "=" + escapeProperly(o);
        a = a.replace("Filter=1&", "")
    } else {
        filterNo = parseInt(b[1]);
        var h = a.match("FilterValue" + filterNo + "=[^&]*"),
            r = a.match("&FilterOp" + filterNo + "=[^&]*"),
            n = a.match("&FilterLookupId" + filterNo + "=[^&]*"),
            p = a.match("&FilterData" + filterNo + "=[^&]*"),
            d = "&" + b[0] + h[0];
        if (0 == q) {
            if (a.indexOf(d) == -1) d = b[0] + h[0] + "&";
            a = a.replace(d, "");
            if (r) a = a.replace(r[0], "");
            if (n) a = a.replace(n[0], "");
            if (p) a = a.replace(p[0], "");
            j = filterNo + 1;
            FilterArray = a.match("FilterField" + j + "=[^&]*");
            for (i = filterNo; FilterArray; i++) {
                strNew = "FilterField" + i;
                strOld = "FilterField" + j;
                a = a.replace(strOld, strNew);
                strNew = "FilterValue" + i;
                strOld = "FilterValue" + j;
                a = a.replace(strOld, strNew);
                strNew = "FilterOp" + i;
                strOld = "FilterOp" + j;
                a = a.replace(strOld, strNew);
                strNew = "FilterLookupId" + i;
                strOld = "FilterLookupId" + j;
                a = a.replace(strOld, strNew);
                strNew = "FilterData" + i;
                strOld = "FilterData" + j;
                a = a.replace(strOld, strNew);
                j++;
                FilterArray = a.match("FilterField" + j + "=[^&]*")
            }
            a = a.replace("Filter=1&", "");
            a = a.replace("?Filter=1", "");
            a = a.replace("&Filter=1", "")
        } else {
            var g;
            if (a.indexOf(d) == -1) {
                d = "?" + b[0] + h[0];
                g = "?"
            } else g = "&";
            var s = g + "FilterField" + b[1] + "=" + k + "&FilterValue" + b[1] + "=" + escapeProperly(o);
            a = a.replace(d, s);
            a = a.replace("Filter=1&", "");
            a = a.replace("&Filter=1", "")
        }
    }
    b = a.match("FilterField([0-9]+)=");
    if (!b) a = a + "&FilterClear=1";
    else a = a.replace("&FilterClear=1", "");
    l.query = a;
    a = l.ToString();
    if (u) {
        var m = a.indexOf("?");
        m = a.substr(m + 1).indexOf("?");
        if (m >= 0) debugger;
        return a
    } else _SubmitFormPost(a)
}
function CanonicalizeUrlEncodingCase(c) {
    a: ;
    for (var b = "", a = 0; a < c.length; a++) {
        var d = c.charAt(a);
        if (d == "%" && a + 2 < c.length) {
            b += d;
            a++;
            b += c.charAt(a).toString().toUpperCase();
            a++;
            b += c.charAt(a).toString().toUpperCase()
        } else b += d
    }
    return b
}
function _SetControlValue(b, c) {
    a: ;
    var a = document.getElementById(b);
    if (a != null) a.value = c
}
var bValidSearchTerm = false;

function SetSearchView() {
    a: ;
    if (typeof bValidSearchTerm != "undefined") bValidSearchTerm = true
}
function GroupCollapse() {
    a: ;
    return typeof _groupCollapse != "undefined" && _groupCollapse
}
function HandleFilter(c, b) {
    a: ;
    if (FV4UI()) {
        var a;
        try {
            a = typeof inplview.HandleFilterReal
        } catch (g) {
            a = "undefined"
        }
        if (a != "undefined") inplview.HandleFilterReal(c, b);
        else {
            var f = "inplview.HandleFilterReal",
                d = f.split(".");
            if (d.length > 1) {
                var e = function () {
                    a: ;
                    inplview.HandleFilterReal(c, b)
                };
                EnsureScript(d[0], a, e)
            }
        }
        return
    }
    _SubmitFormPost(b)
}
function _SubmitFormPost(a, d, c) {
    a: ;
    if (typeof MSOWebPartPageFormName != "undefined") {
        var b = document.forms[MSOWebPartPageFormName];
        if (null != b) if (d != undefined && d == true || !b.onsubmit || b.onsubmit() != false) {
            typeof WebForm_OnSubmit == "function" && WebForm_OnSubmit();
            if (window.location.search.match("[?&]IsDlg=1")) a += a.indexOf("?") == -1 ? "?IsDlg=1" : "&IsDlg=1";
            if (FV4UI()) try {
                currentTabId = SP.Ribbon.PageManager.get_instance().get_ribbon().get_selectedTabId();
                if (currentTabId) {
                    a = StURLSetVar2(a, "InitialTabId", escapeProperly(currentTabId));
                    a = StURLSetVar2(a, "VisibilityContext", "WSSTabPersistence")
                }
            } catch (e) { }
            if (c != undefined && c == true) {
                a = DemoteIntoFormBody(b, a, "owsfileref");
                a = DemoteIntoFormBody(b, a, "NextUsing")
            }
            b.action = STSPageUrlValidation(a);
            b.method = "POST";
            if (isPortalTemplatePage(a)) b.target = "_top";
            !bValidSearchTerm && _ClearSearchTerm("");
            b.submit()
        }
    }
}
function DemoteIntoFormBody(e, c, b) {
    a: ;
    var d = GetUrlKeyValue(b, false, c);
    if (d.length > 0) {
        var a = document.createElement("INPUT");
        if (a != null) {
            a.setAttribute("type", "hidden");
            a.setAttribute("id", b);
            a.setAttribute("name", b);
            a.setAttribute("value", d);
            e.appendChild(a);
            return RemoveUrlKeyValue(b, c)
        }
    }
    return c
}
function RemoveUrlKeyValue(c, a) {
    a: ;
    var b = new RegExp(c + "=[^&]*&");
    a = a.replace(b, "");
    b = new RegExp(c + "=[^&]*");
    a = a.replace(b, "");
    return a
}
function _RefreshPageTo(c, b, a) {
    a: ;
    return _SubmitFormPost(b, a)
}
var g_varSkipRefreshOnFocus = 0;

function RefreshOnFocus() {
    a: ;
    (typeof g_varSkipRefreshOnFocus == "undefined" || !g_varSkipRefreshOnFocus) && _RefreshPage(1)
}
function RefreshOnFocusForOneRow() {
    a: ;
    RefreshOnFocus()
}
function DisableRefreshOnFocus() {
    a: ;
    g_varSkipRefreshOnFocus = 1
}
function SetWindowRefreshOnFocus() {
    a: ;
    window.onbeforeunload = DisableRefreshOnFocus;
    window.onfocus = RefreshOnFocus
}
function RemoveParametersFromUrl(a) {
    a: ;
    var b = a.indexOf("?");
    if (b == -1) return a;
    else return a.substr(0, b)
}
function _GoToPageRelative(a) {
    a: ;
    if (a.substr(0, 4) != "http" && a.substr(0, 1) != "/") {
        var b = RemoveParametersFromUrl(window.location.href),
            c = b.lastIndexOf("/");
        if (c > 0) a = b.substring(0, c + 1) + a
    }
    GoToPage(a)
}
function _EnterFolder(c) {
    a: ;
    var b = RemoveParametersFromUrl(window.location.href),
        a = RemoveParametersFromUrl(c),
        d = a != null && a.length > 0 && a.charAt(0) == "/" && a.length < b.length && b.indexOf(a) == b.length - a.length;
    if (!d && a.toLowerCase() != b.toLowerCase()) STSNavigate(c);
    else _SubmitFormPost(c)
}
function _HandleFolder(q, c, r, h, d, g, l, j, p, b, a, k, m, i, f, o) {
    a: ;
    var n = b && b != "",
        e = a && a != "";
    if (n && e) return DispEx(q, c, h, d, g, l, j, p, b, a, k, m, i, f, o);
    else {
        c && CancelEvent(c);
        _EnterFolder(r);
        return false
    }
}
function UseDialogsForFormsPages(c) {
    a: ;
    if (!FV4UI()) return false;
    var b = null,
        a = GetUrlKeyValue("LISTID", false, c.toUpperCase());
    if (a == "") a = GetUrlKeyValue("LIST", false, c.toUpperCase());
    if (a != "" && g_ctxDict != null) for (var e in g_ctxDict) {
        var d = g_ctxDict[e];
        if (d.listName.toUpperCase() == a.toUpperCase()) {
            b = d;
            break
        }
    }
    if (b == null || !b.NavigateForFormsPages) return true;
    return false
}
function _EditItemWithCheckoutAlert(c, a, b, d, g, h, f, e) {
    a: ;
    if (CheckoutAlertBeforeNavigate(a, b, d, g, h, f, e)) if (b && UseDialogsForFormsPages(a)) NewOrEditV4Core(c, a, true);
    else _EditItem2(c, a)
}
function _STSNavigateWithCheckoutAlert(a, g, b, e, f, d, c) {
    a: ;
    CheckoutAlertBeforeNavigate(a, g, b, e, f, d, c) && STSNavigate(a)
}
function ShowInPopUI(b, a, c) {
    a: ;
    var d = function () {
        a: ;
        if (a == null && b.fromRibbon && b.currentCtx) a = b.currentCtx;
        if (typeof a != "undefined" && a != null && a.clvp != null) {
            var d = a.clvp;
            GetFocusInfo(b, d);
            d.ShowPopup(c)
        } else STSNavigate(c)
    };
    EnsureScript("inplview", typeof inplview, d)
}
function TakeOfflineToClientReal(d, c, h, b, a, g, f) {
    a: ;
    try {
        if (TakeOfflineDisabled(d, c, b, a)) return;
        g_OfflineClient != null && g_OfflineClient.TakeOffline(d, c, h, b, a, g, f)
    } catch (e) {
        alert(e.message)
    }
}
function CheckoutAlertBeforeNavigate(g, f, d, c, e, a, b) {
    a: ;
    if (typeof a == "undefined" || a == null || a == "") a = currentItemCheckedOutUserId;
    if ((typeof b == "undefined" || b == null || b == "") && typeof ctx != "undefined") b = ctx.CurrentUserId;
    if (d == "1") {
        alert(L_CannotEditPropertyForLocalCopy_Text);
        return false
    }
    if (a != null && a != "" && b != null && a != b) {
        alert(L_CannotEditPropertyCheckout_Text);
        return false
    }
    if (f == "1") if (confirm(L_ConfirmCheckout_Text)) {
        if (c.charAt(0) == "/" || c.substr(0, 3).toLowerCase() == "%2f") c = document.location.protocol + "//" + document.location.host + c;
        return CheckoutviaXmlhttp(e, c)
    } else return false;
    return true
}
function CheckoutviaXmlhttp(c, b) {
    a: ;
    var a, e;
    a = new XMLHttpRequest;
    if (a == null) return false;
    a.open("POST", c + "/_vti_bin/lists.asmx", false);
    a.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    a.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/CheckOutFile");
    var d = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CheckOutFile xmlns="http://schemas.microsoft.com/sharepoint/soap/"><pageUrl>' + b + "</pageUrl></CheckOutFile></soap:Body></soap:Envelope>";
    a.send(d);
    if (a.status == 200 && a.responseText.indexOf("true") != 0) return true;
    else return false
}
var g_ExtensionNotSupportCheckoutToLocal = ["ascx", "asp", "aspx", "htm", "html", "master", "odc", "exe", "bat", "com", "cmd", "onetoc2"],
    g_ExtensionDefaultForRead = ["jpg", "jpeg", "bmp", "png", "gif", "onetoc2", "one", "odc"];

function FSupportCheckoutToLocal(a) {
    a: ;
    var c = true;
    if (a == null || a == "") return false;
    a = a.toLowerCase();
    for (var b = 0, b = 0; b < g_ExtensionNotSupportCheckoutToLocal.length; b++) if (a == g_ExtensionNotSupportCheckoutToLocal[b]) return false;
    return true
}
function FDefaultOpenForReadOnly(a) {
    a: ;
    var c = false;
    if (a == null || a == "") return true;
    a = a.toLowerCase();
    for (var b = 0, b = 0; b < g_ExtensionDefaultForRead.length; b++) if (a == g_ExtensionDefaultForRead[b]) return true;
    return false
}
function CheckoutDocument(g, a, e) {
    a: ;
    var d = null,
        b = true,
        c = false;
    if (a.charAt(0) == "/" || a.substr(0, 3).toLowerCase() == "%2f") a = document.location.protocol + "//" + document.location.host + a;
    var f = SzExtension(unescapeProperly(a));
    if (FSupportCheckoutToLocal(f) && e == "SharePoint.OpenDocuments.3") d = StsOpenEnsureEx2(e);
    if (d != null) try {
        b = d.CheckoutDocumentPrompt(unescapeProperly(a), false, "");
        b && RefreshOnFocus();
        c = b;
        if (c || !(IsSupportedMacBrowser() || IsSupportedFirefoxOnWin())) return b
    } catch (i) { }
    if (!c) {
        var h = "FileName=" + escapeProperly(unescapeProperly(a)) + "&Checkout=true";
        NavigateToCheckinAspx(g, h)
    }
    return true
}
function NewOrEditV4Core(a, b, c) {
    a: ;
    if (a != null) {
        var d = function () {
            a: ;
            var b = CLVPFromEventReal(a);
            GetFocusInfo(a, b)
        };
        EnsureScript("inplview", typeof InitAllClvps, d)
    }
    if (c) _OpenPopUpPage(b, RefreshOnDialogClose);
    else _OpenPopUpPage(b, RefreshPage);
    return false
}
function _NewItem2(b, a) {
    a: ;
    if (UseDialogsForFormsPages(a)) return NewOrEditV4Core(b, a);
    else _NewItem(a)
}
function _NewItem(a) {
    a: ;
    GoToPage(a)
}
function _EditItem2(b, a) {
    a: ;
    if (UseDialogsForFormsPages(a)) return NewOrEditV4Core(b, a);
    _EditItem(a)
}
function _EditItem(a) {
    a: ;
    GoToPage(a)
}
function _CorrectUrlForRefreshPageSubmitForm() {
    a: ;
    var a = window.location.hash;
    if (a.indexOf("ServerFilter=") == 1) {
        a = a.replace(/-/g, "&").replace(/&&/g, "-");
        var d = GetUrlKeyValue("RootFolder", true, a),
            c = GetUrlKeyValue("RootFolder", true);
        if ("" == d && "" != c) a += "&RootFolder=" + c;
        var b = new CUrl(window.location.href);
        b.hash = "";
        b.query = "?" + a.substr("ServerFilter=".length + 1);
        return b.ToString()
    } else return window.location.href
}
function _RefreshPage(a) {
    a: ;
    if (a == 1) _SubmitFormPost(_CorrectUrlForRefreshPageSubmitForm());
    else {
        var b = function () {
            a: ;
            SetFocusBack(a)
        };
        EnsureScript("inplview", typeof InitAllClvps, b)
    }
}
function RefreshOnDialogClose() {
    a: ;
    _RefreshPage(SP.UI.DialogResult.OK)
}
function OpenPopUpPageWithTitle(f, b, e, c, d) {
    a: ;
    var g = function () {
        a: ;
        var a = {
            url: f,
            args: null,
            title: d,
            dialogReturnValueCallback: b,
            width: e,
            height: c
        },
                g = SP.UI.ModalDialog.showModalDialog(a)
    },
        a;
    try {
        a = typeof SP.UI.ModalDialog.showModalDialog
    } catch (h) {
        a = "undefined"
    }
    EnsureScript("SP.UI.Dialog.js", a, g)
}
function _OpenPopUpPage(d, a, c, b) {
    a: ;
    OpenPopUpPageWithTitle(d, a, c, b, null)
}
function _RemoveQueryStringsAndHash(a) {
    a: ;
    if (a) {
        var b = a.indexOf("#");
        if (b >= 0) a = a.substr(0, b);
        b = a.indexOf("?");
        if (b >= 0) a = a.substr(0, b)
    }
    return a
}
function _OpenCreateWebPageDialog(a) {
    a: ;
    if (!a && typeof _spPageContextInfo != "undefined" && _spPageContextInfo.webServerRelativeUrl) {
        a = _spPageContextInfo.webServerRelativeUrl;
        if (a.charAt(a.length - 1) != "/") a = a + "/";
        a = a + "_layouts/createwebpage.aspx"
    }
    var b = window.location.href;
    b = _RemoveQueryStringsAndHash(b);
    a = StURLSetVar2(a, "Url", escapeProperly(b));
    if (FV4UI()) {
        var d = parseInt(L_CreateWebPageDialogWidth_Text),
            c = parseInt(L_CreateWebPageDialogHeight_Text);
        if (isNaN(d)) d = 400;
        if (isNaN(c)) c = 250;
        _OpenPopUpPage(a, null, d, c)
    } else GoToPage(a)
}
function PreventDefaultNavigation() {
    a: ;
    var a = window.event;
    if (a) if (!a.preventDefault) a.returnValue = false;
    else a.preventDefault()
}
function _EditLink2(a, b) {
    a: ;
    var c = function () {
        a: ;
        var d = GetGotoLinkUrl(a);
        if (d == null) return;
        var c = window["ctx" + b];
        if (c != null && c.clvp != null) {
            var e = c.clvp;
            if (FV4UI() && !c.NavigateForFormsPages) {
                PreventDefaultNavigation();
                e.ShowPopup(d);
                return false
            }
        }
        GoToLink(a)
    };
    EnsureScript("inplview", typeof inplview, c)
}
function EditLink(a, b) {
    a: ;
    if (FV4UI()) EditLink2(a, b);
    else GotoLink(a)
}
function _GoBack(a) {
    a: ;
    window.location.href = unescapeProperly(GetSource(a))
}
function _ReplyItem(a, b, d, c) {
    a: ;
    if (b.length >= 504) {
        var L_ReplyLimitMsg_Text = "无法答复此线索。已达到答复限制。";
        alert(L_ReplyLimitMsg_Text)
    } else {
        a += "?Threading=" + b;
        a += "&Guid=" + d;
        a += "&Subject=" + c;
        GoToPage(a)
    }
}
function GoBacktoCurrentIssue(a, b) {
    a: ;
    a += "?ID=" + b;
    GoToPage(a)
}
function _ExportToDatabase(d, e, f, c) {
    a: ;
    if (g_expDatabase == null) {
        var a = GetCookie("databaseBtnText");
        if (a != null && a != "0") try {
            g_expDatabase = new ActiveXObject("SharePoint.ExportDatabase")
        } catch (b) {
            return null
        } else if (a == null) GetDataBaseInstalled();
        else return null
    }
    if (g_expDatabase != null) {
        var L_NoWSSClient_Text = "若要导出列表，必须具有与 Microsoft SharePoint Foundation 兼容的应用程序和 Microsoft Internet Explorer 7.0 或更高版本。",
            L_ExportDBFail_Text = "导出到数据库失败。若要导出列表，必须具有与 Microsoft SharePoint Foundation 兼容的应用程序。";
        if (browseris.ie5up && browseris.win32) try {
            g_expDatabase.SiteUrl = makeAbsUrl(d);
            g_expDatabase.ListID = e;
            g_expDatabase.ViewID = f;
            g_expDatabase.DoExport(c)
        } catch (b) {
            alert(L_ExportDBFail_Text);
            return
        } else alert(L_NoWSSClient_Text)
    }
}
function _ExportList(a) {
    a: ;
    g_ssImporterObj == null && EnsureSSImporter();
    if (g_ssImporterObj == null) (g_fSSImporter || GetCookie("EnsureSSImporter") == null) && EnsureSSImporter(true);
    var L_ExportListSpreadsheet_Text = "若要导出列表，必须具有与 Microsoft SharePoint Foundation 兼容的应用程序。";
    if (IsSupportedMacBrowser()) {
        if (g_fSSImporter && g_ssImporterObj.IqyExportEnabled) {
            var b = g_ssImporterObj.IqyExport(makeAbsUrl(a));
            if (!b) window.location.href = STSPageUrlValidation(makeAbsUrl(a))
        } else if (confirm(L_ExportListSpreadsheet_Text)) window.location.href = STSPageUrlValidation(makeAbsUrl(a))
    } else if (g_fSSImporter && g_ssImporterObj.IqyImportEnabled() || confirm(L_ExportListSpreadsheet_Text)) window.location.href = STSPageUrlValidation(makeAbsUrl(a))
}
function ExportDiagram(m, f, l, g, i, h) {
    a: ;
    if (g_objDiagramLaunch == null) {
        var a = GetCookie("digInstalled");
        if (a != null && a != "0") try {
            g_objDiagramLaunch = new ActiveXObject("DiagramLaunch.DiagramLauncher")
        } catch (b) {
            return null
        } else if (a == null) GetDiagramLaunchInstalled();
        else return null
    }
    try {
        var d = "",
            j = m,
            e = h,
            c = f,
            k = l;
        g_objDiagramLaunch.CreateDiagram(d, j, e, c, g, i, k)
    } catch (b) {
        var L_DiagramLaunchFail_Text = "无法创建图表。";
        alert(L_DiagramLaunchFail_Text)
    }
}
function OpenTasks(m, f, l, g, i, h) {
    a: ;
    if (g_objProjectTaskLaunch == null) {
        var a = GetCookie("projInstalled");
        if (a != null && a != "0") try {
            g_objProjectTaskLaunch = new ActiveXObject("TaskLaunch.TaskLauncher")
        } catch (b) {
            return null
        } else if (a == null) GetProjectTaskLaunchInstalled();
        else return null
    }
    if (g_objProjectTaskLaunch != null) try {
        var d = "",
            j = m,
            e = h,
            c = f,
            k = l;
        g_objProjectTaskLaunch.OpenTasks(d, j, e, c, g, i, k)
    } catch (b) {
        var L_OpenTasksFail_Text = "无法打开任务。";
        alert(L_OpenTasksFail_Text)
    }
}
var ListCtrlObj, fListControl = false,
    fListErrorShown = false,
    L_EditInGrid_Text = "由于下列一个或多个原因，列表不能在“数据表”视图中显示: \n\n- 没有安装与 Microsoft SharePoint Foundation 兼容的数据表组件。\n- 您的 Web 浏览器不支持 ActiveX 控件。\n- 组件未正确配置以获取 32 位或 64 位支持。";

function CatchListCreateError() {
    a: ;
    alert(L_EditInGrid_Text);
    fListErrorShown = true;
    return false
}
function EnsureListControl() {
    a: ;
    if (!fListControl) {
        fListErrorShown = false;
        if (browseris.ie5up && browseris.win32) {
            var b = 'try{    ListCtrlObj=new ActiveXObject("ListNet.ListNet");    if (ListCtrlObj)        fListControl=true;} catch (e){    fListControl=false;};',
                a = new Function(b);
            a()
        } else {
            window.onerror = CatchListCreateError;
            ListCtrlObj = new ActiveXObject("ListNet.ListNet");
            if (ListCtrlObj) fListControl = true
        }
    }
    ListCtrlObj = null;
    return fListControl
}
var L_NoQuestion_Text = "此调查没有包含问题。",
    L_NoVoteAllowed_Text = "不允许再次答复此调查。";

function IsVoteOK(a) {
    a: ;
    if (1 == a) alert(L_NoQuestion_Text);
    else if (2 == a) alert(L_NoVoteAllowed_Text);
    else return true
}
function hasHighChar(b) {
    a: ;
    for (var a = 0, a = 0; a < b.length; a++) if (b.charCodeAt(a) > 127) return true;
    return false
}
function _ClearSearchTerm(a) {
    a: ;
    if (typeof MSOWebPartPageFormName != "undefined") {
        var c = document.forms[MSOWebPartPageFormName];
        if (null != c) if (a != null) {
            var b = c["SearchString" + a];
            if (b != null) b.value = ""
        }
    }
    bValidSearchTerm = true
}
function _SubmitSearchRedirect(a) {
    a: ;
    var b = document.forms["frmSiteSearch"];
    if (b == null) if (typeof MSOWebPartPageFormName != "undefined") b = document.forms[MSOWebPartPageFormName];
    if (b != null) {
        var c = b.elements["SearchString"].value.trim();
        if (c === L_SharepointSearch_Text || c === "") return false;
        a = a + "?k=" + escapeProperly(c);
        var e = b.elements["SearchScope"];
        if (e != null) {
            var d = e.value;
            if (d) a = a + "&u=" + escapeProperly(d)
        }
        window.location.href = a
    }
    return false
}
function ShowGridUrlInHTML(a) {
    a: ;
    if (a.indexOf("?") > 0) a = a + "&";
    else a = a + "?";
    a = a + "ShowInGrid=HTML";
    return a
}
function SearchOnBodyLoad() {
    a: ;
    var a = document.getElementById("idSearchString");
    if (a != null && (a.value.trim() === L_SharepointSearch_Text || a.value.trim() === "")) a.className = "ms-sharepointsearchtext"
}
function SearchOnBlur() {
    a: ;
    var a = document.getElementById("idSearchString");
    if (a != null && a.value.trim() === "") {
        a.value = L_SharepointSearch_Text;
        a.className = "ms-sharepointsearchtext"
    }
}
function SearchOnFocus() {
    a: ;
    var a = document.getElementById("idSearchString");
    if (a != null && a.value.trim() === L_SharepointSearch_Text) {
        a.value = "";
        a.className = "ms-searchtext"
    }
}
function SubmitSearch() {
    a: ;
    _SubmitSearchForView("")
}
function _SubmitSearchForView(e) {
    a: ;
    var a = document.forms[0],
        c = "SearchString" + e,
        d = a.elements[c].value;
    if ("" == d) {
        var L_Enter_Text = "请输入一个或多个要搜索的单词。";
        alert(L_Enter_Text);
        a.elements[c].focus()
    } else {
        var b;
        b = RemovePagingArgs(a.action);
        if (typeof bGridViewPresent != "undefined" && bGridViewPresent) b = ShowGridUrlInHTML(b);
        a.action = b;
        a.submit()
    }
}
function IsKeyDownSubmit(a) {
    a: ;
    if (a != null) {
        var c, b;
        if (browseris.ie) {
            c = a.keyCode;
            b = a.altKey || a.ctrlKey
        } else {
            c = a.which;
            b = a.modifers & (a.ALT_MASK | a.CONTROL_MASK)
        }
        if (c == 13 && !b) return true
    }
    return false
}
function SearchViewKeyDown(a) {
    a: ;
    IsKeyDownSubmit(event) && _SubmitSearchForView(a)
}
function SearchKeyDown(b, a) {
    a: ;
    if (IsKeyDownSubmit(b)) {
        _SubmitSearchRedirect(a);
        return false
    }
    return true
}
function SearchKeyDownGoSearch(a) {
    a: ;
    if (IsKeyDownSubmit(a)) {
        GoSearch();
        return false
    }
    return true
}
function _AlertAndSetFocus(b, a) {
    a: ;
    a.focus();
    a.select();
    window.alert(b)
}
function _AlertAndSetFocusForDropdown(b, a) {
    a: ;
    a.focus();
    window.alert(b)
}
function setElementValue(c, b) {
    a: ;
    var a = document.getElementsByName(c).item(0);
    if (a == null) return false;
    a.value = b;
    return true
}
function GetMultipleSelectedText(b) {
    a: ;
    if (b) {
        var a;
        a = "";
        for (var c = 0; c < b.options.length; c++) if (b.options[c].selected) a += "," + b.options[c].text;
        if (a.length > 0) a = a.substring(1);
        return a
    } else return ""
}
function GetCBSelectedValues(c) {
    a: ;
    if (c == null) return;
    var a = {};
    a.strList = "";
    a.fAllChecked = true;
    for (var d = 0; d < c.elements.length; d++) {
        var b = c.elements[d];
        if (b.type == "checkbox" && !b.disabled) if (b.checked) {
            if (a.strList != "") a.strList += ",";
            a.strList += b.value
        } else a.fAllChecked = false
    }
    return a
}
var fNewDoc = false,
    fNewDoc2 = false,
    fNewDoc3 = false,
    L_EditDocumentProgIDError_Text = "“编辑文档”需要使用与 Microsoft SharePoint Foundation 兼容的应用程序和 Web 浏览器。",
    L_EditDocumentRuntimeError_Text = "无法打开文档进行编辑。找不到与 Microsoft SharePoint Foundation 兼容的应用程序来编辑该文档。",
    L_SPDesignerDownloadWindow_Text = "Microsoft SharePoint Designer",
    SPDesignerDownloadUrl = "http://r.office.microsoft.com/r/rlidBrowserToSPD",
    SPDesignerProgID = "SharePoint.WebPartPage.Document";

function editDocumentWithProgID(a, b) {
    a: ;
    if (fNewDoc) {
        if (a.charAt(0) == "/" || a.substr(0, 3).toLowerCase() == "%2f") a = document.location.protocol + "//" + document.location.host + a;
        if (!fNewDoc2 && !fNewDoc3) !EditDocumentButton.EditDocument(a, b) && alert(L_EditDocumentRuntimeError_Text);
        else !EditDocumentButton.EditDocument2(window, a, b) && alert(L_EditDocumentRuntimeError_Text)
    } else alert(L_EditDocumentProgIDError_Text)
}
function GetSPDDownLoadUrl() {
    a: ;
    var a = navigator.userLanguage;
    if (!a) a = navigator.browserLanguage;
    return SPDesignerDownloadUrl + "?clid=" + a
}
function EditInSPD(a, d) {
    a: ;
    var b = GetSPDDownLoadUrl();
    if (a.charAt(0) == "/") a = document.location.protocol + "//" + document.location.host + a;
    var c = StsOpenEnsureEx2("SharePoint.OpenDocuments.3");
    if (c != null) {
        if (!c.EditDocument3(window, a, false, SPDesignerProgID)) OpenPopUpPageWithTitle(b, null, null, null, L_SPDesignerDownloadWindow_Text);
        else if (d) window.onfocus = RefreshOnNextFocus
    } else OpenPopUpPageWithTitle(b, null, null, null, L_SPDesignerDownloadWindow_Text)
}
function editDocumentWithProgID2(e, b, h, g, f, c) {
    a: ;
    var a = editDocumentWithProgIDNoUI(e, b, h, g, f, c);
    if (a == 1) {
        if (b == SPDesignerProgID) {
            var d = GetSPDDownLoadUrl();
            OpenPopUpPageWithTitle(d, null, null, null, L_SPDesignerDownloadWindow_Text)
        } else alert(L_EditDocumentRuntimeError_Text);
        window.onfocus = RefreshOnNextFocus
    } else a == 2 && alert(L_EditDocumentProgIDError_Text)
}
function editDocumentWithProgIDNoUI(a, c, d, h, k, i) {
    a: ;
    var b, l, g = false;
    d = d.replace(/(?:\.\d+)$/, "");
    if (a.charAt(0) == "/" || a.substr(0, 3).toLowerCase() == "%2f") a = document.location.protocol + "//" + document.location.host + a;
    var j = SzExtension(unescapeProperly(a));
    if (FSupportCheckoutToLocal(j)) try {
        b = StsOpenEnsureEx2(d + ".3");
        if (b != null) {
            if (h == "1") {
                if (!b.CheckoutDocumentPrompt(a, true, c)) return 1
            } else {
                if (i == "1") g = true;
                if (!b.EditDocument3(window, a, g, c)) return 1
            }
            var f = false;
            f = b.PromptedOnLastOpen();
            if (f) window.onfocus = RefreshOnNextFocus;
            else SetWindowRefreshOnFocus();
            return
        }
    } catch (e) { }
    if (h == "1") if (confirm(L_ConfirmCheckout_Text)) NavigateToCheckinAspx(k, "FileName=" + escapeProperly(unescapeProperly(a)) + "&Checkout=true");
    else return;
    b = StsOpenEnsureEx2(d);
    if (b != null) {
        try {
            if (!b.EditDocument2(window, a, c)) return 1;
            window.onfocus = RefreshOnNextFocus;
            return
        } catch (e) { }
        try {
            window.onfocus = null;
            if (SzExtension(a) == "ppt" && c == "") c = "PowerPoint.Slide";
            if (!b.EditDocument(a, c)) return 1;
            SetWindowRefreshOnFocus();
            return
        } catch (e) {
            return 2
        }
    }
    return 1
}
function RefreshOnNextFocus() {
    a: ;
    SetWindowRefreshOnFocus()
}
function createNewDocumentWithProgID2Ex(f, b, a, d, c, e) {
    a: ;
    createNewDocumentWithProgID2(b, a, d, c, e)
}
function createNewDocumentWithProgID2(b, a, e, d, c) {
    a: ;
    !createNewDocumentWithProgIDCore(b, a, e, c, false) && createNewDocumentWithProgIDCore(b, a, d, c, true)
}
function createNewDocumentWithProgIDEx(e, b, a, c, d) {
    a: ;
    createNewDocumentWithProgID(b, a, c, d)
}
function createNewDocumentWithProgID(b, a, c, d) {
    a: ;
    createNewDocumentWithProgIDCore(b, a, c, d, true)
}
function createNewDocumentWithProgIDCore(d, c, e, h, g) {
    a: ;
    var a, L_NewDocumentRuntimeError_Text, L_NewDocumentError_Text, b = false;
    if (h) var L_NewDocumentRuntimeError_Text = L_NewFormLibTb1_Text,
        L_NewDocumentError_Text = L_NewFormLibTb2_Text;
    else var L_NewDocumentRuntimeError_Text = L_NewDocLibTb1_Text,
        L_NewDocumentError_Text = L_NewDocLibTb2_Text;
    try {
        a = StsOpenEnsureEx2(e + ".2");
        !a.CreateNewDocument2(window, d, c) && alert(L_NewDocumentRuntimeError_Text);
        b = a.PromptedOnLastOpen();
        if (b) window.onfocus = RefreshOnNextFocus;
        else SetWindowRefreshOnFocus();
        return true
    } catch (f) { }
    try {
        a = StsOpenEnsureEx2(e + ".1");
        window.onfocus = null;
        !a.CreateNewDocument(d, c) && alert(L_NewDocumentRuntimeError_Text);
        SetWindowRefreshOnFocus();
        return true
    } catch (f) {
        g && alert(L_NewDocumentError_Text)
    }
}
function createNewDocumentWithRedirect2(h, d, b, e, f, c, g, a) {
    a: ;
    createNewDocumentWithRedirect(d, b, e, f, c, g, a)
}
function createNewDocumentWithRedirect(e, a, b, f, d, g, c) {
    a: ;
    if (g) if (IsClientAppInstalled(b)) createNewInClient(e, a, b, f);
    else createNewInBrowser(d, a, c);
    else if (IsClientAppInstalled(b) && c != 1) createNewInClient(e, a, b, f);
    else createNewInBrowser(d, a, c)
}
function createNewInClient(c, b, d, e) {
    a: ;
    var a = d.replace(/(?:\.\d+)$/, "");
    createNewDocumentWithProgID(c, b, a, e)
}
function createNewInBrowser(a, c, b) {
    a: ;
    a = a + "&SaveLocation=" + makeAbsUrl(escapeProperly(c));
    a = AddSourceToUrl(a);
    a = a + "&DefaultItemOpen=" + b;
    STSNavigate(a)
}
function LRUCache() {
    a: ;
    this.state = [];
    this.ageStack = [];
    this.count = 0
}
function LRUCache_Add(a, b) {
    a: ;
    if (!a) return;
    oldAge = a.state[b];
    if (oldAge != null) a.ageStack[oldAge] = null;
    else a.count++;
    age = a.ageStack.length;
    a.state[b] = age;
    a.ageStack.push(b)
}
function LRUCache_Remove(a, b) {
    a: ;
    if (!a) return;
    age = a.state[b];
    if (age != null) {
        a.ageStack[age] = null;
        a.state[b] = null;
        a.count--
    }
}
function _AddGroupToCookie(c) {
    a: ;
    var a = ExpGroupFetchWebPartID(c);
    if (a == null) return;
    LRUCache_Add(g_ExpGroupWPState, a);
    if (g_ExpGroupTable[a] == null) g_ExpGroupTable[a] = new LRUCache;
    var b = ExpGroupFetchGroupString(c);
    if (b == null) return;
    LRUCache_Add(g_ExpGroupTable[a], b);
    ExpGroupRenderCookie()
}
function _RemoveGroupFromCookie(d) {
    a: ;
    var a = ExpGroupFetchWebPartID(d);
    if (a == null) return;
    if (g_ExpGroupTable[a] == null) return;
    LRUCache_Add(g_ExpGroupWPState, a);
    var c = ExpGroupFetchGroupString(d);
    if (c == null) return;
    var b;
    for (b in g_ExpGroupTable[a].state) g_ExpGroupTable[a].state[b] != null && b.substring(0, c.length) == c && LRUCache_Remove(g_ExpGroupTable[a], b);
    ExpGroupRenderCookie()
}
function ExpGroupRenderCookie() {
    a: ;
    if (!g_ExpGroupWPState) return;
    for (var c = ExpGroupWPListName + "=", a = 0, d = g_ExpGroupWPState.ageStack.length - 1; d >= 0; d--) if (g_ExpGroupWPState.ageStack[d] != null) {
        var b = g_ExpGroupWPState.ageStack[d];
        if (a == ExpGroupMaxWP) {
            DeleteCookie(ExpGroupCookiePrefix + b);
            break
        } else if (g_ExpGroupTable[b] == null) {
            a++;
            if (a > 1) c += escape(ExpGroupCookieDelimiter);
            c += escape(b)
        } else if (g_ExpGroupTable[b].count == 0) DeleteCookie(ExpGroupCookiePrefix + b);
        else if (a < ExpGroupMaxWP) {
            a++;
            ExpGroupRenderCookieForWebPart(b);
            if (a > 1) c += escape(ExpGroupCookieDelimiter);
            c += escape(b)
        }
    }
    if (a == 0) DeleteCookie(ExpGroupWPListName);
    else document.cookie = c
}
function ExpGroupRenderCookieForWebPart(a) {
    a: ;
    if (!g_ExpGroupTable[a].ageStack) return;
    for (var d = ExpGroupCookiePrefix + a + "=", e = true, c = g_ExpGroupTable[a].ageStack.length - 1; c >= 0; c--) if (g_ExpGroupTable[a].ageStack[c] != null) {
        var f = g_ExpGroupTable[a].ageStack[c],
            b = "";
        if (!e) b += escape(ExpGroupCookieDelimiter);
        b += escape(f);
        if (d.length + b.length <= ExpGroupMaxCookieLength) {
            d += b;
            e = false
        }
    }
    document.cookie = d + ";"
}
function ExpDataViewGroupOnPageLoad() {
    a: ;
    ExpGroupOnPageLoad("PageLoad")
}
function ExpGroupOnPageLoad(a) {
    a: ;
    flag = document.getElementById("GroupByColFlag");
    if (flag != null) {
        g_ExpGroupNeedsState = true;
        ExpGroupParseCookie(a)
    }
}
function ExpGroupParseCookie(e) {
    a: ;
    var c = GetCookie(ExpGroupWPListName);
    if (c == null) return;
    g_ExpGroupParseStage = true;
    for (var d = c.split(ExpGroupCookieDelimiter), b = d.length - 1; b >= 0; b--) {
        var a = d[b];
        LRUCache_Add(g_ExpGroupWPState, a);
        if (g_ExpGroupTable[a] == null) document.getElementById("GroupByCol" + a) != null && ExpGroupParseCookieForWebPart(a, e)
    }
    g_ExpGroupParseStage = false;
    g_ExpGroupQueue.length > 0 && ExpGroupFetchData(g_ExpGroupQueue.shift(), e)
}
function ExpGroupParseCookieForWebPart(d, l) {
    a: ;
    var k = GetCookie(ExpGroupCookiePrefix + d);
    if (k == null) return;
    var m = k.split(ExpGroupCookieDelimiter),
        a;
    g_ExpGroupTable[d] = new LRUCache;
    for (a = m.length - 1; a >= 0; a--) {
        var h = m[a];
        LRUCache_Add(g_ExpGroupTable[d], h)
    }
    var c = [],
        n = document.getElementById("GroupByCol" + d).parentNode;
    tbodyTags = n.getElementsByTagName("TBODY");
    for (a = 0; a < tbodyTags.length; a++) {
        var h = tbodyTags[a].getAttribute("groupString");
        if (h != null) {
            var i = tbodyTags[a].id;
            if (i == null) continue;
            var b = i.substring(4, i.length);
            if (g_ExpGroupTable[d].state[h] != null && c[b] == null) {
                ExpCollGroup(b, "img_" + b, l);
                c[b] = true;
                tbody = document.getElementById("tbod" + b + "_");
                if (tbody != null) {
                    isLoaded = tbody.getAttribute("isLoaded");
                    isLoaded == "false" && g_ExpGroupQueue.push(b)
                }
            }
        }
    }
    var e;
    for (e in c) {
        var j = e.indexOf("_");
        if (j != e.length - 1 && j != -1) {
            var f = e.substring(0, j + 1);
            if (c[f] == null) {
                var g = ExpGroupFetchGroupString(f);
                if (g != null) {
                    LRUCache_Add(g_ExpGroupWPState, g);
                    ExpCollGroup(f, "img_" + f, l);
                    c[g] = true
                }
            }
        }
    }
}
function _ExpGroupBy(e) {
    a: ;
    if (browseris.w3c && !browseris.ie) document.all = document.getElementsByTagName("*");
    docElts = document.all;
    numElts = docElts.length;
    images = e.getElementsByTagName("IMG");
    img = images[0];
    srcPath = img.src;
    index = srcPath.lastIndexOf("/");
    imgName = srcPath.slice(index + 1);
    var b = "auto";
    if (imgName == "plus.gif") {
        b = "";
        img.src = "/_layouts/images/minus.gif"
    } else {
        b = "none";
        img.src = "/_layouts/images/plus.gif"
    }
    oldName = img.name;
    img.name = img.alt;
    img.alt = oldName;
    spanNode = img;
    while (spanNode != null) {
        spanNode = spanNode.parentNode;
        if (spanNode != null && spanNode.id != null && spanNode.id.length > 5 && spanNode.id.substr(0, 5) == "group") break
    }
    parentNode = spanNode;
    while (parentNode != null) {
        parentNode = parentNode.parentNode;
        if (parentNode != null && parentNode.tagName == "TABLE") break
    }
    lastNode = null;
    if (parentNode != null) {
        lastNode = parentNode.lastChild;
        if (lastNode != null && lastNode.tagName == "TBODY") lastNode = lastNode.lastChild;
        if (lastNode != null && lastNode.tagName == "TR" && lastNode.lastChild != null) lastNode = lastNode.lastChild
    }
    for (var c = 0; c < numElts; c++) {
        var a = docElts.item(c);
        if (a == spanNode) break
    }
    ID = spanNode.id.slice(5);
    displayStyle = b;
    for (var d = c + 1; d < numElts; d++) {
        var a = docElts.item(d);
        if (a.id.length > 5 && a.id.substr(0, 5) == "group") {
            curID = a.id.slice(5);
            if (curID <= ID) return
        }
        parentNode = a;
        while (parentNode != null) {
            parentNode = parentNode.parentNode;
            if (parentNode == spanNode) break
        }
        if (parentNode == spanNode) continue;
        if (a.id != null && a.id.substring(0, 5) == "group") b = displayStyle;
        if (a.id != null && a.id.substring(0, 8) == "footer" + ID) b = displayStyle;
        if (displayStyle != "none" && a != img && a.tagName == "IMG" && a.src != null) if (a.src.slice(a.src.length - 25) == "/_layouts/images/plus.gif") b = "none";
        else if (a.src.slice(a.src.length - 26) == "/_layouts/images/minus.gif") b = "";
        if (a.tagName == spanNode.tagName && a.id != "footer") a.style.display = b;
        if (a.tagName == "TABLE" && lastNode == null || a == lastNode) break
    }
}
function SzExtension(a) {
    a: ;
    var c = new String(a),
        b = /^.*\.([^\.]*)$/;
    return c.replace(b, "$1").toLowerCase()
}
function SzServer(a) {
    a: ;
    var c = new String(a),
        b = /^([^:]*):\/\/([^\/]*).*$/;
    return c.replace(b, "$1://$2")
}
var v_stsOpenDoc = null,
    v_strStsOpenDoc = null;

function NavigateParentOrSelf(b, a) {
    a: ;
    if (b.target == "_top") window.frameElement.navigateParent(a);
    else STSNavigate(a)
}
function StsOpenEnsureEx(a) {
    a: ;
    if (v_stsOpenDoc == null || v_strStsOpenDoc != a) if (window.ActiveXObject) try {
        v_stsOpenDoc = new ActiveXObject(a);
        v_strStsOpenDoc = a
    } catch (b) {
        v_stsOpenDoc = null;
        v_strStsOpenDoc = null
    }
    return v_stsOpenDoc
}
function _DispDocItem(b, a) {
    a: ;
    return _DispDocItemEx(b, "FALSE", "FALSE", "FALSE", a)
}
function _DispDocItemExWithServerRedirect(f, c, j, g, i, e, k, a) {
    a: ;
    var d = a != null && a != "",
        h = IsClientAppInstalled(e) && HasRights(16, 0);
    if (d) {
        a = a.substring(1);
        d = a != ""
    }
    if (d) if (k == 1 || !h) {
        var b = a;
        b = AddSourceToUrl(b);
        b = b + "&DefaultItemOpen=" + DocOpen.BROWSER;
        if (window.location.search.match("[?&]IsDlg=1")) window.frameElement.navigateParent(b);
        else if (c.shiftKey || c.ctrlKey) return true;
        else NavigateParentOrSelf(f, b);
        c.cancelBubble = true;
        c.returnValue = false;
        return false
    }
    return DispDocItemExWithEvent(f, c, j, g, i, e)
}
var L_OpenDocumentLocalError_Text = "此文档曾经过脱机编辑，但是没有配置用于从 SharePoint 打开此文档的应用程序。只能以只读方式打开该文档。";

function _DispDocItemEx(e, c, a, b, d) {
    a: ;
    return DispDocItemExWithEvent(e, null, c, a, b, d)
}
function DispDocItemExWithEvent(g, e, p, m, o, a) {
    a: ;
    itemTable = FindSTSMenuTable(g, "CTXName");
    if ((!browseris.ie || !browseris.win32) && !IsSupportedMacBrowser() && !IsSupportedFirefoxOnWin()) {
        if (browseris.ie) event.cancelBubble = false;
        var k = g.href;
        if (window.location.search.match("[?&]IsDlg=1")) window.frameElement.navigateParent(k);
        else STSNavigate(k);
        return false
    }
    var d, c, h, b = true,
        s = itemTable != null ? GetAttributeFromItemTable(itemTable, "Ext", "FileType") : "",
        j = "",
        r = document.getElementById("FileDialogViewTable");
    if (r != null) {
        if (browseris.ie) {
            event.cancelBubble = false;
            event.returnValue = false
        }
        return true
    }
    c = itemTable != null ? GetAttributeFromItemTable(itemTable, "Url", "ServerUrl") : "";
    if (c == null || c == "") c = g.href;
    else c = SzServer(g.href) + c;
    h = SzExtension(c);
    if (currentItemProgId == null && itemTable != null) currentItemProgId = GetAttributeFromItemTable(itemTable, "Type", "HTMLType");
    if (currentItemProgId != null) j = currentItemProgId;
    if (FDefaultOpenForReadOnly(h)) {
        if (a.indexOf("SharePoint.OpenDocuments") >= 0) a = "SharePoint.OpenDocuments.3"
    } else if (!FSupportCheckoutToLocal(h)) a = "";
    if (currentItemCheckedOutUserId == null && itemTable != null) currentItemCheckedOutUserId = itemTable.COUId;
    if (currentItemCheckedoutToLocal == null && itemTable != null) currentItemCheckedoutToLocal = GetAttributeFromItemTable(itemTable, "COut", "IsCheckedoutToLocal ");
    if (currentItemCheckedOutUserId != null && currentItemCheckedOutUserId != "" && currentItemCheckedOutUserId == ctx.CurrentUserId && (a == "" || a.indexOf("SharePoint.OpenDocuments") >= 0) && FSupportCheckoutToLocal(h) || a == "SharePoint.OpenDocuments") a = "SharePoint.OpenDocuments.3";
    var i = 2;
    if (a != "" && HasRights(16, 0)) {
        if (a.indexOf(".3") >= 0) i = 3;
        d = StsOpenEnsureEx2(a);
        if (d == null && i == 3) {
            a = a.replace(".3", ".2");
            d = StsOpenEnsureEx2(a);
            i = 2
        }
    }
    if (d != null) if (i == 2 || itemTable == null && currentItemCheckedOutUserId == null || ctx.isVersions == 1 && (itemTable == null || itemTable.isMostCur == "0")) {
        try {
            if (currentItemCheckedOutUserId != null && currentItemCheckedOutUserId != "" && (currentItemCheckedOutUserId == ctx.CurrentUserId || ctx.CurrentUserId == null)) if (currentItemCheckedoutToLocal == "1") {
                alert(L_OpenDocumentLocalError_Text);
                b = false
            } else b = d.EditDocument2(window, c, j);
            else b = d.ViewDocument2(window, c, j)
        } catch (l) {
            b = false
        }
        if (b) window.onfocus = RefreshOnNextFocus
    } else {
        var f = 0;
        if (currentItemCheckedOutUserId != "") if (currentItemCheckedOutUserId != ctx.CurrentUserId && ctx.CurrentUserId != null) f = 1;
        else if (currentItemCheckedoutToLocal == null || currentItemCheckedoutToLocal != "1") f = 2;
        else f = 4;
        else if (!HasRights(0, 4) || FDefaultOpenForReadOnly(h)) f = 1;
        else if (ctx.isForceCheckout == true) f = 3;
        try {
            b = d.ViewDocument3(window, c, f, j)
        } catch (l) {
            b = false
        }
        if (b) {
            var n = d.PromptedOnLastOpen();
            if (n) window.onfocus = RefreshOnNextFocus;
            else SetWindowRefreshOnFocus()
        }
    } else currentItemCheckedoutToLocal == "1" && alert(L_OpenDocumentLocalError_Text);
    if (d == null || !b) {
        if (p == "TRUE" && m == "TRUE" && o == "TRUE") {
            if (itemTable == null) return b;
            if (browseris.ie) {
                event.cancelBubble = true;
                event.returnValue = false
            } else if (IsSupportedMacBrowser() || IsSupportedFirefoxOnWin()) {
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation()
            }
            var q = new Function("return " + itemTable.getAttribute("CTXName") + ".HttpRoot;"),
                k = q() + "/_layouts/htmltrverify.aspx?doc=" + escapeProperly(c);
            if (window.location.search.match("[?&]IsDlg=1")) window.frameElement.navigateParent(k);
            else GoToPage(k)
        } else if (window.location.search.match("[?&]IsDlg=1")) window.frameElement.navigateParent(g.href);
        else STSNavigate(g.href);
        return false
    }
    if (browseris.ie) {
        event.cancelBubble = true;
        event.returnValue = false
    } else if (IsSupportedMacBrowser() || IsSupportedFirefoxOnWin()) {
        if (d != null && b) {
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation()
        }
        return true
    }
    return b
}
function DispDocItemEx2(d, a, i, f, h, l, k, c, e) {
    a: ;
    var n = false,
        m = e != null && e != "",
        g = IsClientAppInstalled(c) && HasRights(16, 0);
    if (m) if (k == 1 || !g) {
        var b = e;
        b = AddSourceToUrl(b);
        b = b + "&DefaultItemOpen=" + DocOpen.BROWSER;
        if (window.location.search.match("[?&]IsDlg=1")) window.frameElement.navigateParent(b);
        else if (a.shiftKey || a.ctrlKey) return true;
        else NavigateParentOrSelf(d, b);
        a.cancelBubble = true;
        a.returnValue = false;
        return false
    } else if (g) if (c == "" || c.indexOf("SharePoint.OpenDocuments") >= 0) return DispDocItemExWithEvent(d, a, i, f, h, l);
    else {
        if (!ViewDoc(d.href, c)) {
            var j = editDocumentWithProgIDNoUI(d.href, currentItemProgId, c, false, ctx.HttpRoot, "0");
            if (j == 1 || j == 2) {
                var b = AddSourceToUrl(e);
                if (window.location.search.match("[?&]IsDlg=1")) window.frameElement.navigateParent(b);
                else NavigateParentOrSelf(d, b)
            }
        }
        a.cancelBubble = true;
        a.returnValue = false;
        return false
    }
    return DispDocItemExWithEvent(d, a, i, f, h, c)
}
function DispDocItemExWithOutContext(o, n, e, a, d, i, g, m, k, b, h, j, f, c, l) {
    a: ;
    DispEx(o, n, e, a, d, i, g, m, k, b, h, j, f, c, l)
}
function AddSourceToUrl(a) {
    a: ;
    var b = GetSource(),
        c = a.length + b.length;
    if (c > 1950) return a;
    else {
        var d = a.indexOf("?") >= 0 ? "&" : "?";
        return a + d + "Source=" + b
    }
}
function _VerifyFolderHref(f, e, j, h, g, i, d, a) {
    a: ;
    var c = d != null && d != "" && a != null && a != "";
    if (c) {
        a = a.substring(1);
        c = a != ""
    }
    if (c) {
        var b = a;
        b = AddSourceToUrl(b);
        b = b + "&DefaultItemOpen=" + DocOpen.BROWSER;
        f.href = STSPageUrlValidation(b);
        e.cancelBubble = true;
        e.returnValue = true;
        DetachEvent("mousedown", VerifyFolderHref, f)
    }
    return false
}
function _VerifyHref(e, d, g, h, a) {
    a: ;
    var c = a != null && a != "",
        f = IsClientAppInstalled(h) && HasRights(16, 0);
    if (c) {
        a = a.substring(1);
        c = a != ""
    }
    if (c) {
        if (g == 1 || !f) {
            var b = a;
            b = AddSourceToUrl(b);
            b = b + "&DefaultItemOpen=" + DocOpen.BROWSER;
            e.href = STSPageUrlValidation(b);
            d.cancelBubble = true;
            d.returnValue = true
        }
        DetachEvent("mousedown", VerifyHref, e)
    }
    return false
}
function _DispEx(p, a, h, e, g, k, c, o, m, b, j, l, i, f, d) {
    a: ;
    if (a.shiftKey || a.ctrlKey) return true;
    var n = document.getElementById("FileDialogViewTable");
    if (n != null) {
        a.cancelBubble = false;
        a.returnValue = false;
        return true
    }
    if (typeof ctx == "undefined" || ctx == null) ctx = new ContextInfo;
    ctx.CurrentUserId = l;
    if (i == "1") ctx.isForceCheckout = true;
    else ctx.isForceCheckout = false;
    currentItemCheckedOutUserId = j;
    currentItemCheckedoutToLocal = f;
    currentItemProgId = m;
    if (d != null && d != "") {
        SetCurrentPermMaskFromString(d, null);
        if (c == "0" && !HasRights(0, 32)) c = "1"
    }
    a.cancelBubble = true;
    if (b != null && b != "") b = b.substring(1);
    return DispDocItemEx2(p, a, h, e, g, k, c, o, b)
}
function IsClientAppInstalled(a) {
    a: ;
    var b = null;
    if (a != "") b = StsOpenEnsureEx2(a);
    return b != null
}
function ViewDoc(d, c) {
    a: ;
    var b = StsOpenEnsureEx2(c),
        a = false;
    if (b != null) try {
        a = b.ViewDocument2(window, d)
    } catch (e) {
        a = false
    }
    return a
}
function _PortalPinToMyPage(a, c, b) {
    a: ;
    a.action = c + "_vti_bin/portalapi.aspx?Cmd=PinToMyPage";
    a.ReturnUrl.value = window.location.href;
    a.ListViewUrl.value = MakeMtgInstanceUrl(a.ListViewUrl.value, b);
    a.submit()
}
function _PortalPinToMyPage(a, g, e, f, b, d, h, c) {
    a: ;
    a.action = g + "_vti_bin/portalapi.aspx?Cmd=PinToMyPage";
    SetFieldValue(a, "ReturnUrl", window.location.href);
    SetFieldValue(a, "ListViewUrl", MakeMtgInstanceUrl(d, e));
    SetFieldValue(a, "ListTitle", f);
    SetFieldValue(a, "ListDescription", b);
    SetFieldValue(a, "BaseType", h);
    SetFieldValue(a, "ServerTemplate", c);
    a.submit()
}
function SetFieldValue(c, b, d) {
    a: ;
    var a = c[b];
    if (a == null) {
        a = document.createElement("INPUT");
        a.setAttribute("type", "hidden");
        a.setAttribute("name", b);
        c.appendChild(a)
    }
    a.value = d
}
function _MoveToViewDate(b, a, c) {
    a: ;
    if (FV4UI() && typeof _fV4Calendar != "undefined" && _fV4Calendar) {
        var d = function () {
            a: ;
            var d;
            if (c) d = SP.UI.ApplicationPages.CalendarInstanceRepository.lookupInstance(c);
            else d = SP.UI.ApplicationPages.CalendarInstanceRepository.firstInstance();
            if (d) if (a != null) d.moveToViewType(a);
            else d.moveToDate(b)
        };
        AjaxCalendarCall(d)
    } else MoveToViewDatePostBack(b, a)
}
function MoveToViewDatePostBack(c, b) {
    a: ;
    var a = window.location.href;
    if (c != null) a = StURLSetVar2(a, "CalendarDate", escapeProperly(c));
    if (b != null) a = StURLSetVar2(a, "CalendarPeriod", b);
    _SubmitFormPost(a, true)
}
function AjaxCalendarCall(b) {
    a: ;
    var a;
    try {
        a = typeof SP.UI.ApplicationPages.CalendarInstanceRepository
    } catch (c) {
        a = "undefined"
    }
    EnsureScript("SP.js", a, b)
}
function _MoveToDate(a, b) {
    a: ;
    _MoveToViewDate(a, null, b)
}
function MoveToToday() {
    a: ;
    _MoveToViewDate("", null)
}
function MoveView(a) {
    a: ;
    _MoveToViewDate(null, a)
}
function _ClickDay(a) {
    a: ;
    _MoveToDate(a)
}
function GetIframe() {
    a: ;
    return null
}
function _GetMonthView(c) {
    a: ;
    var b = window.location.href,
        a = document.getElementById("ExpandedWeeksId");
    if (a != null) a.value = c;
    else return;
    _SubmitFormPost(b, true)
}
function NewItemDT(a, c, b) {
    a: ;
    if (a == null) return;
    if (b != null) a = StURLSetVar2(a, "CalendarTime", b);
    if (c != null) a = StURLSetVar2(a, "CalendarDate", c);
    _NewItem(a, false)
}
function ClickTime(b, a) {
    a: ;
    NewItemDT(b, null, a)
}
function NewItemDay(b, a) {
    a: ;
    NewItemDT(b, a, null)
}
function ScrollToAnchorInInnerScrollPane(k, h, j) {
    a: ;
    try {
        var l = document.getElementById(k),
            b = document.getElementById(l[h].value);
        if (typeof b == "undefined" || b == null) throw "";
        var d = b.parentNode.previousSibling;
        if (typeof d != "undefined" && d != null) {
            var e = d.previousSibling;
            if (typeof e != "undefined" && e != null) b = e;
            else b = d
        } else throw ""
    } catch (n) {
        for (var f = null, i = document.anchors.length, g = 0; g < i; g++) {
            f = document.anchors[g];
            var m = f.href;
            if (m.search(j) != -1) {
                b = f;
                break
            }
        }
    }
    if (typeof b != "undefined" && b != null) {
        var c = b.parentNode;
        while (c != null && c.tagName != "TABLE") c = c.parentNode;
        if (typeof c != "undefined" && c != null) {
            var a = c.parentNode;
            while (a != null && (a.tagName != "DIV" || a.style.overflow != "auto")) a = a.parentNode;
            if (typeof a != "undefined" && a != null) {
                var o = b.offsetLeft;
                a.scrollLeft = o;
                a.scrollTop = c.offsetTop - a.clientHeight + c.offsetHeight
            }
        }
    }
}
function FilterChoice(e, d, D, u) {
    a: ;
    var a, h = 0,
        g = false,
        l = "",
        w = e.id,
        v = e.name,
        j = "",
        s = "",
        C = d.choices,
        c = C.split("|"),
        z = AbsLeft(d),
        n = AbsTop(d) + d.offsetHeight,
        r = document.getElementById("s4-workspace");
    if (r) n -= AbsTop(r);
    var B = d.optHid,
        x = c.length - 1,
        m = -1,
        q = false,
        p = "";
    if (e != null && e.selectedIndex >= 0) {
        g = true;
        p = e.options[e.selectedIndex].innerText
    }
    for (a = 0; a < c.length; a = a + 2) {
        var b = c[a];
        while (a < x - 1 && c[a + 1].length == 0) {
            b = b + "|";
            a++;
            if (a < x - 1) b = b + c[a + 1];
            a++
        }
        var k = c[a + 1],
            i = b.toLocaleLowerCase(),
            A = D.toLocaleLowerCase();
        if (u.length != 0) g = true;
        if (i.indexOf(A) == 0) {
            var o = u.toLocaleLowerCase();
            if (o.length != 0 && i.indexOf(o) == 0 && j.length == 0) g = false;
            if (i.length > 20) q = true;
            if (!g || i == p) {
                l += '<option selected value="' + k + '">' + STSHtmlEncode(b) + "</option>";
                g = true;
                j = b;
                s = k;
                m = a
            } else l += '<option value="' + k + '">' + STSHtmlEncode(b) + "</option>";
            h++
        }
    }
    var t = ' ondblclick="HandleOptDblClick()" onkeydown="HandleOptKeyDown()"',
        f = "";
    if (q) f = '<select tabIndex="-1" ctrl="' + d.id + '" name="' + v + '" id="' + w + '"' + t;
    else f = '<select class="ms-lookuptypeindropdown" tabIndex="-1" ctrl="' + d.id + '" name="' + v + '" id="' + w + '"' + t;
    if (h == 0) f += ' style="display:none;position:absolute;z-index:2;left:' + z + "px;top:" + n + 'px" onfocusout="OptLoseFocus(this)"></select>';
    else f += ' style="position:absolute;z-index:2;left:' + z + "px;top:" + n + 'px" size="' + (h <= 8 ? h : 8) + '"' + (h == 1 ? 'multiple="true"' : "") + ' onfocusout="OptLoseFocus(this)">' + l + "</select>";
    e.outerHTML = f;
    var y = document.getElementById(B);
    if (m != 0 || c[1] != "0") y.value = s;
    else y.value = "0";
    if (m != 0 || c[1] != "0") return j;
    else return ""
}
function _OptLoseFocus(a) {
    a: ;
    var b = document.getElementById(a.ctrl);
    a.selectedIndex >= 0 && _SetCtrlFromOpt(b, a);
    a.style.display = "none"
}
function SetCtrlMatch(b, a) {
    a: ;
    var c = document.getElementById(b.optHid);
    c.value = a.options[a.selectedIndex].value;
    if (c.value != 0) b.match = a.options[a.selectedIndex].innerText;
    else b.match = ""
}
function _SetCtrlFromOpt(b, a) {
    a: ;
    var c = document.getElementById(b.optHid);
    c.value = a.options[a.selectedIndex].value;
    if (a.options[a.selectedIndex].value == 0) {
        b.value = a.options[a.selectedIndex].innerText;
        b.match = ""
    } else {
        b.value = a.options[a.selectedIndex].innerText;
        b.match = b.value
    }
}
function HandleOptDblClick() {
    a: ;
    var a = event.srcElement,
        b = document.getElementById(a.ctrl);
    _SetCtrlFromOpt(b, a);
    SetCtrlMatch(b, a);
    a.style.display = "none"
}
function HandleOptKeyDown() {
    a: ;
    var a = event.srcElement,
        b = document.getElementById(a.ctrl),
        c = event.keyCode;
    switch (c) {
        case 13:
        case 9:
            _SetCtrlFromOpt(b, a);
            event.returnValue = false;
            a.style.display = "none";
            return
    }
    return
}
function CommitInlineEditChange(tr, cancel) {
    a: ;
    if (tr.cells.length > 0) {
        c = tr.cells[0];
        if (c.width == "1%") eval(cancel == true ? c.firstChild.lastChild.href : c.firstChild.firstChild.href);
        else if (tr.cells.length > 1) {
            c = tr.cells[1];
            if (c.width = "1%") eval(cancel == true ? c.firstChild.lastChild.href : c.firstChild.firstChild.href)
        }
    }
}
function InlineEditNextTR(tr, nextTr, element, down) {
    a: ;
    if (nextTr != null) {
        _inlineEditString = tr.getAttribute("automode") + "#";
        var index = null;
        while (element != null && element.nodeType == 1 && element.getAttribute("automode") == null) {
            var siblingCount = 0,
                sibling = element.previousSibling;
            while (sibling != null) {
                siblingCount++;
                sibling = sibling.previousSibling
            }
            if (index == null) index = siblingCount;
            else index = siblingCount + "," + index;
            element = element.parentNode
        }
        _inlineEditString += index;
        var tab = nextTr;
        while (tab != null && tab.tagName != "TABLE") tab = tab.parentNode;
        if (tab != null && nextTr != null && nextTr.getAttribute("iid") != null) {
            var inlineEditString = tab.getAttribute("inlineedit");
            if (inlineEditString != null) {
                inlineEditString = inlineEditString.replace("{@ID}", "{" + IdFromRow(nextTr) + "}");
                inlineEditString = inlineEditString.replace("__cancel;", "__commit;dvt_inlineedit={" + _inlineEditString + "};");
                eval(inlineEditString)
            }
        } else if (down == true && nextTr != null) if (nextTr.cells.length > 0) {
            var inlineEditString = null;
            c = nextTr.cells[0];
            if (c.width == "1%") inlineEditString = c.firstChild.href;
            else if (nextTr.cells.length > 1) {
                c = nextTr.cells[1];
                if (c.width = "1%") inlineEditString = c.firstChild.href
            }
            if (inlineEditString != null) {
                inlineEditString = inlineEditString.replace("__cancel;", "__commit;dvt_inlineedit={" + _inlineEditString + "};");
                eval(inlineEditString)
            }
        }
    }
}
function HandleInlineEditKeyDown(c) {
    a: ;
    var b = event.srcElement;
    if (b.tagName != "INPUT") return;
    var e = event.keyCode,
        a = c.parentNode;
    switch (e) {
        case 27:
            CommitInlineEditChange(a, true);
            break;
        case 38:
            var d = a.previousSibling;
            InlineEditNextTR(a, d, b);
            break;
        case 13:
        case 40:
            var d = a.nextSibling;
            InlineEditNextTR(a, d, b, true)
    }
    if (window.event) window.event.cancelBubble = true;
    else c != null && c.stopPropagation()
}
function EnsureSelectElement(c, b) {
    a: ;
    var a = document.getElementById(b);
    if (a == null) {
        a = document.createElement("SELECT");
        c.parentNode.appendChild(a);
        a.outerHTML = '<select id="' + b + '" ctrl="' + c.id + '" class="ms-lookuptypeindropdown" name="' + b + '" style="display:none" onfocusout="OptLoseFocus(this)"></select>';
        FilterChoice(a, c, c.value, "")
    }
    return document.getElementById(b)
}
function HandleKey() {
    a: ;
    var g = event.keyCode,
        b = event.srcElement,
        c = b.value,
        a = EnsureSelectElement(b, b.opt),
        d = false,
        f, e;
    switch (g) {
        case 8:
            if (c.length > 0) c = c.substr(0, c.length - 1);
            d = true;
            break;
        case 16:
        case 17:
        case 18:
            return;
        case 9:
        case 16:
        case 17:
        case 18:
            return;
        case 13:
            f = b.value.toLocaleLowerCase();
            e = b.match.toLocaleLowerCase();
            if (e.indexOf(f) != 0) b.match = FilterChoice(a, b, b.value, "");
            if (a.style.display != "none") {
                b.value = b.match;
                a.style.display = "none";
                event.returnValue = false
            }
            return;
        case 27:
            a.style.display = "none";
            event.returnValue = false;
            return;
        case 38:
            if (a.style.display != "none") {
                if (a.selectedIndex > 0) a.selectedIndex = a.selectedIndex - 1;
                else a.selectedIndex = a.options.length - 1;
                SetCtrlMatch(b, a);
                event.returnValue = false
            }
            return;
        case 40:
            if (a.style.display != "none" && a.selectedIndex < a.options.length - 1) {
                a.selectedIndex = a.selectedIndex + 1;
                SetCtrlMatch(b, a);
                event.returnValue = false;
                return
            }
            d = true
    }
    if (d);
    b.match = FilterChoice(a, b, c, "")
}
function ShowDropdown(b) {
    a: ;
    var a = document.getElementById(b),
        d = a.value,
        c = EnsureSelectElement(a, a.opt);
    a.match = FilterChoice(c, a, "", a.value);
    a.focus()
}
function HandleChar() {
    a: ;
    var a = event.srcElement,
        b = a.value,
        d = document.getElementById(a.opt),
        c = event.keyCode;
    if (c == 13) return;
    b = b + String.fromCharCode(c).toLocaleLowerCase();
    a.match = FilterChoice(d, a, b, "")
}
function HandleLoseFocus() {
    a: ;
    var b = event.srcElement,
        a = document.getElementById(b.opt);
    a != null && a.style.display != "none" && document.activeElement != a && _OptLoseFocus(a)
}
function HandleChange() {
    a: ;
    var a = event.srcElement,
        c = a.value,
        b = document.getElementById(a.opt);
    a.match = FilterChoice(b, a, c, "")
}
function IsSafeHref(a) {
    a: ;
    return a.match(new RegExp("^http://", "i")) || a.match(new RegExp("^https://", "i")) || a.match(new RegExp("^ftp://", "i")) || a.match(new RegExp("^file://", "i")) || a.match(new RegExp("^mailto:", "i")) || a.match(new RegExp("^news:", "i")) || a.match(new RegExp("^pnm://", "i")) || a.match(new RegExp("^mms://", "i")) || a.match(new RegExp("^/", "i")) || a.match(new RegExp("^#", "i")) || a.match(new RegExp("^\\\\\\\\", "i"))
}
var L_UnknownProtocolUrlError_Text = "超链接必须以 http://、https://、mailto:、news:、ftp://、file://、 /、# 或 \\\\ 开头。请检查该地址，然后重试。",
    L_UrlTooLongError_Text = "位置的 URL 长度不能超过 256 个字符(不计查询参数)。查询参数从问号(?)处开始。";

function IsSafeHrefAlert(a, b) {
    a: ;
    if (a.match("^[^?]{257}")) {
        alert(L_UrlTooLongError_Text);
        return false
    } else if (IsSafeHref(a)) return true;
    else if (a.match("^[a-zA-Z]*:")) {
        alert(L_UnknownProtocolUrlError_Text);
        return false
    } else if (true == b) return true;
    else {
        alert(L_UnknownProtocolUrlError_Text);
        return false
    }
}
function Discuss(a) {
    a: ;
    var L_IE5upRequired_Text = "“讨论”需要使用与 Microsoft SharePoint Foundation 兼容的应用程序和 Microsoft Internet Explorer 7.0 或更高版本。";
    if (browseris.ie5up && browseris.win32) window.parent.location.href = a;
    else alert(L_IE5upRequired_Text)
}
var g_AdditionalNavigateHierarchyQString = "";

function GetAdditionalNavigateHierarchyQString() {
    a: ;
    return g_AdditionalNavigateHierarchyQString
}
function SetAdditionalNavigateHierarchyQString(a) {
    a: ;
    g_AdditionalNavigateHierarchyQString = a
}
function ProcessDefaultNavigateHierarchy(g, e, d, b, c, j, i, h, f) {
    a: ;
    if (typeof _spCustomNavigateHierarchy == "function") _spCustomNavigateHierarchy(g, e, d, b, c, j);
    else if (c == false) top.location = b;
    else {
        var a = document.createElement("INPUT");
        a.type = "hidden";
        a.name = "_spTreeNodeClicked";
        a.value = d;
        i.appendChild(a);
        var k = "?RootFolder=" + escapeProperly(b) + h + "&" + g_AdditionalNavigateHierarchyQString;
        _SubmitFormPost(f + k);
        return false
    }
}
function ParseMultiColumnValue(b, d) {
    a: ;
    var f = [];
    if (d == null) d = ";#";
    var o = d.charCodeAt(0),
        n = d.charCodeAt(1);
    if (b == null || b.length == 0) return f;
    var h = d.charAt(0),
        m = h + h,
        k = new RegExp(m, "g"),
        j = d.charAt(0),
        c = 0;
    if (b.substr(0, 2) == d) c = 2;
    var a = c,
        g = false,
        i = b.length;
    while (a < i) {
        var l = b.indexOf(h, a);
        if (l >= 0) {
            a = l;
            a++;
            if (b.charCodeAt(a) == n) {
                if (a - 1 > c) {
                    var e = b.substr(c, a - c - 1);
                    if (g) e = e.replace(k, j);
                    f.push(e);
                    g = false
                } else f.push("");
                a++;
                c = a;
                continue
            } else if (b.charCodeAt(a) == o) {
                a++;
                g = true;
                continue
            } else throw "ArgumentException"
        } else a = i
    }
    if (a > c) {
        var e = b.substr(c, a - c);
        if (g) e = e.replace(k, j);
        f.push(e)
    }
    return f
}
function ConvertMultiColumnValueToString(f, b, c) {
    a: ;
    if (b == null) b = ";#";
    if (c == null) c = true;
    for (var h = b.charAt(0), i = h + h, j = new RegExp(b.charAt(0), "g"), g = false, d = "", e = 0; e < f.length; e++) {
        var a = f[e];
        if (a != null && a.length > 0) a = a.replace(j, i);
        if (a != null && a.length > 0) g = true;
        if (c || e != 0) d += b;
        d += a
    }
    if (g) {
        if (c) d += b;
        return d
    } else return ""
}
var httpFolderTarget = null,
    httpFolderSource = null,
    httpFolderDiv = null;

function NavigateHttpFolderCore() {
    a: ;
    if (httpFolderDiv == null) {
        httpFolderDiv = document.createElement("DIV");
        document.body.appendChild(httpFolderDiv);
        httpFolderDiv.onreadystatechange = NavigateHttpFolderCore;
        httpFolderDiv.addBehavior("#default#httpFolder")
    }
    if (httpFolderDiv.readyState == "complete") {
        httpFolderDiv.onreadystatechange = null;
        try {
            var a = document.frames.item(httpFolderTarget);
            if (a != null) a.document.body.innerText = L_WebFoldersRequired_Text
        } catch (c) { }
        var b = false;
        try {
            var d = "";
            d = httpFolderDiv.navigateFrame(httpFolderSource, httpFolderTarget);
            if (d == "OK") b = true
        } catch (c) { }
        if (!b && 0 == httpFolderSource.search("http://[a-zA-Z0-9-.]+(:80)?/")) {
            var e = httpFolderSource.replace(/http:\/\/([a-zA-Z0-9\-\.]+)(:80)?[\/]/, "//$1/").replace(/[\/]/g, "\\");
            try {
                var a = document.frames.item(httpFolderTarget);
                if (a != null) {
                    a.onload = null;
                    a.document.location.href = e;
                    b = true
                }
            } catch (c) { }
        } !b && alert(L_WebFoldersError_Text)
    }
}
function NavigateHttpFolder(a, b) {
    a: ;
    if ("/" == a.charAt(0)) a = document.location.protocol + "//" + document.location.host + a;
    httpFolderSource = a;
    httpFolderTarget = b;
    NavigateHttpFolderCore()
}
function NavigateHttpFolderIfSupported(b, a) {
    a: ;
    if (a == "_blank") if (SupportsNavigateHttpFolder()) NavigateHttpFolder(b, a);
    else alert(L_WebFoldersError_Text);
    else alert(L_NoExplorerView_Text)
}
function AutoIndexForRelationshipsConfirmation() {
    a: ;
    var L_Lookup_AutoIndexForRelationships_Confirm_Text = "若要在此栏上启用关系行为，需要将其编入索引。是否要将此栏编入索引?",
        a = L_Lookup_AutoIndexForRelationships_Confirm_Text;
    return confirm(a)
}
function SetHomePage2(d) {
    a: ;
    if (!window.confirm(SP.Res.confirmWelcomePage)) return;
    var e = new SP.ClientContext,
        c = e.get_web().get_rootFolder(),
        a = "";
    if (d.length > 0) {
        var a = (new CUrl(document.URL)).path,
            b = a.indexOf("//");
        a = a.substr(b + 2);
        b = a.indexOf("/");
        a = a.substr(b);
        a = unescapeProperly(a);
        a = a.substr(d.length);
        if (a.indexOf("/") == 0) a = a.substr(1);
        var b = a.indexOf("?");
        if (b > 0) a = a.substr(0, b)
    }
    c.set_welcomePage(a);
    c.update();
    var f = STSHtmlEncode(SP.Res.sending),
        g = addNotification(f, true);
    e.executeQueryAsync(function () {
        a: ;
        removeNotification(g);
        addNotification(STSHtmlEncode(SP.Res.pageIsSiteHomePage), false)
    })
}
function SetHomePage(b) {
    a: ;
    var a = function () {
        a: ;
        SetHomePage2(b)
    };
    if (typeof SP != "undefined") EnsureScript("SP.js", typeof SP.ClientContext, a);
    else EnsureScript("SP.js", typeof SP, a)
}
function SendEmail(b) {
    a: ;
    var a;
    try {
        a = typeof SP.Ribbon.EMailLink.openMailerWithUrl
    } catch (f) {
        a = "undefined"
    }
    if (a != "undefined") SP.Ribbon.EMailLink.openMailerWithUrl(b);
    else {
        var e = "SP.Ribbon.EMailLink.openMailerWithUrl",
            c = e.split(".");
        if (c.length > 1) {
            var d = function () {
                a: ;
                SP.Ribbon.EMailLink.openMailerWithUrl(b)
            };
            EnsureScript(c[0], a, d)
        }
    }
}
function TryCopyStringToClipboard(b) {
    a: ;
    if (window.clipboardData && clipboardData.setData) clipboardData.setData("Text", b);
    else {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var c = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        if (!c) return false;
        c.data = b;
        var a = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
        if (!a) return false;
        a.addDataFlavor("text/unicode");
        a.setTransferData("text/unicode", c, b.length * 2);
        var d = Components.interfaces.nsIClipboard,
            e = Components.classes["@mozilla.org/widget/clipboard;1"].getService(d);
        if (!e) return false;
        e.setData(a, null, d.kGlobalClipboard)
    }
    return true
}
function CopyStringToClipboard(c) {
    a: ;
    var a = false;
    try {
        a = TryCopyStringToClipboard(c)
    } catch (b) {
        a = false
    } !a && alert(SP.Res.clipboardNoAccess)
}
function CopyPageAddressToClipboard() {
    a: ;
    CopyStringToClipboard(window.location.href)
}
function showViewSelector(b, a, d) {
    a: ;
    if (b == null) b = window.event;
    CancelEvent(b);
    a = EnsureValidPositioningElement(b, a);
    a = AdjustViewSelectorParentInTitleArea(a);
    var e = function () {
        a: ;
        SP.Application.UI.ViewSelectorMenuBuilder.showMenu(a, d)
    },
        c;
    try {
        c = typeof SP.Application.UI.ViewSelectorMenuBuilder.showMenu
    } catch (f) {
        c = "undefined"
    }
    EnsureScript("SP.js", c, e)
}
function EnsureValidPositioningElement(d, c) {
    a: ;
    if (c != null) return c;
    var b = GetEventSrcElement(d),
        a = b;
    while (a != null && a.tagName != "BODY") {
        if (a.tagName == "TD" && (a.className == "ms-viewselector" || a.className == "ms-viewselectorhover")) return a;
        a = a.parentNode
    }
    return b
}
function AdjustViewSelectorParentInTitleArea(a) {
    a: ;
    if (a && a.className == "ms-ltviewselectormenuheader" && a.childNodes) for (var d = a.childNodes, c = 0; c < d.length; c++) {
        var b = d[c];
        if (b && b.id && b.id.indexOf("ListTitleViewSelectorMenu") >= 0) return b
    }
    return a
}
function EnsureCheckoutAndChangeLayoutModeToEdit(f, e, d) {
    a: ;
    var a, c = function () {
        a: ;
        var a;
        try {
            a = typeof browserScript.MSOLayout_ChangeLayoutMode
        } catch (f) {
            a = "undefined"
        }
        if (a != "undefined") browserScript.MSOLayout_ChangeLayoutMode(d);
        else {
            var e = "browserScript.MSOLayout_ChangeLayoutMode",
                    b = e.split(".");
            if (b.length > 1) {
                var c = function () {
                    a: ;
                    browserScript.MSOLayout_ChangeLayoutMode(d)
                };
                EnsureScript(b[0], a, c)
            }
        }
    },
        g = function () {
            a: ;
            var g = a.get_item("CheckoutUser");
            if (!g) {
                if (confirm(L_ConfirmCheckout_Text)) {
                    var b = new SP.ClientContext,
                        d = b.get_web().get_lists().getById(new SP.Guid(f));
                    a = d.getItemById(e);
                    a.get_file().checkOut();
                    b.executeQueryAsync(c)
                }
            } else c()
        },
        h = function () {
            a: ;
            var b = new SP.ClientContext,
                c = b.get_web().get_lists().getById(new SP.Guid(f));
            a = c.getItemById(e);
            b.load(a, "CheckoutUser");
            b.executeQueryAsync(g)
        },
        b;
    try {
        b = typeof SP.ClientContext
    } catch (i) {
        b = "undefined"
    }
    EnsureScript("SP.js", b, h)
}
function _ChangeLayoutMode(b, c) {
    a: ;
    var a;
    try {
        a = typeof browserScript.MSOLayout_ChangeLayoutMode
    } catch (g) {
        a = "undefined"
    }
    if (a != "undefined") browserScript.MSOLayout_ChangeLayoutMode(b, c);
    else {
        var f = "browserScript.MSOLayout_ChangeLayoutMode",
            d = f.split(".");
        if (d.length > 1) {
            var e = function () {
                a: ;
                browserScript.MSOLayout_ChangeLayoutMode(b, c)
            };
            EnsureScript(d[0], a, e)
        }
    }
}
function OpenWebPartMenuFromLink(b, a, c, d) {
    a: ;
    while (a != null && a.parentNode != null && a.tagName != "TD") a = a.parentNode;
    OpenWebPartMenu(b, a, c, d)
}
function OpenWebPartMenu(b, c, d, e, f) {
    a: ;
    var a;
    try {
        a = typeof browserScript.MSOWebPartPage_OpenMenu
    } catch (j) {
        a = "undefined"
    }
    if (a != "undefined") browserScript.MSOWebPartPage_OpenMenu(b, c, d, e, f);
    else {
        var i = "browserScript.MSOWebPartPage_OpenMenu",
            g = i.split(".");
        if (g.length > 1) {
            var h = function () {
                a: ;
                browserScript.MSOWebPartPage_OpenMenu(b, c, d, e, f)
            };
            EnsureScript(g[0], a, h)
        }
    }
    return true
}
function UpdateWebPartMenuFocus(a, d, c) {
    a: ;
    if (a) a.className = d;
    var b = null;
    if (a && a.childNodes) {
        b = a.childNodes[0];
        if (b && b.tagName == "SPAN") b.className = c
    }
}
function _WebPartMenuKeyboardClick(e, b, c, d) {
    a: ;
    var a;
    try {
        a = typeof browserScript.MSOMenu_KeyboardClick
    } catch (i) {
        a = "undefined"
    }
    if (a != "undefined") browserScript.MSOMenu_KeyboardClick(e, b, c, d);
    else {
        var h = "browserScript.MSOMenu_KeyboardClick",
            f = h.split(".");
        if (f.length > 1) {
            var g = function () {
                a: ;
                browserScript.MSOMenu_KeyboardClick(e, b, c, d)
            };
            EnsureScript(f[0], a, g)
        }
    }
}
function _ShowToolPane2Wrapper(b, c, d) {
    a: ;
    var a;
    try {
        a = typeof browserScript.MSOTlPn_ShowToolPane2Wrapper
    } catch (h) {
        a = "undefined"
    }
    if (a != "undefined") browserScript.MSOTlPn_ShowToolPane2Wrapper(b, c, d);
    else {
        var g = "browserScript.MSOTlPn_ShowToolPane2Wrapper",
            e = g.split(".");
        if (e.length > 1) {
            var f = function () {
                a: ;
                browserScript.MSOTlPn_ShowToolPane2Wrapper(b, c, d)
            };
            EnsureScript(e[0], a, f)
        }
    }
}
function ChangeWebPartPageView(b) {
    a: ;
    var a;
    try {
        a = typeof browserScript.MSOLayout_ToggleView
    } catch (f) {
        a = "undefined"
    }
    if (a != "undefined") browserScript.MSOLayout_ToggleView(b);
    else {
        var e = "browserScript.MSOLayout_ToggleView",
            c = e.split(".");
        if (c.length > 1) {
            var d = function () {
                a: ;
                browserScript.MSOLayout_ToggleView(b)
            };
            EnsureScript(c[0], a, d)
        }
    }
}
function _SetupFixedWidthWebParts() {
    a: ;
    var a;
    try {
        a = typeof browserScript.MSOWebPartPage_SetupFixedWidthWebParts
    } catch (e) {
        a = "undefined"
    }
    if (a != "undefined") browserScript.MSOWebPartPage_SetupFixedWidthWebParts();
    else {
        var d = "browserScript.MSOWebPartPage_SetupFixedWidthWebParts",
            b = d.split(".");
        if (b.length > 1) {
            var c = function () {
                a: ;
                browserScript.MSOWebPartPage_SetupFixedWidthWebParts()
            };
            EnsureScript(b[0], a, c)
        }
    }
}
function EnsureSelectionHandlerOnFocusDeferred(d, c, b) {
    a: ;
    var a = c;
    while (a.tagName != "TABLE") a = a.parentNode;
    EnsureSelectionHandlerDeferred(d, a, b)
}
function ChangeWikiPageMode(b) {
    a: ;
    var a;
    try {
        a = typeof ribbon.ChangeWikiPageMode
    } catch (f) {
        a = "undefined"
    }
    if (a != "undefined") ribbon.ChangeWikiPageMode(b);
    else {
        var e = "ribbon.ChangeWikiPageMode",
            c = e.split(".");
        if (c.length > 1) {
            var d = function () {
                a: ;
                ribbon.ChangeWikiPageMode(b)
            };
            EnsureScript(c[0], a, d)
        }
    }
}
function EnsureSelectionHandlerDeferred(m, d, i) {
    a: ;
    var b = window["ctx" + i];
    if (!FV4UI() || !b) {
        d.onmouseover = null;
        return
    }
    ctxInitItemState(b);
    for (var j = d.rows, g = 0; g < j.length; g++) {
        var a = j[g];
        if (HasCssClass(a, "ms-viewheadertr")) {
            var f = a.cells[0];
            if (f) {
                var e = f.getElementsByTagName("INPUT")[0];
                if (e != null) {
                    b.SelectAllCbx = e;
                    b.TableCbxFocusHandler = e.onfocus;
                    e.onfocus = null;
                    e.className = "s4-selectAllCbx"
                }
            }
        }
        var k = a.getAttribute("iid");
        if (k != null) {
            var h = false;
            if (ItemIsCurrentlySelected(b, k)) {
                h = true;
                b.CurrentSelectedItems++
            }
            if (ItemIsCurrentlyVisible(a)) {
                b.TotalListItems++;
                b.LastSelectableRowIdx = g
            }
            if (a.cells.length > 0) {
                f = a.cells[0];
                var c = f.getElementsByTagName("INPUT")[0];
                if (c) {
                    if (!h) c.checked = false;
                    if (!c._setup) {
                        c._setup = true;
                        var l = TooltipOfRow(a);
                        if (l != null) c.title = l;
                        c.onblur = HideItemCbx;
                        c.onfocus = DisplayItemCbx;
                        c.onclick = ToggleItemRowSelection;
                        f.onclick = ToggleItemRowSelection
                    }
                    if (a.getAttribute("automode") == null) a.onclick = SingleItemSelect
                }
                UpdateAutoMode(a);
                AddSpaceToEmptyTDs(a);
                AddBorderToLastCell(a)
            }
        }
    }
    b.TableMouseoverHandler = d.onmouseover;
    d.onmouseover = null;
    if (d.getAttribute("handleDeleteInit") == null) {
        d.setAttribute("handleDeleteInit", "true");
        $addHandler(d, "keydown", function (a) {
            a: ;
            HandleItemDelete(a, i)
        })
    }
}
function ItemIsSelectable(a) {
    a: ;
    if (!a || !ItemHasiid(a) || !ItemIsCurrentlyVisible(a)) return false;
    return true
}
function ItemIsCurrentlyVisible(a) {
    a: ;
    if (!a || !a.parentNode) return false;
    if (GetCurrentEltStyle(a.parentNode, "display") == "none" || GetCurrentEltStyle(a, "display") == "none") return false;
    return true
}
function ItemIsCurrentlySelected(b, c) {
    a: ;
    if (!b || !c) return false;
    var a = GetSelectedItemsDict(b);
    if (a == null || a[c] == null) return false;
    return true
}
function ItemHasiid(a) {
    a: ;
    if (!a || a.getAttribute("iid") == null) return false;
    return true
}
function HandleItemDelete(g, d) {
    a: ;
    if (g.keyCode == Sys.UI.Key.del) {
        var b = window["ctx" + d],
            a;
        try {
            a = typeof inplview.DeleteSelectedItems
        } catch (h) {
            a = "undefined"
        }
        if (a != "undefined") inplview.DeleteSelectedItems(b);
        else {
            var f = "inplview.DeleteSelectedItems",
                c = f.split(".");
            if (c.length > 1) {
                var e = function () {
                    a: ;
                    inplview.DeleteSelectedItems(b)
                };
                EnsureScript(c[0], a, e)
            }
        }
        return false
    }
}
function GetItemRow2(b) {
    a: ;
    var a = b;
    while (a != null && a.nodeType == 1 && a.tagName != "BODY" && a.getAttribute("iid") == null) {
        if (typeof a.parentNode == "undefined" || a.parentNode == null || typeof a.parentNode.tagName == "undefined") {
            a = null;
            break
        }
        a = a.parentNode
    }
    if (a != null && a.nodeType == 1 && a.tagName == "TR") return a;
    return null
}
function GetItemRow(a) {
    a: ;
    if (a == null) a = window.event;
    var b = GetEventSrcElement(a);
    return GetItemRow2(b)
}
function TooltipOfRow(d) {
    a: ;
    for (var c = d.cells, a = 0, a = 0; a < c.length; a++) {
        var e = c[a];
        if (HasCssClass(e, "ms-vb-title")) return e.innerText
    }
    var b = d.getAttribute("iid");
    if (b != null) {
        var f = b.split(",");
        if (f.length > 2) return "" + f[1]
    }
    return null
}
function AlertCheckOut() {
    a: ;
    alert(L_MustCheckout_Text)
}
function UpdateAutoModeImage(a) {
    a: ;
    if (a == null) a = window.event;
    if (a != null) {
        var b = a.srcElement != null ? a.srcElement : a.currentTarget;
        if (b && b.tagName == "A") if (a.type == "blur") RemoveCssClassFromElement(b, "ms-inlineEditLink");
        else a.type == "focus" && AddCssClassToElement(b, "ms-inlineEditLink")
    }
}
function AddAutoModeTag(f, e, g) {
    a: ;
    var a = document.createElement("A");
    a.onblur = UpdateAutoModeImage;
    a.onfocus = UpdateAutoModeImage;
    var c = e;
    while (c.tagName != "TABLE") c = c.parentNode;
    if (f.getAttribute("requiresCheckout") != null) a.onclick = AlertCheckOut;
    else {
        var d = c.getAttribute("inlineedit");
        if (d != null) a.href = d.replace("{@ID}", "{" + IdFromRow(e) + "}")
    }
    var b = document.createElement("IMG");
    b.className = "s4-itm-inlineedit";
    b.src = g;
    b.border = 0;
    b.alt = L_Edit_Text;
    a.appendChild(b);
    f.appendChild(a)
}
function GetItemRowCbx(a) {
    a: ;
    var b = null;
    if (a != null && a.cells && a.cells.length > 0) {
        var c = a.cells[0];
        b = c.getElementsByTagName("INPUT")[0]
    }
    return b
}
function UpdateAutoMode(b) {
    a: ;
    if (b != null) {
        var c = CtxFromRow(b);
        if (!c || !c.InlineEdit) return;
        if (b.cells && b.cells.length > 0) {
            var a = b.cells[0];
            if (a.innerHTML == "" && a.width == "1%") {
                if (a.getAttribute("requiresCheckout") == null) a.onclick = ClickToEdit;
                AddAutoModeTag(a, b, "/_layouts/images/edititem.gif")
            } else if (b.cells.length > 1) {
                a = b.cells[1];
                if (a.innerHTML == "" && a.width == "1%") {
                    if (a.getAttribute("requiresCheckout") == null) a.onclick = ClickToEdit;
                    AddAutoModeTag(a, b, "/_layouts/images/edititem.gif")
                }
            }
        }
    }
}
function ClickToEdit(a) {
    a: ;
    var d = GetItemRow(a);
    if (d != null && d.cells.length > 1) {
        c = d.cells[1];
        var e = c.firstChild;
        if (e != null) {
            var b = e.firstChild;
            if (b != null && b.tagName == "IMG") b.src = "/_layouts/images/spinnyrefresh.gif"
        }
    }
    if (window.event) window.event.cancelBubble = true;
    else a != null && a.stopPropagation()
}
function HideItemCbx(b) {
    a: ;
    if (b == null) b = window.event;
    var c = GetItemRow(b),
        a = GetItemRowCbx(c);
    if (a && a.tagName == "INPUT") {
        a.style.top = "";
        a.style.position = "";
        a.onmouseout = null
    }
}
function DisplayItemCbx(b) {
    a: ;
    if (b == null) b = window.event;
    var c = GetItemRow(b),
        a = GetItemRowCbx(c);
    if (a && a.tagName == "INPUT") {
        a.style.top = "0px";
        a.style.position = "relative";
        a.onmouseout = HideItemCbx
    }
}
function Log(b) {
    a: ;
    var a = document.createElement("DIV");
    a.innerHTML = b;
    document.body.appendChild(a)
}
function _ToggleAllItems(a, b, c) {
    a: ;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSSelectOrDeselectAllStart);
    if (a == null) a = window.event;
    MenuHtc_hide();
    ToggleAllItems2(b, c, b.checked);
    if (window.event) window.event.cancelBubble = true;
    else a.stopPropagation();
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSSelectOrDeselectAllEnd);
    return false
}
function ToggleAllItems2(b, f, g) {
    a: ;
    var a = window["ctx" + f];
    if (!a) {
        b.checked = false;
        return
    }
    var c = b;
    while (c.tagName != "TABLE") c = c.parentNode;
    var e = c.rows,
        d = CountTotalItems(a);
    if (d == 0) {
        b.checked = false;
        return
    }
    if (g) {
        if (d > g_MaximumSelectedItemsAllowed) {
            b.checked = false;
            alert(L_BulkSelection_TooManyItems);
            return
        }
        SelectAllItems(a, e)
    } else DeselectAllItems(a, e, true)
}
function SelectAllItems(a, b) {
    a: ;
    if (!a || !b) return;
    for (var e = a.LastSelectableRowIdx, c = 1; c < e; c++) {
        var d = b[c],
            f = d.getAttribute("iid");
        if (f != null) ItemIsCurrentlyVisible(d) && ToggleItemRowSelection2(a, d, true, false)
    }
    ToggleItemRowSelection2(a, b[e], true, true)
}
function DeselectAllItems(a, d, f) {
    a: ;
    if (!a || !d) return;
    for (var g = a.LastSelectableRowIdx, c = 1; c <= g; c++) {
        var e = d[c],
            b = e.getAttribute("iid");
        if (b != null) {
            var h = b.split(",");
            SelectListItem(a, b, h, e, false)
        }
    }
    f && RefreshCommandUI()
}
function DeselectCollapsedGroup(e, b) {
    a: ;
    if (!b) return;
    var c = b.rows,
        a = GetLastSelectableRowIdx(b, ItemHasiid);
    if (c && a != -1) {
        for (var d = 0; d < a; d++) {
            var f = c[d];
            ItemHasiid(f) && ToggleItemRowSelection2(e, f, false, false)
        }
        ToggleItemRowSelection2(e, c[a], false, true)
    }
}
function HandleSingleGroupByRow(a, b, d) {
    a: ;
    if (!a || !b) return;
    var c = b.getAttribute("iid");
    if (c == null) return;
    if (!d) {
        a.TotalListItems--;
        ItemIsCurrentlySelected(a, c) && ToggleItemRowSelection2(a, b, false, true)
    } else a.TotalListItems++
}
function RefreshCommandUI() {
    a: ;
    if (IsFullNameDefined("SP.Ribbon.PageManager")) {
        var a = SP.Ribbon.PageManager.get_instance();
        a && a.get_commandDispatcher().executeCommand(Commands.CommandIds.ApplicationStateChanged, null)
    }
}
function _CommandUIExecuteCommand(b) {
    a: ;
    if (IsFullNameDefined("SP.Ribbon.PageManager")) {
        var a = SP.Ribbon.PageManager.get_instance();
        a && a.get_commandDispatcher().executeCommand(b, null)
    }
}
function OnItemSelectionChanged(e, a, c) {
    a: ;
    var b = e;
    if (FV4UI()) {
        var d = function () {
            a: ;
            var d = [];
            if (typeof _ribbon != "undefined" && _ribbon) if (c) b.clvp.EnsureEcbInfo(RefreshCommandUI, d, a);
            else b.clvp.EnsureEcbInfo(null, null, a)
        };
        EnsureScript("inplview", typeof InitAllClvps, d)
    }
}
function IdFromRow(c) {
    a: ;
    var b = c.getAttribute("iid"),
        a = b.split(",");
    return a[1]
}
function CtxFromRow(d) {
    a: ;
    var c = d.getAttribute("iid"),
        b = c.split(","),
        a = b[0];
    return window["ctx" + a]
}
function GroupNameFromRow(d) {
    a: ;
    var b = d.parentNode,
        a = b.id;
    if (a == null || a == "") {
        siblingNode = b.previousSibling;
        if (siblingNode != null && siblingNode.childNodes.length == 0 && siblingNode.tagName == b.tagName) a = siblingNode.id
    }
    if (a == null || a == "") return null;
    var c = a.substr(4, a.length - 6);
    return c == "" ? null : c
}
function GroupStringFromGroupName(a) {
    a: ;
    if (a == null || a == "") return null;
    var c = document.getElementById("titl" + a + "_");
    if (c == null) return null;
    var b = c.getAttribute("groupString");
    return b == "" ? null : b
}
function SingleItemSelect(a) {
    a: ;
    if (a == null) a = window.event;
    var g = GetEventSrcElement(a);
    if (g != null && ElementContainsLink(g)) return;
    if (clearECBMenu(g)) {
        CancelEvent(a);
        return false
    }
    var d = GetItemRow(a),
        c = d;
    while (c.tagName != "TABLE") c = c.parentNode;
    var h = c.rows,
        b = CtxFromRow(d),
        i = d.getAttribute("iid"),
        k = i.split(","),
        e = false;
    if (!ItemIsCurrentlySelected(b, i)) {
        e = true;
        if (CountSelectedItems(b) > 0) for (var f = 0; f < h.length; f++) {
            var j = h[f];
            ItemIsSelectable(j) && ToggleItemRowSelection2(b, j, false, false)
        }
    }
    ToggleItemRowSelection2(b, d, e, true);
    UpdateSelectAllCbx(b, e);
    CancelEvent(a);
    return true
}
function ElementContainsLink(a) {
    a: ;
    while (a != null && a.tagName != "TD") {
        if (a.tagName == "A") return true;
        a = a.parentNode
    }
    return false
}
function clearECBMenu(b) {
    a: ;
    if (g_menuHtc_lastMenu == null) return false;
    if (b != null) {
        var a = b;
        while (a != null && a.tagName != "TD") a = a.parentNode;
        var c = GetItemRow2(a);
        MenuHtc_hide();
        tdHasEcbMenu(a) && OnChildItem(a)
    }
    return true
}
function tdHasEcbMenu(d) {
    a: ;
    for (var b = 0; b < d.childNodes.length; b++) {
        var a = d.childNodes[b];
        if (a.nodeType == 1 && a.tagName == "DIV") {
            var c = a.getAttribute("CTXName");
            if (c != null && c != "") return true
        }
    }
    return false
}
function ToggleItemRowSelection(a) {
    a: ;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSSelectItemStart);
    if (a == null) a = window.event;
    MenuHtc_hide();
    var c = GetItemRow(a),
        b = CtxFromRow(c),
        f = c.getAttribute("iid"),
        d = !ItemIsCurrentlySelected(b, f);
    if (d && CountSelectedItems(b) == g_MaximumSelectedItemsAllowed) {
        var e = GetItemRowCbx(c);
        e.checked = false;
        alert(L_BulkSelection_TooManyItems);
        CancelEvent(a);
        return true
    }
    ToggleItemRowSelection2(b, c, d, true);
    UpdateSelectAllCbx(b, d);
    if (window.event) window.event.cancelBubble = true;
    else a.stopPropagation();
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSSelectItemEnd);
    return true
}
function ToggleItemRowSelection2(b, a, f, e) {
    a: ;
    var d = a.getAttribute("iid"),
        c = d.split(",");
    if (c[1] == "") return;
    SelectListItem(b, d, c, a, f);
    OnItemSelectionChanged(b, GroupNameFromRow(a), e);
    return true
}
function UpdateSelectAllCbx(a, c) {
    a: ;
    if (!a || !a.SelectAllCbx) return;
    a.SelectAllCbx.checked = false;
    if (c) {
        var d = CountTotalItems(a),
            b = CountSelectedItems(a);
        if (b == d && b > 0) a.SelectAllCbx.checked = true
    }
}
function SelectListItem(a, b, e, c, d) {
    a: ;
    var f = GetItemRowCbx(c);
    f.checked = d;
    if (typeof a.dictSel == "undefined") a.dictSel = [];
    if (d) {
        AddCssClassToElement(c, "s4-itm-selected");
        if (a.dictSel[b] == null) {
            a.CurrentSelectedItems++;
            a.dictSel[b] = {
                id: e[1],
                fsObjType: e[2]
            }
        }
    } else {
        RemoveCssClassFromElement(c, "s4-itm-selected");
        if (a.dictSel[b] != null) {
            delete a.dictSel[b];
            a.CurrentSelectedItems--
        }
    }
}
function CountTotalItems(a) {
    a: ;
    if (a.TotalListItems == null) a.TotalListItems = 0;
    return a.TotalListItems
}
function CountSelectedItems(a) {
    a: ;
    if (a.CurrentSelectedItems == null) a.CurrentSelectedItems = 0;
    return a.CurrentSelectedItems
}
function GetCtxRgiidFromIid(c) {
    a: ;
    if (c == null) return null;
    var b = c.split(",");
    if (b.length != 3) return null;
    if (b[1] == "") return null;
    var d = b[0],
        a = window["ctx" + d];
    if (a == null) return null;
    if (typeof a.dictSel == "undefined") a.dictSel = [];
    if (a.CurrentSelectedItems == null) a.CurrentSelectedItems = 0;
    return {
        ctx: a,
        rgiid: b
    }
}
function SelectListItemNative(b, e) {
    a: ;
    var c = GetCtxRgiidFromIid(b);
    if (c == null) return false;
    var a = c.ctx,
        d = c.rgiid;
    if (e) {
        if (a.CurrentSelectedItems == g_MaximumSelectedItemsAllowed) return false;
        if (a.dictSel[b] == null) {
            a.CurrentSelectedItems++;
            a.dictSel[b] = {
                id: d[1],
                fsObjType: d[2]
            }
        }
    } else if (a.dictSel[b] != null) {
        delete a.dictSel[b];
        a.CurrentSelectedItems--
    }
    OnItemSelectionChanged(a, null, true);
    return true
}
function DeselectAllListItemsNative(c) {
    a: ;
    var b = GetCtxRgiidFromIid(c);
    if (b == null) return false;
    var a = b.ctx;
    a.dictSel = [];
    a.CurrentSelectedItems = 0;
    OnItemSelectionChanged(a, null, true);
    return true
}
function GetSelectedItemsNative() {
    a: ;
    var a = GetCurrentCtx();
    if (a == null || typeof a.dictSel == "undefined") return [];
    var d = 0,
        b = [];
    for (var c in a.dictSel) {
        b[d] = {
            id: a.dictSel[c].id,
            fsObjType: a.dictSel[c].fsObjType
        };
        d++
    }
    return b
}
function GetSelectedListNative() {
    a: ;
    var a = GetCurrentCtx();
    if (a == null) return null;
    return a.listName
}
function GetCurrentCtx() {
    a: ;
    var c = document.getElementById("_wpSelected");
    if (c == null) return null;
    var a = c.getAttribute("value");
    if (a == null || a == "") return null;
    a = a.substr(12);
    c = document.getElementById(a);
    if (c == null) return null;
    var b;
    if (window._spWebPartComponents && _spWebPartComponents[a] && _spWebPartComponents[a].storageId) b = _spWebPartComponents[a].storageId;
    else b = c.getAttribute("WebPartID");
    if (b == null) return null;
    b = b.toUpperCase();
    var d = g_ViewIdToViewCounterMap["{" + b + "}"];
    if (d == null) return null;
    var e = window["ctx" + d];
    return e
}
function GetLastSelectableRowIdx(c, d) {
    a: ;
    if (!c || !d) return;
    for (var b = c.rows, a = b.length - 1; a >= 0; a--) {
        var e = b[a];
        if (d(e)) return a
    }
    return -1
}
function UpdateCtxLastSelectableRow(a, c) {
    a: ;
    if (!a || !c) return;
    a.LastSelectableRowIdx = 0;
    var b = GetLastSelectableRowIdx(c, ItemIsSelectable);
    if (b != -1) a.LastSelectableRowIdx = b
}
function DeselectAllWPItems() {
    a: ;
    var a = GetCurrentCtx();
    if (!a || !a.clvp || !a.clvp.tab) return;
    var c = a.clvp.tab,
        b = getSelectAllCbxFromTable(c);
    if (!b) return;
    b.checked = false;
    CountSelectedItems(a) > 0 && DeselectAllItems(a, c.rows, false)
}
function callOpenBreadcrumbMenu(a, g, j, i, c, d, e, f, n, o, h, k) {
    a: ;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSBreadcrumbStart);
    if (!a) var a = window.event;
    a.cancelBubble = true;
    a.stopPropagation && a.stopPropagation();
    var l = function () {
        a: ;
        SP.UI.PopoutMenu.createPopoutMenuInstanceAndLaunch(g, j, i, c, d, e, f, n, o, h, k)
    },
        b;
    try {
        b = typeof SP.UI.PopoutMenu.createPopoutMenuInstanceAndLaunch
    } catch (m) {
        b = "undefined"
    }
    EnsureScript("SP.js", b, l);
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSBreadcrumbEnd)
}
function HasCssClass(d, f, e) {
    a: ;
    var c = d.className;
    if (c == null) return false;
    for (var a = c.split(" "), b = 0; b < a.length; b++) if (a[b] == f) {
        if (e) {
            a.splice(b, 1);
            d.className = a.join(" ")
        }
        return true
    }
    return false
}
function AddSpaceToEmptyTDs(b) {
    a: ;
    if (browseris.ie7down && b != null) {
        if (b.getAttribute("addEmptySpace") == null) b.setAttribute("addEmptySpace", "true");
        else return;
        for (i = 0; i < b.childNodes.length; i++) {
            var a = b.childNodes[i];
            if (a.nodeType == 1 && a.tagName == "TD" && a.width != "1%") if (a.innerHTML == "") a.innerHTML = "&#8203;";
            else if (a.innerText == "") {
                while (a && a.nodeType == 1 && a.innerHTML != "") a = a.firstChild;
                if (a && a.nodeType == 1 && a.innerHTML == "" && (a.tagName == "SPAN" || a.tagName == "DIV" || a.tagName == "NOBR")) a.innerHTML = "&#8203;"
            }
        }
    }
}
function AddBorderToLastCell(c) {
    a: ;
    if (c.getAttribute("setEdgeBorder") != null) return;
    var a = c.cells;
    if (a && a.length > 0) {
        if (browseris.ie7down) a[0].className += "";
        var b = a[a.length - 1];
        if (b) if (b.className != "") b.className += " ms-vb-lastCell";
        else b.className = "ms-vb-lastCell"
    }
    c.setAttribute("setEdgeBorder", "true")
}
function AddCssClassToElement(a, b) {
    a: ;
    var c = a.className;
    if (c != null) {
        if (!HasCssClass(a, b)) a.className = a.className + " " + b
    } else a.className = b
}
function RemoveCssClassFromElement(b, a) {
    a: ;
    HasCssClass(b, a, true)
}
function AddGallery_TypeOf(c) {
    a: ;
    if (c != null) {
        var b = typeof c;
        if (b == "object") if (b.constructor != null) {
            var a = c.constructor.toString(),
                d = a.indexOf(" "),
                e = a.indexOf("("),
                f = a.substr(d + 1, e - d - 1);
            return f
        }
        return b
    }
    return null
}
function IsLanguageSupportedInSilverlight(a) {
    a: ;
    if (a == 1025 || a == 1037 || a == 1054 || a == 1081) return false;
    return true
}
function IsSilverlightInstalled(b) {
    a: ;
    if (b == undefined) b = null;
    var a = false,
        m = null;
    try {
        var i = null,
            j = false;
        if (window.ActiveXObject) try {
            i = new ActiveXObject("AgControl.AgControl");
            if (b === null) a = true;
            else if (i.IsVersionSupported(b)) a = true;
            i = null
        } catch (l) {
            j = true
        } else j = true;
        if (j) {
            var k = navigator.plugins["Silverlight Plug-In"];
            if (k) if (b === null) a = true;
            else {
                var h = k.description;
                if (h === "1.0.30226.2") h = "2.0.30226.2";
                var c = h.split(".");
                while (c.length > 3) c.pop();
                while (c.length < 4) c.push(0);
                var e = b.split(".");
                while (e.length > 4) e.pop();
                var d, g, f = 0;
                do {
                    d = parseInt(e[f]);
                    g = parseInt(c[f]);
                    f++
                } while (f < e.length && d === g);
                if (d <= g && !isNaN(d)) a = true
            }
        }
    } catch (l) {
        a = false
    }
    return a
}
function IsAddGalleryProviderEnabled(c, b) {
    a: ;
    var a;
    try {
        if (window.XMLHttpRequest) a = new XMLHttpRequest;
        else a = new ActiveXObject("Microsoft.XMLHTTP");
        a.open("HEAD", c + b + ".deny.xml", false);
        a.send();
        if (a.status == 200) return false;
        else return true
    } catch (d) {
        return true
    }
}
function DownloadSolutionHandler() {
    a: ;
    LaunchCreateHandler("Provider:AddGallery.OfficeOnlineProvider") && STSNavigate("http://r.office.microsoft.com/r/rlidSPTemplates")
}
function SilverlightBasedCreateHandler(a) {
    a: ;
    var k = new Date,
        f, b, c, i, h;
    if (typeof _spPageContextInfo != "undefined") {
        if (_spPageContextInfo.siteServerRelativeUrl) {
            b = _spPageContextInfo.siteServerRelativeUrl;
            if (b.charAt(b.length - 1) != "/") b = b + "/"
        } else return true;
        if (_spPageContextInfo.webServerRelativeUrl) {
            c = _spPageContextInfo.webServerRelativeUrl;
            if (c.charAt(c.length - 1) != "/") c = c + "/";
            f = c + "_layouts/AddGallery.aspx"
        } else return true;
        if (_spPageContextInfo.webLanguage) i = _spPageContextInfo.webLanguage;
        else return true;
        if (_spPageContextInfo.currentLanguage) h = _spPageContextInfo.currentLanguage;
        else return true
    } else return true;
    if (FV4UI() && IsSilverlightInstalled("3.0.40624.0") && IsLanguageSupportedInSilverlight(i) && IsLanguageSupportedInSilverlight(h)) {
        if (a == null) a = "All";
        if (AddGallery_TypeOf(a) != "string") return true;
        a = a.toLowerCase();
        if (a == "page" || a == "publishingpage") return true;
        var d = [];
        d = a.split(":");
        if (d.length == 2 && d[0] == "provider") if (!IsAddGalleryProviderEnabled(b + "_layouts/AddGalleryProviders/", d[1])) return true;
        var g = function (a, b) {
            a: ;
            if (FV4UI()) {
                if (a) if (b) window.location = b;
                else window.location.reload()
            } else if (a) window.location = a;
            else window.location.reload()
        },
            j = function () {
                a: ;
                var i = {
                    scope: a,
                    currentWeb: c,
                    currentSiteCollection: b,
                    clickDateTime: k
                },
                    e = a == "page" ? 660 : 1012,
                    d = a == "page" ? 360 : 600;
                if (FV4UI()) var j = {
                    width: e,
                    height: d,
                    resizable: true,
                    status: false,
                    menubar: false,
                    help: false,
                    url: f,
                    dialogReturnValueCallback: g,
                    args: i
                },
                    l = SP.UI.ModalDialog.showModalDialog(j);
                else {
                    var h;
                    if (window.showModalDialog) h = "dialogWidth:" + e + "px;dialogHeight:" + d + "px;resizable:yes;status:no;menubar:no;help:no";
                    else h = "width=" + e + ",height=" + d + ",resizable=yes,status=no,menubar=no,help=no";
                    var m = commonShowModalDialog(f, h, g, i)
                }
            },
            e;
        try {
            e = typeof SP.UI.ModalDialog.showModalDialog
        } catch (l) {
            e = "undefined"
        }
        EnsureScript("SP.UI.Dialog.js", e, j);
        return false
    }
    return true
}
function LaunchCreateHandler(a) {
    a: ;
    if (typeof __CreateHandler != "undefined" && __CreateHandler != null) {
        var b = __CreateHandler(a);
        return b
    } else try {
        return SilverlightBasedCreateHandler(a)
    } catch (c) {
        return true
    }
}

function QstringStruct(g) {
    a: ;
    this.nonFilterParams = {};
    this.filterParams = {};
    for (var e = g.split("&"), d = 0; d < e.length; d++) {
        var a = e[d].split("=");
        if (a.length == 2) if (a[0].search("^Filter") != -1) {
            var c = a[0].match("[0-9]*$"),
                b;
            if (typeof this.filterParams[c] != "undefined") b = this.filterParams[c];
            else {
                b = {};
                this.filterParams[c] = b
            }
            var f = a[0].match("^Filter[^0-9]*");
            b[f] = a[1]
        } else this.nonFilterParams[a[0]] = a[1]
    }
}
QstringStruct.prototype.toString = QstringStructToString;

function QstringStructToString() {
    a: ;
    for (var c = [], e = 1, d = 0; d < this.filterParams.length; d++) {
        var f = this.filterParams[d];
        for (var b in f) {
            var a = [];
            a.push(b);
            a.push(e);
            a.push("=");
            a.push(f[b]);
            c.push(a.join(""))
        }
        e++
    }
    for (var b in this.nonFilterParams) {
        var a = [];
        a.push(b);
        a.push("=");
        a.push(this.nonFilterParams[b]);
        c.push(a.join(""))
    }
    return "?" + c.join("&")
}
function ReconcileQstringFilters(i, j) {
    a: ;
    var c = [];
    c.push(new QstringStruct(i));
    c.push(new QstringStruct(j));
    for (var f = [], a = 0; a < c.length; a++) for (var e in c[a].nonFilterParams) if (a == 0 || typeof c[0].nonFilterParams[e] == "undefined" && a == 1) {
        var b = [];
        b.push(e);
        b.push("=");
        b.push(c[a].nonFilterParams[e]);
        f.push(b.join(""))
    }
    for (var h = 1, g = {}, a = 0; a < c.length; a++) for (var k in c[a].filterParams) {
        var d = c[a].filterParams[k];
        if (typeof g[d.FilterField] == "undefined") {
            for (var e in d) {
                var b = [];
                b.push(e);
                b.push(h);
                b.push("=");
                b.push(d[e]);
                f.push(b.join(""))
            }
            h++;
            g[d.FilterField] = d
        }
    }
    return f.join("&")
}
function PageActionClick() {
    a: ;
    EnsureScript("ribbon", TypeofFullName("SP.Ribbon.PageStateActionButton"), function () {
        a: ;
        SP.Ribbon.PageStateActionButton.sendCommand()
    })
}
function ShowWebPartAdder(a) {
    a: ;
    LoadWPAdderOnDemand();
    ExecuteOrDelayUntilEventNotified(function () {
        a: ;
        var b = window.WPAdder;
        if (b != null) {
            b._showCategoryColumn(true);
            b._setZone(a);
            b.show()
        }
    }, "_spEventWebPartAdderReady")
}
var g_notiIcs = null,
    g_notiNoti = null,
    g_notiAnimationInProgress = false,
    g_notiRetiring = false,
    g_notiQueue = [],
    g_notiFrameCount, g_notiAnimationIntervalId, g_notiAnimationRight, g_notiAnimationOpacity, g_notiAnimationSettings, g_notiAnimationSettingsInited = false;

function addNotification(g, f, h, d, e) {
    a: ;
    !g_notiAnimationSettingsInited && _initNotiAnimationSettings();
    var b = document.createElement("span"),
        c;
    b.id = c = "notification_" + getUniqueIndex();
    if (g_notiAnimationInProgress) {
        var a = {};
        a.bIsAdd = true;
        a.id = c;
        a.elm = b;
        a.strHtml = g;
        a.bSticky = f;
        a.tooltip = h;
        a.bNoAnimate = e;
        a.onclickHandler = d;
        g_notiQueue.push(a)
    } else {
        g_notiAnimationInProgress = true;
        _addNotificationInternal(b, g, f, h, d, e)
    }
    return c
}
function _initNotiAnimationSettings() {
    a: ;
    var a = {};
    if (browseris.ie) {
        a.frames = 14;
        a.interval = 20;
        a.right = 4;
        a.opacity = 7.143
    } else {
        a.frames = 28;
        a.interval = 12;
        a.right = 2;
        a.opacity = 3.572
    }
    g_notiAnimationSettings = a;
    g_notiAnimationSettingsInited = true
}
function _addNotificationInternal(a, j, l, k, g, h) {
    a: ;
    var d = g_notiIcs == null ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs;
    if (d != null) {
        d.setAttribute("aria-live", "polite");
        d.setAttribute("aria-relevant", "all");
        var e = document.createElement("span"),
            f = document.createElement("span"),
            b = document.createElement("span");
        a.className = "s4-noti-noti";
        e.className = "s4-noti-in1";
        f.className = "s4-noti-in2";
        b.className = "s4-noti-in3";
        f.appendChild(b);
        e.appendChild(f);
        a.appendChild(e);
        if (k) a.title = k;
        if (g) {
            var c = document.createElement("a");
            c.href = "javascript:;";
            c.onclick = function () {
                a: ;
                g();
                removeNotification(a.id, h);
                return false
            };
            c.innerHTML = j;
            b.appendChild(c)
        } else b.innerHTML = j;
        a.setAttribute("role", "alert");
        var i = document.getElementById("s4-mainarea");
        if (i) {
            var m = AbsTop(i);
            d.style.top = m + 1 + "px"
        }
        _opNotificationInternal(true, a, l, h)
    }
}
function retireNotification() {
    a: ;
    if (g_notiRetiring) return;
    g_notiRetiring = true;
    for (var c = g_notiIcs == null ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs, f = c.getElementsByTagName("span"), k, j = new Date, i = j.valueOf(), a = [], e = true, d = 0; d < f.length; d++) {
        var b = f[d],
            g = b.getAttribute("expires");
        if (g != null) if (i > g) a.push(b);
        else e = false
    }
    while (a.length > 0) {
        var b = a.shift();
        _opNotificationInternal(false, b)
    }
    if (e) {
        var h = c.getAttribute("timerSet");
        c.setAttribute("timerSet", "false");
        window.clearInterval(h)
    }
    g_notiRetiring = false
}
function removeNotification(e, f) {
    a: ;
    var a, d, b = false;
    for (a = 0, d = g_notiQueue.length; a < d; a++) if (e == g_notiQueue[a].id) {
        b = true;
        break
    }
    if (b) {
        g_notiQueue.splice(a, 1);
        return
    }
    var g = g_notiIcs == null ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs;
    if (g != null) {
        var c = document.getElementById(e);
        c != null && _opNotificationInternal(false, c, false, f)
    }
}
function _opNotificationInternal(e, b, d, c) {
    a: ;
    var f = g_notiIcs == null ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs;
    if (!e && g_notiAnimationInProgress) {
        var a = {};
        a.elm = b;
        a.bIsAdd = false;
        a.bSticky = d;
        a.bNoAnimate = c;
        g_notiQueue.push(a)
    } else if (e) {
        _doAddNotification(b, c);
        !d && _setExpireTimer(b)
    } else _doRemoveNotification(b, c)
}
function _setExpireTimer(c) {
    a: ;
    var b = g_notiIcs ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs,
        e = new Date;
    c.setAttribute("expires", e.valueOf() + 5e3);
    var a = b.getAttribute("timerSet");
    if (a == null || a == "false") {
        var d = window.setInterval(retireNotification, 750);
        b.setAttribute("timerSet", d)
    }
}
function _doAddNotification(a, c) {
    a: ;
    var b = g_notiIcs ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs;
    if (c || IsAccessibilityFeatureEnabled()) {
        a.style.right = "32px";
        b.appendChild(a);
        g_notiAnimationIntervalId = -1;
        _onAnimateComplete();
        return
    }
    a.style.right = "-24px";
    _setOpacity(a, 0);
    b.appendChild(a);
    g_notiNoti = a;
    g_notiFrameCount = 0;
    g_notiAnimationRight = -24;
    g_notiAnimationOpacity = 0;
    g_notiAnimationIntervalId = window.setInterval(_animateAddFrame, g_notiAnimationSettings.interval)
}
function _animateAddFrame() {
    a: ;
    var a = g_notiAnimationSettings;
    if (++g_notiFrameCount > a.frames) {
        _onAnimateComplete();
        return
    }
    var c = g_notiNoti,
        d = g_notiAnimationRight += a.right,
        b = g_notiAnimationOpacity += a.opacity;
    if (b > 100) g_notiAnimationOpacity = b = 100;
    c.style.right = d + "px";
    _setOpacity(c, b)
}
function _doRemoveNotification(a, b) {
    a: ;
    g_notiAnimationInProgress = true;
    var c = g_notiIcs ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs;
    if (b || IsAccessibilityFeatureEnabled()) {
        try {
            c.removeChild(a)
        } catch (d) { }
        g_notiAnimationIntervalId = -1;
        _onAnimateComplete();
        return
    }
    g_notiNoti = a;
    g_notiFrameCount = 0;
    g_notiAnimationOpacity = 100;
    g_notiAnimationIntervalId = window.setInterval(_animateRemoveFrame, g_notiAnimationSettings.interval)
}
function _animateRemoveFrame() {
    a: ;
    var c = g_notiNoti,
        b = g_notiAnimationSettings;
    if (++g_notiFrameCount > b.frames) {
        var d = g_notiIcs ? (g_notiIcs = document.getElementById("notificationArea")) : g_notiIcs;
        try {
            d.removeChild(c)
        } catch (e) {
            retireNotification()
        }
        _onAnimateComplete();
        return
    }
    var a = g_notiAnimationOpacity -= b.opacity;
    if (a < 0) g_notiAnimationOpacity = a = 0;
    _setOpacity(c, a)
}
function _onAnimateComplete() {
    a: ;
    g_notiAnimationIntervalId != -1 && window.clearInterval(g_notiAnimationIntervalId);
    if (g_notiQueue.length > 0) {
        var a = g_notiQueue.shift();
        if (a.bIsAdd) _addNotificationInternal(a.elm, a.strHtml, a.bSticky, a.tooltip, a.onclickHandler, a.bNoAnimate);
        else _doRemoveNotification(a.elm, a.bNoAnimate)
    } else g_notiAnimationInProgress = false
}
function _setOpacity(b, a) {
    a: ;
    if (browseris.ie) b.style.filter = "alpha(opacity=" + a + ")";
    else b.style.opacity = a / 100
}
cGCMinimumWidth = 400;
cGCMinimumHeight = 200;
cGCMaxGCResizeCount = 10;
var glGCObjectHeight = 0,
    glGCObjectWidth = 0;
glGCResizeCounter = 0;

function GCComputeSizing(e) {
    a: ;
    if (TestGCObject(e)) {
        var g = document.documentElement.currentStyle.direction == "rtl",
            d = document.compatMode == "BackCompat" ? document.documentElement.scrollWidth : document.documentElement.clientWidth,
            f = document.compatMode == "BackCompat" ? document.documentElement.scrollHeight : document.documentElement.clientHeight,
            b = 0,
            c = 0;
        if (g) {
            b = -180;
            c = 120
        } else {
            b = 32;
            c = -2
        }
        var a = e.parentElement;
        while (a != document.body) {
            b += a.offsetLeft;
            c += a.offsetTop;
            a = a.offsetParent;
            if (a == null) break;
            if (g) if (a.offsetLeft > 0) break
        }
        b += e.parentElement.offsetLeft;
        c += e.parentElement.offsetTop;
        glGCObjectHeight = f - c;
        if (glGCObjectHeight > f) glGCObjectHeight = f;
        if (glGCObjectHeight < cGCMinimumHeight) glGCObjectHeight = cGCMinimumHeight;
        if (g) glGCObjectWidth = d + b;
        else glGCObjectWidth = d - b;
        if (glGCObjectWidth > d) glGCObjectWidth = d;
        if (glGCObjectWidth < cGCMinimumWidth) glGCObjectWidth = cGCMinimumWidth
    }
}
function GCResizeGridControl(a) {
    a: ;
    if (TestGCObject(a)) {
        var c = glGCObjectHeight,
            b = glGCObjectWidth;
        GCComputeSizing(a);
        if (c != glGCObjectHeight) a.height = glGCObjectHeight;
        if (b != glGCObjectWidth) a.width = glGCObjectWidth
    }
}
function GCWindowResize(a) {
    a: ;
    if (TestGCObject(a)) {
        glGCResizeCounter = 0;
        GCResizeGridControl(a)
    }
}
function GCOnResizeGridControl(a) {
    a: ;
    if (TestGCObject(a)) if (glGCResizeCounter < cGCMaxGCResizeCount) {
        glGCResizeCounter++;
        GCResizeGridControl(a)
    }
}
function _GCActivateAndFocus(a) {
    a: ;
    if (TestGCObject(a)) {
        a.SetActive;
        a.Focus
    }
}
function _GCNavigateToNonGridPage() {
    a: ;
    var a = window.location.href;
    gridPart = a.match("ShowInGrid=");
    if (gridPart) {
        gridSet = /ShowInGrid=\w*/;
        a = a.replace(gridSet, "")
    }
    var b = a.indexOf("?");
    if (b != -1) {
        var c = a.indexOf("?", b + 1);
        if (c != -1) a = a.slice(0, c);
        a = a + "&"
    } else a = a + "?";
    a = a + "ShowInGrid=False";
    document.location.replace(STSPageUrlValidation(a))
}
function GCAddNewColumn(a, b) {
    a: ;
    if (TestGCObject(a)) {
        var h = window.location.href,
            e = a.Name,
            g = a.SelectedColumnUniqueName,
            i = a.RightToLeft,
            f = a.ViewGUID,
            c = "FldNew.aspx",
            d = a.ServerTemplate;
        if (d == "102") c = "QstNew.aspx";
        b = b + "/_layouts/" + c + "?List=" + e + "&View=" + f + "&Source=" + h + "&RelativeToField=" + g + "&LTR=" + i;
        window.location = b
    }
}
function GCEditDeleteColumn(a, b) {
    a: ;
    if (TestGCObject(a)) {
        var g = window.location.href,
            f = a.SelectedColumnUniqueName,
            e = a.Name,
            c = "FldEdit.aspx",
            d = a.ServerTemplate;
        if (d == "102") c = "QstEdit.aspx";
        b = b + "/_layouts/" + c + "?List=" + e + "&Field=" + f + "&Source=" + g;
        window.location = b
    }
}
var objGCGlobal = null;

function GCShowTaskPane() {
    a: ;
    if (objGCGlobal != null) {
        objGCGlobal.DisplayTaskPane = true;
        objGCGlobal = null
    }
}
function GCShowHideTaskPane(a) {
    a: ;
    if (TestGCObject(a)) {
        var b = a.DisplayTaskPane;
        a.DisplayTaskPane = !b;
        if (!b) {
            objGCGlobal = a;
            window.setTimeout("GCShowTaskPane()", 5)
        }
    }
}
function GCShowHideTotalsRow(a) {
    a: ;
    if (TestGCObject(a)) {
        var b = a.DisplaySheetTotals;
        a.DisplaySheetTotals = !b
    }
}
function GCGridNewRow(a) {
    a: ;
    TestGCObject(a) && a.SelectNewRow()
}
function GCRefresh(a) {
    a: ;
    TestGCObject(a) && a.Refresh()
}
function GCNewFolder(a) {
    a: ;
    TestGCObject(a) && a.NewFolder()
}
var L_Edit_Text = "编辑",
    L_ViewItem_Text = "查看项目",
    L_EditItem_Text = "编辑项目",
    L_EditSeriesItem_Text = "编辑序列",
    L_DeleteItem_Text = "删除项目",
    L_DeleteDocItem_Text = "删除",
    L_ViewProperties_Text = "查看属性",
    L_EditProperties_Text = "编辑属性",
    L_ViewResponse_Text = "查看答复",
    L_EditResponse_Text = "编辑答复",
    L_DeleteResponse_Text = "删除答复",
    L_Subscribe_Text = "通知我",
    L_CustomizeNewButton_Text = "更改“新建”按钮的顺序",
    L_Review_Text = "请求审阅",
    L_EditIn_Text = "在 ^1 中编辑",
    L_EditInApplication_Text = "编辑文档",
    L_Checkin_Text = "签入",
    L_Checkout_Text = "签出",
    L_DiscardCheckou_Text = "放弃签出",
    L_CreateDWS_Text = "创建文档工作区",
    L_PublishBack_Text = "发布到源位置",
    L_Versions_Text = "版本历史记录",
    L_WorkOffline_Text = "Outlook",
    L_Reply_Text = "答复",
    L_ExportContact_Text = "导出联系人",
    L_ExportEvent_Text = "导出事件",
    L_Reschedule_Text = "重新计划选项",
    L_Move_Text = "移动",
    L_Keep_Text = "保留",
    L_Delete_Text = "删除",
    L_Open_Text = "打开",
    L_SiteSettings_Text = "更改网站设置",
    L_ManageUsers_Text = "管理用户",
    L_DeleteSite_Text = "删除网站",
    L_SiteStorage_Text = "管理网站存储",
    L_MngPerms_Text = "管理权限",
    L_Settings_Text = "设置",
    L_Remove_Text = "从此列表中删除",
    L_ModerateItem_Text = "批准/拒绝",
    L_PublishItem_Text = "发布主要版本",
    L_CancelPublish_Text = "取消审批",
    L_UnPublishItem_Text = "取消发布此版本",
    L_DownloadOriginal_Text = "下载图片",
    L_EditVersion_Text = "编辑",
    L_EditInOIS_Text = "编辑图片",
    L_Workflows_Text = "工作流",
    L_OpenMenu_Text = "打开菜单",
    L_Send_Text = "发送到",
    L_ExistingCopies_Text = "现有副本",
    L_OtherLocation_Text = "其他位置",
    L_GoToSourceItem_Text = "转到源项目",
    L_NotifyThisIsCopy_Text = "此项目从其他位置复制而来，并可从该位置接收更新。应确保该源停止发送更新，否则会重新创建该项目。\n\n",
    L_SendToEmail_Text = "通过电子邮件发送链接",
    L_DownloadACopy_Text = "下载副本",
    L_DocTran_Text = "转换文档",
    L_AddToMyLinks_Text = "添加到“我的链接”",
    L_AddToCategory_Text = "提交到门户区域",
    L_VS_DownArrow_Text = "选择视图",
    L_ModifyView = "修改此视图",
    L_CreateView = "新建视图",
    L_SubmitFileCopyWarning_Text = "是否确实要将此文档复制到 ^1?",
    L_SubmitFileMoveWarning_Text = "是否确实要将此文档移动到 ^1?",
    L_SubmitFileLinkWarning_Text = "是否确实要将此文档移动到 ^1? 将创建到一个到目标文档的链接。",
    SubmitFileConfirmation = [];
SubmitFileConfirmation["Copy"] = L_SubmitFileCopyWarning_Text;
SubmitFileConfirmation["Move"] = L_SubmitFileMoveWarning_Text;
SubmitFileConfirmation["Link"] = L_SubmitFileLinkWarning_Text;
var L_ServerBusyError = "服务器正忙。请稍后再试。",
    L_ItemGone = "此项目不再可用。可能已被其他用户删除。单击“确定”刷新网页。",
    L_ActivateSolution_Text = "激活",
    L_DeactivateSolution_Text = "停用",
    L_UpgradeSolution_Text = "升级",
    L_Notification_Delete = "正在删除...",
    L_Notification_CheckIn = "正在签入...",
    L_Notification_CheckOut = "正在签出...",
    L_Notification_DiscardCheckOut = "正在放弃签出...";

function CUIInfo(a, c, b) {
    a: ;
    a.CUICommand = c;
    a.CUIEnabledCommands = b
}
function resetExecutionState() {
    a: ;
    IsMenuShown = false;
    itemTable = null;
    imageCell = null;
    onKeyPress = false;
    currentCtx = null;
    currentEditMenu = null;
    currentItemID = null;
    downArrowText = null;
    resetItemGlobals()
}
function resetItemGlobals() {
    a: ;
    currentItemAppName = null;
    currentItemProgId = null;
    currentItemIcon = null;
    currentItemOpenControl = null;
    currentItemModerationStatus = null;
    currentItemUIString = null;
    currentItemCheckedoutToLocal = null;
    currentItemCanModify = null;
    currentItemFileUrl = null;
    currentItemFSObjType = null;
    currentItemContentTypeId = null;
    currentItemCheckedOutUserId = null;
    currentItemCheckoutExpires = null;
    currentItemPermMaskH = null;
    currentItemPermMaskL = null;
    currentItemIsEventsExcp = null;
    currentItemIsEventsDeletedExcp = null
}
function IsMenuEnabled() {
    a: ;
    return browseris.ie55up || browseris.nav6up || browseris.safari125up
}
function GetSelectedElement(a, c, b) {
    a: ;
    while (a != null && a.tagName != c && (b == null || a.tagName != b)) a = a.parentNode;
    return a
}
function setupMenuContext(a) {
    a: ;
    currentCtx = a
}
function setupMenuContextName(strCtx) {
    a: ;
    try {
        eval("var ctx=" + strCtx + ";")
    } catch (e) {
        eval("var ctx=g_ctxDict['" + strCtx + "'];")
    }
    setupMenuContext(ctx)
}
function FindSTSMenuTable(a, c) {
    a: ;
    var b = a.getAttribute(c);
    while (a != null && (b == null || b == "")) {
        a = GetSelectedElement(a.parentNode, "TABLE", "DIV");
        if (a != null) b = a.getAttribute(c)
    }
    return a
}
function OnLinkDeferCall(a) {
    a: ;
    if (!IsMenuEnabled()) return false;
    a.onfocusout = OutItem;
    a.onkeydown = PopMenu;
    var b = FindSTSMenuTable(a, "CTXName");
    if (b == null) return false;
    OnItem(b);
    return false
}
function StartDeferItem(a) {
    a: ;
    if (a != itemTable) {
        itemTableDeferred = a;
        var c = a.tagName == "TABLE";
        if (c) {
            a.onmouseout = EndDeferItem;
            a.onclick = DeferredOnItem;
            a.oncontextmenu = DeferredOnItem
        } else {
            var b = a.parentNode;
            b.onmouseout = EndDeferItem;
            b.oncontextmenu = DeferredOnItem
        }
    }
}
function IsAjaxMenu(d) {
    a: ;
    var a = d.getAttribute("eventtype");
    if (a != null && (a == 5 || a == 3 || a == 4)) return false;
    var c = d.className;
    if (c != null && c.length > 0) {
        var b = c.split(" ");
        if (b != null && b.length > 1 && b[b.length - 1] == "itx") return true
    }
    return false
}
function DeferredOnItem(b) {
    a: ;
    var a = itemTableDeferred;
    if (a != null) {
        MenuHtc_hide();
        OnItem(a);
        if (IsAjaxMenu(a)) CreateAjaxMenu(b);
        else CreateMenu(b);
        return false
    }
}
function EndDeferItem() {
    a: ;
    var a = itemTableDeferred;
    if (a != null) {
        itemTableDeferred = null;
        var c = a.tagName == "TABLE";
        if (c) {
            a.onmouseout = null;
            a.onclick = null;
            a.oncontextmenu = null
        } else {
            var b = a.parentNode;
            b.onmouseout = null;
            b.onclick = null;
            b.oncontextmenu = null
        }
    }
}
function GetLastChildElement(b) {
    a: ;
    for (var a = b.childNodes.length - 1; a >= 0; a--) if (b.childNodes[a].nodeType == 1) return b.childNodes[a];
    return null
}
function CreateCtxImg(c, h) {
    a: ;
    var a = FindCtxImg(c);
    if (a != null && a.shown == true) return a;
    if (a == null) {
        a = document.createElement("DIV");
        a.className = "s4-ctx";
        var b = [];
        b.push("<span> </span>");
        b.push("<a onfocus='");
        if (c.tagName == "TD") b.push("OnChildItem(this.parentNode.parentNode); return false;'");
        else if (c.tagName == "TH") b.push("OnChildColumn(this.parentNode.parentNode); return false;'");
        else b.push("return false;'");
        b.push("href='javascript:;' onclick='PopMenuFromChevron(event); return false;' title='");
        b.push(L_OpenMenu_Text + "'></a>");
        b.push("<span> </span>");
        a.innerHTML = b.join("");
        delete b;
        c.appendChild(a)
    }
    if (typeof a.shown == "undefined") {
        for (var g = a.getElementsByTagName("SPAN"), i = g.length, e = 0; e < i; e++) if (browseris.ie && browseris.iever == 6) g[e].style.lineHeight = "1px";
        var f = a.getElementsByTagName("A")[0];
        f.onfocusout = h;
        var d = document.createElement("img");
        d.style.visibility = "hidden";
        d.src = "/_layouts/images/ecbarw.png";
        d.alt = L_OpenMenu_Text;
        f.appendChild(d)
    }
    ShowCtxImg(a, true, c);
    return a
}
function FindCtxImg(f) {
    a: ;
    for (var d = null, c = f.childNodes, e = c.length, b = 0; b < e; b++) {
        var a = c[b];
        if (a.nodeType == 1 && a.className.indexOf("s4-ctx") != -1) {
            d = a;
            break
        }
    }
    return d
}
function RemoveCtxImg(b) {
    a: ;
    var a = FindCtxImg(b);
    a != null && ShowCtxImg(a, false, b)
}
function ShowCtxImg(a, e, d) {
    a: ;
    var c = null,
        b = null;
    if (a != null) c = a.getElementsByTagName("A")[0];
    if (c != null) b = c.getElementsByTagName("IMG")[0];
    if (b != null) if (e == true) {
        a.className += " s4-ctx-show";
        PositionCtxImg(a, d, b);
        b.style.visibility = "visible";
        a.shown = true;
        ChevronContainer = d
    } else {
        b.style.visibility = "hidden";
        a.className = "s4-ctx";
        a.shown = false;
        ChevronContainer = null
    }
}
function GetPosition(b) {
    a: ;
    if (b == null) return null;
    var c = 0,
        d = 0,
        h = 0,
        g = 0,
        j = null,
        f = null;
    f = b.offsetParent;
    var e = b,
        a = b;
    while (a.parentNode != null) {
        a = a.parentNode;
        if (a.offsetParent != null) {
            var i = true;
            if (a.scrollTop && a.scrollTop > 0) d -= a.scrollTop;
            if (a.scrollLeft && a.scrollLeft > 0) c -= a.scrollLeft
        }
        if (a == f) {
            c += b.offsetLeft;
            if (a.clientLeft && a.nodeName != "TABLE") c += a.clientLeft;
            d += b.offsetTop;
            if (a.clientTop && a.nodeName != "TABLE") d += a.clientTop;
            b = a;
            if (b.offsetParent == null) {
                if (b.offsetLeft) c += b.offsetLeft;
                if (b.offsetTop) d += b.offsetTop
            }
            f = b.offsetParent
        }
    }
    if (e.offsetWidth) h = e.offsetWidth;
    if (e.offsetHeight) g = e.offsetHeight;
    return {
        left: c,
        top: d,
        width: h,
        height: g
    }
}
function PositionCtxImg(c, b, h) {
    a: ;
    var i = GetPosition(b),
        g = GetPosition(c.offsetParent),
        e = i.top - g.top,
        d = i.left - g.left;
    e = e + b.clientTop;
    var a = c.style;
    a.top = e + "px";
    if (!IsElementRtl(b)) d = d + b.offsetWidth - c.offsetWidth;
    a.left = d + "px";
    var f = b.clientHeight;
    if (browseris.ie && document.compatMode == "BackCompat" & h != null) f -= h.offsetHeight;
    a.height = f + "px";
    a.lineHeight = c.style.height;
    a.margin = "0px"
}
function IsInCtxImg(a) {
    a: ;
    while (a != null && a.tagName != "TD" && a.tagName != "BODY" && a.className.indexOf("s4-ctx") == -1) a = a.parentNode;
    if (a != null && a.className.indexOf("s4-ctx") != -1) return a;
    return null
}
function OnItemDeferCall(g) {
    a: ;
    if (!IsMenuEnabled()) return false;
    if (IsMenuOn()) {
        StartDeferItem(g);
        return false
    }
    if (itemTable == g) return;
    itemTable != null && OutItem();
    itemTable = g;
    currentItemID = GetAttributeFromItemTable(itemTable, "ItemId", "Id");
    var b = itemTable.tagName == "TABLE",
        j = new Function("setupMenuContextName('" + itemTable.getAttribute("CTXName") + "');");
    j();
    var i = currentCtx,
        h = IsAjaxMenu(itemTable);
    if (b) {
        if (browseris.nav6up) itemTable.className = "ms-selectedtitlealternative";
        else itemTable.className = "ms-selectedtitle";
        if (h) itemTable.className = itemTable.className + " itx"
    }
    var a = itemTable.parentNode;
    while (a.tagName != "TD" && a.tagName != "BODY") a = a.parentNode;
    var f = null;
    if (!b) f = CreateCtxImg(a, OutItem);
    if (browseris.ie5up && !browseris.ie55up) {
        itemTable.onclick = EditMenuDefaultForOnclick;
        itemTable.oncontextmenu = EditMenuDefaultForOnclick
    } else {
        var c = h ? CreateAjaxMenu : CreateMenu;
        if (b) {
            itemTable.onclick = c;
            itemTable.oncontextmenu = c
        } else {
            if (f != null) f.onclick = c;
            a.oncontextmenu = c
        }
    }
    if (b) itemTable.onmouseout = OutItem;
    else a.onmouseout = OutItem;
    if (b) {
        var e;
        e = GetFirstChildElement(GetFirstChildElement(itemTable));
        if (e != null) imageCell = GetLastChildElement(e);
        if (i.listTemplate == 200) {
            if (itemTable.getAttribute("menuType") == "Orphaned") downArrowText = L_Reschedule_Text
        } else downArrowText = L_Edit_Text;
        var d = GetFirstChildElement(imageCell);
        d.src = i.imagesPath + "menudark.gif";
        d.alt = downArrowText;
        d.style.visibility = "visible";
        imageCell.className = "ms-menuimagecell"
    }
    return false
}
function OutItem(b) {
    a: ;
    if (!IsMenuOn() && itemTable != null) {
        var d = itemTable.tagName == "TABLE";
        if (d) {
            if (IsAjaxMenu(itemTable)) itemTable.className = "ms-unselectedtitle itx";
            else itemTable.className = "ms-unselectedtitle";
            itemTable.onclick = null;
            itemTable.oncontextmenu = null;
            itemTable.onmouseout = null
        } else {
            var a = itemTable.parentNode,
                c = null;
            if (b == null) b = window.event;
            if (b != null) {
                c = b.toElement != null ? b.toElement : b.relatedTarget;
                if (a != null && c != null && IsContained(c, a)) return true
            }
            if (a != null) {
                a.onclick = null;
                a.oncontextmenu = null;
                a.onmouseout = null;
                RemoveCtxImg(a)
            }
        }
        if (d && imageCell != null) {
            GetFirstChildElement(imageCell).style.visibility = "hidden";
            imageCell.className = ""
        }
        resetExecutionState()
    }
}
function IsContained(a, d) {
    a: ;
    if (a == d) return true;
    for (var c = d.getElementsByTagName(a.tagName), b = 0; b < c.length; b++) if (a == c[b]) return true;
    return false
}
function IsMenuOn() {
    a: ;
    if (!IsMenuShown) return false;
    var a = false;
    a = MenuHtc_isOpen(currentEditMenu);
    if (!a) IsMenuShown = false;
    return a
}
function PopMenuFromChevron(b) {
    a: ;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSFilterSortStart);
    if (b == null) b = window.event;
    var e = b.srcElement ? b.srcElement : b.target,
        a = e.parentNode;
    while (a.tagName != "TD" && a.tagName != "TH" && a.tagName != "BODY") a = a.parentNode;
    if (a.tagName == "TD") {
        var d = a.getElementsByTagName("DIV")[0];
        d != null && OnItemDeferCall(d)
    } else if (a.tagName == "TH") {
        var c = a.getElementsByTagName("DIV")[0];
        c != null && OnMouseOverFilterDeferCall(c)
    }
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSFilterSortEnd);
    return false
}
function PopMenu(a) {
    a: ;
    if (!IsMenuEnabled()) return true;
    if (a == null) a = window.event;
    var b;
    if (a == null) return true;
    if (browseris.nav6up) b = a.which;
    else b = a.keyCode;
    if (!IsMenuOn() && (a.shiftKey && b == 13 || a.altKey && b == 40)) {
        onKeyPress = true;
        var d = a.srcElement ? a.srcElement : a.target,
            c = FindSTSMenuTable(d, "CTXName");
        if (c == null) return false;
        OnItemDeferCall(c);
        if (IsAjaxMenu(c)) CreateAjaxMenu(a);
        else CreateMenu(a);
        onKeyPress = false;
        return false
    } else return true
}
function CreateMenuEx(f, a, e) {
    a: ;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSECBClickStart);
    if (a == null) return;
    IsMenuShown = true;
    document.body.onclick = "";
    var c;
    c = BuildMenu(f);
    currentEditMenu = c;
    a.onmouseout = null;
    var b = a.tagName == "DIV" ? a.parentNode : a,
        d = FindCtxImg(b);
    d != null && d.shown == false && ShowCtxImg(d, true, b);
    OMenu(c, b, null, null, -1);
    if (itemTable != null && itemTable.tagName != "DIV") itemTable = GetSelectedElement(a, "TABLE", "DIV");
    if (b.tagName == "TD") b.onclick = SingleItemSelect;
    c._onDestroy = OutItem;
    if (e != null) e.cancelBubble = true;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSECBClickEnd);
    return false
}
function BuildMenuWithInit(a) {
    a: ;
    resetItemGlobals();
    setDocType();
    currentItemID = GetAttributeFromItemTable(itemTable, "ItemId", "Id");
    currentItemCheckedOutUserId = itemTable.COUId;
    currentItemCheckedoutToLocal = GetAttributeFromItemTable(itemTable, "COut", "IsCheckedoutToLocal ");
    currentItemModerationStatus = GetAttributeFromItemTable(itemTable, "MS", "MStatus");
    return BuildMenu(a)
}
function BuildMenu(a) {
    a: ;
    var b = CMenu(currentItemID + "_menu");
    if (!b) return;
    else if (a.isVersions) AddVersionMenuItems(b, a);
    else if (a.listTemplate == 121) AddSolutionsCatalogMenuItems(b, a);
    else if (a.listBaseType == 1) AddDocLibMenuItems(b, a);
    else if (a.listTemplate == 200) AddMeetingMenuItems(b, a);
    else AddListMenuItems(b, a);
    InsertFeatureMenuItems(b, a);
    return b
}
function CreateAjaxMenu(a) {
    a: ;
    if (!IsContextSet()) return;
    if (a == null) a = window.event;
    var c = a.srcElement ? a.srcElement : a.target;
    if (itemTable == null || itemTable.tagName == "TABLE" && imageCell == null || onKeyPress == false && !IsInCtxImg(c) && (c.tagName == "A" || c.parentNode.tagName == "A")) return;
    var b = itemTable,
        d = b.parentNode;
    if (d != null && d.getAttribute("creatingAjax") == 1) return;
    b.parentNode.setAttribute("creatingAjax", "1");
    var e = currentCtx,
        f = function (c, a) {
            a: ;
            b.parentNode.replaceChild(a, b);
            a.onclick = b.onclick;
            a.onmousehover = OnItem;
            OnItemDeferCall(a);
            CreateMenuEx(c, a, null);
            a.parentNode.removeAttribute("creatingAjax")
        };
    FetchEcbInfo(e, itemTable.id, itemTable.tagName, f);
    a.cancelBubble = true;
    return false
}
var nidEcbMenu = null;

function FetchEcbInfo(b, f, h, g) {
    a: ;
    var a = [],
        d = escapeUrlForCallback(b.HttpRoot);
    a.push(d);
    d[d.length - 1] != "/" && a.push("/");
    a.push("_layouts/inplview.aspx?Cmd=Ctx&List=");
    a.push(b.listName);
    b.HasRelatedCascadeLists == 1 && b.CascadeDeleteWarningMessage == null && a.push("&CascDelWarnMessage=1");
    if (b.view != null) {
        a.push("&View=");
        a.push(b.view)
    }
    a.push("&ViewCount=");
    a.push(b.ctxId);
    if (typeof b.isXslView != "undefined" && b.isXslView) {
        a.push("&IsXslView=TRUE");
        a.push("&Field=");
        if (itemTable != null) a.push(GetAttributeFromItemTable(itemTable, "Field", "Field"));
        else a.push("LinkFilename")
    }
    a.push("&ID=");
    a.push(f);
    var e = GetUrlKeyValue("RootFolder", true, document.URL);
    if (e.length > 0) {
        a.push("&RootFolder=");
        a.push(e)
    }
    a.push("&ListViewPageUrl=");
    var j = new CUrl(document.URL);
    d = j.path;
    a.push(d);
    if (typeof b.overrideScope != "undefined") {
        a.push("&OverrideScope=");
        a.push(escapeProperlyCore(b.overrideScope))
    }
    var i = a.join("");
    if (nidEcbMenu == null) nidEcbMenu = addNotification(L_Loading_Text, true);
    var c;
    if (window.XMLHttpRequest) c = new XMLHttpRequest;
    else c = new ActiveXObject("Microsoft.XMLHTTP");
    c.open("GET", i, true);
    c.onreadystatechange = function () {
        a: ;
        if (c.readyState != 4) return;
        if (c.status == 601) {
            if (nidEcbMenu != null) {
                removeNotification(nidEcbMenu);
                nidEcbMenu = null
            }
            alert(c.responseText)
        } else if (c.status == 503) {
            if (nidEcbMenu != null) {
                removeNotification(nidEcbMenu);
                nidEcbMenu = null
            }
            alert(L_ServerBusyError)
        } else {
            var a = c.responseText,
                j = document.createElement("DIV");
            j.style.visibility = "hidden";
            if (b.HasRelatedCascadeLists == 1 && b.CascadeDeleteWarningMessage == null) {
                var l = "<CascadeDeleteWarningMessage>",
                    m = "</CascadeDeleteWarningMessage>";
                if (a.startsWith(l)) {
                    var k = a.indexOf(m);
                    if (k !== -1) {
                        b.CascadeDeleteWarningMessage = a.substring(l.length, k);
                        a = a.substring(k + m.length)
                    }
                }
            }
            j.innerHTML = a;
            for (var i = j.getElementsByTagName(h), d, e = 0; e < i.length; e++) {
                d = i[e];
                if (d.id == f) break
            }
            if (e == i.length) d = null;
            if (d != null) {
                g(b, d);
                if (nidEcbMenu != null) {
                    removeNotification(nidEcbMenu);
                    nidEcbMenu = null
                }
            } else {
                if (nidEcbMenu != null) {
                    removeNotification(nidEcbMenu);
                    nidEcbMenu = null
                }
                alert(L_ItemGone);
                RefreshPage(1)
            }
        }
    };
    c.send(null)
}
function CreateMenu(a) {
    a: ;
    if (!IsContextSet()) return;
    var c = currentCtx;
    if (a == null) a = window.event;
    var b = a.srcElement ? a.srcElement : a.target;
    if (itemTable == null || itemTable.tagName == "TABLE" && imageCell == null || onKeyPress == false && !IsInCtxImg(b) && (b.tagName == "A" || b.parentNode.tagName == "A")) return;
    return CreateMenuEx(c, itemTable, a)
}
function AddSendSubMenu(w, a) {
    a: ;
    strDisplayText = L_Send_Text;
    var v = GetAttributeFromItemTable(itemTable, "Url", "ServerUrl"),
        d, j, e;
    if (currentItemFileUrl != null) {
        j = unescapeProperly(currentItemFileUrl);
        d = escapeProperly(j);
        e = SzExtension(j);
        if (e != null && e != "") e = e.toLowerCase()
    }
    var h = itemTable.getAttribute("SRed"),
        p = itemTable.getAttribute("DefaultIO");
    if (p == "0" && !HasRights(0, 32)) p = "1";
    var m = currentItemProgId != "SharePoint.WebPartPage.Document" && (h == null || h == "" || HasRights(0, 32)) && e != "aspx",
        n = HasRights(16, 0),
        l = currentItemFSObjType != 1 && a.listBaseType == 1 && (h == null || h == "" || HasRights(0, 32));
    if (!m && !n && !l) return;
    var c = CASubM(w, strDisplayText, "", "", 400);
    CUIInfo(c, "SendTo", ["SendTo", "PopulateSendToMenu"]);
    c.IsSubMenu = true;
    c.id = "ID_Send";
    var b;
    if (m) {
        if (typeof a.SendToLocationName != "undefined" && a.SendToLocationName != null && a.SendToLocationName != "" && typeof a.SendToLocationUrl != "undefined" && a.SendToLocationUrl != null && a.SendToLocationUrl != "") {
            strAction = "STSNavigate('" + a.HttpRoot + "/_layouts/copy.aspx?SourceUrl=" + d + "&FldUrl=" + escapeProperly(a.SendToLocationUrl);
            strAction = AddSourceToUrl(strAction) + "')";
            b = CAMOpt(c, a.SendToLocationName, strAction, "");
            CUIInfo(b, "SendToRecommendedLocation", ["SendToRecommendedLocation"])
        }
        if (typeof itemTable.getAttribute("HCD") != "undefined" && itemTable.getAttribute("HCD") == "1") {
            strDisplayText = L_ExistingCopies_Text;
            strAction = "STSNavigate('" + a.HttpRoot + "/_layouts/updatecopies.aspx?SourceUrl=" + d;
            strAction = AddSourceToUrl(strAction) + "')";
            strImagePath = a.imagesPath + "existingLocations.gif";
            b = CAMOpt(c, strDisplayText, strAction, strImagePath);
            b.id = "ID_ExistingCopies";
            CUIInfo(b, "SendToExistingCopies", ["SendToExistingCopies"])
        }
        strDisplayText = L_OtherLocation_Text;
        strAction = "NavigateToSendToOtherLocationV4(event, '" + a.HttpRoot + "/_layouts/copy.aspx?SourceUrl=" + d;
        strAction = AddSourceToUrl(strAction) + "')";
        strImagePath = a.imagesPath + "sendOtherLoc.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath);
        b.id = "ID_OtherLocation";
        CUIInfo(b, "SendToOtherLocation", ["SendToOtherLocation"]);
        if (a.OfficialFileNames != null && a.OfficialFileNames != "") {
            var k = a.OfficialFileNames.split("__HOSTSEPARATOR__");
            if (k != null) for (var i = 0; i < k.length; i++) {
                var u = k[i],
                    f = u.split(",");
                strDisplayText = f[0];
                var t = 0,
                    s = "Copy";
                if (f.length == 3) {
                    strDisplayText = f[0].replace(/%2c/g, ",").replace(/%25/g, "%");
                    t = f[1];
                    s = f[2]
                }
                strAction = 'if(confirm("' + StBuildParam(SubmitFileConfirmation[s], STSScriptEncode(strDisplayText)) + "\")!=0) SubmitFormPost('" + a.HttpRoot + "/_layouts/SendToOfficialFile.aspx?ID=" + escapeProperly(strDisplayText) + "&Index=" + t + "&SourceUrl=" + d;
                strAction = AddSourceToUrl(strAction) + "')";
                strImagePath = "";
                b = CAMOpt(c, strDisplayText, strAction, strImagePath);
                var o = "SendToOfficialFile" + i;
                CUIInfo(b, o, [o])
            }
        }
        CAMSep(c)
    }
    if (n) {
        strDisplayText = L_SendToEmail_Text;
        var v = GetAttributeFromItemTable(itemTable, "Url", "ServerUrl"),
            g = a.HttpRoot.substr(0);
        if (g[g.length - 1] != "/") g += "/";
        var q = -1,
            r = "";
        q = g.substring(8).indexOf("/") + 8;
        r = g.substr(0, q) + escapeProperlyCore(unescapeProperly(v), true);
        strAction = "javascript:SendEmail('" + r + "')";
        strImagePath = a.imagesPath + "gmailnew.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath);
        CUIInfo(b, "EmailLink", ["EmailLink"]);
        b.id = "ID_SendToEmail"
    }
    if (l) {
        a.listTemplate != 109 && a.listTemplate != 119 && AddWorkspaceMenuItem(c, a);
        if (a.listTemplate != 119) {
            strAction = "STSNavigate('" + a.HttpRoot + "/_layouts/download.aspx?SourceUrl=" + d + "&FldUrl=" + escapeProperly(a.SendToLocationUrl);
            strAction = AddSourceToUrl(strAction) + "')";
            b = CAMOpt(c, L_DownloadACopy_Text, strAction, "");
            CUIInfo(b, "DownloadCopy", ["DownloadCopy"]);
            b.id = "ID_DownloadACopy"
        }
    }
}
function AddDocTransformSubMenu(l, h) {
    a: ;
    if (typeof rgDocTransformers == "undefined" || rgDocTransformers == null) return;
    var b = null,
        c = GetAttributeFromItemTable(itemTable, "Url", "ServerUrl"),
        d;
    if (currentItemFileUrl != null) d = escapeProperly(unescapeProperly(currentItemFileUrl));
    var g = c.lastIndexOf(".");
    if (g > 0) for (var j = c.substring(g + 1, c.length).toLowerCase(), e = false, a = 0; a < rgDocTransformers.length; a++) if (rgDocTransformers[a].ConvertFrom == j) {
        var f = GetAttributeFromItemTable(itemTable, "CId", "ContentTypeId"),
            k = new RegExp("/|" + f + "|/");
        if (f && !k.test(rgDocTransformers[a].ExcludedContentTypes)) {
            if (!e) {
                b = CASubM(l, L_DocTran_Text, h.imagesPath + "ConvertDocument.gif", L_DocTran_Text, 500);
                b.IsSubMenu = true;
                b.Id = "ID_ConvertDocument";
                e = true
            }
            strAction = "STSNavigate('" + h.HttpRoot + "/_layouts/" + escapeProperlyCore(rgDocTransformers[a].TransformUIPage, true) + "?FileName=" + d + "&TID=" + rgDocTransformers[a].Id;
            strAction = AddSourceToUrl(strAction) + "')";
            var i;
            i = CAMOpt(b, rgDocTransformers[a].Name, strAction, "");
            i.Id = "ID_Transform" + rgDocTransformers[a].Id
        }
    }
}
function AddMeetingMenuItems(d, b) {
    a: ;
    if (itemTable.getAttribute("menuType") == "Orphaned") {
        var a, c = GetAttributeFromItemTable(itemTable, "ItemId", "Id");
        strDisplayText = L_Move_Text;
        strAction = "GoToMtgMove('" + b.listUrlDir + "'," + c + ",'" + itemTable.getAttribute("DateTime") + "','" + itemTable.getAttribute("DateTimeISO") + "')";
        strImagePath = "";
        a = CAMOpt(d, strDisplayText, strAction, strImagePath);
        a.id = "ID_Move";
        strDisplayText = L_Keep_Text;
        strAction = "MtgKeep('" + b.HttpPath + "','" + b.listName + "'," + c + ")";
        strImagePath = "";
        a = CAMOpt(d, strDisplayText, strAction, strImagePath);
        a.id = "ID_Keep";
        strDisplayText = L_Delete_Text;
        strAction = "MtgDelete('" + b.HttpPath + "','" + b.listName + "'," + c + ")";
        strImagePath = b.imagesPath + "delitem.gif";
        a = CAMOpt(d, strDisplayText, strAction, strImagePath);
        a.id = "ID_Delete"
    }
}
function AddListMenuItems(c, a) {
    a: ;
    if (typeof Custom_AddListMenuItems != "undefined") if (Custom_AddListMenuItems(c, a)) return;
    if (currentItemFileUrl == null) currentItemFileUrl = GetAttributeFromItemTable(itemTable, "Url", "ServerUrl");
    var d;
    if (currentItemFileUrl != null) d = escapeProperly(unescapeProperly(currentItemFileUrl));
    var g = currentItemID;
    if (currentItemIsEventsExcp == null) {
        currentItemIsEventsExcp = false;
        currentItemIsEventsDeletedExcp = false;
        currentItemEvtType = itemTable.getAttribute("EventType");
        if (currentItemEvtType != null && (currentItemEvtType == 2 || currentItemEvtType == 3 || currentItemEvtType == 4)) {
            currentItemIsEventsExcp = true;
            if (currentItemEvtType == 3) currentItemIsEventsDeletedExcp = true;
            if (currentItemID.indexOf(".") != -1) g = currentItemID.split(".")[0]
        }
    }
    var b;
    if (a.listBaseType == 3 && a.listTemplate == 108) {
        strDisplayText = L_Reply_Text;
        if (itemTable.getAttribute("Ordering").length >= 504) {
            var L_ReplyLimitMsg_Text = "无法答复此线索。已达到答复限制。";
            strAction = "alert('" + L_ReplyLimitMsg_Text + "')"
        } else {
            strAction = "STSNavigate('" + a.newFormUrl + "&Threading=" + escapeProperly(itemTable.getAttribute("Ordering")) + "&Guid=" + escapeProperly(itemTable.getAttribute("ThreadID")) + "&Subject=" + escapeProperly(itemTable.getAttribute("Subject"));
            strAction = AddSourceToUrl(strAction) + "')"
        }
        strImagePath = a.imagesPath + "reply.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 100);
        b.id = "ID_Reply"
    }
    AddSharedNamespaceMenuItems(c, a);
    var f = itemTable.getAttribute("CId");
    if (f != null && f.indexOf("0x0106") == 0 && HasRights(16, 0)) {
        strDisplayText = L_ExportContact_Text;
        strAction = "STSNavigate('" + a.HttpPath + "&Cmd=Display&CacheControl=1&List=" + a.listName + "&ID=" + currentItemID + "&Using=" + escapeProperly(a.listUrlDir) + "/vcard.vcf')";
        strImagePath = a.imagesPath + "exptitem.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 350);
        CUIInfo(b, "ExportContact", ["ExportContact"]);
        b.id = "ID_ExportContact"
    }
    CAMSep(c);
    a.verEnabled == 1 && AddVersionsMenuItem(c, a, d);
    if (a.isModerated == true && HasRights(0, 16) && HasRights(0, 4) && HasRights(0, 135168) && a.listBaseType != 4 && currentItemID.indexOf(".0.") < 0) {
        strDisplayText = L_ModerateItem_Text;
        strAction = "NavigateToApproveRejectAspx(event, '" + a.HttpRoot + "/_layouts/approve.aspx?List=" + a.listName + "&ID=" + g;
        strAction = AddSourceToUrl(strAction) + "')";
        strImagePath = a.imagesPath + "apprj.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 850);
        CUIInfo(b, "Moderate", ["Moderate"]);
        b.id = "ID_ModerateItem"
    }
    CAMSep(c);
    AddWorkflowsMenuItem(c, a);
    var e = typeof _spPageContextInfo != "undefined" && _spPageContextInfo != null && _spPageContextInfo.alertsEnabled;
    if (currentItemID.indexOf(".0.") < 0 && HasRights(128, 0) && !a.ExternalDataList && e) {
        strDisplayText = L_Subscribe_Text;
        strAction = "NavigateToSubNewAspxV4(event, '" + a.HttpRoot + "', 'List=" + a.listName + "&ID=" + currentItemID + "')";
        strImagePath = "";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1100);
        b.id = "ID_Subscribe";
        CUIInfo(b, "Subscribe", ["Subscribe"])
    } (e || a.WorkflowsAssociated && HasRights(0, 4)) && CAMSep(c);
    AddManagePermsMenuItem(c, a, a.listName, currentItemID);
    if (currentItemID.indexOf(".0.") < 0 && HasRights(0, 8) && !currentItemIsEventsExcp) {
        if (a.listBaseType == 4) strDisplayText = L_DeleteResponse_Text;
        else strDisplayText = L_DeleteItem_Text;
        strAction = "DeleteListItem()";
        strImagePath = a.imagesPath + "delitem.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1180);
        CUIInfo(b, "Delete", ["Delete"]);
        b.id = "ID_DeleteItem";
        CUIInfo(b, "Delete", ["Delete"])
    }
    var h = currentItemProgId != null && currentItemProgId != "";
    if (currentItemFSObjType == 1 && !h && a.ContentTypesEnabled && a.listTemplate != 108) {
        strDisplayText = L_CustomizeNewButton_Text;
        strAction = "STSNavigate('" + a.HttpRoot + "/_layouts/ChangeContentTypeOrder.aspx?List=" + a.listName + "&RootFolder=" + d;
        strAction = AddSourceToUrl(strAction) + "')";
        strImagePath = "";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1170);
        CUIInfo(b, "ChangeNewButton", ["ChangeNewButton"]);
        b.id = "ID_CustomizeNewButton"
    }
}
function ReplaceUrlTokens(c, d) {
    a: ;
    if (c == null || c == undefined || c == "") {
        c = "";
        return c
    }
    if (currentItemID != null) c = c.replace(/{ItemId}/g, currentItemID);
    var a = null,
        b = null,
        f = c.indexOf("?");
    if (-1 != f && f + 2 < c.length) {
        a = c.substr(f + 1);
        b = c.substr(0, f + 1)
    } else b = c;
    if (currentItemFileUrl != null) {
        if (null != a) {
            var e = escapeProperly(unescapeProperly(currentItemFileUrl));
            a = a.replace(/{ItemUrl}/g, e)
        }
        b = b.replace(/{ItemUrl}/g, currentItemFileUrl)
    }
    if (d.HttpRoot != null) {
        if (null != a) {
            var e = escapeProperly(unescapeProperly(d.HttpRoot));
            a = a.replace(/{SiteUrl}/g, e)
        }
        b = b.replace(/{SiteUrl}/g, d.HttpRoot)
    }
    if (d.listName != null) {
        if (null != a) {
            var e = escapeProperly(d.listName);
            a = a.replace(/{ListId}/g, e)
        }
        b = b.replace(/{ListId}/g, d.listName)
    }
    if (d.listUrlDir != null) {
        if (null != a) {
            var e = escapeProperly(unescapeProperly(d.listUrlDir));
            a = a.replace(/{ListUrlDir}/g, e)
        }
        b = b.replace(/{ListUrlDir}/g, d.listUrlDir)
    }
    var g = GetSource();
    b = b.replace(/{Source}/g, g);
    if (a != null) if (b.length + a.length + g.length > 1950) a = a.replace(/{Source}/g, "");
    else a = a.replace(/{Source}/g, g);
    if (null == a) return b;
    else return b + a
}
var SYSTEM_ACCOUNT_ID = 1073741823;

function InsertFeatureMenuItems(r, c) {
    a: ;
    CAMSep(r);
    var f = GetAttributeFromItemTable(itemTable, "Ext", "FileType"),
        i = GetAttributeFromItemTable(itemTable, "Type", "HTMLType"),
        e = GetAttributeFromItemTable(itemTable, "CId", "ContentTypeId"),
        j = null,
        g = null,
        o = "ECBItems";
    if (c != null) {
        j = c.listTemplate;
        if (null != c.listName && 0 < c.listName.length) {
            g = c.listName.toLowerCase();
            o = o + "_" + g
        }
    }
    if (f) f = f.toLowerCase();
    if (i) i = i.toLowerCase();
    if (e) e = e.toLowerCase();
    var x, k = document.getElementById(o);
    if (k != null) for (var l = 0; l < k.childNodes.length; l++) {
        var a = k.childNodes[l],
            p = parseInt(GetInnerText(a.childNodes[3])),
            q = parseInt(GetInnerText(a.childNodes[4])),
            h = GetInnerText(a.childNodes[5]),
            b = GetInnerText(a.childNodes[6]),
            d = false;
        if (b) {
            b = b.toLowerCase();
            if (h == "FileType") d = f == b.toLowerCase();
            else if (h == "ProgId") d = i == b.toLowerCase();
            else if (h == "ContentType") d = e && e.indexOf(b.toLowerCase()) == 0;
            else if (h == "List") if (null != j && j == b) d = true;
            else if (null != g && g == b) d = true
        }
        if (d && HasRights(p, q) && !IsTrimmedBySystem(p, q)) {
            var w = a.childNodes[0],
                s = a.childNodes[1],
                u = a.childNodes[2],
                y = parseInt(GetInnerText(a.childNodes[7])),
                t = GetInnerText(w),
                n = ReplaceUrlTokens(GetInnerText(u), c),
                m;
            if (n.substr(0, 11) == "javascript:") m = n;
            else m = "STSNavigate('" + STSScriptEncode(n) + "')";
            var v = ReplaceUrlTokens(GetInnerText(s), c);
            x = CIMOpt(r, t, m, v, null, y)
        }
    }
}
function GetRootFolder2(c) {
    a: ;
    var b = GetUrlKeyValue("RootFolder", false);
    if (c.clvp != null && c.clvp.rootFolder != null) b = c.clvp.rootFolder;
    if (b == "" || bValidSearchTerm) {
        var a;
        if (itemTable) a = GetAttributeFromItemTable(itemTable, "DRef", "FileDirRef");
        if (a != null && a != "") if (a.substring(0, 1) == "/") b = a;
        else b = "/" + a;
        else b = c.listUrlDir
    }
    return b
}
function GetRootFolder(b) {
    a: ;
    var a = GetRootFolder2(b);
    return "&RootFolder=" + escapeProperly(a)
}
function HasRights(a, b) {
    a: ;
    if (currentItemPermMaskH == null) {
        if (itemTable == null) return true;
        var c = GetAttributeFromItemTable(itemTable, "Perm", "PermMask");
        if (c == null) return true;
        var d = itemTable.getAttribute("Author");
        SetCurrentPermMaskFromString(c, d)
    }
    if (!currentItemCanModify && (EqualRights(a, b, 0, 4) || EqualRights(a, b, 0, 8) || EqualRights(a, b, 1073741824, 0))) return false;
    return (b & currentItemPermMaskL) == b && (a & currentItemPermMaskH) == a
}
function EqualRights(a, c, b, d) {
    a: ;
    return a == b && c == d
}
function CheckIfHasRights(a, b, c, d) {
    a: ;
    return (b & d) == b && (a & c) == a
}
function IsTrimmedBySystem(b, c) {
    a: ;
    var a = false;
    if (CheckIfHasRights(0, 4, b, c) && itemTable != null) {
        if (currentItemCheckedOutUserId == null) currentItemCheckedOutUserId = itemTable.getAttribute("COUId");
        a = currentItemCheckedOutUserId == SYSTEM_ACCOUNT_ID && ctx.CurrentUserId != SYSTEM_ACCOUNT_ID
    }
    return a
}
function SetCurrentPermMaskFromString(b, c) {
    a: ;
    var a = b.length;
    if (a <= 10) {
        currentItemPermMaskH = 0;
        currentItemPermMaskL = parseInt(b)
    } else {
        currentItemPermMaskH = parseInt(b.substring(2, a - 8), 16);
        currentItemPermMaskL = parseInt(b.substring(a - 8, a), 16)
    }
    currentItemCanModify = c == null || HasRights(0, 2048) || ctx.CurrentUserId == c || ctx.CurrentUserId == null || ctx.WriteSecurity == 1
}
function AddSharedNamespaceMenuItems(f, a) {
    a: ;
    var g = GetRootFolder(a);
    setupMenuContext(a);
    if (currentItemFileUrl == null) currentItemFileUrl = GetAttributeFromItemTable(itemTable, "Url", "ServerUrl");
    if (currentItemFSObjType == null) currentItemFSObjType = GetAttributeFromItemTable(itemTable, "OType", "FSObjType");
    if (currentItemContentTypeId == null) currentItemContentTypeId = GetAttributeFromItemTable(itemTable, "CId", "ContentTypeId");
    if (currentItemModerationStatus == null) currentItemModerationStatus = GetAttributeFromItemTable(itemTable, "MS", "MStatus");
    if (currentItemCheckedOutUserId == null) currentItemCheckedOutUserId = itemTable.getAttribute("COUId");
    if (currentItemCheckedoutToLocal == null) currentItemCheckedoutToLocal = GetAttributeFromItemTable(itemTable, "COut", "IsCheckedoutToLocal ");
    if (currentItemCheckedoutToLocal != 1) currentItemCheckedoutToLocal = 0;
    var i = currentItemCheckedOutUserId == SYSTEM_ACCOUNT_ID && a.CurrentUserId != SYSTEM_ACCOUNT_ID;
    bIsCheckout = 0;
    if (a.isForceCheckout == true && currentItemCheckedOutUserId == "" && currentItemFSObjType != 1) bIsCheckout = 1;
    var h;
    if (currentItemFileUrl != null) h = escapeProperly(unescapeProperly(currentItemFileUrl));
    var b;
    if (a.listBaseType == 1) strDisplayText = L_ViewProperties_Text;
    else if (a.listBaseType == 4) strDisplayText = L_ViewResponse_Text;
    else strDisplayText = L_ViewItem_Text;
    var d = "";
    if (currentItemContentTypeId != null && currentItemContentTypeId != "") d = "&ContentTypeID=" + currentItemContentTypeId;
    var c = "&";
    if (a.displayFormUrl.indexOf("?") == -1) c = "?";
    var e = a.displayFormUrl + c + "ID=" + currentItemID + d;
    e = AddSourceToUrl(e) + g;
    if (301 == a.listTemplate) strAction = "EditItem('" + e + "')";
    else strAction = "EditItem2(event, '" + e + "')";
    strImagePath = "";
    b = CAMOpt(f, strDisplayText, strAction, strImagePath, null, 200);
    CUIInfo(b, "ViewProperties", ["ViewProperties"]);
    if (a.listBaseType == 1) b.id = "ID_ViewProperties";
    else b.id = "ID_ViewItem";
    if (HasRights(0, 4) && !i && !currentItemIsEventsDeletedExcp) {
        if (a.listBaseType == 1) strDisplayText = L_EditProperties_Text;
        else if (a.listBaseType == 4) strDisplayText = L_EditResponse_Text;
        else strDisplayText = L_EditItem_Text;
        c = "&";
        if (a.editFormUrl.indexOf("?") == -1) c = "?";
        if (a.listBaseType == 1) {
            strAction = "EditItemWithCheckoutAlert(event, '" + a.editFormUrl + c + "ID=" + currentItemID + d;
            strAction = AddSourceToUrl(strAction) + g + "'," + bIsCheckout + ",'" + currentItemCheckedoutToLocal + "','" + STSScriptEncode(currentItemFileUrl) + "','" + a.HttpRoot + "')"
        } else if (FV4UI()) strAction = "EditItem2(event, '" + a.editFormUrl + c + "ID=" + currentItemID + d + "')";
        else {
            strAction = "EditItem('" + a.editFormUrl + c + "ID=" + currentItemID + d;
            strAction = AddSourceToUrl(strAction) + "')"
        }
        strImagePath = a.imagesPath + "edititem.gif";
        b = CAMOpt(f, strDisplayText, strAction, strImagePath, null, 220);
        if (a.listBaseType == 1) {
            b.id = "ID_EditProperties";
            CUIInfo(b, "EditProperties", ["EditProperties"])
        } else {
            b.id = "ID_EditItem";
            CUIInfo(b, "EditProperties", ["EditProperties"])
        }
        if (a.listTemplate == 106 && currentItemID.indexOf(".0.") > 0) {
            var k = currentItemID.indexOf(".0."),
                j = currentItemID.substr(0, k);
            strDisplayText = L_EditSeriesItem_Text;
            strAction = "EditItem2(event, '" + a.editFormUrl + c + "ID=" + j + d;
            strAction = AddSourceToUrl(strAction) + "')";
            strImagePath = a.imagesPath + "recurrence.gif";
            b = CAMOpt(f, strDisplayText, strAction, strImagePath, null, 230);
            CUIInfo(b, "EditSeriesItem", ["EditSeriesItem"]);
            b.id = "ID_EditSeriesItem"
        }
    }
}
function AddSolutionsCatalogMenuItems(a, h) {
    a: ;
    if (HasRights(0, 4)) if (currentItemFSObjType != 1) {
        var b = true,
            c = GetAttributeFromItemTable(itemTable, "Url", null);
        if (c.length > 4) {
            var i = c.substr(c.length - 4).toLowerCase();
            if (i == ".wsp") {
                var d = GetAttributeFromItemTable(itemTable, "SolutionHash", null),
                    g = GetAttributeFromItemTable(itemTable, "Hash", null),
                    f = GetAttributeFromItemTable(itemTable, "SolutionItemID", null),
                    e = GetAttributeFromItemTable(itemTable, "Status", null),
                    j = GetAttributeFromItemTable(itemTable, "id", null);
                if (d != "") if (e == "") AddSolutionMenuActivate(a);
                else if (d == g) {
                    if (j == f) if (e == "1") {
                        b = false;
                        AddSolutionMenuDeactivate(a)
                    } else AddSolutionMenuActivate(a)
                } else AddSolutionMenuUpgrade(a);
                else b = false
            }
        }
        b && AddSolutionMenuDelete(a, h)
    }
}
function AddSolutionMenuHelper(i, d, f, e, g, b, c) {
    a: ;
    var a, h = "if(event){event.currentItemID=" + currentItemID + ';}RunSolutionOperation(event, "' + f + '")';
    a = CAMOpt(i, d, h, e, null, g);
    CUIInfo(a, b, [b]);
    a.id = c
}
function AddSolutionMenuActivate(a) {
    a: ;
    window.SPUserCanManageSolutions == true && AddSolutionMenuHelper(a, L_ActivateSolution_Text, "ACT", "", 1210, "ActivateSolution", "ID_ActivateSolution")
}
function AddSolutionMenuDeactivate(a) {
    a: ;
    window.SPUserCanManageSolutions == true && AddSolutionMenuHelper(a, L_DeactivateSolution_Text, "DEA", "", 1220, "DeactivateSolution", "ID_DeactivateSolution")
}
function AddSolutionMenuUpgrade(a) {
    a: ;
    window.SPUserCanManageSolutions == true && AddSolutionMenuHelper(a, L_UpgradeSolution_Text, "UPG", "", 1230, "UpgradeSolution", "ID_UpgradeSolution")
}
function AddSolutionMenuDelete(e, b) {
    a: ;
    var a, c;
    currentItemFileUrl = GetAttributeFromItemTable(itemTable, "Url", "ServerUrl");
    if (currentItemFileUrl != null) c = escapeProperly(unescapeProperly(currentItemFileUrl));
    strDisplayText = L_DeleteDocItem_Text;
    var d = "false";
    if (typeof itemTable.getAttribute("CSrc") != "undefined" && itemTable.getAttribute("CSrc") != null && itemTable.getAttribute("CSrc") != "") d = "true";
    strAction = "DeleteDocLibItem('" + b.HttpPath + "&Cmd=Delete&List=" + b.listName + "&ID=" + currentItemID + "&owsfileref=" + c + "&NextUsing=" + GetSource() + "'," + d + ")";
    strImagePath = b.imagesPath + "delitem.gif";
    a = CAMOpt(e, strDisplayText, strAction, strImagePath, null, 310);
    a.id = "ID_DeleteDocItem";
    CUIInfo(a, "Delete", ["Delete"])
}
function RunSolutionOperation(b, g) {
    a: ;
    if (!b && !IsContextSet()) return;
    var d = currentCtx ? currentCtx : b.currentCtx,
        e = currentItemID ? currentItemID : b.currentItemID,
        f = d.listUrlDir,
        i = GetSource(),
        a = f + "/Forms/Activate.aspx?Op=" + g + "&ID=" + e + "&Source=" + i;
    if (d.listBaseType == 1) a = a + GetRootFolder(d);
    var h = function () {
        a: ;
        var a = window.location.href,
                b = a.indexOf("#");
        if (b == -1) window.location.href = a;
        else window.location.href = a.substring(0, b)
    },
        j = function () {
            a: ;
            var b = {
                url: a,
                args: null,
                width: 650,
                height: 450,
                dialogReturnValueCallback: h
            },
                c = SP.UI.ModalDialog.showModalDialog(b)
        },
        c;
    try {
        c = typeof SP.UI.ModalDialog.showModalDialog
    } catch (k) {
        c = "undefined"
    }
    EnsureScript("SP.UI.Dialog.js", c, j)
}
function AddDocLibMenuItems(c, a) {
    a: ;
    if (typeof Custom_AddDocLibMenuItems != "undefined") if (Custom_AddDocLibMenuItems(c, a)) return;
    var i = GetRootFolder(a),
        b;
    AddSharedNamespaceMenuItems(c, a);
    CAMSep(c);
    var d;
    if (currentItemFileUrl != null) d = escapeProperly(unescapeProperly(currentItemFileUrl));
    var e = itemTable.getAttribute("SRed"),
        f = currentItemCheckedOutUserId == SYSTEM_ACCOUNT_ID && a.CurrentUserId != SYSTEM_ACCOUNT_ID;
    if (HasRights(0, 4) && HasRights(16, 0) && !f && (e == null || e == "" || HasRights(0, 32))) if (a.isWebEditorPreview == 0 && a.listBaseType == 1) if (a.listTemplate == 109 && itemTable.getAttribute("IsImage") == "1") {
        if (currentItemFSObjType != 1) {
            strDisplayText = L_EditInOIS_Text;
            strAction = "EditSingleImage('" + currentItemID + "')";
            strImagePath = a.imagesPath + "oisweb.gif";
            b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 260);
            b.id = "ID_EditInOIS";
            CUIInfo(b, "EditDocument", ["EditDocument"])
        }
    } else if (a.listTemplate != 119) {
        setDocType();
        if (currentItemAppName != "" && currentItemOpenControl != "") {
            strDisplayText = "";
            if (currentItemAppName != " ") strDisplayText = StBuildParam(L_EditIn_Text, currentItemAppName);
            else {
                var h = StsOpenEnsureEx2(currentItemOpenControl + ".3");
                if (h != null) strDisplayText = L_EditInApplication_Text
            }
            if (strDisplayText != "") {
                strAction = "editDocumentWithProgID2('" + currentItemFileUrl + "', '" + currentItemProgId + "', '" + currentItemOpenControl + "', '" + bIsCheckout + "', '" + a.HttpRoot + "', '" + currentItemCheckedoutToLocal + "')";
                strImagePath = a.imagesPath + currentItemIcon;
                b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 260);
                b.id = "ID_EditIn_" + currentItemAppName;
                CUIInfo(b, "EditDocument", ["EditDocument"])
            }
        }
    }
    CAMSep(c);
    if (HasRights(0, 4)) if (currentItemFSObjType != 1) a.listBaseType == 1 && AddCheckinCheckoutMenuItem(c, a, d);
    (a.verEnabled == 1 || a.isModerated) && currentItemFSObjType != 1 && AddVersionsMenuItem(c, a, d);
    if (HasRights(0, 4)) if (a.isModerated == true && HasRights(0, 16) && ((currentItemModerationStatus == 2 || !a.EnableMinorVersions) && currentItemCheckedOutUserId == "" || currentItemFSObjType == 1)) {
        strDisplayText = L_ModerateItem_Text;
        strAction = "NavigateToApproveRejectAspx(event, '" + a.HttpRoot + "/_layouts/approve.aspx?List=" + a.listName + "&ID=" + currentItemID;
        strAction = AddSourceToUrl(strAction) + GetRootFolder(a) + "')";
        strImagePath = a.imagesPath + "apprj.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 850);
        CUIInfo(b, "Moderate", ["Moderate"]);
        b.id = "ID_ModerateItem"
    }
    CAMSep(c);
    AddWorkflowsMenuItem(c, a);
    if (currentItemFSObjType != 1) {
        if (a.PortalUrl != null) {
            strDisplayText = L_AddToMyLinks_Text;
            strAction = "Portal_Tasks('PinToMyPage')";
            strImagePath = "";
            b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1e3);
            CUIInfo(b, "AddToMyLinks", ["AddToMyLinks"]);
            b.id = "ID_AddToMyLinks"
        }
    } else a.listBaseType == 1 && HasRights(16, 0) && AddWorkOfflineMenuItem(c, a, currentItemFileUrl);
    if (HasRights(128, 0) && typeof _spPageContextInfo != "undefined" && _spPageContextInfo != null && _spPageContextInfo.alertsEnabled) {
        strDisplayText = L_Subscribe_Text;
        strAction = "NavigateToSubNewAspxV4(event, '" + a.HttpRoot + "', 'List=" + a.listName + "&ID=" + currentItemID + "')";
        strImagePath = "";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1100);
        CUIInfo(b, "Subscribe", ["Subscribe"]);
        b.id = "ID_Subscribe"
    }
    if (currentItemFSObjType != 1) {
        AddSendSubMenu(c, a);
        AddGotoSourceItemMenuItem(c, a, itemTable, currentItemFSObjType);
        AddDocTransformSubMenu(c, a)
    }
    if (currentItemFSObjType != 1 && a.listTemplate == 109 && typeof DownloadOriginalImage == "function") {
        strAction = "DownloadOriginalImage(" + currentItemID + ")";
        strImagePath = a.imagesPath + "download.gif";
        strDisplayText = L_DownloadOriginal_Text;
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 550);
        CUIInfo(b, "DownloadOriginalImage", ["DownloadOriginalImage"]);
        b.id = "ID_DownloadOriginal"
    }
    CAMSep(c);
    AddManagePermsMenuItem(c, a, a.listName, currentItemID);
    if (HasRights(0, 8) && !f) {
        strDisplayText = L_DeleteDocItem_Text;
        var g = "false";
        if (typeof itemTable.getAttribute("CSrc") != "undefined" && itemTable.getAttribute("CSrc") != null && itemTable.getAttribute("CSrc") != "") g = "true";
        strAction = "DeleteDocLibItem('" + a.HttpPath + "&Cmd=Delete&List=" + a.listName + "&ID=" + currentItemID + "&owsfileref=" + d + "&NextUsing=" + GetSource() + "'," + g + ")";
        strImagePath = a.imagesPath + "delitem.gif";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1190);
        b.id = "ID_DeleteDocItem";
        CUIInfo(b, "Delete", ["Delete"])
    }
    if (currentItemFSObjType == 1 && a.ContentTypesEnabled && a.listTemplate != 108) {
        strDisplayText = L_CustomizeNewButton_Text;
        strAction = "STSNavigate('" + a.HttpRoot + "/_layouts/ChangeContentTypeOrder.aspx?List=" + a.listName + "&RootFolder=" + d;
        strAction = AddSourceToUrl(strAction) + "')";
        strImagePath = "";
        b = CAMOpt(c, strDisplayText, strAction, strImagePath, null, 1170);
        CUIInfo(b, "ChangeNewButton", ["ChangeNewButton"]);
        b.id = "ID_CustomizeNewButton"
    }
}
function AddManagePermsMenuItem(e, a, c, d) {
    a: ;
    if (!HasRights(1073741824, 0) || currentItemIsEventsExcp || a.ExternalDataList || currentItemEvtType == 5) return;
    strDisplayText = L_MngPerms_Text;
    strAction = "NavigateToManagePermsPage('" + a.HttpRoot + "', '" + c + "','" + d + "')";
    strImagePath = a.imagesPath + "permissions16.png";
    var b = CAMOpt(e, strDisplayText, strAction, strImagePath, null, 1160);
    b.id = "ID_MngPerms";
    CUIInfo(b, "ManagePermissions", ["ManagePermissions"])
}
function AddGotoSourceItemMenuItem(e, d, a, c) {
    a: ;
    if (c != 1 && typeof a.getAttribute("CSrc") != "undefined" && a.getAttribute("CSrc") != null && a.getAttribute("CSrc") != "") {
        strDisplayText = L_GoToSourceItem_Text;
        strAction = "NavigateToSourceItem(event, '" + STSScriptEncode(a.getAttribute("CSrc")) + "')";
        strImagePath = d.imagesPath + "goToOriginal.gif";
        var b = CAMOpt(e, strDisplayText, strAction, strImagePath, null, 440);
        b.id = "ID_GoToSourceItem";
        CUIInfo(b, "GotoSourceItem", ["GotoSourceItem"])
    }
}
function CheckoutSingleItemFromECB(b, c) {
    a: ;
    var a;
    try {
        a = typeof inplview.CheckOutSingleItem
    } catch (g) {
        a = "undefined"
    }
    if (a != "undefined") inplview.CheckOutSingleItem(b, c);
    else {
        var f = "inplview.CheckOutSingleItem",
            d = f.split(".");
        if (d.length > 1) {
            var e = function () {
                a: ;
                inplview.CheckOutSingleItem(b, c)
            };
            EnsureScript(d[0], a, e)
        }
    }
}
function AddCheckinCheckoutMenuItem(d, a, c) {
    a: ;
    var b;
    if (!HasRights(0, 4)) return;
    if (currentItemCheckedOutUserId == SYSTEM_ACCOUNT_ID && a.CurrentUserId != SYSTEM_ACCOUNT_ID) return;
    if (currentItemCheckedOutUserId == null) currentItemCheckedOutUserId = itemTable.getAttribute("COUId");
    if (currentItemCheckedOutUserId != "") {
        if (currentItemCheckedOutUserId == a.CurrentUserId || a.CurrentUserId == null || HasRights(0, 256)) {
            strDisplayText = L_Checkin_Text;
            if (!FV4UI() || a.listTemplate == 109) strAction = "NavigateToCheckinAspx('" + a.HttpRoot + "', 'List=" + a.listName + "&FileName=" + c + "')";
            else strAction = "CheckInSingleItemFromECB_Stub(event, currentCtx, itemTable)";
            strImagePath = a.imagesPath + "checkin.gif";
            b = CAMOpt(d, strDisplayText, strAction, strImagePath, null, 300);
            b.id = "ID_Checkin";
            CUIInfo(b, "CheckIn", ["CheckIn"]);
            strDisplayText = L_DiscardCheckou_Text;
            strAction = "UnDoCheckOutwithNotification('" + a.HttpRoot + "', '" + c + "')";
            strImagePath = a.imagesPath + "unchkout.gif";
            b = CAMOpt(d, strDisplayText, strAction, strImagePath, null, 310);
            b.id = "ID_DiscardCheckou";
            CUIInfo(b, "DiscardCheckOut", ["DiscardCheckOut"])
        }
    } else if (typeof g_disableCheckoutInEditMode == "undefined" || !g_disableCheckoutInEditMode) {
        strDisplayText = L_Checkout_Text;
        currentItemOpenControl == "" && setDocType();
        var h = "";
        if (a.listTemplate != 109) h = currentItemOpenControl + ".3";
        var g = itemTable.getAttribute("SRed");
        if (g == null || g == "" || HasRights(0, 32)) {
            if (!FV4UI() || a.listTemplate == 109) strAction = "CheckoutDocument('" + a.HttpRoot + "', '" + c + "', '" + h + "')";
            else strAction = "CheckoutSingleItemFromECB(currentCtx, itemTable)";
            strImagePath = a.imagesPath + "checkout.gif";
            b = CAMOpt(d, strDisplayText, strAction, strImagePath, null, 300);
            b.id = "ID_Checkout";
            CUIInfo(b, "CheckOut", ["CheckOut"])
        }
        if (currentItemModerationStatus == null) currentItemModerationStatus = GetAttributeFromItemTable(itemTable, "MS", "MStatus");
        if (a.EnableMinorVersions) {
            if (currentItemUIString == null) currentItemUIString = GetAttributeFromItemTable(itemTable, "UIS", "UIString");
            var i = currentItemUIString % 512;
            if ((currentItemModerationStatus == 1 || currentItemModerationStatus == 3) && a.isModerated || !a.isModerated && i != 0) {
                strDisplayText = L_PublishItem_Text;
                strAction = "PublishMajorVersion(event, '" + a.HttpRoot + "', 'List=" + a.listName + "&FileName=" + c + "&Publish=true')";
                strImagePath = a.imagesPath + "pubmajor.gif";
                b = CAMOpt(d, strDisplayText, strAction, strImagePath, null, 320);
                CUIInfo(b, "Publish", ["Publish"]);
                b.id = "ID_PublishItem"
            } else {
                var f, e = false;
                if (!a.isModerated || currentItemModerationStatus == 0) {
                    strDisplayText = L_UnPublishItem_Text;
                    f = "ID_UnPublishItem";
                    strImagePath = a.imagesPath + "unpub.gif"
                } else {
                    strDisplayText = L_CancelPublish_Text;
                    f = "ID_CancelPublish";
                    strImagePath = a.imagesPath + "unapprv.gif";
                    e = true
                }
                strAction = "UnPublish('" + a.HttpRoot + "', 'FileName=" + c + "&UnPublish=true'," + e + ")";
                b = CAMOpt(d, strDisplayText, strAction, strImagePath, null, 330);
                if (e) CUIInfo(b, "CancelApproval", ["CancelApproval"]);
                else CUIInfo(b, "Unpublish", ["Unpublish"]);
                b.id = f
            }
        }
    }
}
function AddWorkflowsMenuItem(h, a) {
    a: ;
    if (a.WorkflowsAssociated && HasRights(0, 4)) {
        var f = GetAttributeFromItemTable(itemTable, "CId", "ContentTypeId");
        if (f == null || f.substr(0, 8) != "0x010801") {
            var g = a.imagesPath + "workflows.gif",
                c, d = ("" + currentItemID).indexOf(".0.");
            if (d > 0) c = currentItemID.substr(0, d);
            else c = currentItemID;
            var b = "STSNavigate('" + a.HttpRoot + "/_layouts/Workflow.aspx?ID=" + c + "&List=" + a.listName;
            b = AddSourceToUrl(b) + "')";
            var e = CAMOpt(h, L_Workflows_Text, b, g, null, 900);
            CUIInfo(e, "ViewWorkflows", ["ViewWorkflows"]);
            e.id = "ID_Workflows"
        }
    }
}
function AddWorkspaceMenuItem(d, b) {
    a: ;
    var a, c = GetAttributeFromItemTable(itemTable, "SUrl", "SourceUrl");
    if (c != null && c != "" && c != "%20") {
        if (HasRights(0, 135168)) {
            strAction = "STSNavigate('" + b.HttpRoot + "/_layouts/publishback.aspx?list=" + b.listName + "&item=" + currentItemID + GetRootFolder(b) + "')";
            a = CAMOpt(d, L_PublishBack_Text, strAction, "", null, 1140);
            CUIInfo(a, "PublishBack", ["PublishBack"]);
            a.id = "ID_PublishBack"
        }
    } else if (HasRights(0, 8388608) && HasRights(0, 135168) && HasRights(0, 67108864)) {
        strAction = "STSNavigate('" + b.HttpRoot + "/_layouts/createws.aspx?list=" + b.listName + "&item=" + currentItemID + GetRootFolder(b) + "')";
        a = CAMOpt(d, L_CreateDWS_Text, strAction, "", null, 1140);
        CUIInfo(a, "CreateDocumentWorkspace", ["CreateDocumentWorkspace"]);
        a.id = "ID_CreateDWS"
    }
}
function AddVersionsMenuItem(f, a, e) {
    a: ;
    if (currentItemID != null) {
        var d = currentItemID.toString();
        if (d.indexOf(".0.") >= 0) return
    }
    var b = currentItemID;
    if (currentItemIsEventsExcp) if (currentItemID.indexOf(".") != -1) b = currentItemID.split(".")[0];
    if (!HasRights(0, 64)) return;
    strDisplayText = L_Versions_Text;
    strAction = "NavigateToVersionsAspxV4(event, '" + a.HttpRoot + "', 'list=" + a.listName + "&ID=" + b + "&FileName=" + e + "')";
    strImagePath = a.imagesPath + "versions.gif";
    var c = CAMOpt(f, strDisplayText, strAction, strImagePath, null, 800);
    CUIInfo(c, "ViewVersions", ["ViewVersions"]);
    c.id = "ID_Versions"
}
function AddWorkOfflineMenuItem(e, a, d) {
    a: ;
    var b = GetStssyncData("documents", L_WorkOffline_Text, a.imagesPath + "tbsprsht.gif", a.imagesPath);
    if (b) {
        strDisplayText = b.BtnText;
        strImagePath = b.BtnImagePath;
        if (strDisplayText) {
            var c = "";
            if (a.SiteTitle != null) c = STSScriptEncode(a.SiteTitle);
            strAction = "javascript:ExportHailStorm('documents','" + a.HttpRoot + "','" + STSScriptEncode(a.listName) + "','" + STSScriptEncode(c) + "','" + STSScriptEncode(a.ListTitle) + "','" + STSScriptEncode(a.listUrlDir) + "','','" + STSScriptEncode(unescapeProperly(a.listUrlDir)) + "'";
            strAction += ",'" + STSScriptEncode(unescapeProperly(d)) + "','" + currentItemID + "')";
            menuOption = CAMOpt(e, strDisplayText, strAction, strImagePath);
            CUIInfo(menuOption, "ConnectFolderToClient", ["ConnectFolderToClient"]);
            menuOption.id = "ID_WorkOffline"
        }
    }
}
function AddVersionMenuItems(b, a) {
    a: ;
    typeof AddVersionMenuItemsCore == "function" && AddVersionMenuItemsCore(b, a)
}
function NavigateToApproveRejectAspx(b, a) {
    a: ;
    if (FV4UI()) ShowInPopUI(b, currentCtx, a);
    else STSNavigate(a)
}
function PublishMajorVersion(d, b, c) {
    a: ;
    var a = b + "/_layouts/Checkin.aspx?" + c;
    a = AddSourceToUrl(a);
    if (FV4UI()) ShowInPopUI(d, currentCtx, a);
    else SubmitFormPost(a)
}
function _NavigateToSubNewAspx(b, c) {
    a: ;
    var a = b + "/_layouts/SubNew.aspx?" + c;
    a = AddSourceToUrl(a);
    STSNavigate(a)
}
function NavigateToSubNewAspxV4(d, b, c) {
    a: ;
    var a = b + "/_layouts/SubNew.aspx?" + c;
    a = AddSourceToUrl(a);
    if (FV4UI()) ShowInPopUI(d, currentCtx, a);
    else STSNavigate(a)
}
function NavigateToVersionsAspx(b, c) {
    a: ;
    var a = b + "/_layouts/Versions.aspx?" + c;
    a = AddSourceToUrl(a);
    STSNavigate(a)
}
function NavigateToVersionsAspxV4(d, b, c) {
    a: ;
    var a = b + "/_layouts/Versions.aspx?" + c;
    a = AddSourceToUrl(a);
    if (FV4UI()) ShowInPopUI(d, currentCtx, a);
    else STSNavigate(a)
}
function NavigateToSendToOtherLocationV4(b, a) {
    a: ;
    if (FV4UI()) ShowInPopUI(b, currentCtx, a);
    else STSNavigate(a)
}
var L_UndoCheckoutWarning_Text = "如果放弃签出，则会丢失对文档所做的所有更改。是否确实要放弃签出?",
    L_UnPublishWarning_Text = " 是否确实要取消发布此版本的文档?",
    L_CancleApproval_TEXT = " 是否确实要取消审批此文档?";

function UnDoCheckOutwithNotification(a, c) {
    a: ;
    var b = UnDoCheckOut(a, c);
    if (b) {
        var d = L_Notification_DiscardCheckOut;
        addNotification(d, true)
    }
}
function UnDoCheckOut(f, c) {
    a: ;
    try {
        var b = null,
            e = SzExtension(unescapeProperly(c));
        if (FSupportCheckoutToLocal(e)) b = StsOpenEnsureEx2("SharePoint.OpenDocuments.3");
        if (b != null) {
            var a = unescapeProperly(c);
            if (a.charAt(0) == "/") a = document.location.protocol + "//" + document.location.host + a;
            var d = b.DiscardLocalCheckout(a);
            if (d) {
                SetWindowRefreshOnFocus();
                return d
            }
            if (IsSupportedMacBrowser() || IsSupportedFirefoxOnWin()) {
                if (!confirm(L_UndoCheckoutWarning_Text)) return false
            } else return d
        } else if (!confirm(L_UndoCheckoutWarning_Text)) return false
    } catch (g) { }
    NavigateToCheckinAspx(f, "FileName=" + c + "&DiscardCheckout=true");
    return true
}
function UnPublish(c, d, b) {
    a: ;
    var a = L_UnPublishWarning_Text;
    if (b) a = L_CancleApproval_TEXT;
    if (!confirm(a)) return;
    NavigateToCheckinAspx(c, d)
}
function NavigateToCheckinAspx(b, c) {
    a: ;
    var a = b + "/_layouts/Checkin.aspx?" + c;
    a = AddSourceToUrl(a);
    SubmitFormPost(a)
}
function CheckInSingleItemFromECB_Stub(c, b, d) {
    a: ;
    var a;
    try {
        a = typeof inplview.CheckInSingleItemFromECB
    } catch (h) {
        a = "undefined"
    }
    if (a != "undefined") inplview.CheckInSingleItemFromECB(c, b, d);
    else {
        var g = "inplview.CheckInSingleItemFromECB",
            e = g.split(".");
        if (e.length > 1) {
            var f = function () {
                a: ;
                inplview.CheckInSingleItemFromECB(c, b, d)
            };
            EnsureScript(e[0], a, f)
        }
    }
}
function _NavigateToManagePermsPage(a, c, b) {
    a: ;
    NavigateToManagePermsPageEx(a, c, b, false)
}
function NavigateToManagePermsPageEx(c, b, d, f) {
    a: ;
    var e = ",LISTITEM",
        a = c + "/_layouts/User.aspx?obj=" + b + "," + d + e + "&List=" + b;
    a = AddSourceToUrl(a);
    if (f) window.frameElement.navigateParent(a);
    else STSNavigate(a)
}
function NavigateToSourceItem(e, a) {
    a: ;
    var d = a.match(/[^\/]*\/\/[^\/]*/g),
        c = d[0];
    a = escapeProperly(a);
    var b = c + "/_layouts/copyutil.aspx?GoToDispForm=1&Use=url&ItemUrl=" + a;
    b = AddSourceToUrl(b);
    STSNavigate(b)
}
function setDocType() {
    a: ;
    var a = GetAttributeFromItemTable(itemTable, "Icon", "DocIcon");
    a = a ? a.split("|") : [];
    currentItemIcon = a[0];
    currentItemAppName = a[1];
    currentItemOpenControl = a[2];
    currentItemProgId = GetAttributeFromItemTable(itemTable, "Type", "HTMLType")
}
function DeleteListItem() {
    a: ;
    if (!IsContextSet()) return;
    var b = currentCtx,
        e = currentItemID,
        g = currentItemFSObjType,
        c = L_STSRecycleConfirm_Text;
    if (!b.RecycleBinEnabled || b.ExternalDataList) c = L_STSDelConfirm_Text;
    if (b.HasRelatedCascadeLists && b.CascadeDeleteWarningMessage != null) c = b.CascadeDeleteWarningMessage + c;
    if (confirm(c)) {
        var h = L_Notification_Delete,
            f = addNotification(h, true),
            a = b.clvp;
        if (b.ExternalDataList && a != null) {
            a.DeleteItemCore(e, g, false);
            a.pendingItems = [];
            a.cctx.executeQueryAsync(function () {
                a: ;
                if (typeof a.rgehs != "undefined") {
                    if (a.rgehs.length == 1 && a.rgehs[0].get_serverErrorCode() == SP.ClientErrorCodes.redirect) {
                        GoToPage(a.rgehs[0].get_serverErrorValue());
                        return
                    }
                    removeNotification(f);
                    a.ShowErrorDialog(RefreshOnDialogClose)
                } else RefreshPage(SP.UI.DialogResult.OK)
            }, function () {
                a: ;
                removeNotification(f);
                typeof a.rgehs != "undefined" && a.ShowErrorDialog()
            })
        } else {
            var d = b.HttpPath + "&Cmd=Delete&List=" + b.listName + "&ID=" + e + "&NextUsing=" + GetSource();
            if (null != currentItemContentTypeId) d += "&ContentTypeId=" + currentItemContentTypeId;
            SubmitFormPost(d)
        }
    }
}
function DeleteDocLibItem(d, e) {
    a: ;
    if (!IsContextSet()) return;
    var b = currentCtx,
        h = currentItemID,
        g = currentItemFSObjType,
        a, c = false;
    if (currentItemFSObjType == 1) {
        if (currentItemContentTypeId != null) {
            d += "&ContentTypeId=" + currentItemContentTypeId;
            if (currentItemContentTypeId.substr(0, 8).toLowerCase() == "0x0120d5") c = true
        }
        if (c) a = b.RecycleBinEnabled ? L_STSRecycleConfirm2_Text : L_STSDelConfirm2_Text;
        else a = b.RecycleBinEnabled ? L_STSRecycleConfirm1_Text : L_STSDelConfirm1_Text
    } else a = b.RecycleBinEnabled ? L_STSRecycleConfirm_Text : L_STSDelConfirm_Text;
    if (b.HasRelatedCascadeLists && b.CascadeDeleteWarningMessage != null) a = b.CascadeDeleteWarningMessage + a;
    if (e && currentItemFSObjType != 1) a = L_NotifyThisIsCopy_Text + a;
    if (confirm(a)) {
        var f = L_Notification_Delete;
        addNotification(f, true);
        SubmitFormPost(d, false, true)
    }
}
function EditMenuDefaultForOnclick() {
    a: ;
    if (!IsContextSet()) return;
    var a = currentCtx;
    if (a.isVersions) STSNavigate(itemTable.getAttribute("verUrl"));
    else if (a.listTemplate == 200) {
        var b = currentItemID;
        MtgNavigate(b)
    } else EditListItem()
}
function EditListItem() {
    a: ;
    if (event.srcElement.tagName == "A" || event.srcElement.parentNode.tagName == "A") return;
    if (!IsContextSet()) return;
    var b = currentCtx,
        c = "&";
    if (b.editFormUrl.indexOf("?") == -1) c = "?";
    var a = b.editFormUrl + c + "ID=" + currentItemID;
    a = AddSourceToUrl(a);
    if (b.listBaseType == 1) a = a + GetRootFolder(b);
    STSNavigate2(event, a)
}
function _DoNavigateToTemplateGallery(a, b) {
    a: ;
    document.cookie = "MSOffice_AWS_DefSaveLoc=" + a;
    STSNavigate(b)
}
function Portal_Tasks(j) {
    a: ;
    if (!IsContextSet()) return;
    var b = currentCtx,
        g = unescapeProperly(currentItemFileUrl),
        c = 0,
        d = 0;
    c = g.lastIndexOf("/");
    d = g.lastIndexOf(".");
    if (c < 0 || d < 0 || c > d) return;
    var i = g.substr(c + 1, d - c - 1),
        f = "";
    c = b.HttpRoot.indexOf("://");
    if (c > 0) {
        d = b.HttpRoot.indexOf("/", c + 3);
        if (d > 0) f = b.HttpRoot.substring(0, d);
        else f = b.HttpRoot
    }
    var e = "";
    if (currentItemFileUrl.charAt(0) == "/" || currentItemFileUrl.substr(0, 3).toLowerCase() == "%2f") e = f + currentItemFileUrl;
    else e = currentItemFileUrl;
    var a = "";
    if (false == setElementValue("ListViewURL", e)) a = a + "&ListViewURL=" + escapeProperly(e);
    if (false == setElementValue("ListTitle", i)) a = a + "&ListTitle=" + escapeProperly(i);
    if (false == setElementValue("ListDescription", "")) a = a + "&ListDescription=";
    if (false == setElementValue("ReturnUrl", window.location.href)) a = a + "&ReturnUrl=" + escapeProperly(window.location.href);
    if (b.PortalUrl.substr(0, 4) != "http") b.PortalUrl = f + b.PortalUrl;
    var h = b.PortalUrl + "_vti_bin/portalapi.aspx?cmd=" + j;
    h = h + "&IconUrl=" + b.imagesPath + currentItemIcon + a;
    SubmitFormPost(h)
}
function IsContextSet() {
    a: ;
    if (currentCtx == null) return false;
    else if (currentCtx.isExplictLogin) return true;
    else if (currentCtx.HttpPath == null || currentItemID == null) return false;
    return true
}
function ChangeContentType(d) {
    a: ;
    var b = document.getElementById(d),
        a = window.location.href,
        e = a.indexOf("?");
    if (a.indexOf("?") <= 0) a = a + "?ContentTypeId=" + b.value;
    else if (a.indexOf("&ContentTypeId=") <= 0) a = a + "&ContentTypeId=" + b.value;
    else {
        var c = /&ContentTypeId=[^&]*/i;
        a = a.replace(c, "&ContentTypeId=" + b.value)
    }
    STSNavigate(a)
}
function _TopHelpButtonClick(a) {
    a: ;
    if (typeof navBarHelpOverrideKey != "undefined") return HelpWindowKey(navBarHelpOverrideKey);
    if (a != null) HelpWindowKey(a);
    else HelpWindowKey("HelpHome")
}
function HelpWindowHelper(d) {
    a: ;
    var c;
    if (typeof d == "undefined") c = "?Lcid=" + L_Language_Text;
    else c = "?Lcid=" + L_Language_Text + d;
    var b;
    if (typeof ctx == "undefined" || ctx == null) if (typeof currentCtx != "undefined" && currentCtx != null) ctx = currentCtx;
    else if (typeof ctxFilter != "undefined" && ctxFilter != null) ctx = ctxFilter;
    if (typeof ctx != "undefined" && ctx != null && typeof ctx.HttpRoot != "undefined" && ctx.HttpRoot != null) {
        var a = ctx.HttpRoot;
        if (a.charAt(a.length - 1) != "/") a = a + "/";
        b = a + "_layouts/help.aspx"
    }
    if (b == null && typeof _spPageContextInfo != "undefined" && _spPageContextInfo != null && typeof _spPageContextInfo.webServerRelativeUrl != "undefined" && _spPageContextInfo.webServerRelativeUrl != null) {
        var a = _spPageContextInfo.webServerRelativeUrl;
        if (a.charAt(a.length - 1) != "/") a = a + "/";
        b = a + "_layouts/help.aspx"
    }
    if (b == null) {
        b = "/_layouts/help.aspx";
        c = c + "&Source=" + escapeProperly(window.location.href)
    }
    var e = window.open(b + c, "STSHELP", "height=500,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no,width=475");
    e.focus()
}
function _HelpWindowKey(a) {
    a: ;
    if (a != null) HelpWindowHelper("&Key=" + a + "&ShowNav=true");
    else HelpWindowHelper("&Key=HelpHome&ShowNav=true")
}
function _HelpWindowUrl(a) {
    a: ;
    HelpWindowHelper("&Url=" + a)
}
function _HelpWindow() {
    a: ;
    HelpWindowKey("HelpHome")
}
var L_EmptySlideShow_Text = "该库中找不到任何图片。请添加图片并重试。",
    L_NotOurView_Text = "该操作不能在当前视图中完成。请选择其他视图并重试。";

function EditSelectedImages() {
    a: ;
    if (!IsImgLibJssLoaded()) {
        alert(L_NotOurView_Text);
        return
    }
    _EditSelectedImages()
}
function DeleteImages() {
    a: ;
    if (!IsImgLibJssLoaded()) {
        alert(L_NotOurView_Text);
        return
    }
    _DeleteImages()
}
function SendImages() {
    a: ;
    if (!IsImgLibJssLoaded()) {
        alert(L_NotOurView_Text);
        return
    }
    _SendImages()
}
function DownloadImages() {
    a: ;
    if (!IsImgLibJssLoaded()) {
        alert(L_NotOurView_Text);
        return
    }
    _DownloadImages()
}
function MtgToggleTimeZone() {
    a: ;
    var b = document.getElementById("TimeZoneSection"),
        a = document.getElementById("TimeZoneLink"),
        L_ShowTZ_Text = "显示时区",
        L_HideTZ_Text = "隐藏时区";
    if (b.style.display == "none") {
        b.style.display = "";
        a.innerHTML = "&lt;&lt;";
        a.title = L_HideTZ_Text;
        SetCookie("MtgTimeZone", "1", "")
    } else {
        b.style.display = "none";
        a.innerHTML = "&gt;&gt;";
        a.title = L_ShowTZ_Text;
        SetCookie("MtgTimeZone", "0", "")
    }
}
function GetPageUrl(a) {
    a: ;
    return unescapeProperly(a ? g_webUrl : g_pageUrl)
}
function MtgNavigate(a) {
    a: ;
    if (a == g_instanceId) return;
    var b = !g_fPageGlobal;
    window.location.href = GetPageUrl(b) + "?InstanceID=" + a + "&" + g_thispagedata
}
function GoToMtgMove(d, c, b, a) {
    a: ;
    window.location.href = d + "/movetodt.aspx?FromInstanceID=" + c + "&FromInstanceDate=" + escapeProperly(b) + "&FromInstanceDateISO=" + escapeProperly(a) + "&Source=" + escapeProperly(window.location.href)
}
function MtgKeep(b, c, a) {
    a: ;
    var L_MtgKeepConfirm_Text = "此会议日期信息与您日历和计划程序中的信息不匹配。如果保留此会议日期，则日期将继续出现在工作区的“会议序列”列表中。";
    confirm(L_MtgKeepConfirm_Text) && SubmitFormPost(b + "&Cmd=MtgKeep&List=" + escapeProperly(c) + "&EditInstanceID=" + a + "&NextUsing=" + escapeProperly(window.location.href))
}
function MtgDelete(c, d, a) {
    a: ;
    var L_MtgDeleteConfirm_Text = "此会议日期和与之关联的内容将从此工作区删除。";
    if (confirm(L_MtgDeleteConfirm_Text)) {
        var b = a == g_instanceId;
        SubmitFormPost(c + "&Cmd=MtgMove&List=" + escapeProperly(d) + "&FromInstanceID=" + a + "&ToInstanceID=-3&NextUsing=" + escapeProperly(b ? GetPageUrl(true) : window.location.href))
    }
}
function SetCookie(b, a, c) {
    a: ;
    document.cookie = b + "=" + a + ";path=" + c
}
function SetAsLastTabVisited() {
    a: ;
    typeof g_pageUrl != "undefined" && typeof g_webUrl != "undefined" && SetCookie("MtgLastTabVisited", escapeProperly(unescapeProperly(g_pageUrl)), escapeProperlyCore(unescapeProperly(g_webUrl), true))
}
function MtgRedirect() {
    a: ;
    var a = GetCookie("MtgLastTabVisited");
    if (a == null) if (typeof g_webUrl != "undefined") a = g_webUrl;
    else a = "../../";
    else a = escapeProperlyCore(a, true);
    window.location.href = a
}
function MakeMtgInstanceUrl(a, c) {
    a: ;
    if (c != "undefined" && c != "") {
        var b = a.indexOf("?");
        if (b == -1 || a.indexOf("InstanceID=", b) == -1) a = a + (b == -1 ? "?" : "&") + "InstanceID=" + c
    }
    return a
}
var filterTable = null,
    bIsFilterMenuShown = false,
    bIsFilterDataLoaded = false,
    filterImageCell = null,
    currentFilterMenu = null,
    loadingFilterMenu = null,
    ctxFilter = null,
    bIsFilterKeyPress = false,
    filterStr = null,
    strFieldName = "",
    bMenuLoadInProgress = false,
    strFilteredValue = null,
    fnOnFilterMouseOut = null,
    L_NotSortable_Text = "无法对此栏类型排序",
    L_NotFilterable_Text = "无法筛选此栏类型",
    L_AOnTop_Text = "升序",
    L_ZOnTop_Text = "降序",
    L_SmallestOnTop_Text = "由小到大",
    L_LargestOnTop_Text = "由大到小",
    L_OldestOnTop_Text = "由旧到新",
    L_NewestOnTop_Text = "由新到旧",
    L_AttachmentsOnTop_Text = "带附件的项目在上",
    L_BlanksOnTop_Text = "不带附件的项目在上",
    L_Ascending_Text = "升序",
    L_Descending_Text = "降序",
    L_DontFilterBy_Text = "清除对“^1”的筛选",
    L_Loading_Text = "正在加载....",
    L_FilterMode_Text = "显示筛选选项",
    L_OpenMenu_Text = "打开菜单",
    L_FilterThrottled_Text = "无法显示筛选器的值。该字段可能无法筛选，或返回的项目数已超出管理员强制实施的列表视图阈值。";

function resetFilterMenuState() {
    a: ;
    if (bMenuLoadInProgress) return;
    bIsFilterMenuShown = false;
    bIsFilterDataLoaded = false;
    filterTable = null;
    filterImageCell = null;
    currentFilterMenu = null;
    loadingFilterMenu = null;
    ctxFilter = null;
    bIsFilterKeyPress = false;
    fnOnFilterMouseOut != null && fnOnFilterMouseOut();
    fnOnFilterMouseOut = null
}
function setupFilterMenuContext(a) {
    a: ;
    ctxFilter = a
}
function IsFilterMenuOn() {
    a: ;
    if (!bIsFilterMenuShown) return false;
    var a = false;
    a = MenuHtc_isOpen(currentFilterMenu) || MenuHtc_isOpen(loadingFilterMenu);
    if (!a) bIsFilterMenuShown = false;
    return a
}
function IsFilterMenuEnabled() {
    a: ;
    return true
}
function OnMouseOverFilterDeferCall(a) {
    a: ;
    if (!IsFilterMenuEnabled()) return false;
    if (IsFilterMenuOn() || bMenuLoadInProgress) return false;
    if (window.location.href.search("[?&]Filter=1") != -1) return false;
    if (a.FilterDisable == "TRUE") return false;
    if (IsFieldNotFilterable(a) && IsFieldNotSortable(a)) return false;
    if (filterTable == a) return;
    filterTable != null && OnMouseOutFilter();
    filterTable = a;
    var e = filterTable.tagName == "TABLE",
        f = new Function("setupFilterMenuContext(ctx" + filterTable.getAttribute("CtxNum") + ");");
    f();
    if (e) {
        filterTable.className = "ms-selectedtitle";
        filterTable.onclick = CreateFilterMenu;
        filterTable.oncontextmenu = CreateFilterMenu;
        filterTable.onmouseout = OnMouseOutFilter
    } else {
        var b = filterTable.parentNode;
        b.onclick = CreateFilterMenu;
        b.oncontextmenu = CreateFilterMenu;
        b.onmouseout = OnMouseOutFilter;
        CreateCtxImg(b, OnMouseOutFilter)
    }
    if (e) {
        var d = filterTable.childNodes[0].childNodes[0];
        filterImageCell = d.childNodes[d.childNodes.length - 1];
        var c = filterImageCell.childNodes[0];
        c.src = ctxFilter.imagesPath + "menudark.gif";
        c.alt = L_OpenMenu_Text;
        c.style.visibility = "visible";
        if (IsElementRtl(filterTable)) {
            filterImageCell.style.right = null;
            filterImageCell.style.left = "1px"
        } else {
            filterImageCell.style.left = null;
            filterImageCell.style.right = "1px"
        }
        filterImageCell.className = "ms-menuimagecell"
    }
    return true
}
function OnMouseOutFilter(b) {
    a: ;
    if (!IsFilterMenuOn() && filterTable != null && !bMenuLoadInProgress) {
        var c = filterTable.tagName == "TABLE",
            a = filterTable.parentNode;
        if (c || a == null) {
            filterTable.className = "ms-unselectedtitle";
            filterTable.onclick = "";
            filterTable.oncontextmenu = "";
            filterTable.onmouseout = ""
        } else {
            if (b == null) b = window.event;
            if (b != null) {
                var d = b.toElement != null ? b.toElement : b.relatedTarget;
                if (a != null && d != null && IsContained(d, a)) return
            }
            a.onclick = "";
            a.oncontextmenu = "";
            a.onmouseout = "";
            RemoveCtxImg(a)
        }
        if (c && filterImageCell != null && filterImageCell.childNodes.length > 0) {
            filterImageCell.childNodes[0].style.visibility = "hidden";
            filterImageCell.className = ""
        }
        resetFilterMenuState()
    }
}
function _OnFocusFilter(a) {
    a: ;
    if (window.location.href.search("[?&]Filter=1") != -1) return false;
    if (!IsFilterMenuEnabled()) return false;
    a.onfocusout = OnMouseOutFilter;
    a.onkeydown = PopFilterMenu;
    var b = a.getAttribute("FilterString");
    if (b != null) filterStr = b;
    var c = FindSTSMenuTable(a, "CTXNum");
    if (c == null) return false;
    OnMouseOverFilter(c);
    return false
}
function PopFilterMenu(a) {
    a: ;
    if (!IsFilterMenuEnabled()) return true;
    if (a == null) a = window.event;
    var b;
    if (browseris.nav6up) b = a.which;
    else b = a.keyCode;
    if (!IsFilterMenuOn() && (a.shiftKey && b == 13 || a.altKey && b == 40)) {
        var d = a.srcElement ? a.srcElement : a.target,
            c = FindSTSMenuTable(d, "CTXNum");
        if (c == null) return false;
        OnMouseOverFilterDeferCall(c);
        CreateFilterMenu(a);
        return false
    } else return true
}
function CreateFilterMenu(b) {
    a: ;
    if (filterTable == null || filterTable.tagName == "TABLE" && filterImageCell == null) return true;
    var c = filterTable.tagName == "DIV" ? filterTable.parentNode : filterTable,
        a = FindCtxImg(c);
    a != null && a.shown == false && ShowCtxImg(a, true, c);
    if (b == null) b = window.event;
    bIsFilterMenuShown = true;
    window.document.body.onclick = "";
    currentFilterMenu = CMenu("filter_menu");
    loadingFilterMenu = CMenu("filter_menu_loading");
    currentFilterMenu.setAttribute("CompactMode", "true");
    addSortMenuItems(currentFilterMenu, loadingFilterMenu);
    if (filterStr == null) addFilterMenuItems(currentFilterMenu, loadingFilterMenu);
    else addAdHocFilterMenuItems(currentFilterMenu, loadingFilterMenu);
    b.cancelBubble = true;
    return false
}
function GetUrlWithNoSortParameters(e) {
    a: ;
    var a = window.location.href,
        h = new CUrl(a);
    h.hash = "";
    a = h.ToString();
    var b, f = 0,
        d, g;
    do {
        d = e.indexOf("=", f);
        if (d == -1) return a;
        b = e.substring(f, d);
        if (b != "");
        a = RemoveQueryParameterFromUrl(a, b);
        if (typeof b == "string" && b.length > "FilterField".length && b.substring(0, "FilterField".length) == "FilterField") {
            var c = b.substring("FilterField".length);
            a = RemoveQueryParameterFromUrl(a, "FilterValue" + c);
            a = RemoveQueryParameterFromUrl(a, "FilterLookupId" + c);
            a = RemoveQueryParameterFromUrl(a, "FilterOp" + c);
            a = RemoveQueryParameterFromUrl(a, "FilterData" + c)
        }
        g = e.indexOf("&", d + 1);
        if (g == -1) return a;
        f = g + 1
    } while (b != "");
    return a
}
function IsFieldNotSortable(a) {
    a: ;
    if (a.getAttribute("Sortable") == "FALSE" || a.getAttribute("SortDisable") == "TRUE" || a.getAttribute("FieldType") == "MultiChoice") return true;
    return false
}
function addSortMenuItems(b, a) {
    a: ;
    if (IsFieldNotSortable(filterTable)) {
        CAMOptFilter(b, a, L_NotSortable_Text, "", "", false, "fmi_ns");
        CAMSep(b);
        CAMSep(a);
        return
    }
    var c = "",
        e = "",
        d = "",
        f = "/_layouts/" + L_Language_Text + "/images/SORTAZLang.gif",
        g = "/_layouts/" + L_Language_Text + "/images/SORTZALang.gif";
    if (filterStr == null) {
        var i = filterTable.getAttribute("SortFields"),
            l = new CUrl(i);
        if (l.query.length > 0) i = l.query.substr(1);
        var q = i.indexOf("&SortDir");
        if (q == -1) {
            CAMOptFilter(b, a, L_NotSortable_Text, "", "", false, "fmi_ns");
            CAMSep(b);
            CAMSep(a);
            return
        }
        var p = i.indexOf("&", q + 1),
            s = GetUrlWithNoSortParameters(i);
        s = RemovePagingArgs(s);
        l = new CUrl(s);
        var h = l.query;
        if (h.length > 1) h += "&";
        else if (h.length == 0) h += "?";
        var w = h;
        if (p < 0) p = i.length;
        h += i.substr(0, q) + "&SortDir=Asc" + i.substr(p);
        l.query = h;
        c = "HandleFilter(event, '" + STSScriptEncode(l.ToString()) + "');";
        h = w;
        h += i.substr(0, q) + "&SortDir=Desc" + i.substr(p);
        l.query = h;
        e = "HandleFilter(event, '" + STSScriptEncode(l.ToString()) + "');";
        if (c.indexOf("?") >= 0) if (c.substr(c.indexOf("?") + 1).indexOf("?") >= 0) debugger;
        var d = filterTable.getAttribute("FieldType");
        strFieldName = filterTable.getAttribute("Name")
    } else {
        var r = " ",
            k = filterStr.lastIndexOf(r);
        d = filterStr.substring(k + 1);
        if (d.substring(0, 2) == "x:") d = d.substring(2);
        var n = filterStr.substring(0, k);
        k = n.lastIndexOf(r);
        strFieldName = n.substring(k + 1);
        if (strFieldName.substring(0, 1) == "@") strFieldName = strFieldName.substring(1);
        n = filterStr.substring(0, k);
        k = n.lastIndexOf(r);
        if (k > 0) strFieldName = n.substring(0, k);
        var v = filterTable.tagName == "TABLE",
            j = null;
        if (v) {
            var u = filterTable.childNodes[0].childNodes[0],
                j = u.childNodes[0].childNodes[0];
            if (j.tagName == "TABLE") j = j.childNodes[0].childNodes[0].childNodes[1].childNodes[0]
        } else j = filterTable.firstChild;
        if (j.tagName == "DIV") j = j.childNodes[0];
        var m = j.href;
        m = m.replace(/%20/g, " ");
        if (m.indexOf("'ascending'") > 0) {
            c = m;
            e = m.replace("'ascending'", "'descending'")
        } else {
            e = m;
            c = m.replace("'descending'", "'ascending'")
        }
    }
    d = d.toLowerCase();
    if (d == "dateTime") {
        CAMOptFilter(b, a, L_OldestOnTop_Text, c, f, true, "fmi_asc");
        CAMOptFilter(b, a, L_NewestOnTop_Text, e, g, true, "fmi_desc")
    } else if (d == "integer" || d == "number" || d == "currency") {
        CAMOptFilter(b, a, L_SmallestOnTop_Text, c, f, true, "fmi_asc");
        CAMOptFilter(b, a, L_LargestOnTop_Text, e, g, true, "fmi_desc")
    } else if (d == "text" || d == "user" || d == "string") {
        CAMOptFilter(b, a, L_AOnTop_Text, c, f, true, "fmi_asc");
        CAMOptFilter(b, a, L_ZOnTop_Text, e, g, true, "fmi_desc")
    } else if (d == "calculated") {
        var o = filterTable.getAttribute("ResultType");
        if (o == "Number" || o == "Currency") {
            CAMOptFilter(b, a, L_SmallestOnTop_Text, c, f, true, "fmi_asc");
            CAMOptFilter(b, a, L_LargestOnTop_Text, e, g, true, "fmi_desc")
        } else if (o == "dateTime") {
            CAMOptFilter(b, a, L_OldestOnTop_Text, c, f, true, "fmi_asc");
            CAMOptFilter(b, a, L_NewestOnTop_Text, e, g, true, "fmi_desc")
        } else if (o == "boolean") {
            CAMOptFilter(b, a, L_Ascending_Text, c, f, true, "fmi_asc");
            CAMOptFilter(b, a, L_Descending_Text, e, g, true, "fmi_desc")
        } else {
            CAMOptFilter(b, a, L_AOnTop_Text, c, f, true, "fmi_asc");
            CAMOptFilter(b, a, L_ZOnTop_Text, e, g, true, "fmi_desc")
        }
    } else if (d == "attachments") {
        CAMOptFilter(b, a, L_BlanksOnTop_Text, c, f, true, "fmi_asc");
        CAMOptFilter(b, a, L_AttachmentsOnTop_Text, e, g, true, "fmi_desc")
    } else if (d == "lookup") {
        var t = filterTable.getAttribute("Name");
        if (t == "Last_x0020_Modified" || t == "Created_x0020_Date") {
            CAMOptFilter(b, a, L_OldestOnTop_Text, c, f, true, "fmi_asc");
            CAMOptFilter(b, a, L_NewestOnTop_Text, e, g, true, "fmi_desc")
        } else {
            CAMOptFilter(b, a, L_Ascending_Text, c, f, true, "fmi_asc");
            CAMOptFilter(b, a, L_Descending_Text, e, g, true, "fmi_desc")
        }
    } else {
        CAMOptFilter(b, a, L_Ascending_Text, c, f, true, "fmi_asc");
        CAMOptFilter(b, a, L_Descending_Text, e, g, true, "fmi_desc")
    }
    CAMSep(b);
    CAMSep(a)
}
function CAMOptFilter(h, g, d, f, c, b, e) {
    a: ;
    var a;
    a = CAMOpt(h, d, f, c);
    a.id = e;
    !b && a.setAttribute("enabled", "false");
    a = CAMOpt(g, d, f, c);
    a.id = e + "_p";
    !b && a.setAttribute("enabled", "false")
}
function ShowFilterLoadingMenu() {
    a: ;
    !bIsFilterDataLoaded && filterTable != null && FilterOMenu(loadingFilterMenu, filterTable)
}
function getFilterQueryParam() {
    a: ;
    var d = document.getElementById("FilterIframe" + filterTable.getAttribute("CtxNum"));
    if (d == null) return;
    var e = d.getAttribute("FilterLink"),
        f = escapeProperly(filterTable.getAttribute("Name")),
        b = "",
        c = 0,
        a;
    do {
        c++;
        a = e.match("FilterField" + c + "=[^&]*&FilterValue" + c + "=[^&]*");
        if (a != null) b = b + "&" + a
    } while (a);
    return b
}
function IsFieldNotFilterable(a) {
    a: ;
    if (a.getAttribute("Filterable") == "FALSE" || a.getAttribute("FilterDisable") == "TRUE" || a.getAttribute("FieldType ") == "Note" || a.getAttribute("FieldType ") == "URL") return true;
    return false
}
function addFilteringDisabledMenuItem(b) {
    a: ;
    var a = filterTable.getAttribute("FilterDisableMessage");
    if (a == null || a.length == 0) a = L_NotFilterable_Text;
    var c = CAMOpt(b, a, "");
    c.setAttribute("enabled", "false");
    FilterOMenu(b, filterTable);
    b._onDestroy = OnMouseOutFilter
}
function addFilterMenuItems(m, j) {
    a: ;
    if (IsFieldNotFilterable(filterTable)) {
        addFilteringDisabledMenuItem(m);
        return
    }
    var d = document.getElementById("FilterIframe" + filterTable.getAttribute("CtxNum"));
    if (d == null) return;
    var c = d.getAttribute("FilterLink");
    if (!c || c == "") c = CanonicalizeUrlEncodingCase(window.location.href);
    var g = escapeProperly(filterTable.getAttribute("Name"));
    strFilteredValue = null;
    var a = "",
        e = 0,
        b, f;
    do {
        e++;
        b = c.match("FilterField" + e + "=[^&#]*");
        f = c.match("&FilterValue" + e + "=[^&#]*");
        if (b != null && f != null) {
            if (strFilteredValue == null) strFilteredValue = getFilterValueFromUrl(b.toString() + f.toString(), g);
            a = a + "&" + b + f;
            var p = c.match("&FilterOp" + e + "=[^&#]*");
            if (p != null) a = a + p;
            var h = c.match("&FilterLookupId" + e + "=[^&#]*");
            if (h != null) a = a + h;
            var l = c.match("&FilterData" + e + "=[^&#]*");
            if (l != null) a = a + l;
            if (h != null && l == null && strFilteredValue != null) {
                addFilteringDisabledMenuItem(m);
                return
            }
        }
    } while (b);
    var o = strFilteredValue != null;
    strDisplayText = StBuildParam(L_DontFilterBy_Text, filterTable.getAttribute("DisplayName"));
    var q = "javascript:HandleFilter(event, '" + STSScriptEncode(FilterFieldV3(ctxFilter.view, g, "", 0, true)) + "')",
        k;
    if (o) k = ctxFilter.imagesPath + "FILTEROFF.gif";
    else k = ctxFilter.imagesPath + "FILTEROFFDISABLED.gif";
    CAMOptFilter(m, j, strDisplayText, q, k, o, "fmi_clr");
    var r = CAMOpt(j, L_Loading_Text, "");
    r.setAttribute("enabled", "false");
    setTimeout("ShowFilterLoadingMenu()", 500);
    j._onDestroy = OnMouseOutFilter;
    b = c.match("MembershipGroupId=[^&]*");
    if (b != null) a = a + "&" + b;
    b = c.match("InstanceID=[^&]*");
    if (b != null) a = a + "&" + b;
    if (a != null && a.length > 0) {
        if (ctxFilter.overrideFilterQstring != null && ctxFilter.overrideFilterQstring.length > 0) a = "&" + ReconcileQstringFilters(a.substring(1), ctxFilter.overrideFilterQstring)
    } else if (ctxFilter.overrideFilterQstring != null && ctxFilter.overrideFilterQstring.length > 0) a = "&" + ctxFilter.overrideFilterQstring;
    var i = "";
    if (ctxFilter != null && ctxFilter.clvp != null && ctxFilter.clvp.rootFolder != null && ctxFilter.clvp.rootFolder.length > 0) i = "&RootFolder=" + escapeProperlyCore(ctxFilter.clvp.rootFolder, true);
    else {
        b = c.match("RootFolder=[^&]*");
        if (b != null) i = "&" + b
    }
    var n = "";
    b = a.match("OverrideScope=[^&]*");
    if (ctxFilter != null && typeof ctxFilter.overrideScope != "undefined" && b == null) n = "&OverrideScope=" + escapeProperlyCore(ctxFilter.overrideScope);
    if (browseris.safari) {
        d.src = "/_layouts/blank.htm";
        d.style.offsetLeft = "-550px";
        d.style.offsetTop = "-550px";
        d.style.display = "block"
    }
    d.src = ctxFilter.HttpRoot + "/_layouts/filter.aspx?ListId=" + ctxFilter.listName + i + n + "&FieldInternalName=" + g + "&ViewId=" + ctxFilter.view + "&FilterOnly=1&Filter=1" + a;
    bMenuLoadInProgress = true
}
function getFilterValueFromUrl(b, f) {
    a: ;
    var a, c, e;
    a = b.indexOf("=");
    if (a == -1) return;
    c = b.indexOf("&");
    if (c == -1) return;
    if (c < a) return;
    b = CanonicalizeUrlEncodingCase(b);
    e = b.substring(a + 1, c);
    if (e == f) {
        var d;
        a = b.indexOf("=", c + 1);
        if (a == -1) return;
        d = b.substr(a + 1);
        d = unescapeProperly(d);
        return d
    }
    return null
}
function _OnIframeLoad() {
    a: ;
    bMenuLoadInProgress = false;
    if (filterTable != null && filterTable.getAttribute("Name") != null) {
        var c = null;
        c = document.getElementById("FilterIframe" + filterTable.getAttribute("CtxNum"));
        if (c != null) {
            var a = null,
                e = filterTable.getAttribute("Name");
            if (c.contentDocument) a = c.contentDocument;
            else if (c.contentWindow && c.contentWindow.document) a = c.contentWindow.document;
            else if (c.document) a = c.document;
            if (a != null) {
                var g = a.getElementById("diidFilterCustomTable");
                if (g != null && (a.parentWindow && a.parentWindow.CustomPopulateFilterMenu != null || a.defaultView && a.defaultView.CustomPopulateFilterMenu != null)) if (a.parentWindow) a.parentWindow.CustomPopulateFilterMenu(currentFilterMenu, g, "FilterIframe" + filterTable.getAttribute("CtxNum"), ctxFilter.view, e);
                else a.defaultView.CustomPopulateFilterMenu(currentFilterMenu, g, "FilterIframe" + filterTable.getAttribute("CtxNum"), ctxFilter.view, e);
                else {
                    var h = a.getElementById("diidFilter" + e);
                    e = escapeProperly(e);
                    if (h != null) {
                        var i = h.childNodes.length;
                        if (i > 500) addFilterOptionMenuItem();
                        else for (var d = h.childNodes, b = 1; b < i; b++) {
                            var f;
                            if (d[b].innerText) f = d[b].innerText;
                            else if (d[b].textContent) f = d[b].textContent;
                            else f = d[b].innerHTML;
                            var j = "javascript:HandleFilter(event, '" + STSScriptEncode(FilterFieldV3(ctxFilter.view, e, d[b].value, b, true)) + "')",
                                k = CAMOpt(currentFilterMenu, f, j);
                            strFilteredValue != null && strFilteredValue == d[b].value && k.setAttribute("checked", "true")
                        }
                    } else {
                        alert(L_FilterThrottled_Text);
                        return
                    }
                }
                bIsFilterDataLoaded = true;
                if (loadingFilterMenu != null) loadingFilterMenu._onDestroy = null;
                if (currentFilterMenu != null) {
                    currentFilterMenu._onDestroy = OnMouseOutFilter;
                    FilterOMenu(currentFilterMenu, filterTable)
                }
            }
        }
    }
}
function addFilterOptionMenuItem() {
    a: ;
    var a = window.location.href;
    a = StURLSetVar2(a, "Filter", "1");
    a = StURLSetVar2(a, "View", ctxFilter.view);
    a = "javascript:SubmitFormPost('" + a + "')";
    CAMOpt(currentFilterMenu, L_FilterMode_Text, a)
}
function OnMouseOverAdHocFilterDeferCall(f, e) {
    a: ;
    filterStr = e;
    if (IsFilterMenuOn()) return false;
    filterTable != null && OnMouseOutFilter();
    filterTable = f;
    var d = filterTable.tagName == "TABLE";
    if (d) {
        filterTable.className = "ms-selectedtitle";
        filterTable.onclick = CreateFilterMenu;
        filterTable.oncontextmenu = CreateFilterMenu;
        filterTable.onmouseout = OnMouseOutFilter
    } else {
        var a = filterTable.parentNode;
        a.onclick = CreateFilterMenu;
        a.oncontextmenu = CreateFilterMenu;
        a.onmouseout = OnMouseOutFilter;
        CreateCtxImg(a, OnMouseOutFilter)
    }
    if (d) {
        var c = filterTable.childNodes[0].childNodes[0];
        filterImageCell = c.childNodes[c.childNodes.length - 1];
        var b = filterImageCell.childNodes[0];
        b.src = "/_layouts/images/menudark.gif";
        b.alt = L_OpenMenu_Text;
        b.style.visibility = "visible";
        if (IsElementRtl(filterTable)) {
            filterImageCell.style.right = null;
            filterImageCell.style.left = "1px"
        } else {
            filterImageCell.style.left = null;
            filterImageCell.style.right = "1px"
        }
        filterImageCell.className = "ms-menuimagecell"
    }
    return true
}
function addAdHocFilterMenuItems(b, a) {
    a: ;
    if (IsFieldNotFilterable(filterTable)) {
        addFilteringDisabledMenuItem(b);
        return
    }
    var c = CAMOpt(a, L_Loading_Text, "");
    c.setAttribute("enabled", "false");
    FilterOMenu(a, filterTable);
    a._onDestroy = OnMouseOutFilter;
    DoCallBack("__filter={" + filterStr + "}");
    filterStr = null
}
function UpdateFilterCallback(b) {
    a: ;
    var i = "</OPTION>",
        a = -1;
    a = b.indexOf(i, a + 1);
    var c = b.lastIndexOf(">", a),
        l = StBuildParam(L_DontFilterBy_Text, strFieldName),
        h, e = "";
    if (c < a - 1) {
        var d = b.lastIndexOf('"', a);
        if (d > 0) {
            var g = b.lastIndexOf('"', d - 1);
            if (g > 0) e = b.substring(g + 1, d)
        }
    }
    if (c == a - 1) h = "/_layouts/images/FILTEROFFDISABLED.gif";
    else h = "/_layouts/images/FILTEROFF.gif";
    if (a > 0) {
        var j = CAMOpt(currentFilterMenu, l, e, h);
        j.setAttribute("enabled", c == a - 1 ? "false" : "true");
        var d = a,
            m = '<OPTION href="';
        a = b.indexOf(i, a + 8);
        while (a > 0) {
            c = b.indexOf(m, d + 8);
            c = b.indexOf('"', c + 20);
            if (c > 0 && c < a) {
                var k = b.indexOf(">", c),
                    f = b.substring(k + 1, a),
                    e = "";
                d = b.lastIndexOf('"', c);
                if (d > 0) {
                    var g = b.lastIndexOf('"', d - 1);
                    if (g > 0) {
                        e = b.substring(g + 1, d);
                        e = e.replace(/&amp;/g, "&")
                    }
                }
                if (f.length > 40) f = f.substring(0, 40) + "...";
                if (f.length > 0) {
                    var j = CAMOpt(currentFilterMenu, f, e);
                    k > c + 1 && j.setAttribute("checked", "true")
                }
            }
            d = a;
            a = b.indexOf(i, a + 8)
        }
    } else {
        var j = CAMOpt(currentFilterMenu, L_NotFilterable_Text, "");
        j.setAttribute("enabled", "false");
        FilterOMenu(currentFilterMenu, filterTable);
        return
    }
    loadingFilterMenu._onDestroy = null;
    FilterOMenu(currentFilterMenu, filterTable);
    currentFilterMenu._onDestroy = OnMouseOutFilter
}
function FilterOMenu(c, a) {
    a: ;
    if (a == null) return;
    var b = a.tagName == "DIV" ? a.parentNode : a;
    OMenu(c, b, null, null, -1)
}
function _OnClickFilter(d, b) {
    a: ;
    if (FV4UI()) {
        if (browseris.ie) {
            b.cancelBubble = true;
            b.returnValue = false
        } else b.stopPropagation();
        var c;
        try {
            c = typeof inplview.OnClickFilterV4
        } catch (b) {
            c = "undefined"
        }
        if (c != "undefined") inplview.OnClickFilterV4(d);
        else {
            var i = "inplview.OnClickFilterV4",
                g = i.split(".");
            if (g.length > 1) {
                var h = function () {
                    a: ;
                    inplview.OnClickFilterV4(d)
                };
                EnsureScript(g[0], c, h)
            }
        }
        return false
    }
    var e = FindSTSMenuTable(d, "CTXNum");
    if (e != null && e.getAttribute("SortFields") != null) {
        var f = e.getAttribute("SortFields"),
            a = GetUrlWithNoSortParameters(f);
        a = RemovePagingArgs(a);
        if (a.indexOf("?") < 0) a += "?";
        else a += "&";
        SubmitFormPost(a + f)
    }
    if (!bIsFileDialogView) b.cancelBubble = true;
    return false
}
function ToggleSelectionAllUsers(b) {
    a: ;
    var a = document.getElementById("spToggleUserSelectionCheckBox_" + b.toString());
    if (a != null) {
        var h = "spUserSelectionCheckBox_" + b.toString(),
            e = document.getElementsByName(h);
        a.checked = !a.checked;
        for (var d = 0; d < e.length; d++) {
            var g = e[d];
            g.checked = a.checked
        }
        var f = "cbxUserSelectAll" + b.toString(),
            c = document.getElementById(f);
        if (c != null) if (a.checked) c.src = "/_layouts/images/checkall.gif";
        else c.src = "/_layouts/images/unchecka.gif"
    }
}
function _UserSelectionOnClick(j, c) {
    a: ;
    var g = "cbxUserSelectAll" + c.toString(),
        b = document.getElementById(g),
        a = document.getElementById("spToggleUserSelectionCheckBox_" + c.toString());
    if (!j.checked) {
        if (a != null) a.checked = false;
        if (b != null) b.src = "/_layouts/images/unchecka.gif"
    } else {
        for (var i = "spUserSelectionCheckBox_" + c.toString(), f = document.getElementsByName(i), e = true, d = 0; d < f.length; d++) {
            var h = f[d];
            if (!h.checked) {
                e = false;
                break
            }
        }
        if (e) {
            if (b) b.src = "/_layouts/images/checkall.gif";
            if (a) a.checked = true
        }
    }
}
function initPageRequestManagerForDFWP() {
    a: ;
    var a = Sys.WebForms.PageRequestManager.getInstance();
    a.add_beginRequest(hideMRBForRequest)
}
function hideMRBForRequest(d, c) {
    a: ;
    var a = c.get_postBackElement();
    if (a == undefined) return;
    else if (a.value == undefined || a.value == "") return;
    var b = $get(a.value);
    if (b == undefined || b == null) return;
    hideMRB(b.parentElement)
}
function hideMRB(b) {
    a: ;
    if (b == undefined || b == null) return;
    var a = b.all;
    for (i = 0; i < a.length; i++) if (a[i].tagName == "IMG") {
        regEx = new RegExp("ManualRefresh", "i");
        if (a[i].id != undefined && regEx.test(a[i].id)) {
            hideElement(a[i]);
            break
        }
    }
}
function hideElement(a) {
    a: ;
    if (a == null || a == undefined) return;
    a.style.visibility = "hidden";
    a.style.display = "none"
}
function MSOWebPartPage_GetLocalizedStrings() {
    a: ;
    var L_ResetPagePersonalizationDialog_TXT = "您正准备将所有个性化 Web 部件重置为其共享值，并删除任何私人 Web 部件。可单击“确定”完成此操作，或单击“取消”保留您的个性化 Web 部件设置和私人 Web 部件。",
        L_ResetPartPersonalizationDialog_TXT = "重置此 Web 部件将丢失您所做的任何更改。是否确实要进行此操作? 若要重置此 Web 部件，请单击“确定”。若要保留更改，请单击“取消”。",
        L_RemoveConnection_TXT = "是否确实要删除 %0 Web 部件和 %1 Web 部件之间的连接? 若要删除该连接，请单击“确定”。若要保留该连接，请单击“取消”。",
        L_ExportPersonalization_TXT = "此 Web 部件页已经过个性化设置。因此，一个或多个 Web 部件属性可能包含机密信息。请确保属性包含的信息都是他人可阅读的安全信息。导出此 Web 部件之后，可以使用文本编辑器(如 Microsoft 记事本)查看 Web 部件说明文件(.webpart 或 .dwp)中的属性。",
        L_GetPropertiesFailure_ERR = "现在无法检索属性。",
        L_SaveDirtyParts_TXT = "此网页上的一个或多个 Web 部件的内容已被更改。若要保存更改，请按“确定”。若要放弃更改，请按“取消”。",
        L_ToolPaneWidenToolTip_TXT = "加宽",
        L_ToolPaneShrinkToolTip_TXT = "收缩",
        L_ToolPartExpandToolTip_TXT = "展开工具部件: %0",
        L_ToolPartCollapseToolTip_TXT = "折叠工具部件: %0",
        L_WebPartBackgroundColor_TXT = "Web 部件背景色",
        L_TransparentTooltip_TXT = "透明 Web 部件背景色",
        L_InvalidURLPath_ERR = "该 URL 对 %0 属性无效。请检查 URL 拼写和路径并重试。",
        L_InvalidFolderPath_ERR = "该文件夹路径对 %0 属性无效。请检查路径名并重试。",
        L_InvalidFilePath_ERR = "该文件或文件夹的路径无效。请检查路径并重试。",
        L_FileOrFolderUnsupported_ERR = "当前浏览器不支持指向文件或文件夹的链接。若要指定指向文件或文件夹的链接，必须使用 Microsoft Internet Explorer 5.0 或更高版本",
        L_Link_TXT = "链接",
        L_TransparentLiteral_TXT = "透明",
        L_ContentEditorSaveFailed_ERR = "无法保存您的更改。",
        L_AccessDenied_ERR = "保存 Web 部件属性时访问被拒绝: 可能是由于 Web 部件直接嵌入到该网页中，或者是您没有足够的权限保存属性。",
        L_NoInitArgs_ERR = "不能创建或修改连接。一个 Web 部件没有任何数据字段。",
        L_PageNotYetSaved_ERR = "页面尚未保存",
        a = {};
    a.ResetPagePersonalizationDialogText = L_ResetPagePersonalizationDialog_TXT;
    a.ResetPartPersonalizationDialogText = L_ResetPartPersonalizationDialog_TXT;
    a.RemoveConnection = L_RemoveConnection_TXT;
    a.ExportPersonalizationDialogText = L_ExportPersonalization_TXT;
    a.GetPropertiesFailure = L_GetPropertiesFailure_ERR;
    a.SaveDirtyPartsDialogText = L_SaveDirtyParts_TXT;
    a.ToolPaneWidenToolTip = L_ToolPaneWidenToolTip_TXT;
    a.ToolPaneShrinkToolTip = L_ToolPaneShrinkToolTip_TXT;
    a.ToolPartExpandToolTip = L_ToolPartExpandToolTip_TXT;
    a.ToolPartCollapseToolTip = L_ToolPartCollapseToolTip_TXT;
    a.WebPartBackgroundColor = L_WebPartBackgroundColor_TXT;
    a.TransparentTooltip = L_TransparentTooltip_TXT;
    a.InvalidURLPath = L_InvalidURLPath_ERR;
    a.InvalidFolderPath = L_InvalidFolderPath_ERR;
    a.InvalidFilePath = L_InvalidFilePath_ERR;
    a.FileOrFolderUnsupported = L_FileOrFolderUnsupported_ERR;
    a.Link = L_Link_TXT;
    a.TransparentLiteral = L_TransparentLiteral_TXT;
    a.ContentEditorSaveFailed = L_ContentEditorSaveFailed_ERR;
    a.AccessDenied = L_AccessDenied_ERR;
    a.NoInitArgs = L_NoInitArgs_ERR;
    a.PageNotYetSaved = L_PageNotYetSaved_ERR;
    return a
}
var MSOStrings = MSOWebPartPage_GetLocalizedStrings(),
    L_AccessibleMenu_Text = "菜单";
typeof Sys != "undefined" && Sys && Sys.Application && Sys.Application.notifyScriptLoaded();
typeof NotifyScriptLoadedAndExecuteWaitingJobs != "undefined" && NotifyScriptLoadedAndExecuteWaitingJobs("msstring.js");

function FNEmpWz(a) {
    a: ;
    return a && a != ""
}
function AChld(b, a) {
    a: ;
    b && a && b.appendChild(a)
}
function AImg(a, c, b) {
    a: ;
    if (!a) return;
    FNEmpWz(c) && a.setAttribute("iconSrc", c);
    if (FNEmpWz(b)) a.setAttribute("iconAltText", b);
    else a.setAttribute("iconAltText", "")
}
function CMenu(b) {
    a: ;
    var a = document.getElementById(b);
    if (a) {
        a._initialized = false;
        a._oContents = null;
        a.innerHTML = "";
        return a
    }
    a = document.createElement("MENU");
    if (!a) return null;
    if (b) a.id = b;
    a.className = "ms-SrvMenuUI";
    AChld(document.body, a);
    return a
}
function CMItm(b) {
    a: ;
    var a = document.createElement("SPAN");
    if (!a) return null;
    a.setAttribute("type", b);
    return a
}
function SetInnerText(a, b) {
    a: ;
    if (document.createTextNode != null) {
        var c = document.createTextNode(b);
        a.innerHTML = "";
        a.appendChild(c)
    } else a.innerText = b
}
function CMOpt(f, g, e, d, c, b) {
    a: ;
    var a = CMItm("option");
    if (!a) return null;
    a.setAttribute("text", f);
    a.setAttribute("onMenuClick", g);
    b && a.setAttribute("description", b);
    AImg(a, e, d);
    FNEmpWz(c) && a.setAttribute("sequence", c);
    return a
}
function CAMOpt(h, f, g, e, c, d, b) {
    a: ;
    var a = CMOpt(f, g, e, c, d, b);
    if (!a) return null;
    AChld(h, a);
    return a
}
function CIMOpt(c, h, i, g, f, d) {
    a: ;
    var a = CMOpt(h, i, g, f, d);
    if (!a) return null;
    for (var b = 0; b < c.childNodes.length; b++) {
        var e = c.childNodes[b].getAttribute("sequence");
        if (e) if (e > d) {
            c.childNodes[b].parentNode.insertBefore(a, c.childNodes[b]);
            return a
        }
    }
    AChld(c, a);
    return a
}
function CMSep() {
    a: ;
    var a = CMItm("separator");
    SetInnerText(a, "");
    return a
}
function CAMSep(b) {
    a: ;
    var a = CMSep();
    if (!a) return null;
    AChld(b, a);
    return a
}
function CSubM(f, e, d, c, b) {
    a: ;
    var a = CMItm("submenu");
    if (!a) return null;
    a.setAttribute("text", f);
    b && a.setAttribute("description", b);
    AImg(a, e, d);
    FNEmpWz(c) && a.setAttribute("sequence", c);
    return a
}
function CASubM(g, f, e, c, d, b) {
    a: ;
    var a = CSubM(f, e, c, d, b);
    if (!a) return null;
    AChld(g, a);
    return a
}
function FRdy(a) {
    a: ;
    if (!a) return false;
    if (a.readyState == null) return true;
    switch (a.readyState) {
        case "loaded":
        case "interactive":
        case "complete":
            return true;
        default:
            return false
    }
}
function OMenu(a, e, c, d, b) {
    a: ;
    if (typeof a == "string") a = document.getElementById(a);
    a && OMenuInt(a, e, c, d, b);
    return false
}
function OMenuInt(a, e, b, d, c) {
    a: ;
    (a && !MenuHtc_isOpen(a) || a && b) && MenuHtc_show(a, e, b, d, c)
}
function OMenuEvnt() {
    a: ;
    var a = event.srcElement;
    if (a && FRdy(document) && FRdy(a)) {
        var e = a.getAttribute("relativeTo"),
            c = a.getAttribute("forceRefresh"),
            d = a.getAttribute("flipTop"),
            b = a.getAttribute("yOffsetTop");
        e != null && a.removeAttribute("relativeTo");
        c != null && a.removeAttribute("forceRefresh");
        d != null && a.removeAttribute("flipTop");
        b != null && a.removeAttribute("yOffsetTop");
        a.onreadystatechange = null;
        OMenuInt(a, e, c, d, b)
    }
}
var kfnDisableEvent = new Function("return false"),
    g_menuHtc_lastMenu = null,
    g_uniqueNumber = 0,
    g_MenuEndOfDOM = false;

function RenderECBBackwardCompatibilityMode(a) {
    a: ;
    g_MenuEndOfDOM = a
}
function IsAccessibilityFeatureEnabledProxy() {
    a: ;
    if (typeof IsAccessibilityFeatureEnabled != "undefined") return IsAccessibilityFeatureEnabled();
    return false
}
function MenuHtc_show(oMaster, oParent, fForceRefresh, fFlipTop, yOffset) {
    a: ;
    if (!(browseris.ie55up || browseris.nav6up || browseris.safari125up)) return false;
    MenuHtc_hide();
    MenuHtc_init(oMaster);
    oMaster._oParent = oParent;
    oMaster._fIsRtL = IsElementRtl(oMaster._oParent);
    if ((browseris.ie || browseris.nav) && IsAccessibilityFeatureEnabledProxy()) {
        var menu = null;
        if (oParent.foa != null) {
            menu = byid(oParent.foa);
            if (menu == null) menu = eval(oParent.foa)
        }
        menu != null && menu.onblur != null && menu.onblur();
        RenderAccessibleMenu(oMaster, fForceRefresh);
        g_menuHtc_lastMenu = oMaster
    } else {
        SetBodyEventHandlers(null);
        AssureId(oParent);
        var result = ShowRoot(oMaster, oParent, fForceRefresh, fFlipTop, yOffset);
        g_menuHtc_lastMenu = oMaster;
        !(typeof _fV4UI != "undefined" && _fV4UI) && NavigateToMenu(oMaster);
        SetBodyEventHandlers(HandleDocumentBodyClick)
    }
    if (browseris.ie) if (window.event != null) window.event.cancelBubble = true;
    return false
}
function MenuHtc_hide() {
    a: ;
    ClearTimeOutToHideMenu();
    var a = g_menuHtc_lastMenu;
    if (a != null) if (a._accessibleMenu != null) CloseAccessibleMenu(a);
    else HideMenu(a);
    g_menuHtc_lastMenu = null
}
function MenuHtc_isOpen(a) {
    a: ;
    if (!a || !a._initialized) return false;
    var b = IsOpen(a);
    return b
}
function MenuHtc_item(a, c, b) {
    a: ;
    MenuHtc_init(a);
    var d = GetItem(a, c, b);
    return d
}
function TrapMenuClick(a) {
    a: ;
    if (a != null) a.cancelBubble = true;
    return false
}
function SetBodyEventHandlers(a) {
    a: ;
    document.body.onclick = a
}
function HandleDocumentBodyClick() {
    a: ;
    if (g_menuHtc_lastMenu != null) {
        var a = g_menuHtc_lastMenu;
        a != null && HideMenu(a)
    }
    return false
}
function GetEventPopup(b) {
    a: ;
    var a = GetEventSrcElement(b);
    while (a != null) {
        if (a.master != null) return a;
        a = a.parentNode
    }
    return null
}
function GetUniqueNumber() {
    a: ;
    g_uniqueNumber++;
    return g_uniqueNumber
}
function MenuHtc_init(a) {
    a: ;
    if (a._initialized) return;
    a._initialized = true;
    a._wzPrefixID = "mp" + GetUniqueNumber();
    if (a.id == null) a.id = a._wzPrefixID + "_id";
    a._nLevel = 0;
    a._arrPopup = [];
    a._arrSelected = [];
    if (typeof a._onDestroy == "undefined") a._onDestroy = null;
    a._fLargeIconMode = false;
    a._fCompactItemsWithoutIcons = false
}
function PrepContents(a) {
    a: ;
    a._fLargeIconMode = a.getAttribute("largeIconMode") == "true";
    a._fCompactItemsWithoutIcons = a.getAttribute("CompactMode") == "true";
    if (!browseris.safari) {
        a._oContents = document.createElement("span");
        a._oContents.style.display = "none";
        var b = a.innerHTML;
        if (b.indexOf("<IE:MENUITEM ") < 0 && b.indexOf("<MENUITEM ") >= 0) {
            b = "<?XML:NAMESPACE PREFIX=IE />" + b;
            b = b.replace(/<MENUITEM/g, "<IE:MENUITEM");
            b = b.replace(/<\/MENUITEM/g, "</IE:MENUITEM")
        }
        a._oContents.innerHTML = b
    } else {
        a._oContents = a.cloneNode(true);
        a._oContents.style.display = "none"
    }
    if (a._fLargeIconMode) if (a._fIsRtL) a._wzMenuStyle = "ms-MenuUILargeRtL";
    else a._wzMenuStyle = "ms-MenuUILarge";
    else if (a._fIsRtL) a._wzMenuStyle = "ms-MenuUIRtL";
    else a._wzMenuStyle = "ms-MenuUI";
    a._wzChkMrkPath = "/_layouts/images/ChkMrk.gif";
    a._wzMArrPath = "/_layouts/images/MArr.gif";
    a._wzMArrPathRtL = "/_layouts/images/MArrRtL.gif"
}
function FixUpMenuStructure(i) {
    a: ;
    for (var g = i._oRoot.childNodes, f = null, a = null, d = false, c = 0; c < g.length; c++) {
        var b = g[c];
        if (b.nodeType != 1) continue;
        var e = false,
            j = b.style != null && b.style.display == "none",
            k = FIsIHidden(b);
        if (j || k) e = true;
        else if (FIsIType(b, "separator")) if (a != null || c == 0) e = true;
        else {
            a = b;
            d = true
        } else {
            var h = b.getAttribute("menuGroupId");
            if (h != f && a == null && c != 0) {
                var a = document.createElement("ie:menuitem");
                a.setAttribute("type", "separator");
                i._oRoot.insertBefore(a, b)
            } else if (FIsIType(b, "submenu") && a != null && !d) {
                b.parentNode.removeChild(a);
                a = null
            } else a = null;
            f = h;
            d = false
        }
        if (e) {
            b.parentNode.removeChild(b);
            c--
        }
    }
    a != null && a.parentNode.removeChild(a)
}
function IsElementRtl(a) {
    a: ;
    while (a != null && a.tagName != null) {
        var b = a.getAttribute("dir");
        if ((b == null || b == "") && a.style != null) b = a.style.direction;
        if (b == "rtl") return true;
        else if (b == "ltr") return false;
        a = a.parentNode
    }
    return false
}
function getElementOverFlowStyle(b) {
    a: ;
    try {
        var a = b.currentStyle;
        if (a == "undefined" || a == null) return document.defaultView.getComputedStyle(b, null).getPropertyValue("overflow").toLowerCase();
        else return a.overflow.toLowerCase()
    } catch (c) {
        return ""
    }
}
function AdjustScrollPosition(d, e, b) {
    a: ;
    var a = d;
    while (a != null && a != e && a != d.offsetParent && a.tagName != null && a.tagName.toLowerCase() != "body" && a.tagName.toLowerCase() != "html" && !(getElementOverFlowStyle(a) == "hidden")) {
        if (a.scrollWidth > a.clientWidth && a.offsetWidth >= a.clientWidth && a.clientWidth != 0) if (!IsElementRtl(a)) {
            if (a.scrollLeft > 0) b.x -= a.scrollLeft
        } else if (browseris.ie8standard) b.x += a.scrollLeft;
        else if (browseris.firefox) b.x -= a.scrollLeft;
        else {
            var c = getElementOverFlowStyle(a);
            if (browseris.ie || browseris.safari && (c == "auto" || c == "scroll")) b.x += a.scrollWidth - a.clientWidth - a.scrollLeft
        }
        if (a.scrollTop > 0) b.y -= a.scrollTop;
        a = a.parentNode
    }
}
function MenuHtc_GetElementPosition(a, d) {
    a: ;
    var b = {};
    b.x = 0;
    b.y = 0;
    b.width = 0;
    b.height = 0;
    if (a.offsetParent) {
        var c = a;
        while (c != null && c != d) {
            b.x += c.offsetLeft;
            b.y += c.offsetTop;
            AdjustScrollPosition(c, d, b);
            var e = c.tagName.toLowerCase();
            if (e != "body" && e != "html" && c.clientTop != null && c.clientLeft != null && c != a) {
                b.x += c.clientLeft;
                b.y += c.clientTop
            }
            c = c.offsetParent
        }
    } else if (a.offsetLeft || a.offsetTop) {
        b.x = a.offsetLeft;
        b.y = a.offsetTop
    } else {
        if (a.x) b.x = a.x;
        if (a.y) b.y = a.y
    }
    if (a.offsetWidth && a.offsetHeight) {
        b.width = a.offsetWidth;
        b.height = a.offsetHeight
    } else if (a.style && a.style.pixelWidth && a.style.pixelHeight) {
        b.width = a.style.pixelWidth;
        b.height = a.style.pixelHeight
    }
    return b
}
function MenuTag(b, a) {
    a: ;
    this.tagName = b;
    this.className = a
}
function CreateMenuTag(a) {
    a: ;
    if (a.tagName != null) {
        var b = document.createElement(a.tagName);
        if (a.className != null) b.className = a.className;
        return b
    }
    return null
}
function TransferEventToMenu(b, c) {
    a: ;
    var a;
    if (browseris.ie) a = {
        srcElement: b,
        keyCode: c.keyCode
    };
    else a = {
        target: b,
        which: c.which
    };
    PopupKeyDown(a)
}
function MenuHtcInternal_Show(c, b, A, n) {
    a: ;
    var e = {};
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        e.popup = new MenuTag("div", "ms-MenuUIPopupBody");
        e.inner = new MenuTag("div", null);
        e.section = new MenuTag("table", null);
        e.menubody = new MenuTag("tbody", null)
    } else {
        e.popup = new MenuTag("div", "ms-MenuUIPopupBody ms-MenuUIPopupScreen");
        e.inner = new MenuTag("div", "ms-MenuUIPopupInner");
        e.section = new MenuTag("div", null);
        e.menubody = new MenuTag("ul", "ms-MenuUIUL")
    }
    var a = c._arrPopup[c._nLevel],
        i;
    !c._oContents && PrepContents(c);
    if (!c._oContents || IsOpen(c)) return;
    if (!a && !c._oRoot) {
        c._nLevel = 0;
        c._oRoot = c._oContents
    }
    var g = c._nLevel == 0;
    n = n && g;
    if (!a) {
        a = CreateMenuTag(e.popup);
        if (browseris.ie || browseris.safari) a.title = "";
        else if (browseris.nav) a.title = " ";
        c._arrPopup[c._nLevel] = a;
        a.isMenu = true;
        a.master = c;
        a.level = c._nLevel;
        i = CreateMenuTag(e.inner);
        var h = CreateMenuTag(e.section),
            j = CreateMenuTag(e.menubody);
        i.isInner = true;
        a.style.position = "absolute";
        if (c._fIsRtL) a.setAttribute("dir", "rtl");
        else a.setAttribute("dir", "ltr");
        a.style.visibility = "hidden";
        i.style.overflow = "visible";
        h.className = c._wzMenuStyle;
        if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
            h.cellSpacing = 0;
            h.cellPadding = 0
        }
        h.appendChild(j);
        i.appendChild(h);
        a.appendChild(i);
        if (!(typeof _fV4UI != "undefined" && _fV4UI) || g_MenuEndOfDOM == true) document.body.appendChild(a);
        else if (b.tagName == "TABLE") b.parentNode.appendChild(a);
        else b.appendChild(a);
        FixUpMenuStructure(c);
        for (var x = 0, y = c._oRoot.childNodes.length, p = 0; p < y; p++) {
            var q = c._oRoot.childNodes[p];
            if (q.nodeType != 1) continue;
            if (!FIsIType(q, "label")) {
                var v = CreateMenuItem(c, q, MakeID(c, c._nLevel, x));
                v && j.appendChild(v);
                x++
            }
        }
        if (typeof _fV4UI != "undefined" && _fV4UI && !c._fLargeIconMode) {
            for (var f = 0, o = j.getElementsByTagName("a"), m = null, l = 0, k = 0; k < o.length; k++) {
                l = o[k].childNodes[1].offsetWidth;
                if (l > f) {
                    m = k;
                    f = l
                }
            }
            f = 0;
            if (m == null) f = 200;
            else for (var u = o[m], z = u.childNodes.length, r = 0; r < z; r++) f += u.childNodes[r].offsetWidth;
            f += 16 + 5;
            j.style.width = f + "px";
            h.style.width = f + 4 + "px"
        }
        a.oncontextmenu = kfnDisableEvent;
        a.ondragstart = kfnDisableEvent;
        a.onselectstart = kfnDisableEvent;
        if (b._onmouseover == null) b._onmouseover = b.onmouseover;
        if (b._onmouseout == null) b._onmouseout = b.onmouseout;
        if (b._onmousedown == null) b._onmousedown = b.onmousedown;
        if (b._onclick == null) b._onclick = b.onclick;
        if (b._oncontextmenu == null) b._oncontextmenu = b.oncontextmenu;
        if (typeof _fV4UI != "undefined" && _fV4UI && g) if (b._onkeydown == null) b._onkeydown = b.onkeydown;
        if (browseris.nav) {
            a.onkeypress = function () {
                a: ;
                return false
            };
            a.onkeyup = function () {
                a: ;
                return false
            };
            a.onkeydown = function (a) {
                a: ;
                PopupKeyDown(a);
                a.cancelBubble = true;
                return false
            };
            a.onmousedown = function (a) {
                a: ;
                TrapMenuClick(a);
                return false
            };
            a.onmouseover = function (a) {
                a: ;
                PopupMouseOver(a);
                return false
            };
            a.onmouseout = function (a) {
                a: ;
                PopupMouseLeave(a);
                return false
            };
            a.onclick = function (a) {
                a: ;
                PopupMouseClick(a);
                TrapMenuClick(a);
                return false
            };
            b.onmouseover = function (a) {
                a: ;
                PopupMouseOverParent(a);
                return false
            };
            b.onmouseout = function (a) {
                a: ;
                PopupMouseLeaveParent(a);
                return false
            };
            b.onmousedown = function (a) {
                a: ;
                TrapMenuClick(a);
                return false
            };
            b.onclick = function (a) {
                a: ;
                TrapMenuClick(a);
                return false
            };
            b.oncontextmenu = function (a) {
                a: ;
                TrapMenuClick(a);
                return false
            };
            if (typeof _fV4UI != "undefined" && _fV4UI && g) b.onkeydown = function (b) {
                a: ;
                TransferEventToMenu(a, b);
                return false
            }
        } else {
            a.onkeydown = new Function("PopupKeyDown(event); event.cancelBubble=true; return false;");
            a.onmousedown = new Function("TrapMenuClick(event); return false;");
            a.onmouseover = new Function("PopupMouseOver(event); return false;");
            a.onmouseout = new Function("PopupMouseLeave(event); return false;");
            a.onclick = new Function("PopupMouseClick(event); TrapMenuClick(event); return false;");
            b.onmouseover = new Function("PopupMouseOverParent(event); return false;");
            b.onmouseout = new Function("PopupMouseLeaveParent(event); return false;");
            b.onmousedown = new Function("TrapMenuClick(event); return false;");
            b.onclick = new Function("TrapMenuClick(event); return false;");
            b.oncontextmenu = new Function("TrapMenuClick(event); return false;");
            if (typeof _fV4UI != "undefined" && _fV4UI && g) b.onkeydown = function () {
                a: ;
                TransferEventToMenu(a, event);
                return false
            }
        }
        if (g) {
            var t = c.getAttribute("onunloadtext");
            if (t) a.onunload = new Function(t)
        }
    } else {
        var w = c._arrSelected[c._nLevel];
        w && UnselectItem(w)
    }
    c._arrSelected[c._nLevel] = null;
    var d;
    if (browseris.ie) {
        var s = document.body.scrollLeft;
        d = document.createElement("iframe");
        AssureId(d);
        d.src = "/_layouts/blank.htm";
        d.style.position = "absolute";
        d.style.display = "none";
        d.scrolling = "no";
        d.frameBorder = "0";
        if (!(typeof _fV4UI != "undefined" && _fV4UI) || g_MenuEndOfDOM == true) document.body.appendChild(d);
        else if (b.tagName == "TABLE") b.parentNode.appendChild(d);
        else b.appendChild(d);
        a.style.zIndex = 103;
        a._backgroundFrameId = d.id;
        if (s != document.body.scrollLeft) document.body.scrollLeft = s
    }
    SetMenuPosition(c, b, a, i, n, g);
    a.style.visibility = "visible";
    if (browseris.ie) {
        SetBackFrameSize(null, a);
        a.onresize = new Function("SetBackFrameSize(event, null);");
        d.style.display = "block";
        d.style.zIndex = 101
    }
}
function SetMenuPosition(D, H, d, g, M, z) {
    a: ;
    var h = window.screen.width,
        j = window.screen.height;
    if (self.innerHeight) {
        h = self.innerWidth;
        j = self.innerHeight
    } else if (document.documentElement && document.documentElement.clientHeight) {
        h = document.documentElement.clientWidth;
        j = document.documentElement.clientHeight
    } else if (document.body) {
        h = document.body.clientWidth;
        j = document.body.clientHeight
    }
    var c = d.offsetWidth,
        f = d.offsetHeight,
        G = false,
        x = false;
    if (c > h - 50) {
        G = true;
        c = h - 50 < 0 ? 0 : h - 50
    }
    if (D._fCompactItemsWithoutIcons && f >= 375) {
        x = true;
        f = 375
    }
    if (f >= j - 50) {
        x = true;
        f = j - 50 < 0 ? 0 : j - 50
    }
    if (!G && !x) g.style.overflow = "visible";
    else if (browseris.ie) {
        if (G) {
            d.style.width = c + "px";
            g.style.width = c + "px";
            g.style.overflowX = "scroll"
        } else {
            g.style.width = c + "px";
            g.style.overflowX = "visible"
        }
        if (x) {
            d.style.height = f + "px";
            g.style.height = f + "px";
            g.style.overflowY = "scroll"
        } else {
            g.style.height = f + "px";
            g.style.overflowY = "visible"
        }
    } else {
        d.style.height = f + "px";
        g.style.height = f + "px";
        d.style.width = c + "px";
        g.style.width = c + "px";
        g.style.overflow = "auto"
    }
    c = d.offsetWidth;
    f = d.offsetHeight;
    var A = 0,
        y = h,
        a = 0,
        O = 0,
        r = 0,
        s = H;
    if (browseris.safari) if (s.tagName == "TR" && s.childNodes.length > 0) s = s.childNodes[0];
    var t = MenuHtc_GetElementPosition(s);
    a = t.x;
    r = t.y;
    var k;
    if (z) {
        k = t.width;
        r += t.height
    } else k = t.width + 1;
    var N = !M && !document.body.getAttribute("flipped"),
        w, F, B, C;
    if (!D._fIsRtL) {
        var u, q;
        if (z) {
            B = a;
            u = a + c;
            q = a + k - c
        } else {
            B = a + k;
            u = a + k + c;
            q = a - c
        }
        C = q;
        w = u > y && q > A;
        F = !(q < A && u < y)
    } else {
        var p, v;
        if (z) {
            p = a + k - c;
            v = a + c;
            C = a
        } else {
            p = a - c;
            v = a + k + c;
            C = a + k
        }
        B = p;
        w = p < A && v < y;
        F = !(v > y && p > A)
    }
    var l = N ? w : F,
        E = l ? C : B,
        i, n;
    if (browseris.firefox) {
        i = window.pageXOffset;
        n = window.pageYOffset
    } else {
        var m = document.body.parentElement;
        if (!IsElementRtl(document.body)) {
            i = document.body.scrollLeft;
            i += m.scrollLeft
        } else if (browseris.ie8standard) {
            i = -document.body.scrollLeft;
            i += -m.scrollLeft
        } else {
            var I = getElementOverFlowStyle(document.body);
            if (browseris.ie || browseris.safari && (I == "auto" || I == "scroll")) i = -document.body.scrollWidth + document.body.clientWidth + document.body.scrollLeft;
            i += -m.scrollWidth + m.offsetWidth + m.scrollLeft
        }
        n = document.body.scrollTop;
        n += m.scrollTop
    }
    if (c >= h) E = i;
    else if (E - i + c >= h) E = i + h - c;
    var o;
    if (f >= j) o = n;
    else if (r + f - n >= j) o = n + j - f;
    else o = r;
    if (browseris.safari) o += window.pageYOffset;
    else o += document.documentElement.scrollTop;
    d.setAttribute("flipped", M ? l && w : l);
    var b = E,
        e = o;
    if (browseris.safari) e -= window.pageYOffset;
    else e -= document.documentElement.scrollTop;
    if (typeof _fV4UI != "undefined" && _fV4UI && g_MenuEndOfDOM == false) if (!z) {
        if (D._fIsRtL) if (browseris.ie) if (l) b = b - a;
        else b = b - a + 1;
        else if (l) b = b - a;
        else b = b - a + 3;
        else if (browseris.ie) if (l) b = b - a + 1;
        else b = b - a;
        else if (l) b = b - a + 3;
        else b = b - a;
        if (e == 0) e = H.offsetTop - d.offsetParent.firstChild.scrollTop;
        else e = e - r + H.offsetTop - d.offsetParent.firstChild.scrollTop;
        if (browseris.ie8standard) e = e - 1
    } else if (d.offsetParent != null && d.offsetParent.tagName.toLowerCase() != "body") {
        var J, K, L = MenuHtc_GetElementPosition(d.offsetParent);
        J = L.x;
        K = L.y;
        e = e - K;
        b = b - J;
        if (!D._fLargeIconMode) e = e - 1
    }
    d.style.left = b + "px";
    d.style.top = e + "px";
    d.LeftForBackIframe = b;
    d.TopForBackIframe = e
}
function SetBackFrameSize(e, a) {
    a: ;
    if (a == null) a = GetEventSrcElement(e);
    var d = a.offsetWidth,
        c = a.offsetHeight,
        b = document.getElementById(a._backgroundFrameId);
    if (b != null) {
        b.style.left = a.LeftForBackIframe + "px";
        b.style.top = a.TopForBackIframe + "px";
        b.style.width = d + "px";
        b.style.height = c + "px"
    }
}
function HideMenu(a, c) {
    a: ;
    ClearTimeOutToHideMenu();
    if (c == null) c = 0;
    if (c == 2) {
        if (a._onDestroy != null) {
            a._onDestroy();
            a._onDestroy = null
        }
        return
    }
    if (IsOpen(a) && !IsAccessibilityFeatureEnabledProxy()) {
        if (a._oParent != null) {
            a._oParent.onclick = a._oParent._onclick;
            a._oParent.onmouseover = a._oParent._onmouseover;
            a._oParent.onmouseout = a._oParent._onmouseout;
            a._oParent.onmousedown = a._oParent._onmousedown;
            a._oParent.oncontextmenu = a._oParent._oncontextmenu;
            if (typeof _fV4UI != "undefined" && _fV4UI) a._oParent.onkeydown = a._oParent._onkeydown
        }
        SetBodyEventHandlers(null);
        UpdateLevel(a, 0);
        var b = a._arrPopup[0];
        if (b != null) {
            var d = document.getElementById(b._backgroundFrameId);
            d != null && d.parentNode.removeChild(d);
            b.parentNode != null && b.parentNode.removeChild(b);
            a._arrPopup[0] = null;
            if (c == 0) if (a._onDestroy != null && typeof a._onDestroy == "function") {
                a._onDestroy();
                a._onDestroy = null
            }
        }
        g_menuHtc_lastMenu = null;
        RenderECBBackwardCompatibilityMode(false)
    }
}
function IsOpen(a) {
    a: ;
    if (a._accessibleMenuInProgress || a._accessibleMenu && !a._accessibleMenu.closed) return true;
    if (!a._arrPopup) return false;
    var b = a._arrPopup[a._nLevel];
    return b
}
function FindLabel(d) {
    a: ;
    var a = d ? d.childNodes : null;
    if (a) for (var b = 0; b < a.length; b++) {
        var c = a[b];
        if (c.nodeType != 1) continue;
        if (FIsIType(c, "label")) return c
    }
    return null
}
function ShowRoot(a, b, f, d, e) {
    a: ;
    UpdateLevel(a, 0);
    if (f) {
        a._oContents = null;
        a._oRoot = null;
        a._nLevel = 0;
        a._arrPopup = [];
        a._arrSelected = []
    } else a._oRoot = a._oContents;
    var c = 0;
    if (b) c += b.offsetHeight;
    if (browseris.safari) if (b.tagName == "TR" && b.childNodes.length > 0) c += b.childNodes[0].offsetTop + b.childNodes[0].offsetHeight - b.offsetTop;
    if (e) c += e;
    d = d != false;
    MenuHtcInternal_Show(a, b, c, d)
}
function ShowSubMenu(a, c, b) {
    a: ;
    if (!b) return;
    if (b.submenuRoot == null) return;
    UpdateLevel(a, c);
    a._oRoot = b.submenuRoot;
    a._nLevel = a._nLevel + 1;
    MenuHtcInternal_Show(a, b, -1)
}
function ShowSubMenuEvnt(a) {
    a: ;
    if (a != null) {
        var b = a._arrPopup[a._nLevel];
        if (b) {
            b.removeAttribute("timeoutID");
            ShowSubMenu(a, a._nLevel, a._arrSelected[a._nLevel])
        }
    }
}
function SetShowSubMenuEvnt(a) {
    a: ;
    var b = a._arrPopup[a._nLevel];
    if (b) {
        ClearTimeOut("timeoutID");
        document.body.setAttribute("timeoutID", window.setTimeout(function () {
            a: ;
            ShowSubMenuEvnt(a)
        }, 100))
    }
}
function ClearTimeOut(a) {
    a: ;
    var b = document.body.getAttribute(a);
    b != null && window.clearTimeout(b);
    document.body.removeAttribute(a)
}
function ClearShowSubMenuEvnt() {
    a: ;
    ClearTimeOut("timeoutID")
}
function GetEventSrcItem(d, b) {
    a: ;
    var c = null;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) c = "tr";
    else {
        if (b != null && FIStringEquals(b.tagName, "div") && b.className.indexOf("ms-MenuUIPopupInner") != -1) return null;
        c = "li"
    }
    for (var a = b; a && !FIStringEquals(a.tagName, "body"); a = a.parentNode) if (FIStringEquals(a.tagName, c) && a.id.substring(0, d._wzPrefixID.length) == d._wzPrefixID) return a;
    return null
}
function UpdateLevel(a, d) {
    a: ;
    var b;
    while (a._nLevel > d) {
        if (a._arrPopup != null) b = a._arrPopup[a._nLevel];
        if (b) {
            ClearShowSubMenuEvnt(b);
            var c = document.getElementById(b._backgroundFrameId);
            c != null && c.parentNode.removeChild(c);
            b.parentNode.removeChild(b)
        }
        a._arrPopup[a._nLevel] = null;
        a._arrSelected[a._nLevel] = null;
        a._oRoot = a._oRoot.parentNode;
        a._nLevel--
    }
    if (a._arrPopup != null) b = a._arrPopup[a._nLevel];
    b && ClearShowSubMenuEvnt(b)
}
function PopupMouseOver(e) {
    a: ;
    var d = GetEventPopup(e);
    if (d != null) {
        var a = d.master,
            c = d.level;
        if (c < 0) return;
        var b = GetEventSrcItem(a, GetEventSrcElement(e));
        if (b) if (b != a._arrSelected[c]) {
            if (FIsIType(b, "separator")) return;
            ToggleMenuItem(a, c, b);
            FIsIType(b, "submenu") && EngageSelection(a, true, true, false)
        } else c < a._nLevel && UnselectCurrentOption(a);
        ClearTimeOutToHideMenu()
    }
}
function PopupMouseLeave(b) {
    a: ;
    var a;
    a = GetEventPopup(b);
    if (a != null) {
        UnselectCurrentOption(a.master);
        SetTimeOutToHideMenu()
    }
    return false
}
function PopupMouseOverParent() {
    a: ;
    if (g_menuHtc_lastMenu != null) {
        ClearTimeOutToHideMenu();
        g_menuHtc_lastMenu._oParent != null && g_menuHtc_lastMenu._oParent._onmouseover != null && typeof g_menuHtc_lastMenu._oParent._onmouseover == "function" && g_menuHtc_lastMenu._oParent._onmouseover()
    }
}
function PopupMouseLeaveParent() {
    a: ;
    if (g_menuHtc_lastMenu != null) {
        g_menuHtc_lastMenu._oParent != null && g_menuHtc_lastMenu._oParent._onmouseout != null && typeof g_menuHtc_lastMenu._oParent._onmouseout == "function" && g_menuHtc_lastMenu._oParent._onmouseout();
        SetTimeOutToHideMenu()
    }
}
function ClearTimeOutToHideMenu() {
    a: ;
    document.body.getAttribute("HideMenuTimeOut") != null && ClearTimeOut("HideMenuTimeOut")
}
function SetTimeOutToHideMenu() {
    a: ;
    ClearTimeOut("HideMenuTimeOut");
    document.body.setAttribute("HideMenuTimeOut", window.setTimeout(MenuHtc_hide, 5e3))
}
function PopupMouseClick(a) {
    a: ;
    var g = GetEventPopup(a),
        b = g.master,
        c = g.level;
    if (c < 0) return;
    var h = b._arrSelected[c],
        e = GetEventSrcItem(b, GetEventSrcElement(a));
    if (h != e) if (e) b._arrSelected[c] = e;
    UpdateLevel(b, c);
    var d, f;
    if (browseris.nav) {
        f = a && a.target && a.target.className == "hierarchy";
        d = a && a.target && a.target.getAttribute("onExpand")
    } else {
        f = a && a.srcElement && a.srcElement.className == "hierarchy";
        d = a && a.srcElement && a.srcElement.getAttribute("onExpand")
    }
    EngageSelection(b, true, false, false, f, d)
}
function PopupKeyDown(c) {
    a: ;
    var d = GetEventPopup(c),
        b = d.master,
        f = d.level;
    if (f < 0) return;
    var a = GetEventKeyCode(c),
        e = c.shiftKey;
    if (b._fIsRtL) if (a == 37) a = 39;
    else if (a == 39) a = 37;
    if (a == 9) a = !e ? 40 : 38;
    ClearShowSubMenuEvnt(d);
    switch (a) {
        case 38:
            MoveMenuSelection(b, -1);
            break;
        case 40:
            MoveMenuSelection(b, 1);
            break;
        case 37:
        case 27:
            CloseCurrentLevel(b, a == 27);
            break;
        case 39:
        case 13:
            EngageSelection(b, a == 13, false, true)
    }
    c.returnValue = false
}
function SetNewId(a) {
    a: ;
    a.id = "msomenuid" + GetUniqueNumber();
    return a.id
}
function AssureId(a) {
    a: ;
    if (a.id == null || a.id == "") a.id = "msomenuid" + GetUniqueNumber();
    return a.id
}
function NavigateToMenu(c) {
    a: ;
    if (IsAccessibilityFeatureEnabledProxy()) return;
    var b = null;
    b = c._arrPopup[c._nLevel].firstChild;
    AssureId(b);
    try {
        var a = b.firstChild.firstChild.firstChild;
        if (!(typeof _fV4UI != "undefined" && _fV4UI)) a.tabIndex = 0;
        else a = a.getElementsByTagName("A")[0];
        if (a != null) if (a.setActive != null) a.setActive();
        else a.focus != null && a.focus()
    } catch (d) { }
}
function ExecuteOnClick(fnOnClick, oMaster) {
    a: ;
    try {
        if (browseris.safari) if (FIStringEquals(typeof fnOnClick, "string")) eval("var document=window.document; {" + fnOnClick + "}");
        else fnOnClick();
        else {
            if (FIStringEquals(typeof fnOnClick, "string")) fnOnClick = new Function("event", "var document=window.document; {" + fnOnClick + "}");
            var oTemp = window.document.body.appendChild(window.document.createElement("span"));
            oTemp.master = oMaster;
            oTemp.onclick = fnOnClick;
            var evt, ctx = null;
            if (typeof currentCtx != "undefined" && currentCtx != null) ctx = currentCtx;
            else if (typeof ctxFilter != "undefined" && ctxFilter != null) ctx = ctxFilter;
            if (browseris.ie) evt = {
                srcElement: oTemp,
                fakeEvent: 1,
                currentCtx: ctx
            };
            else evt = {
                target: oTemp,
                fakeEvent: 1,
                currentCtx: ctx
            };
            oTemp.onclick(evt);
            oTemp.parentNode.removeChild(oTemp)
        }
    } catch (e) { }
}
function EngageSelection(oMaster, fDoSelection, fDelayExpandSM, fEnterSM, fExpand, fCommand) {
    a: ;
    var oItem = oMaster._arrSelected[oMaster._nLevel];
    if (!oItem || oItem.optionDisabled) return;
    if (FIsIType(oItem, "submenu")) if (fDelayExpandSM) SetShowSubMenuEvnt(oMaster);
    else {
        ShowSubMenu(oMaster, oMaster._nLevel, oItem);
        fEnterSM && MoveMenuSelection(oMaster, 1)
    } else if (fDoSelection) {
        var fEnabled = oItem.getAttribute("enabled");
        if (fEnabled != "false") if (!fExpand) {
            var fnOnClick = oItem.getAttribute("onMenuClick");
            if (fnOnClick) {
                HideMenu(oMaster, 1);
                ExecuteOnClick(fnOnClick, oMaster);
                HideMenu(oMaster, 2)
            }
        } else eval(fCommand)
    }
}
function CloseCurrentLevel(oMaster, fAllowHideRoot) {
    a: ;
    if (oMaster._nLevel > 0) {
        UpdateLevel(oMaster, oMaster._nLevel - 1);
        var obj = oMaster._arrSelected[oMaster._nLevel];
        if (obj != null && obj.onclick != null) obj.onclick = obj._onclick;
        if (obj != null) if (!(typeof _fV4UI != "undefined" && _fV4UI)) if (browseris.nav) {
            obj = obj.firstChild.firstChild.firstChild.firstChild.firstChild.nextSibling.firstChild.firstChild;
            obj.focus != null && obj.focus()
        } else obj.focus != null && obj.focus();
        else {
            obj = obj.getElementsByTagName("a")[0];
            if (obj != null) if (obj.setActive != null) obj.setActive();
            else obj.focus != null && obj.focus()
        }
    } else if (fAllowHideRoot) {
        HideMenu(oMaster);
        var oParent = oMaster._oParent;
        while (oParent != null && oParent.tagName == "SPAN" && oParent.getAttribute("contentEditable") == "true") oParent = oParent.parentElement;
        if (oParent != null) {
            var focusElement = oParent,
                foastr = oParent.getAttribute("foa");
            if (foastr != null) {
                var foa = null;
                foa = eval(foastr);
                if (foa == null) foa = byid(foastr);
                if (foa != null) focusElement = foa
            } else if (focusElement.tagName != "A") {
                var anchorList = focusElement.getElementsByTagName("a"),
                    anchorListLen = anchorList.length;
                if (anchorListLen > 0) focusElement = anchorList[anchorListLen - 1]
            }
            if (focusElement != null) if (focusElement.setActive != null) focusElement.setActive();
            else focusElement.focus != null && focusElement.focus()
        }
    }
}
function UnselectCurrentOption(a) {
    a: ;
    if (a._nLevel >= 0) {
        var b = a._arrSelected[a._nLevel];
        if (FIsIType(b, "option")) {
            UnselectItem(b);
            a._arrSelected[a._nLevel] = null
        }
    }
}
function MakeID(a, c, b) {
    a: ;
    return a._wzPrefixID + "_" + c + "_" + b
}
function GetItem(a, b, c) {
    a: ;
    var d = a._arrPopup[b];
    return d ? document.getElementById(MakeID(a, b, c)) : null
}
function MoveMenuSelection(b, g) {
    a: ;
    var a = -1,
        d = b._oRoot.childNodes.length,
        f = b._arrSelected[b._nLevel];
    if (f) {
        var e = f ? f.id : null;
        if (e) {
            var i = parseInt(e.substring(e.lastIndexOf("_") + 1, e.length));
            a = (i + d + g) % d
        }
    }
    if (a < 0) a = g > 0 ? 0 : d - 1;
    var c, h = a;
    do {
        c = GetItem(b, b._nLevel, a);
        a = (a + d + g) % d
    } while (a != h && (!c || c.style.display == "none" || !(FIsIType(c, "option") || FIsIType(c, "submenu"))));
    ToggleMenuItem(b, b._nLevel, c)
}
function ToggleMenuItem(d, e, a) {
    a: ;
    var b = d._arrSelected[e];
    if (!a || b && a.id == b.id) return;
    if (b) {
        UnselectItem(b);
        b.onkeydown = null;
        b.onmousedown = null;
        b.onmouseover = null;
        b.onmouseout = null;
        b.oncontextmenu = null
    }
    UpdateLevel(d, e);
    SelectItem(a);
    d._arrSelected[e] = a;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        a.tabIndex = 0;
        if (a.setActive != null) a.setActive();
        else a.focus != null && a.focus()
    } else {
        var c = a.firstChild.firstChild;
        if (c != null) if (c.setActive != null) c.setActive();
        else c.focus != null && c.focus()
    }
}
function SelectItem(b) {
    a: ;
    if (!b) return;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        var a = b.firstChild,
            d = a.firstChild;
        if (a.className == "ms-MenuUIItemTableCellCompact") a.className = "ms-MenuUIItemTableCellCompactHover";
        else a.className = "ms-MenuUIItemTableCellHover";
        d.className = "ms-MenuUIItemTableHover"
    } else {
        var c = b.firstChild;
        if (c.className.indexOf("ms-MenuUISeparator") == -1) c.className = "ms-MenuUIULItemHover"
    }
}
function UnselectItem(b) {
    a: ;
    if (!b) return;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        var a = b.firstChild,
            d = a.firstChild;
        if (a.className == "ms-MenuUIItemTableCellCompactHover") a.className = "ms-MenuUIItemTableCellCompact";
        else a.className = "ms-MenuUIItemTableCell";
        d.className = "ms-MenuUIItemTable"
    } else {
        var c = b.firstChild;
        if (c.className.indexOf("ms-MenuUISeparator") == -1) c.className = "ms-MenuUIULItem"
    }
}
function SetImageSize(c, b, a) {
    a: ;
    if (a == null) if (c._fLargeIconMode) a = 32;
    else a = 16;
    b.width = a;
    b.height = a
}
function CreateMenuOption(e, l, d, D, C) {
    a: ;
    var c = {};
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        c.icon = new MenuTag("td", null);
        c.label = new MenuTag("td", null);
        c.accKey = new MenuTag("td", null);
        c.arrow = new MenuTag("td", null)
    } else {
        c.icon = new MenuTag("span", null);
        c.label = new MenuTag("span", null);
        c.accKey = new MenuTag("span", null);
        c.arrow = new MenuTag("span", null)
    }
    var f = null,
        m = CreateMenuTag(c.icon),
        b = CreateMenuTag(c.label),
        i = CreateMenuTag(c.accKey),
        p = CreateMenuTag(c.arrow);
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        l.appendChild(m);
        l.appendChild(b);
        l.appendChild(i);
        l.appendChild(p)
    } else {
        f = document.createElement("a");
        f.className = "ms-MenuUIULLink";
        f.id = D + "_Anchor";
        f.appendChild(m);
        f.appendChild(b);
        f.appendChild(i);
        f.appendChild(p);
        if (!e._fIsRtL) i.style.cssFloat = "left";
        else i.style.cssFloat = "right";
        i.style.width = "auto";
        f.href = "javascript:;";
        f.setAttribute("onclick", "return false;")
    }
    if (e._fLargeIconMode) m.className = !e._fIsRtL ? "ms-MenuUIIconLarge" : "ms-MenuUIIconLargeRtl";
    else m.className = !e._fIsRtL ? "ms-MenuUIIcon" : "ms-MenuUIIconRtL";
    m.align = "center";
    if (e._fCompactItemsWithoutIcons && !d.getAttribute("iconSrc")) b.className = !e._fIsRtL ? "ms-menuuilabelcompact" : "ms-menuuilabelcompactRtl";
    else b.className = !e._fIsRtL ? "ms-MenuUILabel" : "ms-MenuUILabelRtL";
    i.className = "ms-MenuUIAccessKey";
    p.className = "ms-MenuUISubmenuArrow";
    if (!e._fLargeIconMode) b.style.whiteSpace = "nowrap";
    m.style.whiteSpace = "nowrap";
    i.style.whiteSpace = "nowrap";
    p.style.whiteSpace = "nowrap";
    p.style.display = "none";
    b.id = d.id;
    if (d.getAttribute("enabled") == "false") {
        l.disabled = true;
        if (!(typeof _fV4UI != "undefined" && _fV4UI)) b.className += " ms-MenuUIItemTableCellDisabled"
    }
    var q = null,
        o = null;
    if (d.getAttribute("checked") == "true") {
        q = e._wzChkMrkPath;
        o = "*"
    } else {
        q = EvalAttributeValue(d, "iconSrc", "iconScript");
        o = d.getAttribute("iconAltText")
    }
    var s;
    if (C) s = C;
    else s = "";
    var j = EvalAttributeValue(d, "text", "textScript");
    if (j == null || j == "") {
        var t = d.firstChild;
        if (t != null && t.nodeType == 3) j = t.nodeValue
    }
    var x = EvalAttributeValue(d, "description", "descriptionScript"),
        h = null;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) h = document.createElement("div");
    if (x != null && e._fLargeIconMode) {
        var a = document.createElement("span"),
            u = document.createTextNode(j),
            E = document.createElement("br"),
            n = document.createElement("span"),
            y = document.createTextNode(x);
        a.style.whiteSpace = "normal";
        n.className = "ms-menuitemdescription";
        n.style.whiteSpace = "normal";
        if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
            h.appendChild(a);
            a.appendChild(u);
            h.appendChild(E);
            h.appendChild(n);
            n.appendChild(y)
        } else {
            b.appendChild(a);
            a.appendChild(u);
            b.appendChild(E);
            b.appendChild(n);
            n.appendChild(y)
        }
    } else if (j != null) {
        var a = document.createElement("span"),
            r = d.getAttribute("hierarchy");
        if (r != null) {
            var k = document.createElement("span");
            k.setAttribute("style", "white-space: nowrap;");
            var B = d.getAttribute("onExpand");
            B != null && k.setAttribute("onExpand", B);
            k.className = "hierarchy";
            if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
                h.appendChild(k);
                k.innerHTML = r;
                a.setAttribute("style", "white-space: nowrap;");
                h.appendChild(a);
                a.innerHTML = j
            } else {
                b.appendChild(k);
                k.innerHTML = r;
                a.setAttribute("style", "white-space: nowrap;");
                b.appendChild(a);
                a.innerHTML = j
            }
        } else {
            var u = document.createTextNode(j);
            a.setAttribute("style", "white-space: nowrap;");
            if (!(typeof _fV4UI != "undefined" && _fV4UI)) h.appendChild(a);
            else b.appendChild(a);
            a.appendChild(u)
        }
    }
    var v = document.createElement("span");
    v.innerHTML = s;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) h.appendChild(v);
    else b.appendChild(v);
    var A = D + "_ICON",
        g = document.createElement("img");
    g.className = "ms-MenuUIULImg";
    SetImageSize(e, g);
    m.appendChild(g);
    g.id = A;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        var w = document.createElement("LABEL");
        b.appendChild(w);
        w.htmlFor = A;
        w.appendChild(h)
    }
    if (q) {
        g.src = q;
        g.alt = o ? o : "";
        g.title = o ? o : ""
    } else {
        g.src = "/_layouts/images/blank.gif";
        g.alt = "";
        g.title = ""
    }
    var z = d.getAttribute("accessKeyText");
    if (z) i.innerHTML = z;
    else i.style.display = "none";
    SetIType(l, "option");
    typeof _fV4UI != "undefined" && _fV4UI && l.appendChild(f)
}
function CreateMenuSeparator(a, b) {
    a: ;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        var d = document.createElement("td"),
            c = document.createElement("div");
        b.appendChild(d);
        d.appendChild(c);
        if (a._fLargeIconMode) c.className = !a._fIsRtL ? "ms-MenuUISeparatorLarge" : "ms-MenuUISeparatorLargeRtl";
        else c.className = !a._fIsRtL ? "ms-MenuUISeparator" : "ms-MenuUISeparatorRtL";
        c.innerHTML = "&nbsp;"
    } else {
        if (a._fLargeIconMode) b.className = !a._fIsRtL ? "ms-MenuUISeparatorLarge" : "ms-MenuUISeparatorLargeRtl";
        else b.className = !a._fIsRtL ? "ms-MenuUISeparator" : "ms-MenuUISeparatorRtL";
        b.innerHTML = "&nbsp;"
    }
    SetIType(b, "separator")
}
function CreateSubmenu(c, b, e, g) {
    a: ;
    var f = FindLabel(e);
    CreateMenuOption(c, b, e, g, f ? f.innerHTML : null);
    var d = null;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) d = b.childNodes[3];
    else d = b.childNodes[0].childNodes[3];
    d.style.display = "inline";
    var a = document.createElement("img");
    a.className = "ms-MenuUIULImg";
    SetImageSize(c, a, 16);
    d.appendChild(a);
    a.src = !c._fIsRtL ? c._wzMArrPath : c._wzMArrPathRtL;
    a.alt = L_SubMenu_Text;
    a.title = "";
    SetIType(b, "submenu");
    b.submenuRoot = e
}
function MergeAttributes(c, b) {
    a: ;
    if (browseris.nav || c.mergeAttributes == null) {
        for (var e = b.attributes, d = 0; d < e.length; d++) {
            var a = e[d];
            a != null && a.specified && a.nodeName != "id" && a.nodeName != "ID" && a.nodeName != "name" && c.setAttribute(a.nodeName, a.nodeValue)
        }
        b.getAttribute("type") != null && c.setAttribute("type", b.getAttribute("type"));
        if (b.submenuRoot != null) c.submenuRoot = b.submenuRoot
    } else c.mergeAttributes(b)
}
function CreateMenuItem(g, c, h, n) {
    a: ;
    if (FIsIType(c, "label")) return;
    var j = {};
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) j.menuitem = new MenuTag("tr", null);
    else j.menuitem = new MenuTag("div", "ms-MenuUIULItem");
    var a = CreateMenuTag(j.menuitem);
    MergeAttributes(a, c);
    if (FIsIType(c, "separator")) if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        CreateMenuSeparator(g, a);
        return a
    } else {
        var b = document.createElement("li");
        MergeAttributes(b, a);
        CreateMenuSeparator(g, a);
        b.appendChild(a);
        b.id = h;
        return b
    } !GetIType(c) && SetIType(c, "option");
    var d = null,
        f = null,
        e = null,
        i = null,
        b = null;
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        d = document.createElement("tr");
        f = document.createElement("td");
        e = document.createElement("table");
        i = document.createElement("tbody");
        d.appendChild(f);
        f.appendChild(e);
        e.appendChild(i);
        i.appendChild(a);
        if (g._fCompactItemsWithoutIcons && !c.getAttribute("iconSrc")) f.className = "ms-MenuUIItemTableCellCompact";
        else f.className = "ms-MenuUIItemTableCell";
        e.className = "ms-MenuUIItemTable";
        e.width = "100%";
        e.cellSpacing = 0;
        e.cellPadding = 0;
        if (a.disabled == true || a.getAttribute("enabled") == "false") f.className += " ms-MenuUIItemTableCellDisabled"
    } else {
        b = document.createElement("li");
        b.appendChild(a)
    }
    if (FIsIType(c, "submenu")) CreateSubmenu(g, a, c, h);
    else FIsIType(c, "option") && CreateMenuOption(g, a, c, h, n);
    if (a.disabled == true || a.getAttribute("enabled") == "false") {
        a.disabled = false;
        a.className += " ms-MenuUIDisabled";
        a.disabled = false;
        for (var m = a.childNodes.length, l = 0; l < m; l++) {
            var k = a.childNodes[l];
            if (k.nodeType != 1 || k.tagName == "A") continue;
            k.disabled = true
        }
        a.optionDisabled = true
    }
    if (!(typeof _fV4UI != "undefined" && _fV4UI)) {
        MergeAttributes(d, a);
        if (a.optionDisabled != null) d.optionDisabled = a.optionDisabled;
        d.id = h;
        SetIType(d, GetIType(a));
        return d
    } else {
        MergeAttributes(b, a);
        if (a.optionDisabled != null) b.optionDisabled = a.optionDisabled;
        b.id = h;
        SetIType(b, GetIType(a));
        return b
    }
}
function GetItems(a) {
    a: ;
    !a._oContents && PrepContents(a);
    return a._oContents.childNodes
}
function GetIType(a) {
    a: ;
    return a ? a.getAttribute("type") : null
}
function FIsIType(b, a) {
    a: ;
    return FIStringEquals(GetIType(b), a)
}
function SetIType(a, b) {
    a: ;
    a && a.setAttribute("type", b)
}
function FIStringEquals(a, b) {
    a: ;
    return a != null && b != null && a.toLowerCase() == b.toLowerCase()
}
function RenderAccessibleMenu(a, c) {
    a: ;
    if (c) {
        a._oContents = null;
        a._oRoot = null;
        a._nLevel = 0;
        a._arrPopup = [];
        a._arrSelected = []
    } else a._oRoot = a._oContents;
    !a._oContents && PrepContents(a);
    if (!a._oContents) return;
    if (!a._oRoot) {
        a._nLevel = 0;
        a._oRoot = a._oContents
    }
    FixUpMenuStructure(a);
    var d = a._fIsRtL ? "rtl" : "ltr";
    g_menuHtc_html = "<html dir='" + d + "'><head><title>" + L_AccessibleMenu_Text + "</title></head><body><ul id='root'>";
    RenderMenuLevel(a, a._oRoot, true);
    g_menuHtc_html = g_menuHtc_html + "</ul></body></html>";
    a._accessibleMenuInProgress = true;
    var b = window.open("/_layouts/blank.htm", "_blank", "status=no,toolbar=no,menubar=no,location=no");
    a._accessibleMenu = b;
    b.document.write(g_menuHtc_html);
    b.document.close();
    b.onunload = MenuHtc_hide;
    b.focus()
}
function CloseAccessibleMenu(a, b) {
    a: ;
    if (b == null) b = 0;
    if (a != null) {
        a._accessibleMenuInProgress = false;
        if (b == 0 || b == 1) if (a._accessibleMenu != null) {
            a._accessibleMenu.close();
            try {
                a._accessibleMenu.opener != null && a._accessibleMenu.opener.focus()
            } catch (c) { }
            a._accessibleMenu = null
        }
        if (b == 0 || b == 2) if (a._onDestroy != null) {
            a._onDestroy();
            a._onDestroy = null
        }
    }
}
function GetMenuItemText(d, b, a) {
    a: ;
    if (a == "") {
        a = EvalAttributeValue(b, "text", "textScript");
        var c = EvalAttributeValue(b, "description", "descriptionScript");
        if (c != null && c != "" && d._fLargeIconMode) {
            if (a != "") a = a + ": ";
            a = a + c
        }
    }
    if (b.getAttribute("checked") == "true") a = "* " + a;
    if (b.title != null && b.title != "") a = a + ": " + b.title;
    return a
}
function GetMenuItemEnabled(a, b) {
    a: ;
    if (!b) return false;
    if (a.getAttribute("enabled") == "false") return false;
    if (a.getAttribute("disabled") != null && a.getAttribute("disabled") != "") return false;
    return true
}
var g_menuHtc_html;

function RenderMenuLevel(c, h, g) {
    a: ;
    for (var d = 0; d < h.childNodes.length; d++) {
        var a = h.childNodes[d];
        if (a.nodeType != 1) continue;
        if (a.style.display == "none") continue;
        if (FIsIType(a, "option")) {
            var f = GetMenuItemText(c, a, a.innerHTML.trim());
            if (!GetMenuItemEnabled(a, g)) g_menuHtc_html = g_menuHtc_html + '<li><span id="' + a.id + '">' + f + "</span></li>";
            else g_menuHtc_html = g_menuHtc_html + '<li><a href="#" id="' + a.id + '" onMenuClick="' + a.getAttribute("onMenuClick") + '" onclick="javascript:opener.ExecuteOnAccessibleClick(this.getAttribute(\'onMenuClick\')); return false;">' + f + "</a></li>"
        } else if (FIsIType(a, "submenu")) {
            var f = GetMenuItemText(c, a, "");
            g_menuHtc_html = g_menuHtc_html + '<li><span id="' + a.id + '">' + f;
            for (var e = 0; e < a.childNodes.length; e++) {
                var b = a.childNodes[e];
                if (b.nodeType != 1) continue;
                if (b.style.display == "none") continue;
                if (FIsIType(b, "label")) {
                    g_menuHtc_html = g_menuHtc_html + " " + b.innerHTML;
                    break
                }
            }
            g_menuHtc_html = g_menuHtc_html + "</span><ul>";
            RenderMenuLevel(c, a, GetMenuItemEnabled(a, g));
            g_menuHtc_html = g_menuHtc_html + "</ul></li>"
        }
    }
}
function ExecuteOnAccessibleClick(b) {
    a: ;
    var a = g_menuHtc_lastMenu;
    if (a != null) {
        CloseAccessibleMenu(a, 1);
        ExecuteOnClick(b, a);
        CloseAccessibleMenu(a, 2)
    }
}
function FIsIHidden(oItem) {
    a: ;
    if (oItem) {
        var hiddenFunc = oItem.getAttribute("hidden");
        if (!hiddenFunc) return false;
        return eval(hiddenFunc)
    } else return false
}
function EvalAttributeValue(oNode, sAttribute1, sAttribute2) {
    a: ;
    var result = oNode.getAttribute(sAttribute2);
    if (result != null && result.toLowerCase().indexOf("javascript:") == 0) {
        result = eval(result.substring(11));
        if (result != null && result != "") return result
    }
    var result = oNode.getAttribute(sAttribute1);
    if (result == null) return "";
    return result
}
var MMU_chDelim = ",",
    MMU_chDelimEnc = "%2c",
    MMU_postbackPrefix = "javascript:__doPostBack(",
    MMU_chDelim2 = "%",
    MMU_chDelim2Enc = "%25";

function MHash_New() {
    a: ;
    var a = {};
    a._keys = [];
    a._values = [];
    return a
}
function MHash_Add(a, c, b) {
    a: ;
    a._keys.push(c);
    a._values.push(b)
}
function MHash_Count(a) {
    a: ;
    return a._keys.length
}
function MHash_Keys(a) {
    a: ;
    return a._keys
}
function MHash_Values(a) {
    a: ;
    return a._values
}
function MHash_Exists(b, c) {
    a: ;
    for (var a = 0; a < b._keys.length; a++) if (b._keys[a] == c) return true;
    return false
}
function MHash_Item(b, c) {
    a: ;
    for (var a = 0; a < b._keys.length; a++) if (b._keys[a] == c) return b._values[a];
    return null
}
var MMU_reDelimEnc = new RegExp(MMU_chDelimEnc, "g"),
    MMU_reDelim2Enc = new RegExp(MMU_chDelim2Enc, "g"),
    MMU_reDelimDec = new RegExp(MMU_chDelim, "g"),
    MMU_reDelim2Dec = new RegExp(MMU_chDelim2, "g");

function MMU_EncVal(a) {
    a: ;
    return a.replace(MMU_reDelimDec, MMU_chDelimEnc).replace(MMU_reDelim2Dec, MMU_chDelim2Enc)
}
function MMU_DecVal(a) {
    a: ;
    return a.replace(MMU_reDelim2Enc, MMU_chDelim2).replace(MMU_reDelimEnc, MMU_chDelim)
}
function MMU_ParseNV(h) {
    a: ;
    var g = MHash_New(),
        c = h.split(MMU_chDelim);
    if (c != null) for (var f = 0; f < c.length; f++) {
        var a = c[f],
            b = a.indexOf("=");
        if (b == 0) continue;
        var e = null,
            d = null;
        if (b < 0) e = a;
        else {
            e = a.substr(0, b);
            if (b < a.length - 1) d = MMU_DecVal(a.substr(b + 1));
            else d = ""
        }
        MHash_Add(g, e, d)
    }
    return g
}
function MMU_ParseNVAttr(a, c) {
    a: ;
    var b = a.getAttribute(c);
    if (b == null && a.childNodes.length > 0 && a.childNodes[0].nodeType == 1) b = a.childNodes[0].getAttribute(c);
    if (b == null) return MHash_New();
    return MMU_ParseNV(b)
}
function MMU_ResetMenuState(f, h, i, g, b) {
    a: ;
    for (var e = 0; e < f.childNodes.length; e++) {
        var a = f.childNodes[e];
        if (a.nodeType != 1) continue;
        var c = a.getAttribute("id");
        if (a != null && c != null && c.length > 0) {
            if (a.childNodes.length > 0) {
                MMU_ResetMenuState(a, h, i, g, b);
                continue
            }
            if (MHash_Exists(i, c)) a.style.display = "none";
            else {
                a.style.display = "";
                var d = a.getAttribute("enabledOverride");
                if (d != null && d.length > 0) a.setAttribute("enabled", d, 0);
                else if (MHash_Exists(h, c)) a.setAttribute("enabled", "false", 0);
                else {
                    a.setAttribute("enabled", "true", 0);
                    if (MHash_Exists(g, c)) a.setAttribute("checked", "true", 0);
                    else a.setAttribute("checked", "false", 0)
                }
            }
            MMU_ReplTokValAttr(a, "onMenuClick", b);
            MMU_ReplTokValAttr(a, "text", b);
            MMU_ReplTokValAttr(a, "description", b);
            MMU_ReplTokValVal(a, b)
        }
    }
}
function MMU_ReplTokValAttr(c, b, f) {
    a: ;
    var a = c.getAttribute(b),
        d = c.getAttribute(b + "_Original");
    if (a != null && d == null && MHash_Count(f) > 0) c.setAttribute(b + "_Original", a, 0);
    else if (a != null && d != null && a != d) a = d;
    if (a == null || a.length <= 0) return;
    var e = MMU_ReplTokVal(a, f);
    e != a && c.setAttribute(b, e, 0)
}
function MMU_ReplTokValVal(c, e) {
    a: ;
    if (c.nextSibling == null) return;
    var a = c.nextSibling.nodeValue,
        b = c.getAttribute("valOrig");
    if (a != null && b == null && MHash_Count(e) > 0) {
        b = a;
        c.setAttribute("valOrig", b, 0)
    } else if (a != null && b != null && a != b) a = b;
    var d = MMU_ReplTokVal(a, e);
    if (a != null && d != null && d != a) c.nextSibling.nodeValue = d
}
function MMU_ReplTokVal(a, b) {
    a: ;
    if (a != null && a.indexOf("%") >= 0 && b != null && MHash_Count(b) > 0) for (var d = MHash_Keys(b), e = MHash_Values(b), c = 0; c < d.length; c++) {
        var f = d[c],
            g = e[c];
        a = a.replace("%" + f + "%", g)
    }
    return a
}
var g_MMU_HighlightedEcbTable = null,
    g_MMU_HighlightedEcbTableOpen = null,
    g_MMU_OpenTimeoutHandle = null;

function MMU_Open(menu, ecbLink, e, fAlignRight, alignId, delay) {
    a: ;
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSMMUOpenStart);
    try {
        if (menu == null || ecbLink == null) return;
        if (ecbLink.getAttribute("suppressBubbleIfPostback") != null && e != null && e.srcElement != null && e.srcElement.href != null && e.srcElement.href.substr(0, MMU_postbackPrefix.length) == MMU_postbackPrefix) {
            event.cancelBubble = true;
            return
        }
        ClearHighlightedEcbTableOpen();
        if (fAlignRight == null) fAlignRight = true;
        MMU_ResetMenuState(menu, MMU_ParseNVAttr(ecbLink, "menuItemsDisabled"), MMU_ParseNVAttr(ecbLink, "menuItemsHidden"), MMU_ParseNVAttr(ecbLink, "menuItemsChecked"), MMU_ParseNVAttr(ecbLink, "menuTokenValues"));
        var elemAlign = null;
        if (alignId != null && alignId.length > 0) elemAlign = document.getElementById(alignId);
        if (elemAlign == null) elemAlign = document.getElementById(ecbLink.id + "_t");
        if (elemAlign == null) elemAlign = ecbLink;
        MMU_EcbHighlight(MMU_GetHighlightElement(ecbLink), true);
        var openMenuScript = "MenuHtc_show(document.getElementById('" + menu.id + "'), document.getElementById('" + elemAlign.id + "'), true, " + fAlignRight + ", null);";
        openMenuScript += "SetEcbMouseOutAndDestroy('" + menu.id + "');";
        if (delay != null && delay > 0) {
            openMenuScript += " g_MMU_OpenTimeoutHandle=null;";
            g_MMU_OpenTimeoutHandle = window.setTimeout(openMenuScript, delay, "javascript")
        } else eval(openMenuScript);
        if (e != null) e.cancelBubble = true
    } catch (ex) {
        alert(L_Loading_Error_Text)
    }
    IsFullNameDefined("CUI.PMetrics.perfMark") && CUI.PMetrics.perfMark(CUI.PMarker.perfWSSMMUOpenEnd)
}
function SetEcbMouseOutAndDestroy(a) {
    a: ;
    if (g_MMU_HighlightedEcbTable != null) {
        g_MMU_HighlightedEcbTable.onmouseout = null;
        g_MMU_HighlightedEcbTableOpen = g_MMU_HighlightedEcbTable;
        document.getElementById(a)._onDestroy = ClearHighlightedEcbTableOpen
    }
}
function ClearHighlightedEcbTableOpen() {
    a: ;
    if (g_MMU_HighlightedEcbTableOpen != null) {
        MMU_EcbHighlight(g_MMU_HighlightedEcbTableOpen, false);
        g_MMU_HighlightedEcbTableOpen = null
    }
}
function MMU_EcbLinkOnFocusBlurDeferCall(d, c, a) {
    a: ;
    if (a) c.onblur = a ? new Function("MMU_EcbLinkOnFocusBlurDeferCall(null, this, false)") : null;
    if (g_MMU_HighlightedEcbTableOpen != null) return;
    var b = document.getElementById(c.id + "_t");
    b != null && MMU_EcbHighlight(b, a)
}
function MMU_EcbTableMouseOverOutDeferCall(b, a) {
    a: ;
    if (a) {
        if (b == g_MMU_HighlightedEcbTableOpen) return;
        b.onmouseout = a ? new Function("MMU_EcbTableMouseOverOut(this, false)") : null
    }
    MMU_EcbHighlight(b, a)
}
function MMU_EcbHighlight(a, b) {
    a: ;
    if (a == null && !b) a = g_MMU_HighlightedEcbTableOpen;
    if (a == null) return;
    if (b == null) b = false;
    var d = a.getAttribute("hoverActive"),
        c = a.getAttribute("hoverInactive");
    if (d == null) d = "ms-selectedtitle";
    if (c == null) c = "ms-unselectedtitle";
    if (b) {
        a.className = d;
        g_MMU_HighlightedEcbTable = a
    } else a.className = c;
    var e = a.getAttribute("menuformat"),
        f = document.getElementById(a.id + "i");
    if (f != null && e != null && e == "ArrowOnHover") f.style.visibility = b ? "visible" : "hidden";
    if (!b) g_MMU_HighlightedEcbTable = null
}
function MMU_PopMenuIfShowingDeferCall(b) {
    a: ;
    if (!IsAccessibilityFeatureEnabledProxy() && g_menuHtc_lastMenu) {
        var a = g_menuHtc_lastMenu.getAttribute("type");
        a && a == "ServerMenu" && b.onclick()
    }
}
function MMU_HandleArrowSplitButtonKeyDown(a, c, b) {
    a: ;
    if (!a.shiftKey && !a.altKey && !a.ctrlKey && GetEventKeyCode(a) == 13) return;
    if (b) return MMU_EcbLinkOnKeyDown(byid(c), b, a)
}
function MMU_HandleArrowOnHoverKeyDown(c, b, a) {
    a: ;
    if (!a.shiftKey && !a.altKey && !a.ctrlKey && GetEventKeyCode(a) == 13) return;
    if (b) return MMU_EcbLinkOnKeyDown(c, b, a)
}
function MMU_GetHighlightElement(b) {
    a: ;
    var a = null;
    a = document.getElementById(b.id + "_t");
    if (a != null) return a;
    else return b
}
var g_MMU_theFormActionAtPageLoad = null,
    g_MMU_theFormActionAtPreMenuOpen = null,
    g_MMU_Form0ActionAtPageLoad = null,
    g_MMU_Form0ActionAtPreMenuOpen = null;

function MMU_CallbackPreMenuOpen(templateClientId, menuClientId, callbackEventReference, timeoutLength, timeoutMessage, e) {
    a: ;
    try {
        g_MMU_theFormActionAtPreMenuOpen = theForm != null ? theForm.action : "null";
        g_MMU_Form0ActionAtPreMenuOpen = document.forms != null && document.forms.length > 0 ? document.forms[0].action : "null";
        var menuTemplate = document.getElementById(templateClientId),
            menuLink = document.getElementById(menuClientId);
        if (menuLink.getAttribute("suppressBubbleIfPostback") != null && e != null && e.srcElement != null && e.srcElement.href != null && e.srcElement.href.substr(0, MMU_postbackPrefix.length) == MMU_postbackPrefix) {
            event.cancelBubble = true;
            return
        }
        MMU_StopPendingTimerEventsFromCallback();
        MMU_RemoveCallbackItemsFromMenuTemplate(menuTemplate);
        var menu = document.getElementById(menuClientId);
        menu.setAttribute("callbackInProgress", "true", 0);
        var loadingMessageMenuItem = CAMOpt(menuTemplate, L_Loading_Text, "null");
        if (loadingMessageMenuItem != null) {
            loadingMessageMenuItem.setAttribute("callbackitem", "true", 0);
            loadingMessageMenuItem.setAttribute("enabled", "false", 0)
        }
        var callbackContext = templateClientId + ";" + menuClientId + ";" + timeoutMessage.replace(/;/g, "%semi%").replace(/\'/g, "%quot%");
        callbackEventReference = callbackEventReference.replace(/__CALLBACKCONTEXT__/g, callbackContext);
        eval(callbackEventReference);
        g_MMU_RequestTimeoutTimeoutHandle = window.setTimeout("MMU_CallbackErrHandler('timeout', '" + callbackContext + "')", timeoutLength, "javascript")
    } catch (ex) {
        alert(L_Loading_Error_Text)
    }
}
var g_MMU_RequestTimeoutTimeoutHandle = null;

function MMU_RemoveCallbackItemsFromMenuTemplate(b) {
    a: ;
    try {
        for (var a = 0; a < b.childNodes.length; a++) {
            var c = b.childNodes[a];
            if (c.nodeType == 1 && c.getAttribute("callbackitem") == "true") {
                b.removeChild(c);
                --a
            }
        }
    } catch (d) {
        alert(L_Loading_Error_Text)
    }
}
function MMU_StopPendingTimerEventsFromCallback() {
    a: ;
    if (g_MMU_OpenTimeoutHandle != null) {
        window.clearTimeout(g_MMU_OpenTimeoutHandle);
        g_MMU_OpenTimeoutHandle = null
    }
    if (g_MMU_RequestTimeoutTimeoutHandle != null) {
        window.clearTimeout(g_MMU_RequestTimeoutTimeoutHandle);
        g_MMU_RequestTimeoutTimeoutHandle = null
    }
}
function MMU_UpdateMenuTemplateWithErrorItem(a, b) {
    a: ;
    MMU_RemoveCallbackItemsFromMenuTemplate(a);
    var c = CAMOpt(a, b, "null");
    if (loadingMessageMenuItem != null) {
        loadingMessageMenuItem.setAttribute("callbackitem", "true", 0);
        loadingMessageMenuItem.setAttribute("enabled", "false", 0)
    }
}
function MMU_UpdateOpenedMenuWithErrorItem(c, a, b) {
    a: ;
    MMU_UpdateMenuTemplateWithErrorItem(a, b);
    HideMenu(a);
    MMU_Open(a, c)
}
function MMU_CallbackHandler(l, k) {
    a: ;
    MMU_StopPendingTimerEventsFromCallback();
    var j = MMU_ParseContext(k),
        c = document.getElementById(j.TemplateClientId);
    if (c == null) {
        alert(L_Loading_Error_Text);
        return
    }
    var b = document.getElementById(j.MenuClientId);
    if (b == null) {
        alert(L_Loading_Error_Text);
        return
    }
    var g = "",
        i = "",
        h = "",
        f = "",
        e = "",
        a = l.split(MMU_chDelim);
    if (a == null || a.length != 5) e = MMU_GenerateErrorMenuItem(L_Loading_Error_Text);
    else {
        var d = new RegExp(MMU_chDelimEnc, "g");
        g = a[0].replace(d, MMU_chDelim);
        i = a[1].replace(d, MMU_chDelim);
        h = a[2].replace(d, MMU_chDelim);
        f = a[3].replace(d, MMU_chDelim);
        e = a[4].replace(d, MMU_chDelim)
    }
    b.setAttribute("menuItemsDisabled", g, 0);
    b.setAttribute("menuItemsHidden", i, 0);
    b.setAttribute("menuItemsChecked", h, 0);
    b.setAttribute("menuTokenValues", f, 0);
    MMU_RemoveCallbackItemsFromMenuTemplate(c);
    c.innerHTML = c.innerHTML + e;
    HideMenu(c);
    MMU_Open(c, b);
    b.setAttribute("callbackInProgress", "", 0)
}
function MMU_CallbackErrHandler(f, e) {
    a: ;
    try {
        alert(L_Loading_Error_Text);
        var a = MMU_ParseContext(e),
            d = document.getElementById(a.TemplateClientId);
        if (d == null) {
            alert(L_Loading_Error_Text);
            return
        }
        var b = document.getElementById(a.MenuClientId);
        if (b == null) {
            alert(L_Loading_Error_Text);
            return
        }
        b.setAttribute("callbackInProgress", "", 0);
        var c = L_Loading_Error_Text;
        if (f == "timeout" && a.TimeoutMessage != null && a.TimeoutMessage.length > 0) c = a.TimeoutMessage;
        MMU_UpdateOpenedMenuWithErrorItem(b, d, c)
    } catch (g) {
        alert(L_Loading_Error_Text)
    }
}
function MMU_ParseContext(c) {
    a: ;
    try {
        var a = {},
            b = c.split(";");
        a.TemplateClientId = b[0];
        a.MenuClientId = b[1];
        a.TimeoutMessage = b[2].replace(/%semi%/g, ";").replace(/%quot%/g, "'");
        return a
    } catch (d) {
        alert(L_Loading_Error_Text)
    }
}
var L_NewFormLibTb3_Text = "无法合并文档。\n可能是所需的应用程序安装不正确，或者是无法打开此文档库的模板。\n\n请尝试以下操作:\n1. 在此文档库的“常规设置”中检查该模板名，并安装打开该模板所必需的应用程序。如果该应用程序设置为在首次使用时安装，则运行该应用程序，然后再次尝试新建文档。\n\n2. 如果您拥有修改此文档库的权限，则转到该库的“常规设置”，然后配置新模板。",
    L_NewFormLibTb4_Text = "选择要合并的文档，然后单击工具栏上的“合并选择的文档”。";

function combineDocuments(k, j, g) {
    a: ;
    fNewDoc = false;
    if (browseris.w3c && !browseris.ie) document.all = document.getElementsByTagName("*");
    var a = true,
        b, c;
    try {
        var e = document.all.chkCombine;
        for (i = 0; a && i < e.length; i++) if (e[i].checked && a) {
            a = false;
            b = document.all.chkUrl[i].getAttribute("href");
            c = document.all.chkProgID[i].getAttribute("href")
        }
    } catch (d) { }
    try {
        if (a && document.all.chkCombine.checked) {
            a = false;
            b = document.all.chkUrl.getAttribute("href");
            c = document.all.chkProgID.getAttribute("href")
        }
    } catch (d) { }
    if (!a) {
        var f = false;
        try {
            NewDocumentButton = new ActiveXObject(c);
            fNewDoc = NewDocumentButton != null
        } catch (d) { }
        if (!fNewDoc) alert(L_NewFormLibTb3_Text);
        else {
            try {
                f = NewDocumentButton.MergeDocuments(b, document.all.chkCombine, makeAbsUrl(g))
            } catch (h) { }
            if (!f) alert(L_NewFormLibTb3_Text);
            else window.onfocus = RefreshOnFocus
        }
    } else alert(L_NewFormLibTb4_Text)
}
var L_NewFormLibTb5_Text = "选择要重新链接的文档，然后单击工具栏上的“重新链接选择的文档”。",
    L_NewFormLibTb6_Text = "一次只能重新链接 500 个文档，请修改选择范围并重试。";

function repairLinks(e, f, g) {
    a: ;
    if (browseris.w3c && !browseris.ie) document.all = document.getElementsByTagName("*");
    var b = 0,
        d = document.all.SubmitRepairDocs;
    d.value = "";
    for (var c = document.getElementsByTagName("input"), a = 0; a < c.length; a++) if (c[a].id == "chkRepair") if (c[a].checked) {
        d.value += c[a].getAttribute("docID");
        d.value += " ";
        b++
    }
    if (b > 0 && b <= 500) {
        document.all.SubmitRepairRedirectList.value = f;
        document.all.SubmitRepairRedirectFolder.value = e;
        document.all.SubmitRepairDocsForm.action = g + "/submitrepair.aspx";
        document.all.SubmitRepairDocsForm.submit()
    } else alert(b == 0 ? L_NewFormLibTb5_Text : L_NewFormLibTb6_Text)
}
function repairAllLinks(a, b, c) {
    a: ;
    if (browseris.w3c && !browseris.ie) document.all = document.getElementsByTagName("*");
    document.all.SubmitRepairDocs.value = "*";
    document.all.SubmitRepairRedirectList.value = b;
    document.all.SubmitRepairRedirectFolder.value = a;
    document.all.SubmitRepairDocsForm.action = c + "/submitrepair.aspx";
    document.all.SubmitRepairDocsForm.submit()
}
function NavigateToManageCopiesPage(a, b) {
    a: ;
    STSNavigate(a + "/_layouts/managecopies.aspx?ItemUrl=" + b + "&Source=" + GetSource())
}
var L_ViewVersion_Text = "查看",
    L_RestoreVersion_Text = "还原",
    L_DeleteVersion_Text = "删除",
    L_DenyVersion_Text = "拒绝此版本",
    L_UnPublishVersion_Text = "取消发布此版本";

function AddVersionMenuItemsCore(b, c) {
    a: ;
    if (currentItemID != null) {
        var f = currentItemID.toString();
        if (f.indexOf(".0.") >= 0) return
    }
    if (!HasRights(0, 64)) return;
    var a, e = itemTable.getAttribute("isCur"),
        h = itemTable.getAttribute("Level"),
        g = itemTable.getAttribute("canViewProperty");
    if (currentItemFSObjType == null) currentItemFSObjType = GetAttributeFromItemTable(itemTable, "OType", "FSObjType");
    if (g != "0") {
        a = CAMOpt(b, L_ViewVersion_Text, "javascript:ViewVersion()", "");
        a.id = "ID_ViewVersion"
    }
    if (HasRights(0, 4)) {
        a = CAMOpt(b, L_RestoreVersion_Text, "javascript:RestoreVersion()", "");
        a.id = "ID_RestoreVersion"
    }
    if (HasRights(0, 128) && e != "1") {
        a = CAMOpt(b, L_DeleteVersion_Text, "javascript:DeleteVersion()", "");
        a.id = "ID_DeleteVersion"
    }
    if (HasRights(0, 16) && HasRights(0, 4)) if ((c.isModerated || c.EnableMinorVersions) && currentItemFSObjType != 1 && (h == 1 && e == "1")) {
        var d = L_DenyVersion_Text;
        if (c.EnableMinorVersions) d = L_UnPublishVersion_Text;
        a = CAMOpt(b, d, "javascript:TakeOfflineVersion()", "");
        a.id = "ID_TakeOfflineVersion"
    }
}
function ViewVersion() {
    a: ;
    if (!IsContextSet()) return;
    STSNavigate(itemTable.getAttribute("verUrl"))
}
var L_Version_Restore_Confirm_Text = "您将用所选版本替换当前版本。",
    L_Version_RestoreVersioningOff_Confirm_Text = "版本控制当前被禁用。因此，您将覆盖当前版本。对此版本的所有更改都将丢失。",
    L_Version_NoRestore_Current_ERR = "无法还原当前版本。";

function RestoreVersion() {
    a: ;
    if (!IsContextSet()) return;
    var a = currentCtx;
    if (itemTable.getAttribute("isMostCur") != "0") alert(L_Version_NoRestore_Current_ERR);
    else {
        var b = a.HttpPath + "&op=Restore&ver=" + itemTable.getAttribute("verId");
        if (confirm(a.verEnabled ? L_Version_Restore_Confirm_Text : L_Version_RestoreVersioningOff_Confirm_Text)) {
            window.frameElement && window.frameElement.overrideDialogResult && window.frameElement.overrideDialogResult(1);
            SubmitFormPost(b)
        }
    }
}
var L_Version_NoOffline_NonCurrent_ERR = "只能将当前已发布或批准的版本设为脱机",
    L_Version_unpublish_Confirm_Text = "是否确实要取消发布此版本的文档?",
    L_Version_deny_Confirm_Text = "是否确实要拒绝此版本的文档?";

function TakeOfflineVersion() {
    a: ;
    if (!IsContextSet()) return;
    var b = currentCtx,
        a = L_Version_deny_Confirm_Text;
    if (b.EnableMinorVersions) a = L_Version_unpublish_Confirm_Text;
    if (itemTable.getAttribute("isCur") != "1" || itemTable.getAttribute("Level") != 1) alert(L_Version_NoOffline_NonCurrent_ERR);
    else confirm(a) && SubmitFormPost(b.HttpPath + "&op=TakeOffline")
}
var L_Version_Delete_Confirm_Text = "是否确实要删除此版本?",
    L_Version_Recycle_Confirm_Text = "是否确实要将此版本发送到网站回收站?",
    L_Version_NoDelete_Current_ERR = "无法删除当前签入版本、主要版本或已批准版本。";

function DeleteVersion() {
    a: ;
    if (!IsContextSet()) return;
    var a = currentCtx;
    if (itemTable.getAttribute("isCur") != "0") alert(L_Version_NoDelete_Current_ERR);
    else {
        var b = a.HttpPath + "&op=Delete&ver=" + itemTable.getAttribute("verId");
        confirm(a.RecycleBinEnabled ? L_Version_Recycle_Confirm_Text : L_Version_Delete_Confirm_Text) && SubmitFormPost(b)
    }
}
var L_Version_DeleteAll_Confirm_Text = "是否确实要删除与此文件关联的所有以前版本?",
    L_Version_RecycleAll_Confirm_Text = "是否确实要将与此文件关联的所有以前版本发送到网站回收站?",
    L_Version_DeleteAllMinor_Confirm_Text = "是否确实要删除此文件所有以前的草稿版本?",
    L_Version_RecycleAllMinor_Confirm_Text = "是否确实要将此文件所有以前的草稿版本发送到网站回收站?",
    L_Version_NoDeleteAll_None_ERR = "没有要删除的以前版本。";

function DeleteAllVersions(b, a) {
    a: ;
    if (b <= 1) alert(L_Version_NoDeleteAll_None_ERR);
    else confirm(a.RecycleBinEnabled ? L_Version_RecycleAll_Confirm_Text : L_Version_DeleteAll_Confirm_Text) && SubmitFormPost(a.HttpPath + "&op=DeleteAll")
}
function DeleteAllMinorVersions(b, a) {
    a: ;
    if (b <= 1) alert(L_Version_NoDeleteAll_None_ERR);
    else confirm(a.RecycleBinEnabled ? L_Version_RecycleAllMinor_Confirm_Text : L_Version_DeleteAllMinor_Confirm_Text) && SubmitFormPost(a.HttpPath + "&op=DeleteAllMinor")
}
function EditInGrid(b, a) {
    a: ;
    EnsureListControl();
    if (fListControl) {
        encViewId = escapeProperly(a);
        strDocUrl = b + "?ShowInGrid=True&View=" + encViewId;
        pageView = GetUrlKeyValue("PageView", true);
        if (pageView != "") strDocUrl = strDocUrl + "&PageView=" + pageView;
        showWebPart = GetUrlKeyValue("ShowWebPart", true);
        if (showWebPart != "") strDocUrl = strDocUrl + "&ShowWebPart=" + showWebPart;
        viewId = GetUrlKeyValue("View", true);
        if (viewId == "" || (viewId.toUpperCase() == a.toUpperCase() || viewId.toUpperCase() == encViewId.toUpperCase())) {
            rootFolder = GetUrlKeyValue("RootFolder", true);
            if (rootFolder != "") strDocUrl = strDocUrl + "&RootFolder=" + rootFolder
        }
        SubmitFormPost(strDocUrl)
    } else if (!fListErrorShown) {
        alert(L_EditInGrid_Text);
        fListErrorShown = true
    }
}
function ExitGrid(e) {
    a: ;
    var a, b, d, c;
    a = e;
    b = GetUrlKeyValue("PageView", true);
    d = GetUrlKeyValue("View", true);
    if (d != "") {
        a = a + "?View=" + d;
        c = GetUrlKeyValue("RootFolder", true);
        if (c != "") a = a + "&RootFolder=" + c;
        if (b != "") a = a + "&PageView=" + b;
        showWebPart = GetUrlKeyValue("ShowWebPart", true);
        if (showWebPart != "") a = a + "&ShowWebPart=" + showWebPart;
        a = a + "&ShowInGrid=HTML"
    } else {
        a = a + "?ShowInGrid=HTML";
        if (b != "") a = a + "&PageView=" + b;
        showWebPart = GetUrlKeyValue("ShowWebPart", true);
        if (showWebPart != "") a = a + "&ShowWebPart=" + showWebPart
    }
    SubmitFormPost(a)
}
function _AddSilverlightWebPart(d, b, a) {
    a: ;
    var c = new _AddSilverlightWebPartPopupUI(d, b, a);
    c.show()
}
function _AddSilverlightWebPartPopupUI(c, b, a) {
    a: ;
    this.item = c;
    this.zoneNum = b;
    this.zoneIndex = a
}
function _AddSilverlightWebPartPopupUI_show() {
    a: ;
    var b = this,
        c = function () {
            a: ;
            var a = {};
            a.url = _spExternalApplicationRegistrationInformation.dialogUrl;
            a.width = _spExternalApplicationRegistrationInformation.dialogWidth;
            a.height = _spExternalApplicationRegistrationInformation.dialogHeight;
            a.dialogReturnValueCallback = Function.createDelegate(b, b.dialogCallback);
            SP.UI.ModalDialog.showModalDialog(a)
        },
        a;
    try {
        a = typeof SP.UI.ModalDialog.showModalDialog
    } catch (d) {
        a = "undefined"
    }
    EnsureScript("SP.js", a, c)
}
function _AddSilverlightWebPartPopupUI_dialogCallback(c, a) {
    a: ;
    if (c == 1) {
        var b = WPAdder._getHiddenField("wpVal");
        if (b) if (a.applicationXml) b.value = a.applicationXml;
        else b.value = a.url;
        WPAdder.addItemToPage(this.item, this.zoneNum, this.zoneIndex)
    }
}
_AddSilverlightWebPartPopupUI.prototype.show = _AddSilverlightWebPartPopupUI_show;
_AddSilverlightWebPartPopupUI.prototype.dialogCallback = _AddSilverlightWebPartPopupUI_dialogCallback;

function _ConfigSilverlightWebpart(b, a, c, f, d) {
    a: ;
    var e = new _ConfigSilverlightWebpartPopupUI(b, a, c, f, d);
    e.show()
}
function _ConfigSilverlightWebpartPopupUI(b, a, c, e, d) {
    a: ;
    this.urlElementId = b;
    this.appXmlElementId = a;
    this.dialogUrl = c;
    this.dialogWidth = e;
    this.dialogHeight = d
}
function _ConfigSilverlightWebpartPopupUI_show() {
    a: ;
    var a = this,
        c = function () {
            a: ;
            var b = {};
            b.url = a.dialogUrl;
            b.width = a.dialogWidth;
            b.height = a.dialogHeight;
            var c = {};
            c.url = document.getElementById(a.urlElementId).value;
            c.applicationXml = document.getElementById(a.appXmlElementId).value;
            b.args = c;
            b.dialogReturnValueCallback = Function.createDelegate(a, a.dialogCallback);
            SP.UI.ModalDialog.showModalDialog(b)
        },
        b;
    try {
        b = typeof SP.UI.ModalDialog.showModalDialog
    } catch (d) {
        b = "undefined"
    }
    EnsureScript("SP.js", b, c)
}
function _ConfigSilverlightWebpartPopupUI_dialogCallback(c, b) {
    a: ;
    if (c == 1) {
        var a = document.getElementById(this.urlElementId);
        if (a) if (b.url != null) a.value = b.url;
        else a.value = "";
        a = document.getElementById(this.appXmlElementId);
        if (a) if (b.applicationXml != null) a.value = b.applicationXml;
        else a.value = ""
    }
}
_ConfigSilverlightWebpartPopupUI.prototype.show = _ConfigSilverlightWebpartPopupUI_show;
_ConfigSilverlightWebpartPopupUI.prototype.dialogCallback = _ConfigSilverlightWebpartPopupUI_dialogCallback;
