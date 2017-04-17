// JavaScript Document
$(function() {
		//顶部导航弹出层
	$('.ycc').hover(function(){
		$(this).find('div').css('display','block');
		$(this).css('z-index','8');
	},function(){
		$(this).find('div').css('display','none');
		$(this).css('z-index','1');
	});

	//特别策划
	$('#focus').slideFocus();
	//幻灯片新闻
	$('#focus1').slideFocus();
	$('#focus2').slideFocus1();
	$('#focus3').slideFocus();
	//滚动图片视频
	$(".x-gdtpsp").slide({
		titCell:"",
		mainCell:".mr_frUl_a ul",
		autoPage:true,
		effect:"leftLoop",
		autoPlay:false,
		delayTime:500,
		vis:4
	});
	//一线视角
	$(".x-yxsj").slide({
		titCell:"",
		mainCell:".mr_frUl_a ul",
		autoPage:true,
		effect:"leftLoop",
		autoPlay:false,
		delayTime:500,
		vis:4
	});
	//今日要闻
	$(".x-jryw").tabs({
		index: 0,
		type: "mouseover",
		current: "on",
		hdItem: ".tab_hd",
		bdItem: ".x-con-jryw"
	});	
	//微博微信二维码
	$('.x-wbwx').hover(function(){
		$(this).find('.ewm').css('display','block');
		$(this).css('z-index','8');
	},function(){
		$(this).find('.ewm').css('display','none');
		$(this).css('z-index','1');
	});
	//诚信合规手册
	$('.x-ztbd-bt .p5').hover(function(){
		$(this).find('div').css('display','block');
	},function(){
		$(this).find('div').css('display','none');
	});

	//数读图解
	//$("#s4").Scroll({line:1,speed:500,timer:3000,up:"btn3",down:"btn4"});
	//传媒之声
	$("#s3").Scroll({line:1,speed:500,timer:3000,up:"btn1",down:"btn2"});
	//企业动态滚动图片
	$(".x-qydt-con4").slide({
		titCell:"",
		mainCell:".mr_frUl_a1 ul",
		autoPage:true,
		effect:"leftMarquee",
		autoPlay:true,
		interTime:20,
		vis:3
	});
	//能源聚焦
	$(".x-nyjj").tabs({
		index: 0,
		type: "mouseover",
		current: "on",
		hdItem: ".tab",
		bdItem: ".x-ldjh-list"
	});	
	//石油公司动态
	$(".x-xygsdt").tabs({
		index: 0,
		type: "mouseover",
		current: "on",
		hdItem: ".tab",
		bdItem: ".x-ldjh-list-con"
	});	
	//股价油价气价
	$(".x-gjyjqj").tabs({
		index: 0,
		type: "mouseover",
		current: "p2",
		hdItem: ".x-gjyjqj-bt .p1",
		bdItem: ".x-gjyjqj-tab"
	});	
	//石油人物
	$(".mr_frbox111").slide({
		titCell:"",
		mainCell:".mr_frUl ul",
		autoPage:true,
		effect:"leftLoop",
		autoPlay:true,
		vis:1
	});
	//专题专栏
	$(".x-qydt-con9").slide({
		titCell:"",
		mainCell:".mr_frUl_a9 ul",
		autoPage:true,
		effect:"topMarquee",
		autoPlay:true,
		interTime:50,
		vis:5
	});

	


});

