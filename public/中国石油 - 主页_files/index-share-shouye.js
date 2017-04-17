// JavaScript Document
$(function() {
		//页头二维码
	$('.x-ewm').hover(function(){
		$(this).find('div').css('display','block');
		$(this).css('z-index','1111111');
	},function(){
		$(this).find('div').css('display','none');
		$(this).css('z-index','1');
	});

	//站点导航
	var timer=null;
	$(".x-fixnav .p5 .x-zk1").mouseover(function(){
		clearInterval( timer);
    	$(".z-zddh-sd1").show();
  	});
	
	$(".x-fixnav .p5 .close").click(function(){
    	
			timer = setInterval(function(){
			
			$(".z-zddh-sd1").hide();			
			
			},20)
  	});
	
	$(".z-zddh-sd1").mouseover(function(){
		clearInterval( timer);
    	$(this).show();
  	});
	$(".z-zddh-sd1").mouseout(function(){
    	$(this).hide();
  	});

	
	$(".x-zkqb .x-zk").click(function(){
    	$(".z-zddh-sd").show();
  	});
	
	$(".x-zkqb .close").click(function(){
    	$(".z-zddh-sd").hide();
  	});

	
	//浮动导航
	if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g,"")=="MSIE7.0") 
	{ 
		$(".x-fixnav").css({"top":"96px","left":($(window).width()-$(".x-fixnav").width())*0.5-8});
	} 
	$('body #s4-workspace').scroll(function(){
			var wTop = $('body #s4-workspace').scrollTop();
			if(wTop<=96){
				$(".x-fixnav").css("top",96-wTop);
			}
			else if(wTop>96){
				$(".x-fixnav").css("top",0);
			}
	});
 
 

	
	//相关连接
	$('.x-xglj-title').hover(function(){
		$(this).find('div').css('display','block');
		$(this).css('z-index','8');
	},function(){
		$(this).find('div').css('display','none');
		$(this).css('z-index','1');
	});
	//页脚意见建议
	$('.x-yjjy').hover(function(){
		$(this).find('div').css('display','block');
		$(this).css('z-index','8');
	},function(){
		$(this).find('div').css('display','none');
		$(this).css('z-index','1');
	});



});

