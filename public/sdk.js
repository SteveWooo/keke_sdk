function KekeSdk(opts) {
	var that = this;
	//变量参数(默认)
	this.options = {
		canvasId : '',
		canvas : {}, //画布实例,
		ctx : {}, //操作实例
		items : {
			list : {},
			length : 0
		}, //画布元素
	}
	this.config = {};
	//通用对象
	var _module = {
		/**
		* 画布元素对象
		*/
		Item : {
			/**
			* 创建itemId
			* @param item属性
			* @return itemId
			*/
			createItemId : function(options){

			},
			/**
			* 渲染具体item
			* 递归函数
			* @param options.items
			* @param options.itemNumber //当前渲染的item
			*/
			renderItem : function(options, callback){

			},

			/**
			* 渲染items列表到画布上
			*/
			render : function(){

			}
		},

		Image : {
			/**
			* 缓存图片，原则上每次渲染前都要先把图片缓存一次，之后直接通过id去用就行了
			* @param options.imageId
			* @callback result.status result.errorMessage
			*/
			saveImage : function(options, callback){

			},
		},

		Alert : {
			/**
			* 报错
			* @param options.errorMessage
			*/
			errorAlert : function(options){
				alert(options.errorMessage);
			}
		},

		Canvas : {
			/**
			* 初始化画布
			*/
			initCanvas : function(){
				//默认配置
				if(opts.config){
					for(var i in opts.config){
						that.config[i] = opts.config[i];
					}
				}
				//画布
				that.options.canvasId = opts.canvasId;
				that.options.canvas = document.getElementById(that.options.canvasId);
				if(!opts.canvasId || !that.options.canvas){
					_common.errorAlert({
						errorMessage : '参数错误：canvasId无效'
					})
				}
				that.options.ctx = that.options.canvas.getContext('2d');

				//清空items
				that.options.items.list = [];
				that.options.item.length = 0;
			}
		}
	}

	/**
	* 获取所有item元素
	* @return 所有items
	*/
	this.getItem = function(){

	}

	/*
	* 更新item,此处渲染
	* @param items 所有item
	* @return 更新后的items
	*/
	this.updateItem = function(items){

	}

	/**
	* 创建item
	* @param item属性
	* @return item
	*/
	this.addItem = function(options){

	}

	/**
	* 删除item
	* @param options.itemId
	*/
	this.deleteItem = function(options){

	}

	/**
	* 设置deafultInfo
	* @param options.default_info:string 数据库存的JSON字符串
	* @return items
	*/
	this.setDefaultInfo = function(options){

	}

	/**
	* 设置info，表情图的info
	* @param options.info:string 表情图的info
	* @return items
	*/
	this.setInfo = function(options){

	}

	/*
	* 实例初始化
	*/
	function init(){
		try{
			_common.initCanvas();
		}catch(e){
			console.error(e);
		}
	}
	init();

	return this;
}