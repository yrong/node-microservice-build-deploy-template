var isSave; //标识是否可以保存，如果有敏感词，则为否，即提示是否修改不能保存
function SensitiveWords() {
    SensitiveWords("");
}
function SensitiveWords(commandId) {
    isSave = true;
    //commandId != "PageStateGroupSaveSplit" && 
    if (commandId != "PageStateGroupCheckinSplit" && commandId != "PageStateGroupSubmitForApproval" && commandId != "PageStateGroupPublishSplit") {
        var region = RTE.Canvas.currentEditableRegion();

        if (!region) {
            return;
        }
        //获取敏感词JSON串的数组
        var Sensitive = new Array();
        var siteUrl = SP.PageContextInfo.get_webServerRelativeUrl(); //获取当前网站URL
        var resUrl = siteCollectionUrl + "/_vti_bin/listdata.svc/敏感词配置";
        if (siteCollectionUrl == "/") {
            resUrl = "http://" + location.host + "/_vti_bin/listdata.svc/敏感词配置";
        }
        $.ajax({
            type: "GET",
            url: resUrl, //调用系统自带WCF，获取敏感词
            data: "{}",
            dataType: 'json',   //WCF返回Json类型  
            async: false,
            success: function (data, textStatus, jqXHR) {
                if (data.d.results.length > 0) {
                    var word;
                    for (var i = 0; i < data.d.results.length; i++) {//当前判断的规则是“禁用词”和“慎用词”都是“敏感词”
                        if (data.d.results[i].敏感词启用状态 == true) {
                            var category = data.d.results[i].敏感词分类Value == null ? "" : data.d.results[i].敏感词分类Value;
                            var forbidden = data.d.results[i].敏感禁用词 == null ? "" : data.d.results[i].敏感禁用词.split(',');
                            var careful = data.d.results[i].敏感慎用词 == null ? "" : data.d.results[i].敏感慎用词.split(',');
                            var recommend = data.d.results[i].推荐替代词 == null ? "" : data.d.results[i].推荐替代词.split(',');
                            var desc = data.d.results[i].敏感词描述 == null ? "" : data.d.results[i].敏感词描述;
                            var word = { 'category': category, 'f': forbidden, 'c': careful, 'r': recommend, 'desc': desc };
                            Sensitive.push(word);
                        }
                    }
                }
            },
            error: function (result) {     //回调函数，result，返回值 
                alert("没有发现敏感词信息，请确认敏感词列表!!!");
            }
        });
        region.innerHTML = ExecuteChecking(Sensitive, region.innerHTML)
        if (!isSave) {
            addNotification("发现敏感词,已标记！", false);
            //PageStateGroupSaveSplit,PageStateGroupSaveAndStop,PageStateGroupSaves是保存按钮事件ID
            if (commandId == "PageStateGroupSaveSplit" || commandId == "PageStateGroupSave" || commandId == "PageStateGroupSaveAndStop") {
                isSave = confirm("检测到敏感词，是否确实要强制保存并关闭？") ? true : false;
            }
        }
        else {
            if (commandId != "PageStateGroupSaveSplit" && commandId != "PageStateGroupSave" && commandId != "PageStateGroupSaveAndStop") {
                addNotification("没有 发现敏感词！", false);
            }
        }
    }
    return isSave;
}

//将检测到的敏感词标红标记
function ExecuteChecking(arr, html) {
    i = arr.length;
    while (i--)  /* 循环规则条目 */
    {
        /* 循环禁用词 */
        fLength = arr[i].f.length;
        while (fLength--) {
            fWord = arr[i].f[fLength];
            html = markColor(html, fWord);
        }

        /* 循环慎用词 */
        cLength = arr[i].c.length;
        while (cLength--) {
            cWord = arr[i].c[cLength];
            html = markColor(html, cWord);
        }

        /* 遍历推荐词 */
    }
    return html;
}

//对内容标色
function markColor(html, word) {
    var MARK_TAG = "<SPAN class=\"ms-spellcheck-error ms-rtegenerate-skip fb-word\">$</SPAN>"; /* 敏感词标记定义 '$'为内容占位符 */
    var filter = MARK_TAG.replace("$", "");

    if (filter.indexOf(word) == -1) {
        var myReg = eval("/" + word + "/gi"); /* 动态生成正则 匹配多个且忽略大小写 */
        text = html.match(eval("/" + word + "/i"));
        if (text != null || text != undefined) {
            isSave = false;
        }
        html = html.replace(myReg, MARK_TAG.replace("$", text));
    }
    return html;
}