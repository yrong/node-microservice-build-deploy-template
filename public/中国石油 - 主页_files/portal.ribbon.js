/// <reference path="c:\Program Files\common Files\microsoft Shared\web Server Extensions\14\TEMPLATE\LAYOUTS\MicrosoftAjax.js" />
/// <reference path="c:\Program Files\common Files\microsoft Shared\web Server Extensions\14\TEMPLATE\LAYOUTS\SP.debug.js" />
/// <reference path="c:\Program Files\common Files\microsoft Shared\web Server Extensions\14\TEMPLATE\LAYOUTS\SP.Core.debug.js" />

/// <see cref="http://msdn.microsoft.com/en-us/library/ff407303.aspx"/>
Type.registerNamespace('Portal.Ribbon');

////////////////////////////////////////////////////////////////////////////////
// Portal.Ribbon.PortalRibbonComponent

Portal.Ribbon.PortalRibbonComponent = function () {
    Portal.Ribbon.PortalRibbonComponent.initializeBase(this);
    this.registerWithPageManager();
}

Portal.Ribbon.PortalRibbonComponent.load = function () {
    Portal.Ribbon.PortalRibbonComponent.instance = new Portal.Ribbon.PortalRibbonComponent();
}

Portal.Ribbon.PortalRibbonComponent.prototype = {
    focusedCommands: null,
    globalCommands: null,

    registerWithPageManager: function () {
        SP.Ribbon.PageManager.get_instance().addPageComponent(this);
    },

    unregisterWithPageManager: function () {
        SP.Ribbon.PageManager.get_instance().removePageComponent(this);
    },

    // Initializes the page component
    init: function () {
        this.focusedCommands = [];
        this.globalCommands = ['Portal.PasteAsWord', 'Portal.FormatParagraph', 'Portal.SensitiveWords'];
    },

    // Returns a string array with the names of the focused commands. 
    getFocusedCommands: function () {
        return this.focusedCommands;
    },

    // Returns a string array with the names of the global commands
    getGlobalCommands: function () {
        return this.globalCommands;
    },

    // Indicates whether the page component can handle the command that was passed to it.
    canHandleCommand: function (commandId) {
        switch (commandId) {
            case 'Portal.PasteAsWord':
                return true;
                // return Portal.Ribbon.PortalCommands.pasteAsWordEnabled();
            case 'Portal.FormatParagraph':
            case 'Portal.SensitiveWords':
                return Portal.Ribbon.PortalCommands.paragraphOptEnabled();
            default:
                return false;
        }
    },

    // Execute the commands that come from our ribbon button
    handleCommand: function (commandId, properties, sequence) {
        switch (commandId) {
            case 'Portal.PasteAsWord':
                Portal.Ribbon.PortalCommands.pasteAsWord();
                break;
            case 'Portal.FormatParagraph':
                Portal.Ribbon.PortalCommands.FormatParagraph();
                break;
            case 'Portal.SensitiveWords':
                Portal.Ribbon.PortalCommands.SensitiveWords();
                break;
            default:
                break;
        }
    },

    // Indicates whether the page component can receive the focus. 
    // If this method returns false, the page manager will not register the page component's focused commands.
    isFocusable: function () {
        return true;
    },

    // Is used when the page component receives focus.
    receiveFocus: function () {
        //alert('The page component has received focus.');
        return true;
    },

    // Is called when the page component loses focus.
    yieldFocus: function () {
        //alert('The page component has lost focus.');
        return true;
    }
}

////////////////////////////////////////////////////////////////////////////////
// Portal.Ribbon.PortalCommandNames

Portal.Ribbon.PortalCommandNames = function () {
}


////////////////////////////////////////////////////////////////////////////////
// Portal.Ribbon.PortalRibbonCommandNames

Portal.Ribbon.PortalRibbonCommandNames = function () {
}


////////////////////////////////////////////////////////////////////////////////
// Portal.Ribbon.PortalCommands

Portal.Ribbon.PortalCommands = function () {
}

Portal.Ribbon.PortalCommands.pasteAsWordEnabled = function () {
    pasteClipboardData();
    var strHtml = getClipboardData();
    return isWordDocument(strHtml);
}
Portal.Ribbon.PortalCommands.paragraphOptEnabled = function () {
    return isRTEField();
}

Portal.Ribbon.PortalCommands.pasteAsWord = function () {
    pasteClipboardData();
    var wordXml = getClipboardData();
    var strHtml = clearWordDocument(wordXml);
    pasteWordDocument(strHtml);
}
Portal.Ribbon.PortalCommands.FormatParagraph = function () {
    FormatInit();
}
Portal.Ribbon.PortalCommands.SensitiveWords = function () {
    SensitiveWords("");
}
////////////////////////////////////////////////////////////////////////////////
// RegisterClass

Portal.Ribbon.PortalRibbonComponent.registerClass('Portal.Ribbon.PortalRibbonComponent', CUI.Page.PageComponent);
Portal.Ribbon.PortalCommandNames.registerClass('Portal.Ribbon.PortalCommandNames');
Portal.Ribbon.PortalRibbonCommandNames.registerClass('Portal.Ribbon.PortalRibbonCommandNames');
Portal.Ribbon.PortalCommands.registerClass('Portal.Ribbon.PortalCommands');

Portal.Ribbon.PortalRibbonComponent.instance = null;

Portal.Ribbon.PortalCommandNames.pasteAsWord = 'Portal.PasteAsWord';
Portal.Ribbon.PortalCommandNames.FormatParagraph = 'Portal.FormatParagraph';
Portal.Ribbon.PortalCommandNames.SensitiveWords = 'Portal.SensitiveWords';

//if (typeof (_spBodyOnLoadCalled) == 'undefined' || _spBodyOnLoadCalled) {
//    window.setTimeout(DocSet.Ribbon.DocSetRibbonComponent.load, 0);
//}
//else {
//    _spBodyOnLoadFunctionNames.push("Portal.Ribbon.PortalRibbonComponent.load");
//}
ExecuteOrDelayUntilScriptLoaded(Portal.Ribbon.PortalRibbonComponent.load, "sp.ribbon.js");

if (typeof (Sys) != "undefined" && Sys && Sys.Application) {
    Sys.Application.notifyScriptLoaded();
}
if (typeof (NotifyScriptLoadedAndExecuteWaitingJobs) != "undefined") {
    NotifyScriptLoadedAndExecuteWaitingJobs("Portal.Ribbon.js");
}