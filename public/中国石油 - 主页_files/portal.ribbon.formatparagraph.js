function isRTEField() {
    var region = RTE.Canvas.currentEditableRegion();
    if (!region || region.id.indexOf('Title') > 0) {
        return false;
    }
    return true;
}

//过滤标签，默认将图片替换成###
function tagFilter(content, tag, replace) {
    tag = tag || 'img';
    replace = replace || '###';
    regex = eval("/<" + tag + "[^>]+>/ig");
    html = content.replace(regex, replace);
    return html;
}

//接收传进的字符串，并执行自动排版
function FormatInit() {
    if (confirm("是否确实要自动排版？选择自动排版格式将丢失！")) {
        var region = RTE.Canvas.currentEditableRegion();
        if (!region) {
            return;
        }
        region.innerHTML = FormatText(region); 
    }
}

//自动排版
function FormatText(region) {
    var imgs = region.getElementsByTagName('IMG'); //获得图片
    var imgs_tmp = [];
    if (imgs != null && imgs.length > 0) {
        i = imgs.length;
        for (var j = i; j--;j>0 ) {
            imgs_tmp.push(imgs[j].outerHTML);
            imgs[j].outerHTML = "###";
        }
        //input = tagFilter(region.innerHTML);
        //input = input.replace( /<[^>]+>/ig , "");   
      
        input = ExecuteFormatText(region.innerText);  //此处进行其他排版处理
        i = imgs_tmp.length;
          for (var j = i; j--;j>0 ) {
            imgDom = "<p style='text-align:center;'>" + imgs_tmp.pop() + "<span style='display:block'>#图片说明#</span></p>";
            input = input.replace("###", imgDom);
        }
    }

    else {
        input = ExecuteFormatText(region.innerText);
    }
    return input;
}

//开始排版
function ExecuteFormatText(input) {
    var text = ShiftSymbol(input);
    text = delBlank(text);
    text = text.replace(/#图片说明#/ig, "");
    var tmps = text.split('\r'); //以\r分组标记
    var html = "";
    for (var i = 0; i < tmps.length; i++) {
        var tmp = tmps[i].trim() ;
        if (tmp.length > 0) {
            if (tmp != "###") {
                html += "<p>　　" + tmp + "</p>\r"; //将每个分组加<p>标签.replace(/[　　]/g, "")
            }
            else {
                html += "###"; //图片替换符不加p标签
            }
        }
    }
    return html;
}

//将全半角角符号转变
function ShiftSymbol(html) {
    var result = '';
    for (var i = 0; i < html.length; i++) {
        code = html.charCodeAt(i);
        // “65281”是“！”，“65373”是“｝”，“65292”是“，”。不转换"，"，65306 ：
        //需加入分号65307
        if (code >= 65281 && code < 65375 && code != 65292 && code != 65306 && code != 65307) {
            //  “65248”是转换码距
            result += String.fromCharCode(html.charCodeAt(i) - 65248);
        }
        else {
            result += html.charAt(i);
        }
    }
    return result;
}

//去除多余空格
function delBlank(html) {
    var result = '';
    var sum = 0;
    for (var i = 0; i < html.length; i++) {
        code = html.charCodeAt(i);
        if (code == 32 || code == 12288|| code==8203) {//空格，包含全角空格,0宽度的空格
            sum++;
        } else {
            result += html.charAt(i);
        }
    }
    if (sum > 0) {
        /*addNotification("替换空格 " + sum + " 个！", false);*/
    }
    if (sum == 0) {
        addNotification("未发现多余空格！", false);
    }
    return result;
}

//当用户编辑标题时，排版按钮不显示 
var curOBJ;
$(function () {

    //鼠标点击时隐藏
    $("a[role=button]").each(function () {
        if ($(this).attr("id") == "Ribbon.EditingTools.CPEditTab.Paragraph.Format-Large") {
            curOBJ = $(this); //记录“排版”ribbon按钮对象
            curOBJ.addClass("format");
        }
    });
    //当新闻内容文本框获取焦点时，显示“排版"按钮
    $("div[id*=RichHtmlField]").each(function () {
        $(this).focus(function () {
            if ($(this).attr("id").indexOf("PlaceHolderMain_Content_RichHtmlField") > 0) {
                curOBJ.removeClass("format");
            }
            else {
                curOBJ.addClass("format");
            }
        });
    });
});