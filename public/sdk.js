function Keke_sdk(_options) {
	var that = this;
	//变量参数
	this.options = {
		items : [], //表情元素 相当于sprite
		imgs : {}, //图片元素哈希表
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
	if(_options.config){
		for(var i in _options.config){
			that.config[i] = _options.config[i];
		}
	}

	//类接口

	var classes = {
		text : function(_options){
			var item = {
				id : 0,
				type : _options.type,
				content : _options.content,
				x : _options.x || 0,
				y : _options.y || 0,
				text_width : 0,

				visible : true, //是否渲染

				fill_style : _options.fill_style || "#111", //颜色

				font : _options.font || "48px black", //字体样式
			}

			return item;
		},
		img : function(_options){
			if(!_options.origin_sticker_id || !_options.file_path){
				throw {
					message : "参数错误：file_path or origin_sticker_id"
				}
			}
			var item = {
				id : 0,
				type : _options.type,
				origin_sticker_id : _options.origin_sticker_id,
				file_path : _options.file_path,
				x : _options.x || 0,
				y : _options.y || 0,

				visible : true, //是否渲染
			}

			//web端：
			if(!that.options.imgs[_options.origin_sticker_id]){
				var img_dom = document.createElement("img");
				img_dom.src = that.config.base_res_url + item.file_path;
				img_dom.style = "display:none";
				//load
				document.body.appendChild(img_dom);
				that.options.imgs[_options.origin_sticker_id] = img_dom;
			}
			return item;
		}
	}

	//接口区域
	/*
	* 新增item到渲染队列
	*/
	var add_item = function(_item){
		_item.id = that.options.items.length + 1;
		that.options.items.push(_item);
		return _item;
	}

	this.create_item = function(_options){
		if(!_options.type in classes){
			throw {
				message : "参数错误：type"
			}
		}
		var item = classes[_options.type](_options);
		//添加到队列 并且增加一个id
		item = add_item(item);

		return item;
	}

	/*
	* 文本渲染
	*/
	var renders = {
		text : function(_item){
			var ctx = that.options.ctx;
			var canvas = that.options.canvas;
			ctx.font = _item.font;
			ctx.fillStyle = _item.fill_style;

			//计算宽度
			var t = that.options.ctx.measureText(_item.content);
			_item.text_width = t.width;

			ctx.fillText(_item.content, _item.x, _item.y, _item.text_width);
		},
		img : function(_item){
			var ctx = that.options.ctx;
			var canvas = that.options.canvas;
			ctx.drawImage(that.options.imgs[_item.origin_sticker_id], _item.x, _item.y);
		}
	}

	/*
	* 渲染item
	*/
	this.render = function(_options){
		//清理整个页面：
		that.options.ctx.fillStyle = "#eee";
		that.options.ctx.fillRect(0, 0, that.options.canvas.width, that.options.canvas.height);

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

	/*
	* 更新item，传入itemid和更新内容
	*/
	this.update_item = function(_id, _item){
		var items = that.options.items;
		for(var i=0;i<items.length;i++){
			if(items[i]["id"] == _id){
				//update:
				for(var k in _item){
					items[i][k] = _item[k];
				}

				return items[i];
			}
		}

		return undefined;
	}

	this.get_items = function(){
		return that.options.items;
	}

	/*
	* 设置画布宽
	*/
	this.set_canvas_width = function(_width){
		that.options.canvas.width = _width;
	}

	/*
	* 设置画布高
	*/
	this.set_canvas_height = function(_height){
		that.options.canvas.height = _height;
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