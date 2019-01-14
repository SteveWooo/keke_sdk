function Keke_sdk(_options) {
	var that = this;
	//变量参数(默认)
	this.options = {
		draw_items : [], //表情元素 相当于sprite
		imgs : {}, //图片元素哈希表
		canvas : {},
		ctx : {}, //操作实例

		canva_id : "",
		canvas_width : 300,
		canvas_height : 300,
		canvas_background_style : "#fff",

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
		text : function(_options, callback){
			var item = {
				id : 0,
				type : _options.type,
				content : _options.content,
				x : _options.x || 0,
				y : _options.y || 0,
				text_width : 0,

				visible : true, //是否渲染

				fill_style : _options.fill_style || "#111", //颜色

				font : _options.font || "48px block", //字体样式
			}

			callback({
				status : 2000,
				draw_item : item
			});
		},
		img : function(_options, callback){
			if(!_options.origin_sticker_id){
				throw {
					message : "参数错误：origin_sticker_id"
				}
			}
			var draw_item = {
				id : 0,
				type : _options.type,
				origin_sticker_id : _options.origin_sticker_id,
				file_path : "",
				x : _options.x || 0,
				y : _options.y || 0,
				width : _options.width || undefined,
				height : _options.height || undefined,
				visible : true, //是否渲染
			}

			//获取图片信息
			$.ajax({
				url : that.config.base_url + "/api/p/origin_sticker/get?origin_sticker_id=" + _options.origin_sticker_id,
				success : function(res){
					res = JSON.parse(res);
					if(res.status != "2000"){
						callback({
							status : res.status,
							error_message : res.error_message
						})
						return ;
					}
					if(res.data.length == 0){
						callback({
							status : 4004,
							error_message : "origin_sticker_id不存在"
						})
						return ;
					}
					draw_item.file_path = res.data[0].path;

					if(!that.options.imgs[_options.origin_sticker_id]){
						var img_dom = document.createElement("img");
						img_dom.src = that.config.base_res_url + draw_item.file_path;
						img_dom.style = "display:none";
						//load
						document.body.appendChild(img_dom);
						that.options.imgs[_options.origin_sticker_id] = img_dom;

						img_dom.onload = function(){
							callback({
								status : 2000,
								draw_item : draw_item
							});
						}
					}
				},
				error : function(e){
					alert("网络错误")
				}
			})
		}
	}

	//接口区域
	/*
	* 新增item到渲染队列
	*/
	var add_item = function(_item){
		_item.id = that.options.draw_items.length + 1;
		that.options.draw_items.push(_item);
		return _item;
	}

	this.create_item = function(_options, callback){
		if(!_options.type in classes){
			throw {
				message : "参数错误：type"
			}
		}
		classes[_options.type](_options, function(res){
			res.draw_item = add_item(res.draw_item);
			callback(res);
		});
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
			if(_item['width'] && _item['height'] && _item['width'] != 0 && _item['height'] != 0){
				ctx.drawImage(that.options.imgs[_item.origin_sticker_id], _item.x, _item.y, 
					_item.width , _item.height);
				return ;
			}
			ctx.drawImage(that.options.imgs[_item.origin_sticker_id], _item.x, _item.y);
		}
	}

	/*
	* 渲染item
	*/
	this.render = function(_options){
		//设置画布宽高
		if(_options){
			if(_options.canvas_width){
				that.set_canvas_width(parseFloat(_options.canvas_width));
			}
			if(_options.canvas_height){
				that.set_canvas_height(parseFloat(_options.canvas_height));
			}
			if(_options.canvas_background_style){
				that.set_canvas_background_style(_options.canvas_background_style);
			}
		}
		//底色
		that.options.ctx.fillStyle = that.options.canvas_background_style;
		that.options.ctx.fillRect(0, 0, that.options.canvas.width, that.options.canvas.height);

		var items = that.options.draw_items;
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
	this.update_item = function(_items){
		that.options.draw_items = _items;
	}

	this.get_items = function(){
		return that.options.draw_items;
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

	/*
	* 设置画布背景色
	*/
	this.set_canvas_background_style = function(_style){
		that.options.canvas_background_style = _style;
	}

	/*
	* 设置draw item
	*/
	this.set_draw_item = function(_items){
		this.options.draw_items = _items;
	}

	/*
	* 设置表情info，如果info为空，则使用默认属性。
	default_info : {
		infos : [{
			name : "",
			canvas_width : "",
			canvas_height : "",
			items : [{
				type : "",
				x : "",
				y : "",
				...
			}]
		}]
	}
	*/
	function add_info_item(_info, num, callback){
		if(num == _info.items.length){
			callback({
				info : _info
			});
			return ;
		}

		var item = _info.items[num];
		that.create_item(item, function(res){
			add_info_item(_info, num+1, callback);
		});
	}
	/*
	* 初始化item
	*/
	this.set_info = function(_info, origin_sticker, callback){
		//初始化
		that.options.draw_items = [];
		//设置原始默认属性
		that.set_canvas_height(_info.canvas_height || that.options.canvas.height);
		that.set_canvas_width(_info.canvas_width || that.options.canvas.width);
		//递归顺序增加
		add_info_item(_info, 0, callback);
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