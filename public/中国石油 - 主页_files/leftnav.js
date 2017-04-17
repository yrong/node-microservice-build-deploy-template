function b() {
	h = 700;
	t = $('body #s4-workspace').scrollTop();
	t > h ? $("#back-to-top").show() : $("#back-to-top").hide()
}
var t, h;
$(document).ready(function() {
	b(),
	$(".to-top").click(function() {
		$('body #s4-workspace').scrollTop(0)
	}),
	$("#back-to-top li div").hide(),
	$("#back-to-top li").mouseenter(function() {
		$("#back-to-top li div").hide(),
		$(this).find("div").show(),
		$("#back-to-top li>a").eq($(this).index()).addClass("current")
	}).mouseleave(function() {
		$("#back-to-top li>a").removeClass("current"),
		$(this).find("div").hide()
	}),
	$(".skin").mouseenter(function() {
		$("#back-to-top").show()
	}).mouseleave(function() {
		h = 700,
	t = $('body #s4-workspace').scrollTop(),
		h > t && $("#back-to-top").hide()
	});
	var c = parent.document.location.href,
	d = c.lastIndexOf("/"),
	e = c.lastIndexOf(".shtml");
	if ( - 1 != d && -1 != e && e > d) {
		var f = c.substring(d + 1, e);
		32 == f.length && ($("#container a").each(function() {
			var a = $(this).attr("href"); - 1 != a.indexOf("../") && $(this).attr("href", "../" + a)
		}), $("#footer-wrap a").each(function() {
			var a = $(this).attr("href"); - 1 != a.indexOf("../") && $(this).attr("href", "../" + a)
		}), $("#gonggyc a").each(function() {
			var a = $(this).attr("href"); - 1 != a.indexOf("../") && $(this).attr("href", "../" + a)
		}), $("#picrihgt a").each(function() {
			var a = $(this).attr("href"); - 1 != a.indexOf("../") && $(this).attr("href", "../" + a)
		}))
	}
}),
$('body #s4-workspace').scroll(function() {
	b()
}),
$(function() {
	$(window).bind("scroll",
	function() {
		$("#my_left_bar").css("top", $(window).scrollTop() + 55)
	}),
	$("#my_left_bar").length > 0 && $("#my_left_bar").append('<img style=" position:absolute; right:9px; z-index:999999; top:5px;" id="close_leftnav" src="http://10.21.64.2:8080/cnpc/xhtml/images/public/close_aa.gif" />'),
	$(".skin").length > 0 && $(".skin").append('<img style=" position:absolute; right:3px; z-index:999999; top:3px;" id="close_rightnav" src="http://10.21.64.2:8080/cnpc/xhtml/images/public/close_aa.gif" />'),
	$("#close_leftnav").live("click",
	function() {
		$("#my_left_bar").hide(),
		$(this).hide()
	}),
	$("#close_rightnav").live("click",
	function() {
		$(".skin").hide(),
		$(this).hide()
	})
});