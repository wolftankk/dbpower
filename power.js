if (typeof WowshellPower){
	var WowshellPower = new function(){
		/**
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
				if (Brower.ie){
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
		/**
		 * @return {Node}
		 */
		function getTagName(parent, tag){
			return parent.getElementsByTagName(tag);
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
				return parent.appendChild(child);
			}			
		}
		/**
		 * insert first
		 * @param {Node} parent
		 * @param {Node} child
		 */
		function aef(parent, child){
			return parent.insertBefore(child, parent.firstChild);
		}
		//create element
		function ce(tag, options, parent){
			var element = document.createElement(tag);
			//设定element参数
			if (options){
				copyObjectRecursion(element, options);
			}
			if (parent){
				ae(parent, element)
			}
			return element
		}
		/**
		 * @param {Node} target
		 */
		function ac(target){
			var x =0, y=0, parent;
			while (target){
				x += target.offsetLeft;
				y += target.offsetTop;
				parent = target.parentNode;
				while (parent && parent != target.offsetParent && parent.offsetParent){
					if (parent.scrollLeft || parent.scrollTop){
						x -= (parent.scrollLeft | 0);
						y -= (parent.scrollTop | 0);
						break;
					}
					parent = parent.parentNode;
				}
				target = target.offsetParent;
			}
			return {
				"x" : x,
				"y" : y
			}
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
		
		function getWindowSize(){
			var winWidth = 0, winHeight = 0;
			if (document.documentElement && (document.documentElement.clientHeight || document.documentElement.clientWidth)){
				winWidth = document.documentElement.clientWidth;
				winHeight = document.documentElement.clientHeight;
			}else{
				if (document.body && (document.body.clientHeight || document.body.clientWidth)){
					winWidth = document.body.clientWidth;
					winHeight = document.body.clientHeight;
				}else{
					if (typeof window.innerWidth == "number"){
						winWidth = window.innerWidth;
						winHeight = window.innerHeight;
					}
				}
			}			
			return {
				w : winWidth,
				h : winHeight
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
		function g_ajaxIshRequest(url){
			var head = getTagName(document, "head")[0];
			ae(head, ce("script",{
				type: "text/javascript",
				src: url
			}));
		}
		
		//tooltip
		var Tooltip = {			
			/**
			 * 创建一个tooltip element
			 * @return {Node} root
			 */
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
				tright.style.backgroundPosition = "top right";
				bleft.style.backgroundPosition = "bottom left";
				bright.style.backgroundPosition = "bottom right";
				if (html){
					tleft.innerHTML = html;
				}
				ae(toptr, tleft);
				ae(toptr, tright);
				ae(tbody, toptr);
				ae(bottomtr, bleft);
				ae(bottomtr, bright);
				ae(tbody, bottomtr);
				ae(table, tbody);								
				Tooltip.icon = ce("p");
				Tooltip.icon.style.visibility = "hidden";
				ae(Tooltip.icon, ce("div"));
				ae(root, Tooltip.icon);
				ae(root, table);
				return root
			},
			/**
			 * @param {Node} tooltip
			 */
			fix: function(tooltip, isShrink, isVisible){
				var tooltipTable = getTagName(tooltip, "table")[0];
				var tooltipTd = getTagName(tooltip, "td")[0];
				var TooltipTdChilds = tooltipTd.childNodes;
				if (TooltipTdChilds.length >= 2 && TooltipTdChilds[0].nodeName == "TABLE" && TooltipTdChilds[1].nodeName == "TABLE"){
					TooltipTdChilds[0].style.whiteSpace = "nowrap";
					var adjustWidth;
					if (TooltipTdChilds[1].offsetWidth > 300){
						adjustWidth = Math.max(300, TooltipTdChilds[0].offsetWidth) + 20;
					}else{
						adjustWidth = Math.max(TooltipTdChilds[0].offsetWidth, TooltipTdChilds[1].offsetWidth) + 20;
					}
					if (adjustWidth > 20){
						tooltip.style.width = adjustWidth+"px";
						TooltipTdChilds[0].style.width = TooltipTdChilds[1].style.width = "100%";
						if (!isShrink && tooltip.offsetHeight > document.body.clientHeight){
							tooltip.className = "shrink";//缩放
						}
					}
				}
				if (isVisible){
					tooltip.style.visibility = "visible";
				}
			},
			fixSafe:function(){},
			append:function(){},
			prepare:function(){
				if (Tooltip.tooltip){
					return;
				}
				var layers;
				if (!ge("layers")){
					layers = ce("div");
					layers.id = "layers";
					aef(document.body, layers);
				}else{
					layers = ge("layers");
				}
				var tooltip = Tooltip.create();
				tooltip.style.position = "absolute";
				tooltip.style.left = tooltip.style.top = "-2323px";
				ae(layers, tooltip);
				Tooltip.tooltip = tooltip;
				Tooltip.tooltipTable = 	getTagName(tooltip, "table")[0];
				Tooltip.tooltipTd = getTagName(tooltip, "td")[0];
				if (Brower.ie6){
					tooltip = ce("iframe");
					tooltip.src = "javascript:0;";
					tooltip.frameBorder = 0;
					ae(layers, tooltip);
					Tooltip.iframe = tooltip;
				}
			},
			set:function(html){
				var tip = Tooltip.tooltip;
				tip.style.width = "550px";
				tip.style.left = "-2323px";
				tip.style.top = "-2323px";				
				Tooltip.tooltipTd.innerHTML = html;
				tip.style.display = "";
				Tooltip.fix(tip, 0, 0);
			},
			moveTests:[[null, null], [null, false], [false, null], [false, false]],
			move:function(posX, posY, width, height, fixWidth, fixHeight){
				if (!Tooltip.tooltipTable){
					return;
				}
				var tooltip = Tooltip.tooltip,
				tipTableWidth = Tooltip.tooltipTable.offsetWidth,
				tipTableHeight = Tooltip.tooltipTable.offsetHeight;
				tooltip.style.width = tipTableWidth + "px";
				//movetest
				var testData, tipAttr;
				for (var g = 0, len = Tooltip.moveTests.length; g < len; ++g){
					testData = Tooltip.moveTests[g];
					tipAttr = Tooltip.moveTest(posX, posY, width, height, fixWidth, fixHeight, testData[0], testData[1]);
				}
				tooltip.style.left = tipAttr.posX + "px";
				tooltip.style.top = tipAttr.posY + "px";
				tooltip.style.visibility = "visible";
				if (Brower.ie6 && Tooltip.iframe) {
					var iframe = Tooltip.iframe;
					iframe.style.left = tipAttr.posX + "px";
					iframe.style.top = tipAttr.posY + "px";
					iframe.style.width = tipTableWidth + "px";
					iframe.style.height = tipTableHeight + "px";
					iframe.style.display = "";
					iframe.style.visibility = "visible";
				}
			},
			moveTest:function(posX, posY, width, height, fixWidth, fixHeight, abswidth, absheight){
				var oldPosX = posX,
					oldPosY = posY,
					tooltip = Tooltip.tooltip,
					tipTableWidth = Tooltip.tooltipTable.offsetWidth,
					tipTableHeight = Tooltip.tooltipTable.offsetHeight,
						windowSize = getWindowSize(),
						scrollInfo = getScroll(),
					windowWidth = windowSize.w,
					windowHeight = windowSize.h,
					scrollX = scrollInfo.x,
					scrollY = scrollInfo.y,
					relwidth = scrollX + windowWidth,
					relheight = scrollY + windowHeight;
					
				if (abswidth == null){
					abswidth = (posX + width + tipTableWidth <= relwidth);
				}
				if (absheight == null){
					absheight = (posY - tipTableHeight >= relheight)
				}
				
				posX += width + fixWidth
				posY -= tipTableHeight + fixHeight
				
				if (posX < scrollX){
					posX = scrollX;
				}else{
					if (posX + tipTableWidth > relwidth){
						posX = relwidth - tipTableWidth;
					}
				}
					
				if (posY < scrollY){
					posY = scrollY;
				}else{
					if (posY + tipTableHeight > relheight){
						posY = Math.max(scrollY, relheight - tipTableHeight);
					}
				}
				if (Tooltip.iconVisible){
					if (oldPosX >= posX - 48 && oldPosX <= posX && oldPosY >= posY-4 && oldPosY <= posY + 48){
						posY -= 48 - (oldPosY - posY);
					}
				}
				return {
					posX: posX,
					posY: posY,
					tipTblWidth: tipTableWidth,
					tipTblHeight: tipTableHeight
				}
			},
			show:function(target, html, fixWidth, fixHeight, className){
				if (Tooltip.disabled){
					return;
				}
				if (!fixWidth || fixWidth < 1){
					fixWidth = 1
				}
				if (!fixHeight || fixHeight < 1){
					fixHeight = 1
				}
				if (className){
					html = '<span class="'+className+'">'+html+"</span>";
				}
				var pos = ac(target);
				Tooltip.prepare();
				Tooltip.set(html);
				Tooltip.move(pos.x, pos.y, target.offsetWidth, target.offsetHeight, fixWidth, fixHeight)
			},
			showAtCursor:function(target, html, fixWidth, fixHeight, className){
				if (Tooltip.disabled){
					return
				}
				if (!fixWidth || fixWidth< 1){
					fixWidth = 1;
				}		
				if (!fixHeight || fixHeight < 1){
					fixHeight = 1;
				}		
				if (className){
					html = '<span class="' + className + '">' + html + "</span>";
				}
				target = getInfoFromEvent(target)
				var pos = getCursorPos(target)
				Tooltip.prepare();
				Tooltip.set(html);
				Tooltip.move(pos.x, pos.y, 0, 0, fixWidth, fixHeight);
			},
			showAtXY:function(html, posX, posY, fixWidth, fixHeight){
				if (Tooltip.disabled){
					return;
				}
				Tooltip.prepare();
				Tooltip.set(html);
				Tooltip.move(posX, posY, 0, 0, fixWidth, fixHeight);
			},
			cursorUpdate:function(that, fixWidth, fixHeight){
				if (Tooltip.disabled || !Tooltip.tooltip){
					return
				}
				if (!fixWidth || fixWidth < 10){
					fixWidth = 10;
				}
				if (!fixHeight || fixHeight < 10){
					fixHeight = 10;
				}
				that = getInfoFromEvent(that)
				var pos = getCursorPos(that)
				Tooltip.move(pos.x, pos.y, 0, 0, fixWidth, fixHeight);
			},
			hide:function(){
				if (Tooltip.tooltip){
					var tooltip = Tooltip.tooltip;
					tooltip.style.visibility = "hidden";
					tooltip.style.display = "none";
					Tooltip.tooltipTable.className = "";
					if (Brower.ie6){
						Tooltip.iframe.style.display = "none";
					}
					Tooltip.setIcon(null)
				}
			},
			setIcon:function(iconName){
				Tooltip.prepare();
				var tipIcon = Tooltip.icon;
				if (iconName){
					tipIcon.style.backgroundImage = "url(http://db.wowshell.com/images/icons/medium/"+iconName.toLowerCase()+".jpg)";
					tipIcon.style.visibility = "visible";
				}else{
					tipIcon.style.backgroundImage = "none";
					tipIcon.style.visibility = "hidden"
				}
				Tooltip.iconVisible = iconName ? 1 : 0;
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
			3:[g_items, "item", "物品"],
			5:[g_quests, "quest", "任务"],
			6:[g_spells, "spell", "法术"],
			10:[g_achievement, "achievement", "成就"]
		};
		
		//监视页面mouse over
		function monitorMouseOver(){
			registerEvent(document, "mouseover", monitorCallback);	
		}		
		function power_init(){
			//加载css
			ce("link", {
				type: "text/css",
				rel: "stylesheet",
				href: "http://db.wowshell.com/widgets/power_base.css"
			}, head);
			if (Brower.ie6){
				ce("link", {
					type: "text/css",
					rel: "stylesheet",
					href: "http://db.wowshell.com/widgets/power_base_ie6.css"
				}, head);
			}
			if (Brower.ie7){
				ce("link", {
					type: "text/css",
					rel: "stylesheet",
					href: "http://db.wowshell.com/widgets/power_base_ie7.css"
				}, head);
			}
			monitorMouseOver();
		}
		//处理mouseover 进行回调,处理
		function monitorCallback(e){
			e = getInfoFromEvent(e);
			var target = e._target;
			var counter = 0;			
			while (target != null && counter < 5 && parseURIInfo(target, e) == -2323){
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
		function parseURIInfo(obj, e){
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
						obj.onmousemove = moveTooltip;
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
			currId = lnk;
			currDomain = domain;
			lnkRelationInfo = relInfo;
			InitTipData(type, lnk);//init
			var cache = typeList[type][0];
			if (cache[lnk].status == 3 || cache[lnk].status == 4){
				showTooltip(cache[lnk][isShowBuff()], cache[lnk]["icon"]);
			}else{
				if (cache[lnk].status == 1){
					showTooltip("数据载入中...")
				}else{
					getJsonDataFromRemote(type, id, domain, null, relInfo)
				}
			}
		}
		/**
		 * 显示鼠标提示
		 * @param {String} html
		 * @param {String} icon 显示icon
		 */
		function showTooltip(html, icon){
			if (currentTipObj && currentTipObj._fixTooltip){
				html = currentTipObj._fixTooltip(html, currTypeId, currId, currentTipObj);
			}
			if (!html){
				html += "此"+typeList[currTypeId][2]+"没有找到:(";
				icon = "inv_misc_questionmark";				
			}else{
				if (!lnkRelationInfo){
					if (lnkRelationInfo.pcs && lnkRelationInfo.pcs.length){}
					if (lnkRelationInfo.c){}
					if (lnkRelationInfo.lvl){}
					if (lnkRelationInfo.who && lnkRelationInfo.when){}
				}
			}			
			if (isIconShown == 1){
				Tooltip.setIcon(null);
				Tooltip.show(currentTipObj, html);
			}else{
				Tooltip.setIcon(icon)
				Tooltip.showAtXY(html, tip_x, tip_y, 15, 15);
			}
		}
		function hideTooltip(){
			currentTipObj = null;
			currTypeId = null;
			Tooltip.hide();
		}
		function moveTooltip(e){
			e = getInfoFromEvent(e);
			getPosInfo(e);
			Tooltip.move(tip_x, tip_y, 0, 0, 15, 15)
		}
		/**
		 * 向服务器请求获取json数据
		 * @param {Number} typeId 请求数据类型 详细参考typeList
		 * @param {String} id 请求id 它是通过getRequestParamId生成的
		 * @param {String} domain 域
		 * @param {Boolean} 是否需要请求
		 * @param {Array} url中的rel信息
		 */
		function getJsonDataFromRemote(typeId, id, domain, isRequest, relInfo){
			var realId = getRequestParamId(id, relInfo);
			var cache = typeList[typeId][0];
			if (cache[realId].status != 0 && cache[realId].status != 2){
				return
			}
			cache[realId].status = 1;
			if (!isRequest){
				cache[realId].timer = setTimeout(function(){
					showLoadingTip.apply(this, [typeId, realId, domain]);
				}, 333)
			}
			var str = "";
			for (var key in relInfo){
				if (key != "rand" && key != "ench" && key != "gems" && key != "sock"){
					continue;
				}
				if (typeof relInfo[key] == "object"){
					str += "&"+key+"="+relInfo[key].join(":");
				}else{
					if (key == "sock"){
						str += "&sock";
					}else{
						str += "&"+key+"="+relInfo[key];
					}
				}
			}
			var url = "";
			url = "http://db.wowshell.com";
			url += "/"+"ajax/tooltip.php?type="+typeList[typeId][1]+"&id="+id+str+"&comid="+realId;
			g_ajaxIshRequest(url);
		}
		function showLoadingTip(typeId, realId, domain){
			if (currTypeId == typeId && currId == realId && currDomain == domain){				
				showTooltip("数据载入中...");
				var cache = typeList[typeId][0];
				cache[realId].timer = setTimeout(function(){
					showResponseTip.apply(this, [typeId, realId, domain])
				},3850);
			}
		}
		function showResponseTip(typeId, realId, domain){
			var cache = typeList[typeId][0];
			cache[realId].status = 2;
			if (currTypeId == typeId && currId == realId && currDomain == domain) {
				showTooltip("数据加载超时");
			}
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
			if (cache[id].status == null){
				cache[id].status = 0;//初始状态为0
			}
		}
		function isShowBuff(){
			return (lnkRelationInfo.buff ? "buff" : "tooltip");
		}
		
		this.register = function(typeId, id, localid, tipData){
			var cache = typeList[typeId][0];
			InitTipData(typeId, id, localid);
			if (cache[id].timer){
				clearTimeout(cache[id].timer);
				cache[id].timer = null;
			}
			copyTable(cache[id], tipData);
			if (cache[id].status == 1){
				if (cache[id][isShowBuff()]){
					cache[id].status = 3
				}else{
					cache[id].status = 4
				}
			}
			if (currTypeId == typeId && currId == id && currDomain == "www"){
				showTooltip(cache[id][isShowBuff()], cache[id].icon);
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
