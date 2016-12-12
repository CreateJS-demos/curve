this.Widget = this.Widget||{};
(function(){
	/**
	 * 初始化曲线组件
	 * @param {Object组件容器选择符，同css选择符} boxElement
	 */
	function curve(boxElement){
		//canvas
		this.canvas = document.createElement("canvas");
		//组件容器
		this.boxElement = document.querySelector(boxElement);
		//组件配置参数
		this.config = null;
		//组件数据
		this.dataProvider = null;
		//组件通信事件触发器
		this.EventDispatcher = $({});
		//显示对象地图
		this.nodeMap = null;
        this.boxElement.appendChild(this.canvas);
        this.stage = new createjs.Stage(this.canvas);
        this.stage.enableMouseOver(10);
        this.stage.cursor = "pointer";
        createjs.Touch.enable(this.stage);
        createjs.Ticker.on("tick",this.stage);
        //动画
        this.AnimateObj = null;
	};
	var p = curve.prototype;
	/**
	 * 初始化组件配置
	 * @param {Object组件配置参数} config
	 */
	p.setConfig = function(config){
		this.config = config;
	}
	/**
	 * 数据发生改变时，需要重新创建元素
	 * @param {Object组件数据} data
	 */
	p.setDataProvider = function(data){
		this.dataProvider = data;
		//初始化组件显示对象
		this._createContent();
	}
	/**
     * 初始化组件尺寸或resize时调用
     * @param size 最新尺寸：{width: 100, height: 100}
     */
    p.resize = function(size)
    {
    	this.canvas.width = size.width;
    	this.canvas.height = size.height;
    }
    /**
     * 初始化组件显示对象
     */
    p._createContent = function(){
    	if (this.config == null || this.dataProvider == null) return;
    	//每次都清空显示对象列表
    	//引用给nodeMap，每次this.nodeMap太麻烦了
    	var nodeMap = this.nodeMap = {};
    	this.AnimateObj = null;
    	//组件左右间距
    	var Space = this.dataProvider.bottomNodeArr[0][this.config.bottomName].length*this.config.fontStyle.slice(0,2)/2;
    	this.stage.removeAllChildren();
    	//一个背景层，作为响应全局事件的对象
    	nodeMap.bgclick = new createjs.Shape();
    	nodeMap.bgclick.alpha = 0.01;
    	nodeMap.bgclick.graphics.beginFill("#000").rect(0,0,this.canvas.width,this.canvas.height);
    	//显示对象统一容器
    	nodeMap.container1 = new createjs.Container();
    	//上边元素容器
    	nodeMap.topNodeCon = new createjs.Container();
    	//下边元素容器
    	nodeMap.bottomNodeCon = new createjs.Container();
    	//线条元素容器
    	nodeMap.lineNodeCon = new createjs.Container();
    	//上边文字容器
    	nodeMap.topName = new createjs.Container();
    	//下边文字容器
    	nodeMap.bottomName = new createjs.Container();
    	//第一段流光容器
    	nodeMap.Streamer = new createjs.Container();
    	//第二段流光容器
    	nodeMap.Streamer2 = new createjs.Container();
    	//添加显示对象到舞台
    	this.stage.addChild(nodeMap.container1);
    	nodeMap.container1.addChild(nodeMap.bgclick);
    	nodeMap.container1.addChild(nodeMap.lineNodeCon);
    	nodeMap.container1.addChild(nodeMap.topNodeCon);
    	nodeMap.container1.addChild(nodeMap.bottomNodeCon);
    	nodeMap.container1.addChild(nodeMap.topName);
    	nodeMap.container1.addChild(nodeMap.bottomName);
    	nodeMap.container1.addChild(nodeMap.Streamer);
    	nodeMap.container1.addChild(nodeMap.Streamer2);
    	//设置左边距
    	nodeMap.topNodeCon.x = nodeMap.bottomNodeCon.x = nodeMap.topName.x = nodeMap.bottomName.x = Space;
    	//上边小圆球之间的间距。（舞台宽 - 容器左边距 - 右边间距）/ 数据长度
    	var spacingTop = (this.canvas.width - nodeMap.topNodeCon.x - Space)/this.dataProvider.topNodeArr.length;
    	for (var i = 0; i < this.dataProvider.topNodeArr.length; i++) {
    		//小圆球对象
    		var circle = new createjs.Shape();
    		//颜色
    		var color = this.config.circleColor;
    		//半径
    		var radius = this.config.radius;
    		//高亮小圆球颜色，半径改变，并且出现文字
    		if(i%this.config.Highlightsize==0){
    			color = this.config.topHighlightcircleColor;
    			radius = this.config.Highlightradius;
    			var textTop = new createjs.Text(this.dataProvider.topNodeArr[i][this.config.topName],this.config.fontStyle,this.config.fontColor);
    			textTop.x = i*spacingTop-radius;
    			textTop.y = this.config.top-radius*2.5;
    			textTop.rotation = this.config.fontdeg;
    			nodeMap.topName.addChild(textTop);
    			circle.shadow = new createjs.Shadow("#fff",0,0,20);
    			circle.AnimateObj = new TimelineMax({
    				repeat:-1
    			});
    			circle.AnimateObj.to(circle,0.8,{
					alpha:1,
					ease:"linear"
				}).to(circle,0.8,{
					alpha:0.3,
					ease:"linear"
				}).to(circle,0.8,{
					alpha:1,
					ease:"linear"
				});
    		}
    		//自定义类别属性
    		circle.type = "circle";
    		circle.name = this.dataProvider.topNodeArr[i][this.config.topName];
    		//位置
    		circle.x = i*spacingTop;
    		circle.y = this.config.top;
    		circle.lineArr = [];
    		//画圆
    		circle.graphics.beginFill(color).drawCircle(0,0,radius);
    		nodeMap.topNodeCon.addChild(circle);
    	}
    	var spacingBottom = (this.canvas.width - nodeMap.bottomNodeCon.x - Space)/this.dataProvider.bottomNodeArr.length;
    	for (var i = 0; i < this.dataProvider.bottomNodeArr.length; i++) {
    		this.dataProvider.bottomNodeArr[i]
    		var circle = new createjs.Shape();
    		var color = this.config.circleColor;
    		var radius = this.config.radius;
    		circle.x = i*spacingBottom;
    		circle.y = this.canvas.height-this.config.bottom;
    		if(i%this.config.Highlightsize==0){
    			color = this.config.bottomHighlightcircleColor;
    			radius = this.config.Highlightradius;
    			var textTop = new createjs.Text(this.dataProvider.bottomNodeArr[i][this.config.bottomName],this.config.fontStyle,this.config.fontColor);
    			textTop.x = i*spacingBottom;
    			textTop.y = this.canvas.height-this.config.bottom+radius;
    			textTop.regX = Space;
    			textTop.rotation = this.config.fontdeg;
    			nodeMap.bottomName.addChild(textTop);
    			circle.shadow = new createjs.Shadow("#fff",0,0,20);
    			circle.AnimateObj = new TimelineMax({
    				repeat:-1
    			});
    			circle.AnimateObj.to(circle,0.8,{
					alpha:1,
					ease:"linear"
				}).to(circle,0.8,{
					alpha:0.3,
					ease:"linear"
				}).to(circle,0.8,{
					alpha:1,
					ease:"linear"
				});
    		}
    		circle.type = "circle";
    		circle.name = this.dataProvider.bottomNodeArr[i][this.config.bottomName];
    		circle.lineArr = [];
    		circle.graphics.beginFill(color).drawCircle(0,0,radius);
    		nodeMap.bottomNodeCon.addChild(circle);
    	}
    	//画线
    	var tos = this.dataProvider.to;
    	var colorIndex = 0;
    	for(var key in tos){
    		//从下往上有关联关系
    		var bottomNode = nodeMap.bottomNodeCon.getChildByName(key);
    		//取到关联数据
    		var nodeArr = tos[key];
    		//Y轴曲线起点，取75%范围内的任意一点 = （舞台高-上边距）* 0.75（这个比例自己定） * 一个百分比随机数
    		var y1 = (this.canvas.height-this.config.top)*0.75*random(8,10)/10;
    		//Y轴曲线结束点，取一个百分比范围内任意一点（此百分比为配置参数）+ 上边距
    		var ytop = (this.canvas.height-this.config.top)*this.config.topline*random(5,10)/10+this.config.top;
    		var ybottom = (this.canvas.height-this.config.bottom)-(this.canvas.height-this.config.bottom)*this.config.bottomline*random(5,10)/10;
			var y2 = this.canvas.height - y1;
    		for (var i = 0; i < nodeArr.to.length; i++) {
    			var topNode = nodeMap.topNodeCon.getChildByName(nodeArr.to[i][this.config.topName]);
    			var line = new createjs.Shape();
    			line.name = "line";
    			line.color = this.config.colorArr[colorIndex];
    			line.tips = nodeArr.to[i];
    			nodeMap.lineNodeCon.addChild(line);
    			bottomNode.lineArr.push(line);
    			line.graphics
						.setStrokeStyle(1)
						.beginStroke(this.config.colorArr[colorIndex])
						.moveTo(bottomNode.x+nodeMap.bottomNodeCon.x,bottomNode.y-this.config.radius);
				//整条线分为3段，第一段为直线，中间的曲线，最后的直线
				line.startline = {
					"x1":bottomNode.x+nodeMap.bottomNodeCon.x,
					"y1":bottomNode.y,
					"x2":bottomNode.x+nodeMap.bottomNodeCon.x,
					"y2":ybottom
				}
				line.bezierCurveToPath = {
					"x0":bottomNode.x+nodeMap.bottomNodeCon.x,
					"y0":ybottom,
					"x1":bottomNode.x+nodeMap.bottomNodeCon.x,
					"y1":y2,
					"x2":topNode.x+nodeMap.topNodeCon.x,
					"y2":y1,
					"x3":topNode.x+nodeMap.topNodeCon.x,
					"y3":ytop
				};
				line.endline = {
					"x":topNode.x+nodeMap.topNodeCon.x,
					"y":topNode.y+this.config.radius
				}
				nodeMap.lineNodeCon.addChild(line);
				topNode.lineArr.push(line);
    		}
    		colorIndex++;
    		if(colorIndex==this.config.colorArr.length){
    			colorIndex = 0;
    		}
    	}
    	nodeMap.bgclick.on("click",bgclick);
    	nodeMap.topNodeCon.on("click",mouseoverNode);
    	nodeMap.bottomNodeCon.on("click",mouseoverNode);
    	nodeMap.lineNodeCon.on("mouseover",mouseoverline);
    	nodeMap.lineNodeCon.on("mouseout",mouseoutline);
    	var cur = this;
    	//鼠标移入
    	function mouseoverNode(e){
    		for (var i = 0; i < nodeMap.lineNodeCon.children.length; i++) {
    			var lineNode = nodeMap.lineNodeCon.children[i];
				lineNode.alpha = 0.2;
				if(lineNode.AnimateObj){
					lineNode.AnimateObj.kill();
				}
				if(lineNode.AnimateObj2){
					lineNode.AnimateObj2.kill();
				}
				var streline = nodeMap.Streamer.children[i];
				if(streline){
					streline.graphics.clear();
				}
				var streline2 = nodeMap.Streamer2.children[i];
				if(streline2){
					streline2.graphics.clear();
				}
			};
			for (var i = 0; i < e.target.lineArr.length; i++) {
				e.target.lineArr[i].alpha = 1;
				var lineNode = e.target.lineArr[i];
				var streline = nodeMap.Streamer.children[i];
				lineNode.streTime = 0;
				lineNode.streTime2 = 0;
				lineNode.streSize = cur.config.streSize;
				lineNode.AnimateObj = TweenMax.to(lineNode,3,{
					streTime:lineNode.arrs.length,
					//delay:i*0.03,
					ease:"linear",
					repeat:-1,
					onUpdateParams:[lineNode,streline],
					onUpdate:function(line,streline){
						var j = (Math.floor(line.streTime)-1) >= (line.arrs.length) ? (line.arrs.length-1) : (Math.floor(line.streTime)-1);
						j = j < 0 ? 0 : j;
						streline.graphics.clear();
						streline.graphics.setStrokeStyle(3).beginStroke("#fff")
									 .moveTo(line.arrs[j].x,line.arrs[j].y);
						for (var i = 1; i <= line.streSize; i++) {
							if(!line.arrs[j+i]){return;}
							streline.graphics.lineTo(
					    		line.arrs[j+i].x,
					    		line.arrs[j+i].y
					    	);
						}
					}
				});
				var streline2 = nodeMap.Streamer2.children[i];
				lineNode.AnimateObj2 = TweenMax.to(lineNode,3,{
					streTime2:lineNode.arrs.length,
					delay:1.5,
					ease:"linear",
					repeat:-1,
					onUpdateParams:[lineNode,streline2],
					onUpdate:function(line,streline){
						var j = (Math.floor(line.streTime2)-1) >= (line.arrs.length) ? (line.arrs.length-1) : (Math.floor(line.streTime2)-1);
						j = j < 0 ? 0 : j;
						streline.graphics.clear();
						streline.graphics.setStrokeStyle(3).beginStroke("#fff")
									 .moveTo(line.arrs[j].x,line.arrs[j].y);
						for (var i = 1; i <= line.streSize; i++) {
							if(!line.arrs[j+i]){return;}
							streline.graphics.lineTo(
					    		line.arrs[j+i].x,
					    		line.arrs[j+i].y
					    	);
						}
					}
				});
			}
			e.stopPropagation();
    	}
    	//恢复默认
    	function bgclick(e){
    		for (var i = 0; i < nodeMap.lineNodeCon.children.length; i++) {
    			var lineNode = nodeMap.lineNodeCon.children[i];
				lineNode.alpha = 1;
				if(lineNode.AnimateObj){
					lineNode.AnimateObj.kill();
				}
				var streline = nodeMap.Streamer.children[i];
				lineNode.AnimateObj
				if(streline){
					streline.graphics.clear();
				}
			};
    	}
    	function mouseoverline(e){
    		var argObj = {
    			tips:e.target.tips,
    			x:e.stageX,
    			y:e.stageY
    		}
    		cur.EventDispatcher.trigger("WIDGET_OVER",argObj);
    	};
    	function mouseoutline(e){
    		cur.EventDispatcher.trigger("WIDGET_OUT");
    	};
    	function random(min,max){
	    	return Math.floor(Math.random()*(max-min+1)+min);
	    };
	    var StreamerLength = Math.max(this.dataProvider.bottomNodeArr.length,this.dataProvider.topNodeArr.length);
	    for (var i = 0; i < StreamerLength; i++) {
	    	var streline = new createjs.Shape();
	    	nodeMap.Streamer.addChild(streline);
	    	var streline2 = new createjs.Shape();
	    	nodeMap.Streamer2.addChild(streline2);
	    }
    	this.Animate();
    }
    p.Animate = function(){
    	var numberOfPoints = this.config.numberOfPoints;
    	//算直线上的点
    	function pointline(x1,y1,x2,y2,length){
    		var disX = x1 - x2;
    		var disY = y1 - y2;
    		var arr = [];
    		for (var i = 0; i < length; i++) {
    			arr.push({
    				"x":x2+i/length*disX,
    				"y":y2+i/length*disY
    			});
    		}
    		return arr.reverse();
    	}
    	function Point2D(x,y){
		    this.x=x||0.0;
		    this.y=y||0.0;
		}
		//算曲线的点
    	function PointOnCubicBezier( cp, t ){
		    var ax, bx, cx;
		    var ay, by, cy;
		    var tSquared, tCubed;
		    var result = new Point2D();
		    /*计算各项系数*/
		    cx = 3.0 * (cp[1].x - cp[0].x);
		    bx = 3.0 * (cp[2].x - cp[1].x) - cx;
		    ax = cp[3].x - cp[0].x - cx - bx;

		    cy = 3.0 * (cp[1].y - cp[0].y);
		    by = 3.0 * (cp[2].y - cp[1].y) - cy;
		    ay = cp[3].y - cp[0].y - cy - by;

		    tSquared = t * t;
		    tCubed = tSquared * t;

		    result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
		    result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;

		    return result;
		}
  		//计算点的位置
	  	function ComputeBezier( cp, numberOfPoints, curve ){
		    var dt;
		    var i;
		    dt = 1.0 / ( numberOfPoints - 1 );
		    for( i = 0; i < numberOfPoints; i++){
		        curve[i] = PointOnCubicBezier( cp, i*dt );
	       	}
		}
		for (var i = 0; i < this.nodeMap.lineNodeCon.children.length; i++) {
			var lineNode = this.nodeMap.lineNodeCon.children[i];
			var bezierCurveToPath = lineNode.bezierCurveToPath;
			var cp=[
				new Point2D(bezierCurveToPath.x0,bezierCurveToPath.y0),
			    new Point2D(bezierCurveToPath.x1,bezierCurveToPath.y1),
			    new Point2D(bezierCurveToPath.x2,bezierCurveToPath.y2),
			    new Point2D(bezierCurveToPath.x3,bezierCurveToPath.y3)
			];
			lineNode.startTime = 0;
			var startArr = pointline(lineNode.startline.x1,lineNode.startline.y1,lineNode.startline.x2,lineNode.startline.y2,10);
			var curve=[];
			ComputeBezier(cp,numberOfPoints,curve);
			var endArr = pointline(bezierCurveToPath.x3,bezierCurveToPath.y3,lineNode.endline.x,lineNode.endline.y,10);
			//所有点的坐标
			lineNode.arrs = startArr.concat(curve).concat(endArr);
			lineNode.graphics.setStrokeStyle(1).beginStroke(lineNode.color);
			TweenMax.to(lineNode,3,{
				startTime:lineNode.arrs.length,
				delay:i*0.03,
				ease:"linear",
				onUpdateParams:[lineNode],
				onUpdate:function(line){
					var j = (Math.floor(line.startTime)-1) >= (lineNode.arrs.length) ? (lineNode.arrs.length-1) : (Math.floor(line.startTime)-1);
					j = j < 0 ? 0 : j;
					line.graphics.lineTo(
			    		line.arrs[j].x,
			    		line.arrs[j].y
			    	);
				}
			});
		}
    }
	this.Widget.curve = curve;
})();
