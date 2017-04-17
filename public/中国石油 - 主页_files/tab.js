
(function ($) {
    /**
     * @name    tabs        页卡函数
     * @param   {Object}    初始值
     * @type    {Object}    返回对象本身
     */
    $.fn.tabs = function (options) {
        var config = {
            index: 0,
            current:"current",
            type: "mouseover",
            hdItem: ".tab_hd_item",
            bdItem: ".tab_bd_item",
            moreItem: ".tab_bd_item"
        },
        obj = $(this),
        opts = $.extend({}, config, options);

        $(opts.hdItem, obj).bind(opts.type, function(){
            if(opts.index != $(opts.hdItem, obj).index($(this))){
                opts.index = $(opts.hdItem, obj).index($(this));
                setCurrent();
            }
        });

        function setCurrent(){
            $(opts.hdItem, obj).removeClass(opts.current).eq(opts.index).addClass(opts.current);
            $(opts.bdItem, obj).css({"display":"none"}).eq(opts.index).css({"display":"block"});
            $(opts.moreItem, obj).css({"display":"none"}).eq(opts.index).css({"display":"block"});

            //$(opts.bdItem, obj).removeClass(opts.current).eq(opts.index).addClass(opts.current);
        }
        setCurrent();
        return obj;
    };
})(jQuery);/*  |xGv00|dfe9081c71f0cee5596e5d50fdf18e87 */
