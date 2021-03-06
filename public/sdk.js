function Keke_sdk(_options) {
	var that = this;
	//变量参数(默认)
	this.options = {
		draw_items : [], //表情元素 相当于sprite
		drawing_items : {
			count : 0,
			items : {}
		}, //表情元素哈希表（新）
		imgs : {}, //图片元素哈希表
		canvas : {},
		ctx : {}, //操作实例

		operating_item_id : 1, //正在操作的item id， 默认第一个

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
				type : _options.type || "text",
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
			if(Keke_sdk.prototype.get_cache_origin_sticker(_options.origin_sticker_id) != undefined){
				callback({
					status : 2000,
					draw_item : draw_item
				});
				return ;
			}
			//获取图片信息
			$.ajax({
				url : that.config.base_url + "/api/p/origin_sticker/get?origin_sticker_id=" + _options.origin_sticker_id,
				success : function(res){
					if(typeof res != "object"){
						res = JSON.parse(res);
					}
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

					if(!Keke_sdk.prototype.get_cache_origin_sticker(res.data[0].origin_sticker_id)){
						var img_dom = document.createElement("img");
						img_dom.src = that.config.base_res_url + draw_item.file_path;
						img_dom.style = "display:none";
						//load
						document.body.appendChild(img_dom);
						that.options.imgs[that.options.canvas_id + _options.origin_sticker_id] = img_dom;
						//设置全局缓存
						Keke_sdk.prototype.set_cache_origin_sticker(res.data[0], img_dom);

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
		that.options.drawing_items.items[_item.id] = _item;
		that.options.drawing_items.count ++;
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
			if(_item['width'] != parseFloat(_item['width'])){
				_item['width'] = 0;
			}
			if(_item['height'] != parseFloat(_item['height'])){
				_item['height'] = 0;
			}
			if(_item['width'] && _item['height'] && _item['width'] != 0 && _item['height'] != 0){
				ctx.drawImage(Keke_sdk.prototype.get_cache_origin_sticker(_item.origin_sticker_id).dom, _item.x, _item.y, 
					_item.width , _item.height);
				return ;
			}
			ctx.drawImage(Keke_sdk.prototype.get_cache_origin_sticker(_item.origin_sticker_id).dom, _item.x, _item.y);
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

		if(_options && _options.draw_list == "drawing_items"){
			var items = that.options.drawing_items.items;
			for(var i in items){
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

			return ;
		}

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

	this.get_base64 = function(){
		return this.options.canvas.toDataURL();
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

	/*
	* 把default info设置进去
	*/
	this.set_default_info = function(_default_info, callback, _options){
		//默认取0
		var info = _default_info.infos[0];
		//初始化
		that.options.draw_items = [];
		that.options.origin_sticker_id = _options.origin_sticker.origin_sticker_id;
		//设置原始默认属性
		that.set_canvas_height(info.canvas_height || that.options.canvas.height);
		that.set_canvas_width(info.canvas_width || that.options.canvas.width);
		//添加item到渲染列表里面去
		add_info_item(info, 0, callback);
	}

	/*
	* 把需要渲染的info设置进去
	*/
	this.set_content_info = function(_info, callback, _options){
		that.options.draw_items = [];
		that.options.origin_sticker_id = _options.sticker.origin_sticker_id;
		//设置原始默认属性
		that.set_canvas_height(_info.canvas_height || that.options.canvas.height);
		that.set_canvas_width(_info.canvas_width || that.options.canvas.width);

		//先处理一下items
		var items = _info.items;
		var temp = [];
		for(var i in _info.items){
			temp.push(_info.items[i]);
		}
		_info.items = temp;

		//添加item到渲染列表里面去
		add_info_item(_info, 0, callback);
	}

	/*
	* 修改正在编辑的item id
	*/
	this.set_operating_item_id = function(item){
		that.options.operating_item_id = item.id;
	}

	/*
	* 添加新的元素到渲染列表
	*/
	this.add_drawing_item = function(options, callback){
		if(options.type == "text"){
			var info = {
				items : [{
					type : "text",
					content : "请输入文本"
				}]
			}

			add_info_item(info, 0, callback);
		}
	}

	/*
	* 获取需要提交的drawing_item
	*/
	this.get_drawing_result = function(){
		return that.options;
	}

	/*
	* 管理后台评论页面渲染,把content从options里面传进来
	*/
	var CONTENT_TAG_LIST = {
		"keke_sticker" : true
	}
	/*
	* 获取所有sticker
	*/
	function fetch_stickers(sticker_ids, callback){
		$.ajax({
			url : that.config.base_url + "/api/p/sticker/gets",
			type : "post",
			headers : {
				"Content-Type" : "Application/json"
			},
			data : JSON.stringify({
				sticker_ids : sticker_ids.join(",")
			}),
			success : function(res){
				if(typeof res != "object"){
					res = JSON.parse(res);
				}

				if(res.status != "2000"){
					alert(res.error_message);
					return ;
				}

				callback(res.data);
			},
			error : function(){
				alert("网络错误");
			}
		})
	}

	/*
	* options = {stickers, comments}
	*/
	function decode_sticker_to_base64(options, callback){
		if(options.num == options.stickers.length){
			set_base64_to_comments_content(options, callback);
			return ;
		}

		options.stickers[options.num].info = JSON.parse(options.stickers[options.num].info);
		var dom = document.createElement("canvas");
		dom.id = "keke_sdk_temp_" + options.stickers[options.num].sticker_id;
		dom.style = "display:none";
		// dom.style = "border:1px solid #111;margin-bottom:100px";
		document.body.appendChild(dom);

		var temp_sdk = new Keke_sdk({
			canvas_id : "keke_sdk_temp_" + options.stickers[options.num].sticker_id,
			config : that.config
		})

		temp_sdk.set_content_info(options.stickers[options.num].info, function(result){
			temp_sdk.render({
				draw_list : "drawing_items"
			});

			//转换base64
			var base_64 = temp_sdk.get_base64();
			options.stickers[options.num].base_64 = base_64;
			//更替到hash表里面
			options.stickers_hash[options.stickers[options.num].sticker_id] = options.stickers[options.num];
			options.num ++;
			decode_sticker_to_base64(options, callback);
		}, {
			sticker : options.stickers[options.num]
		})
	}

	/*
	* options : {stickers, comments}, callback返回渲染内容后的comments
	*/
	function set_base64_to_comments_content(options, callback){
		for(var i=0;i<options.comments.length;i++){
			var content = options.comments[i].content;
			//处理换行
			content = content.replace(/\n/g, "<br>");
			var temp_content = content.split("$$keke_sticker$$");
			for(var k=0;k<temp_content.length;k++){
				if(temp_content[k].indexOf("$$/keke_sticker$$") < 0){
					continue;
				}

				var sticker_id = temp_content[k].substring(0, temp_content[k].indexOf("$$/keke_sticker$$"));

				//图片标签
				var img_html = "<img src='"+
					options.stickers_hash[sticker_id].base_64 +"' width='" + 
					options.stickers_hash[sticker_id].info.canvas_width + "' height='"+
					options.stickers_hash[sticker_id].info.canvas_height+"'/>";
				temp_content[k] = temp_content[k].replace(sticker_id + "$$/keke_sticker$$", img_html);
			}
			options.comments[i].content = temp_content.join("");
		}

		callback(options);
	}

	this.admin_content_render_all = function(options, callback){
		var comments = options.comments;
		var sticker_ids = [];

		//抽取sticker id
		for(var i=0;i<comments.length;i++){
			var content = comments[i].content;
			var temp_content = content.split("$$keke_sticker$$");
			for(var k=0;k<temp_content.length;k++){
				if(temp_content[k].indexOf("$$/keke_sticker$$") < 0){
					continue;
				}
				sticker_ids.push(temp_content[k].substring(0, temp_content[k].indexOf("$$/keke_sticker$$")));
			}
		}

		//获取所有sticker_id的信息
		fetch_stickers(sticker_ids, function(stickers){
			//制作base 64
			decode_sticker_to_base64({
				stickers : stickers,
				stickers_hash : {},
				comments : comments,
				num : 0,
			}, callback);
		})
	}

	this.admin_content_render = function(options, callback){
		var content = options.content;
		//没有则不需要渲染
		if(content.indexOf("$$keke_sticker$$") < 0){
			callback({
				content : content
			})
			return ;
		}
		/*
		* 1：获取所有sticker_id
		* 2：递归取sticker
		* 3：把sticker渲染成base64
		* 4：回调images结果，把images分别替换成html内容渲染进去
		*/

		//换行处理
		content = content.replace(/\n/g, "<br>");

		//抽取sticker id
		var temp_content = content.split("$$keke_sticker$$");
		var sticker_ids = [];
		for(var i=0;i<temp_content.length;i++){
			if(temp_content[i].indexOf("$$/keke_sticker$$") < 0){
				continue;
			}
			sticker_ids.push(temp_content[i].substring(0, temp_content[i].indexOf("$$/keke_sticker$$")));
		}

		//获取所有sticker的内容
		fetch_stickers(sticker_ids, function(result){
			console.log(result);
		})
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

Keke_sdk.prototype.cache = {
	origin_sticker : {}
}

Keke_sdk.prototype.set_cache_origin_sticker = function(origin_sticker, dom){
	Keke_sdk.prototype.cache.origin_sticker[origin_sticker.origin_sticker_id] = {
		dom : dom,
		origin_sticker : origin_sticker
	};
}

Keke_sdk.prototype.get_cache_origin_sticker = function(origin_sticker_id){
	return Keke_sdk.prototype.cache.origin_sticker[origin_sticker_id];
}
