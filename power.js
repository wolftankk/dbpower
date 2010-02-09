if (typeof WowshellPower){
	var WowshellPower = new function(){
		/*
		 * 通用函数集
		 */
		function argumentsToArray(args){
			var arr = [];
			for (var a=0, len = args.length; a < len; ++a){
				arr.push(args[a])
			}
			return arr;
		}
		if (typeof Function.prototype.bindContext == undefined){
			Function.prototype.bindContext = function(){
				var method = this, args = argumentsToArray(arguments), scope = args.shift();
				return function(){
					method.apply(scope, args.concat(argumentsToArray(arguments)));
				}
			}
		}		
		var Brower = {
			ie : !-[1,],
			opera : !!window.opera,
			safari : navigator.userAgent.indexOf("safari") != -1,
			gecko : navigator.userAgent.indexOf("Gecko") != -1 && navigator.userAgent.indexOf("KHTML") == -1,
			chrome: navigator.userAgent.indexOf("Chrome") != -1		
		};
		Brower.ie8 = Brower.ie && navigator.userAgent.indexOf("MSIE 8.0") != -1;
		Brower.ie7 = Brower.ie && navigator.userAgent.indexOf("MSIE 7.0") != -1;
		Brower.ie6 = Brower.ie && navigator.userAgent.indexOf("MSIE 6.0") != -1;
		Brower.ie67 = Brower.ie6 || Brower.ie7;
		navigator.userAgent.match(/Gecko\/([0-9]+)/);
		Brower.gechoVersion = parseInt(RegExp.$1) | 0;		
		function registerEvent(obj, event, func){
			if (Brower.ie){
				obj.attachEvent("on"+event, func);
			}else{
				obj.addEventListener(event, func, false);
			}
		}
		function unregisterEvent(obj, event, func){
			if (Brower.ie){
				obj.detachEvent("on"+event, func);
			}else{
				obj.removeEventListener(event, func, false);
			}
		}
		function is_array(target){
			return !!(target && target.constructor == Array);
		}
		function array_apply(array, func, scope){
			for (var a=0, len = array.length; a < len; ++a){
				func(array[a], scope, array, a);
			}
		}
		//event增强
		function getInfoFromEvent(e){
			if (!e){
				if (typeof e == undefined){
					e = event;
				}else{
					return null
				}
			}
			if (e.which){
				e._button = e.which;
			}else{
				e._button = e.button;
				if ($.browser.msie){
					if (e._button & 4){
						e._button = 2
					}else{
						if (e._button & 2){
							e._button = 3
						}
					}
				}else{
					e._button = e.button + 1;
				}
			}
			e._target = e.target ? e.target : e.srcElement;
			e._wheelDelta = e.wheelDelta ? e.wheelDelta : -e.detail;
			
			return e
		}
		
		//get element
		function ge(id){
			return document.getElementById(id);
		}
		function getTagName(tag){
			return document.getElementsByTagName(tag);
		}
		function de(child){
			child.parentNode.removeChild(child);
		}
		/**
		 * append child to child's parent
		 * @param {Node} child 需要append的元素
		 * @param {Node} parent 父层
		 */
		function ae(parent, child){
			if (is_array(child)){
				array_apply(child, parent.appendChild.bindContext(parent));
				return child;
			}else{
				return child.appendChild(parent);
			}			
		}
		//create element
		function ce(tag, options, parent){
			var element = document.createElement(tag);
			//设定element参数
			if (options){
				copyObjectRecursion(element, options);
			}
			if (parent){
				ae(element, parent)
			}
			return element
		}
		/**
		 * 递归方式复制
		 */
		function copyObjectRecursion(target, source, slice){
			for (var key in source){
				if (typeof source[key] == "object"){
					if (slice && source[key].length){
						target[key] = source[key].slice(0);
					}else{
						if (!target[key]){
							target[key] = {};
						}
						copyObjectRecursion(target[key], source[key], slice);
					}
				}else{
					target[key] = source[key];
				}
			}
		}
		function copyTable(target, source, slice){
			for (var key in source){
				if (slice && typeof source[key] == "object" && source[key].length){
					target[key] = source[key].slice(0);
				}else{
					target[key] = source[key];
				}
			}
		}
		
		function getScroll(){
			var sx = 0, sy = 0;
			if (typeof(window.pageYOffset) == "number"){
				sx = window.pageXOffset;
				sy = window.pageYOffset;
			}else{
				if (document.body && (document.body.scrollLeft || document.body.scrollTop)){
					sx = document.body.scrollLeft;
					sy = document.body.scrollTop;
				} else {
					if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)){
						sx = document.documentElement.scrollLeft;
						sy = document.documentElement.scrollTop;
					}
				}
			}
			
			return {
				x : sx,
				y : sy
			}
		}
		
		/**
		 * 获取当前鼠标坐标
		 * @param {Event} e
		 */
		function getCursorPos(e){
			var pos_x, pos_y;
			if (window.innerHeight){
				pos_x = e.pageX;
				pos_y = e.pageY;
			}else{
				var scrollPos = getScroll();
				pos_x = e.clientX + scrollPos.x;
				pos_y = e.clientY + scrollPos.y;
			}			
			return {
				x : pos_x,
				y : pos_y
			}
		}
		
		function getIdFromTypeName(typeName){
			var list = getIdFromTypeName.list;
			return (list[typeName]?list[typeName]:-1)
		}		
		getIdFromTypeName.list = {
			npc: 1,
		    object: 2,
		    item: 3,
		    itemset: 4,
		    quest: 5,
		    spell: 6,
		    zone: 7,
		    faction: 8,
		    pet: 9,
		    achievement: 10
		}
		
		//tooltip
		var Tooltip = {
			create: function(html){
				var root = ce("div"),
				table = ce("table"),
				tbody = ce("tbody"),
				toptr = ce("tr");
				bottomtr = ce("tr");
				tleft = ce("td"),
				tright = ce("th"),//左上角
				bleft = ce("th"),
				bright = ce("th");				
				root.className = "wowshell_tooltip";				
				toptr.style.backgroundPosition = "top right";
				bleft.style.backgroundPosition = "bottom left";
				bright.style.backgroundPosition = "bottom right";
				if (html){
					tleft.innerHTML = html
				}
				
			}
		};
				
		/**
		 * power 全局变量
		 */
		var isRemote = true;//always
		var applyto = 3;
		var head = (document.getElementsByTagName("head"))[0];
		var currTypeId, currId, currDomain, lnkRelationInfo;
		var currentTipObj;
		var isIconShown = 0;
		var tip_x, tip_y;
		
		var g_items = {};
		var g_npcs = {};
		var g_quests = {};
		var g_spells = {};
		var g_achievement = {};
		var g_objects = {};
		
		var typeList = {
			1:[g_npcs, "npc", "NPC"],
			2:[g_objects, "object", "Object"],
			3:[g_items, "item", "Item"],
			5:[g_quests, "quest", "Quest"],
			6:[g_spells, "spell", "Spell"],
			10:[g_achievement, "achievement", "Achievement"]
		};
		
		//监视页面mouse over
		function monitorMouseOver(){
			registerEvent(document, "mouseover", monitorCallback);	
		}		
		function power_init(){
			//创建layers层
			if (!ge("layers")){
				ce("div", {
					id: "layers"
				}, getTagName("body")[0]);
			}
			//加载css
			ce("link", {
				type: "text/css",
				rel: "stylesheet",
				href: "http://dev.wowshell.com/widgets/power_base.css"
			}, head);
			if (Brower.ie6){
				ce("link", {
					type: "text/css",
					rel: "stylesheet",
					href: "http://dev.wowshell.com/widgets/power_base_ie6.css"
				}, head);
			}
			if (Brower.ie7){
				ce("link", {
					type: "text/css",
					rel: "stylesheet",
					href: "http://dev.wowshell.com/widgets/power_base_ie7.css"
				}, head);
			}
			monitorMouseOver();
		}
		//处理mouseover 进行回调,处理
		function monitorCallback(e){
			e = getInfoFromEvent(e);
			var target = e._target;
			var counter = 0;
			while (target != null && counter < 5 && showTooltip(target, e) == -2323){
				target = target.parentNode;
				++counter;
			}
		}
		
		/**
		 * 获取当前node的坐标
		 * @param {Event} e
		 */
		function getPosInfo(e){
			var pos = getCursorPos(e);
			tip_x = pos.x
			tip_y = pos.y
		}
		
		/**
		 * 分析并且显示tip在页面上
		 * @param {Node} obj
		 * @param {Event} e
		 */
		function showTooltip(obj, e){
			if (obj.nodeName != "A" && obj.nodeName != "AREA"){
				return -2323;
			}
			if (!obj.href.length){
				return
			}
			if (obj.rel.indexOf("np") != -1){
				return
			}
			//开始分析当前连接的数据信息			
			var urlPath, urlReqType, urlReqId, urlInfo, urlRelInfo = {};
			lnkRelationInfo = urlRelInfo;
			//获取/分析rel中的信息
			var parseRelationInfo = function(relinfo, reltype, relval){
				if (reltype == "buff" || reltype=="sock"){
					urlRelInfo[reltype] = true
				}else{
					if (reltype == "rand" || reltype == "ench" || reltype == "lvl" || reltype == "c"){
						urlRelInfo[reltype] = parseInt(relval);
					}else{
						if (reltype == "gems" || reltype == "pcs"){
							urlRelInfo[reltype] = relval.split(":");
						}else{
							if (reltype == "who" || reltype == "domain"){
								urlRelInfo[reltype] = relval;
							}else{
								if (reltype == "when"){
									urlRelInfo[reltype] = new Date(parseInt(relval));
								}
							}
						}
					}
				}
			}			
			//完整模式			
			if (applyto & 1){
				urlReqType = 3;
				urlReqId = 4;
				if (obj.href.indexOf("http://") == 0){
					urlPath = 1;
					urlInfo = obj.href.match(/http:\/\/(.+?)?\.?(wowshell|sa20)\.com\/(item|quest|spell|achievement)\/info\.?php\?id=([0-9]+)/);
					if (urlInfo == null){
						//profile
					}
				}else{
					urlInfo = obj.href.match(/()()\/(item|quest|spell|achievement)\/info\.?php\?id=([0-9]+)/);
					if (urlInfo == null){
						//profile
					}
				}
			}			
			if (urlInfo == null && obj.rel && applyto & 2){
				urlPath = 0;
				urlReqType = 1;
				urlReqId = 2;
				urlInfo=obj.href.match(/(item|quest|spell|achievement)\/info\.?php\?id=([0-9]+)/);
				if (urlInfo == null){
					//profile
				}
			}			
			//get rel info
			obj.href.replace(/([a-zA-Z]+)=?([a-zA-Z0-9:-]*)/g, parseRelationInfo);
			obj.rel.replace(/([a-zA-Z]+)=?([a-zA-Z0-9:-]*)/g, parseRelationInfo);
			//读取珠宝
			if (urlRelInfo.gems && urlRelInfo.gems.length > 0){
				var gemNum;
				for (gemNum=Math.min(3, urlRelInfo.gems.length - 1); gemNum >= 0; --gemNum){
					if (parseInt(urlRelInfo.gems[gemNum])){
						break;
					}
				}
				++gemNum;
				if (gemNum == 0){
					delete urlRelInfo.gems;
				}else{
					if (gemNum < urlRelInfo.gems.length){
						urlRelInfo.gems = urlRelInfo.gems.slice(0, gemNum);
					}
				}
			}
			
			if (urlInfo){
				var domain = "www";
				currentTipObj = obj;
				//if (obj.href.indexOf("#") != -1 && document.location.href.indexOf("")){					
				//}
				isIconShown = ((obj.parentNode.className.indexOf("icon") == 0 && obj.parentNode.nodeName == "DIV") ? 1 : 0);
				if (!obj.onmouseout){
					if (isIconShown == 0){
						//obj.onmousemove = ;
					}
					obj.onmouseout = hideTooltip;
				}
			}
			getPosInfo(e);
			var typeId = getIdFromTypeName(urlInfo[urlReqType]), typeVal = urlInfo[urlReqId];			
			//load data tip
			LoadTooltip(typeId, typeVal, domain, urlRelInfo);
		}
		
		/**
		 * 加载鼠标信息
		 * @param {String} type
		 * @param {String|Number} id
		 * @param {String} domain
		 * @param {Array} relInfo
		 */
		function LoadTooltip(type, id, domain, relInfo){
			if (!relInfo){
				relInfo = {}
			}
			var lnk = getRequestParamId(id, relInfo);
			currTypeId = type;
			currId = id;
			currDomain = domain;
			lnkRelationInfo = relInfo;
			InitTipData(type, id);//init
			var cache = typeList[type][0];
			if (cache[lnk].status == 3 || cache[lnk].status == 4){
				
			}else{
				if (cache[lnk].status == 1){
					
				}else{
					
				}
			}
		}
		/**
		 * 显示鼠标提示
		 * @param {String} str
		 * @param {String} icon 显示icon
		 */
		function showTooltip(str, icon){
			
		}
		function hideTooltip(){
			
		}
		function moveTooltip(){
			
		}
		/**
		 * 向服务器请求获取json数据
		 */
		function getJsonDataFromRemote(){
			
		}
		
		/**
		 * 获取请求参数id 比如2345r2g35,2
		 * @param {String} id
		 * @param {Array} relInfo
		 */
		function getRequestParamId(id, relInfo){
			return id + (relInfo.rank ? "r" + relInfo.rank : "") + (relInfo.ench ? "e" + relInfo.ench : "") + (relInfo.gems ? "g" + relInfo.gems.join(",") : "") + (relInfo.sock ? "s" : "");
		}
		
		/**
		 * 初始化提示数据
		 * @param {String} typeId
		 * @param {String} id
		 * @param {String} localid
		 */
		function InitTipData(typeId, id, localid){
			var cache = typeList[typeId][0];
			if (cache[id] == null){
				cache[id] = {};
			}
			if (cache[id].satus == null){
				cache[id].satus = 0;//初始状态为0
			}
		}
		
		this.register = function(typeId, id, localid, tipData){
			var cache = typeList[typeId][0];
			InitTipData(typeId, id, localid);
			if (cache[id].timer){
				clearTimeout(cache[id].timer);
				cache[id].timer = null;
			}
			copyTable(cache[id], tipData);
			if (cache[id].satus == 1){
				
			}			
		}
		this.registerItem = function(id, localid, tip){
			this.register(3, id, localid, tip);			
		}
		this.registerSpell = function(id, localid, tip){
			this.register(6, id, localid, tip);	
		}
		this.registerQuest = function(id, localid, tip){
			this.register(5, id, localid, tip);	
		}
		this.registerAchievement = function(id, localid, tip){
			this.register(10, id, localid, tip);	
		}
				
		//init
		power_init();
	}
}
