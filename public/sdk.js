function Keke_sdk(_options) {
	var that = this;
	//变量参数
	this.options = {
		items : [], //表情元素 相当于sprite
		canvas : {},
		ctx : {}, //操作实例

		canva_id : "",
		canvas_width : 400,
		canvas_height : 400,

		origin_sticker_id : "", //模板origin_sticker_id
	}

	//默认配置
	this.config = {

	}

	//类接口
	var classes = {
		text : function(_options){
			var item = {
				type : _options.type,
				content : _options.content,
				x : _options.x || 0,
				y : _options.y || 0,
				text_width : 0,

				visible : true, //是否渲染

				fill_style : _options.fill_style || "#111", //颜色

				font : _options.font || "48px serif", //字体样式
			}

			var t = that.options.ctx.measureText(item.content);
			item.text_width = t.width;

			return item;
		},
		img : function(_options){
			var item = {

			}

			return item;
		}
	}
	this.create_item = function(_options){
		if(!_options.type in classes){
			throw {
				message : "参数错误：type"
			}
		}
		return classes[_options.type](_options);
	}

	//接口区域
	/*
	* 新增item到渲染队列
	*/
	this.add_item = function(_item){
		that.options.items.push(_item);
	}

	/*
	* 文本渲染
	*/
	var renders = {
		text : function(_item){
			var ctx = that.options.ctx;
			// ctx.font = _item.font;
			// ctx.fillStyle = _item.fill_style;
			// ctx.fillText(_item.content, _item.x, _item.y, _item.text_width);
			ctx.fillText("hello ", 0, 0);
			console.log(ctx)
		},
		img : function(_item){

		}
	}

	/*
	* 渲染item
	*/
	this.render = function(_options){
		var items = that.options.items;
		for(var i=0;i<items.length;i++){
			if(!items[i].visible){
				continue;
			}

			//找到渲染器
			if(!(items[i].type in renders)){
				console.warn("渲染类型错误：" + items[i]);
				continue ;
			}

			//保存渲染状态
			that.options.ctx.save();
			//进入渲染器
			renders[items[i].type](items[i]);
			//恢复渲染状态
			that.options.ctx.restore();
		}
	}

	//逻辑区域
	function init_canvas(){
		var canvas = document.getElementById(_options.canvas_id);
		if(!_options.canvas_id){
			throw {
				message : "缺少必要参数：canvas_id"
			}
		}
		that.options.canvas_id = _options.canvas_id;
		//初始化宽高
		if(_options.canvas_width){
			that.options.canvas_width = _options.canvas_width;
		}
		if(_options.canvas_height){
			that.options.canvas_height = _options.canvas_height
		}
		canvas.width = that.options.canvas_width;
		canvas.height = that.options.canvas_height;

		var ctx = canvas.getContext("2d");
		that.options.ctx = ctx;
		that.options.canvas = canvas;

		// ctx.fillRect(0, 0, canvas.width, canvas.height);
		// ctx.fillStyle = "#e1e";
		// ctx.font = "48px serif";
		// var text = ctx.measureText("hello world");
		// ctx.fillText("hello world", 10, 50, text.width);
	}
	/*
	* 实例初始化
	*/
	function init(){
		try{
			init_canvas();
		}catch(e){
			console.error(e);
		}
	}
	init();

	return this;
}