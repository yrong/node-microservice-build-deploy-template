var FestivalVersion=parseInt(Math.random()*10000000);
var FestivalScript=document.createElement("script");
var FestivalCss=document.createElement("link"); 
FestivalCss.rel="stylesheet";
FestivalCss.href="/FestivalsSkin/FestivalsSkinInformation/Festivals.css?v="+FestivalVersion;
FestivalScript.type="text/javascript";
FestivalScript.src="/FestivalsSkin/FestivalsSkinInformation/FestivalsSkin.js?v="+FestivalVersion;
document.getElementsByTagName('head')[0].appendChild(FestivalCss);
document.getElementsByTagName('head')[0].appendChild(FestivalScript);
