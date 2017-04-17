function pasteClipboardData() {
    // Initializes the iframe. SP.UI.Rte.debug.js line:4392
    RTE.Cursor.$9u();

    // Paste clipboard data to iframe. SP.UI.Rte.debug.js line:4454
    RTE.Cursor.$R_0.style.display = '';

    var $v_0 = RTE.Cursor.$R_0.contentWindow.document;
    var $v_1 = $v_0.body;
    var $v_2 = RTE.DomHelper.createRange($v_0);
    var $v_3 = new RTE.Range($v_2);
    $v_3.moveToElementText($v_1);
    $v_3.select();
    // The codes above can replace with: RTE.Cursor.$R_0.contentWindow.focus();

    RTE.Cursor.$R_0.contentWindow.document.execCommand('paste', false, null);
    RTE.Cursor.$R_0.style.display = 'none';
}

function getClipboardData() {
    return RTE.Cursor.$R_0.contentWindow.document.body.innerHTML;
}

function isWordDocument(str) {
    //class=”MsoNormal”;<w:WordDocument></w:WordDocument>;style=”mso-font-charset:0”
    var re = new RegExp(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/ig);
    return re.test(str);
}

function clearWordDocument(str) {
    //remove link break
    str = str.replace(/\r\n|\n|\r/ig, "");
    //remove &nbsp; entities at the start of contents
    str = str.replace(/^\s*(&nbsp;)+/ig, "");
    //remove &nbsp; entities at the end of contents
    str = str.replace(/(&nbsp;|<br[^>]*>)+\s*$/ig, "");
    // Word comments like conditional comments etc
    str = str.replace(/<!--[\s\S]*?-->/ig, "");
    // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
    str = str.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi, "");

    //convert word headers to strong
    str = str.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
    //remove lang attribute
    str = str.replace(/(lang)\s*=\s*([\'\"]?)[\w-]+\2/ig, "");
    // Examine all styles: delete junk, transform some, and keep the rest
    str = str.replace(/(<[a-z][^>]*)\sstyle="([^"]*)"/gi, function (str, tag, style) {
        var n = [],
                                    i = 0,
                                    s = style.trim().replace(/&quot;/gi, "'").split(";");

        // Examine each style definition within the tag's style attribute
        for (var i = 0; i < s.length; i++) {
            v = s[i];
            var name, value,
            parts = v.split(":");

            if (parts.length == 2) {
                name = parts[0].toLowerCase();
                value = parts[1].toLowerCase();
                // Translate certain MS Office styles into their CSS equivalents
                switch (name) {
                    case "mso-padding-alt":
                    case "mso-padding-top-alt":
                    case "mso-padding-right-alt":
                    case "mso-padding-bottom-alt":
                    case "mso-padding-left-alt":
                    case "mso-margin-alt":
                    case "mso-margin-top-alt":
                    case "mso-margin-right-alt":
                    case "mso-margin-bottom-alt":
                    case "mso-margin-left-alt":
                    case "mso-table-layout-alt":
                    case "mso-height":
                    case "mso-width":
                    case "mso-vertical-align-alt":
                        n[i++] = name.replace(/^mso-|-alt$/g, "") + ":" + ensureUnits(value);
                        continue;

                    case "horiz-align":
                        n[i++] = "text-align:" + value;
                        continue;

                    case "vert-align":
                        n[i++] = "vertical-align:" + value;
                        continue;

                    case "font-color":
                    case "mso-foreground":
                        n[i++] = "color:" + value;
                        continue;

                    case "mso-background":
                    case "mso-highlight":
                        n[i++] = "background:" + value;
                        continue;

                    case "mso-default-height":
                        n[i++] = "min-height:" + ensureUnits(value);
                        continue;

                    case "mso-default-width":
                        n[i++] = "min-width:" + ensureUnits(value);
                        continue;

                    case "mso-padding-between-alt":
                        n[i++] = "border-collapse:separate;border-spacing:" + ensureUnits(value);
                        continue;

                    case "text-line-through":
                        if ((value == "single") || (value == "double")) {
                            n[i++] = "text-decoration:line-through";
                        }
                        continue;

                    case "mso-zero-height":
                        if (value == "yes") {
                            n[i++] = "display:none";
                        }
                        continue;
                }
                // Eliminate all MS Office style definitions that have no CSS equivalent by examining the first characters in the name
                if (/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?:align|decor|indent|trans)|top-bar|version|vnd|word-break)/.test(name)) {
                    continue;
                }
                // If it reached this point, it must be a valid CSS style
                n[i++] = name + ":" + parts[1];        // Lower-case name, but keep value case
            }
        }
        // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
        if (i > 0) {
            return tag + ' style="' + n.join(';') + '"';
        } else {
            return tag;
        }
    });

    return str;
}

function pasteWordDocument(str) {
    // SP.UI.Rte.debug.js line:4261
    RTE.Cursor.get_range().deleteContent();
    var rng = RTE.Cursor.get_range().$3_0;
    var doc = rng.ownerDocument;
    var content = doc.createElement("div");
    content.innerHTML = str;
    SP.UI.UIUtility.insertAfter(content, rng);
    RTE.Cursor.update();
}
/* clearWordDocument()存在bug，影响word粘贴带格式 20120905 by yuepeng */
function clearWordDocument(text) {
    return text;
}