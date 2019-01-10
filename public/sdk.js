function Keke_sdk(_options) {
	var that = this;
	//变量参数
	this.options = {
		items : [], //表情元素 相当于sprite
		canvas : {},
		ctx : {}, //操作实例

		canva_id : "",
		canvas_width : 400,
		canvas_height : 400
	}

	//默认配置
	this.config = {

	}

	//类接口
	var classes = {
		text : function(_options){
			var item = {

			}

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
	this.add_item = function(_item){

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
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#e1e";
		ctx.font = "48px serif";
		var text = ctx.measureText("hello world");
		ctx.fillText("hello world", 10, 50, text.width);
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