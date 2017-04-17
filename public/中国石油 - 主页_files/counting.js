
	
	
function domainURI(str){
    var durl=/http:\/\/([^\/]+)\//i;
    domain = str.match(durl);
    return domain[1];
 }
 
var SiteName=domainURI(document.location.href);
var ChannelName = window.location.pathname;
ChannelName = ChannelName.substring(0,ChannelName.lastIndexOf('/')+1);
var PageUrl = 	window.location.href;
var PageName = encodeURI(window.location.href.replace(/^.*\/([^\/\?]*).*$/,'$1'));
var PageTitle=encodeURI(document.title);
var UpSiteName= encodeURI(document.referrer);
var DepSize = screen.width + ',' + screen.height;


if(UpSiteName.length>500){
	UpSiteName = UpSiteName.substring(0,500);
}
        

   
     $.getJSON("http://apps02.cnpc/CountPage/ClientInfo2013.ashx?jsoncallback=?", 
    { 
            SiteName: SiteName, 
            UpSiteName: UpSiteName, 
            ChannelPath: ChannelName,
            PageTitle: PageTitle,
            DepSize:DepSize,
            PageName:PageName,
            PageUrl:PageUrl
          }, 
          function(data) { 
         // alert(data.result);
          });     
    

    function getCounter(isShow,ShowName,Numlong) {
    var showPara = '';
    switch (ShowName.toLocaleLowerCase())
    {
        case "pageurl":
            showPara = PageUrl;
            break;
        case "sitename":
            showPara = SiteName;
            break;
         case "channelname":
            showPara = ChannelName;
            break;
     }
     $.getJSON("http://apps02.cnpc/CountPage/GetCountInfo.ashx?jsoncallback=?", 
    { 
            SiteName: SiteName, 
            UpSiteName: UpSiteName, 
            ChannelPath: ChannelName,
            PageTitle: PageTitle,
            DepSize:DepSize,
            PageName:PageName,
            PageUrl:PageUrl,
            ShowName:ShowName,
            Numlong:Numlong
          }, 
          function(data) { 
          if(isShow)
            $("#countObj").text(data.result);
          else
            $("#countObj").hide();   
          });      
    }