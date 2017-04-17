function Wait() {
    if (CheckClientValidate()) {

        var tempdiv = document.createElement("DIV");
        tempdiv.style.position = 'absolute';
        tempdiv.style.display = 'block';
        tempdiv.style.width = '100%';
        tempdiv.style.height = document.documentElement.clientHeight;
        tempdiv.style.zIndex = 99999;
        tempdiv.style.left = "0px";
        tempdiv.style.top = "0px";
        tempdiv.style.filter = "alpha(opacity=50)";
        tempdiv.style.backgroundColor = 'white';
        tempdiv.innerHTML = '<table style="width: 100%; height: 100%"><tr><td align="center"><img src="../../App_Themes/Default/Images/Main/Indicator.gif" ismap="ismap" style="" /></td></tr></table>';
        //parent.window.document.body.appendChild(tempdiv);
        document.body.appendChild(tempdiv);
        return true;
    }
    else {
        return false;
    }    
          
}
function CheckClientValidate() {    
    if (typeof (Page_IsValid) === 'undefined') {
        return true;
    }
    else {
        
        Page_ClientValidate();
        if (Page_IsValid) {
            return true;
        }
        else {
            return false;
        }
    }


}
