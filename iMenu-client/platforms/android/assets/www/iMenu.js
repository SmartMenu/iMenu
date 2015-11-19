/*jshint multistr: true */
jQuery.sap.require("com.h3.prj.imenu.util.Formatter");

com.h3.prj.imenu.iMenuInitializer = {
	attachDeviceReady: function() {
		var that = com.h3.prj.imenu.iMenuInitializer; 
		document.addEventListener('deviceready', that.start, false);
	},

	initI18NModel: function() {
		var i18nModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.i18n");

		if (!localStorage.getItem("com.h3.prj.imenu.language")) {
			localStorage.setItem("com.h3.prj.imenu.language", "繁");
		}

		var l10nData = null;
		switch (localStorage.getItem("com.h3.prj.imenu.language")) {
			case "繁":
				l10nData = i18nModel.getData().zh_TW;
				break;
			case "EN":
				l10nData = i18nModel.getData().en_US;
				break;
		}
		var l10nModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		l10nModel.setData(l10nData);

		com.h3.prj.imenu.util.Formatter.setL10nData(l10nModel.getData());
	},

	initAppInfoModel: function() {
		var that = com.h3.prj.imenu.iMenuInitializer;
		that.appInfoModelDeferred = jQuery.Deferred();
		that.deskModelDeferred = jQuery.Deferred();
		that.svcChargeModelDeferred = jQuery.Deferred();
		that.menuModelDeferred = jQuery.Deferred();
		that.modelDeferred = jQuery.Deferred();

		jQuery.when(that.appInfoModelDeferred).then(jQuery.proxy(that.initDeskModel, that));
		jQuery.when(that.deskModelDeferred).then(jQuery.proxy(that.initModels_svccharge_menu, that));
		jQuery.when(that.svcChargeModelDeferred, that.menuModelDeferred).
			then(jQuery.proxy(that.initTrackingModel, that));
		
		var deferred = that.appInfoModelDeferred;

		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		if (localStorage.getItem("com.h3.prj.imenu.server_url")) {
			appData.server_url = localStorage.getItem("com.h3.prj.imenu.server_url");
		}
		if (localStorage.getItem("com.h3.prj.imenu.device_mac")) {
			appData.device_mac = localStorage.getItem("com.h3.prj.imenu.device_mac");
		}
		if (appData.device_mac && appData.server_url) {
			jQuery.getJSON(appData.server_url + "/action" + "/getShopAndPos?mac=" + appData.device_mac + 
			               "&&callback=?", function(json) {
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					appData.state = "NEW";
					delete appData.shop_id;
					delete appData.device_id;
					appInfoModel.updateBindings();
					return;
				} else {
					appData.shop_id = json.data["shop-id"];
					appData.device_id = json.data["pos-id"];
					
					appInfoModel.updateBindings();
					deferred.resolve();
				}
			});
		}
	},

	initDeskModel: function() {
		var that = com.h3.prj.imenu.iMenuInitializer; 
		var deferred = that.deskModelDeferred;

		var desk_en_US_Model = sap.ui.getCore().getModel("com.h3.prj.imenu.model.desk_en_US");
		var desk_zh_TW_Model = sap.ui.getCore().getModel("com.h3.prj.imenu.model.desk_zh_TW");
		var l10nDeskModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nDesk");
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
			jQuery.getJSON(appData.server_url + "/action" + "/getTables?mac=" + appData.device_mac +
			               "&&shopid=" + appData.shop_id + "&&callback=?", function(json){
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					return;
				} else {
					var deskData_en_US = jmespath.search(json, 
					                 'data[].{\
						                 id: tableId,\
						                 pre_id: oldTableId,\
						                 floor: floorDesc,\
						                 max_chairs: maxChairs,\
						                 open_time: openTime,\
						                 open_chairs: openChairs,\
						                 status: status,\
						                 bill: openAmount\
					                 }').sort(function(d1, d2){
					                	 return d1.id - d2.id;
					                 });
					desk_en_US_Model.setData(deskData_en_US);
					var deskData_zh_TW = jmespath.search(json,
					                 'data[].{\
						                 id: tableId,\
						                 pre_id: oldTableId,\
						                 floor: floorDesc2,\
						                 max_chairs: maxChairs,\
						                 open_time: openTime,\
						                 open_chairs: openChairs,\
						                 status: status,\
						                 bill: openAmount\
					                 }').sort(function(d1, d2){
					                	 return d1.id - d2.id;
					                 });
					desk_zh_TW_Model.setData(deskData_zh_TW);
					switch (localStorage.getItem("com.h3.prj.imenu.language")) {
						case "繁":
							l10nDeskModel.setData(deskData_zh_TW);
							break;
						case "EN":
							l10nDeskModel.setData(deskData_en_US);
							break;
					}
					deferred.resolve();
				}
			});
		}else{
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	},
	
	initSvcChargeModel: function(){
		var that = com.h3.prj.imenu.iMenuInitializer; 
		var deferred = that.svcChargeModelDeferred;
		
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
			var deskData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nDesk").getData();
			var deferreds = {};
			var svcChargeData = {};
			deskData.forEach(function(desk){
				deferreds[desk.id] = jQuery.Deferred();
			});
			deskData.forEach(function(desk){
				jQuery.getJSON(appData.server_url + "/action" + "/getServiceCharge?mac=" +
			                   appData.device_mac + "&&shopid=" + appData.shop_id + 
			                   "&&tableid=" + desk.id + "&&callback=?", function(json){
							if (json.status == 1) {
								sap.m.MessageToast.show(json.msg);
								return;
							} else {
								svcChargeData[desk.id] = {};
								svcChargeData[desk.id].id = json.data.id;
								svcChargeData[desk.id].type = json.data.type;
								svcChargeData[desk.id].value = json.data.value;
								svcChargeData[desk.id].desc = json.data.desc;
								svcChargeData[desk.id].desc2 = json.data.desc2;
								deferreds[desk.id].resolve();
							}
					    });
			});
			var deferredArray = [];
			for(var d in deferreds){
				deferredArray.push(deferreds[d]);
			}
			jQuery.when.apply(jQuery, deferredArray).then(function(){
				appData.state="NORMAL";
				sap.ui.getCore().getModel("com.h3.prj.imenu.model.svcCharge").setData(svcChargeData);
				deferred.resolve();
				appInfoModel.updateBindings();
			});
		}else{
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	},

	initMenuModel: function() {
		var that = com.h3.prj.imenu.iMenuInitializer; 
		var deferred = that.menuModelDeferred;

		var menu_en_US_Model = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_en_US");
		var menu_zh_TW_Model = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_zh_TW");
		var l10nMenuModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nMenu");
		var menuItemIdToModifierModel_en_US = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Modifier_en_US");
		var menuItemIdToModifierModel_zh_TW = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Modifier_zh_TW");
		var menuItemIdToSetterModel_en_US = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Setter_en_US");
		var menuItemIdToSetterModel_zh_TW = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Setter_zh_TW");
		var l10nModifierModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier");
		var l10nSetterModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter");
		var categoryModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories");
		var menuItemToCategoryModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItem_to_Category");
		var menuItemIdToNameModel_en_US = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Name_en_US");
		var menuItemIdToNameModel_zh_TW = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Name_zh_TW");
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
			jQuery.getJSON(appData.server_url + "/action" + "/getMenu?mac=" + appData.device_mac + 
			               "&&shopid=" + appData.shop_id + 
			               "&&posid=" + appData.device_id + 
			               "&&callback=?", function(json) {
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					return;
				} else {
					var menu_en_US_Data = jmespath.search(json,'data[?length(items) > "0"].{\
					                cat_id: "lookup-id", \
					                cat_name: "lookup-name", \
					                cat_type: "lookup-type", \
					                pic_type: "picture-type", \
					                items: items[].{\
					                    cat_id: "cat-id",\
					                	item_id: "item-id", \
					                	item_name: "item-name", \
					                	price: price, \
					                	item_pic: "item-pic", \
					                    svc_chargeable: "svchg-allow", \
					                    modifier: "modifier",\
		                    			setter: "setter"\
					                	}\
					                }');
					var menuItemIdToModifier_en_US_Data = {};
					var menuItemIdToSetter_en_US_Data = {};
					menu_en_US_Data.forEach(function(cat){
						cat.items.forEach(function(item){
							if(item.modifier){
								var flattenedModifiers = [];
								that.flatModifiers_en_US(item.modifier, flattenedModifiers);
								menuItemIdToModifier_en_US_Data[item.item_id] = flattenedModifiers;
								delete item.modifier;
							}
							if(item.setter){
								var flattenedSetters = [];
								that.flatSetters_en_US(item.setter, flattenedSetters);
								menuItemIdToSetter_en_US_Data[item.item_id] = flattenedSetters;
								delete item.setter;
							}
						});
					});
					menuItemIdToModifierModel_en_US.setData(menuItemIdToModifier_en_US_Data);
					menuItemIdToSetterModel_en_US.setData(menuItemIdToSetter_en_US_Data);
					
					menu_en_US_Model.setData(menu_en_US_Data);
					
					var menuItemIdToName_en_US_Data = {};
					menu_en_US_Data.forEach(function(cat){
						cat.items.forEach(function(item){
							menuItemIdToName_en_US_Data[item.item_id] = item.item_name;
						});
					});
					menuItemIdToNameModel_en_US.setData(menuItemIdToName_en_US_Data);
					
					var menu_zh_TW_Data = jmespath.search(json, 'data[?length(items) > "0"].{\
					                cat_id: "lookup-id", \
					                cat_name: "lookup-name2", \
					                cat_type: "lookup-type", \
					                pic_type: "picture-type", \
					                items: items[].{\
					                    cat_id: "cat-id",\
					                	item_id: "item-id", \
					                	item_name: item_name2, \
					                	price: price, \
					                	item_pic: "item-pic", \
					                    svc_chargeable: "svchg-allow", \
					                    modifier: "modifier",\
										setter: "setter"\
					                	}\
					                }');
					var menuItemIdToModifier_zh_TW_Data = {};
					var menuItemIdToSetter_zh_TW_Data = {};
					menu_zh_TW_Data.forEach(function(cat){
						cat.items.forEach(function(item){
							if(item.modifier){
								var flattenedModifiers = [];
								that.flatModifiers_zh_TW(item.modifier, flattenedModifiers);
								menuItemIdToModifier_zh_TW_Data[item.item_id] = flattenedModifiers;
								delete item.modifier;
							};
							if(item.setter){
								var flattenedSetters = [];
								that.flatSetters_zh_TW(item.setter, flattenedSetters);
								menuItemIdToSetter_zh_TW_Data[item.item_id] = flattenedSetters;
								delete item.setter;
							};
						});
					});
					menuItemIdToModifierModel_zh_TW.setData(menuItemIdToModifier_zh_TW_Data);
					menuItemIdToSetterModel_zh_TW.setData(menuItemIdToSetter_zh_TW_Data);
					
					menu_zh_TW_Model.setData(menu_zh_TW_Data);
					
					var menuItemIdToName_zh_TW_Data = {};
					menu_zh_TW_Data.forEach(function(cat){
						cat.items.forEach(function(item){
							menuItemIdToName_zh_TW_Data[item.item_id] = item.item_name;
						});
					});
					menuItemIdToNameModel_zh_TW.setData(menuItemIdToName_zh_TW_Data);
					switch (localStorage.getItem("com.h3.prj.imenu.language")) {
						case "繁":
							l10nMenuModel.setData(menu_zh_TW_Model.getData());
							l10nModifierModel.setData(menuItemIdToModifier_zh_TW_Data);
							l10nSetterModel.setData(menuItemIdToSetter_zh_TW_Data);
							break;
						case "EN":
							l10nMenuModel.setData(menu_en_US_Model.getData());
							l10nModifierModel.setData(menuItemIdToModifier_en_US_Data);
							l10nSetterModel.setData(menuItemIdToSetter_en_US_Data);
							break;
					}
					var menuData = l10nMenuModel.getData();

					var categories = jmespath.search(menuData, "[].{cat_id: cat_id, cat_name: cat_name}");
					categoryModel.setData(categories);

					var menuItemToCategory = {};
					menuData.forEach(function(category) {
						var cat_id = category.cat_id;
						category.items.forEach(function(item) {
							menuItemToCategory[item.item_id] = cat_id;
						});
					});
					menuItemToCategoryModel.setData(menuItemToCategory);

					jmespath.search(menuData, "[*].items[]").forEach(function(itemData) {
						var name = "com.h3.prj.imenu.model.menu_item_" + itemData.item_id;
						var menuItemModel = sap.ui.getCore().getModel(name);
						if(!menuItemModel){
							menuItemModel = new sap.ui.model.json.JSONModel();
							sap.ui.getCore().setModel(menuItemModel, name);
						}
						menuItemModel.setData(itemData);
					});
					deferred.resolve();
				}
			});
		}else{
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	},
	
	flatModifiers_en_US: function(modifier, flattenedModifiers) {
		var that = com.h3.prj.imenu.iMenuInitializer;
		var m = {};
		m.modifier_id = modifier["modifier-id"];
		m.modifier_name = modifier["modifier-name"];
		m.compulsory = modifier["compulsory"];
		m.min_count = modifier["min-count"];
		m.max_count = modifier["max-count"];
		
		if(modifier.details){
			var details = jmespath.search(modifier, "details[?type=='detail']");
			m.details = jmespath.search(details, '[].{\
				                            item_id: "item-id", \
			                           		item_name: "item-name", \
			                           		price: price, \
			                           		subtype: subtype, \
			                           		desc: "item-name", \
			                                desc2: "item-name2"\
			                            }');
			
			var childModifiers = jmespath.search(modifier, "details[?type=='modifier']");
			childModifiers.forEach(function(cm){
				that.flatModifiers_en_US(cm, flattenedModifiers);
			});
		}
		flattenedModifiers.push(m);
	},
	
	flatModifiers_zh_TW: function(modifier, flattenedModifiers) {
		var that = com.h3.prj.imenu.iMenuInitializer;
		var m = {};
		m.modifier_id = modifier["modifier-id"];
		m.modifier_name = modifier["modifier-name2"];
		m.compulsory = modifier["compulsory"];
		m.min_count = modifier["min-count"];
		m.max_count = modifier["max-count"];
		
		if(modifier.details){
			var details = jmespath.search(modifier, "details[?type=='detail']");
			m.details = jmespath.search(details, '[].{\
				                            item_id: "item-id", \
			                           		item_name: "item-name2", \
			                           		price: price, \
			                           		subtype: subtype, \
			                           		desc: "item-name", \
			                                desc2: "item-name2"\
			                            }');
			
			var childModifiers = jmespath.search(modifier, "details[?type=='modifier']");
			childModifiers.forEach(function(cm){
				that.flatModifiers_zh_TW(cm, flattenedModifiers);
			});
		}

		flattenedModifiers.push(m);
	},
	
	flatSetters_en_US: function(setter, flattenedSetters) {
		var that = com.h3.prj.imenu.iMenuInitializer;
		var m = {};
		m.lookup_id = setter["lookup-id"];
		m.lookup_name = setter["lookup-name"];
		m.compulsory = setter["compulsory"];
		m.min_count = setter["min-count"];
		m.max_count = setter["max-count"];
		m.select_all = setter["select-all"];
		
		if(setter.details){
			var details = jmespath.search(setter, "details[?type=='detail']");
			m.details = jmespath.search(details, '[].{\
				                            item_id: "item-id", \
			                           		item_name: "item-name", \
					plu_no: "plu-no", \
					item_pic: "item-pic", \
					disc_able: "disc-able", \
					svchg_allow: "svchg-allow", \
			                           		subtype: subtype, \
					cat_id: "cat-id", \
					cat_name: "cat-name", \
					cat_name2: "cat-name2", \
			                           		desc: "item-name", \
			                                desc2: "item-name2"\
			                            }');
			
			var childSetters = jmespath.search(setter, "details[?type=='setter']");
			childSetters.forEach(function(cm){
				that.flatSetters_en_US(cm, flattenedSetters);
			});
		}

		flattenedSetters.push(m);
	},
	
	flatSetters_zh_TW: function(setter, flattenedSetters) {
		var that = com.h3.prj.imenu.iMenuInitializer;
		var m = {};
		m.lookup_id = setter["lookup-id"];
		m.lookup_name = setter["lookup-name2"];
		m.compulsory = setter["compulsory"];
		m.min_count = setter["min-count"];
		m.max_count = setter["max-count"];
		m.select_all = setter["select-all"];
		
		if(setter.details){
			var details = jmespath.search(setter, "details[?type=='detail']");
			m.details = jmespath.search(details, '[].{\
				                            item_id: "item-id", \
			                           		item_name: "item_name2", \
					plu_no: "plu-no", \
					item_pic: "item-pic", \
					disc_able: "disc-able", \
					svchg_allow: "svchg-allow", \
			                           		subtype: subtype, \
					cat_id: "cat-id", \
					cat_name: "cat-name", \
					cat_name2: "cat-name2", \
			                           		desc: "item-name", \
			                                desc2: "item_name2"\
			                            }');
			
			var childsetters = jmespath.search(setter, "details[?type=='setter']");
			childsetters.forEach(function(cm){
				that.flatSetters_zh_TW(cm, flattenedSetters);
			});
		}
		
		flattenedSetters.push(m);
	},


	initTrackingModel: function() {
		var trackingModel = new sap.ui.model.json.JSONModel();
		trackingModel.loadData("./model/tracking.json", "", false);
		sap.ui.getCore().setModel(trackingModel, "com.h3.prj.imenu.model.tracking");
		var trackingData = trackingModel.getData();
		var deskData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nDesk").getData();
		deskData.forEach(function(desk){
			var deskDetail = {};
			deskDetail.status = desk.status;
			deskDetail.itemId = 1;
			deskDetail.orders = {};
			trackingData.swap[desk.id] = deskDetail;
		});
	},

	initModels_i18_app: function() {
		com.h3.prj.imenu.iMenuInitializer.initI18NModel();
		com.h3.prj.imenu.iMenuInitializer.initAppInfoModel();
	},

	initModels_svccharge_menu: function() {
		com.h3.prj.imenu.iMenuInitializer.initSvcChargeModel();
		com.h3.prj.imenu.iMenuInitializer.initMenuModel();
	},

	initUI: function() {
		sap.ui.getCore().attachInit(function() {
			var shellView = sap.ui.xmlview("com.h3.prj.imenu.view.App");
			var shell = shellView.byId("imenuApp");
			var compCon = new sap.ui.core.ComponentContainer({
				height: "100%",
				name: "com.h3.prj.imenu"
			});

			var shellHeader = sap.ui.xmlview("com.h3.prj.imenu.view.AppHeader");
			var segmentedButton = shellHeader.byId("languageButton");
			var btn1 = segmentedButton.createButton("繁");
			var btn2 = segmentedButton.createButton("EN");
			switch (localStorage.getItem("com.h3.prj.imenu.language")) {
				case "繁":
					shellHeader.byId("languageButton").setSelectedButton(btn1);
					break;
				case "EN":
					shellHeader.byId("languageButton").setSelectedButton(btn2);
					break;
			}
			shell.setHeader(shellHeader);
			shell.addContent(compCon);
			shell.placeAt("content");

		});
	},
	
	initLocalDir: function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(fileSystem){	
				newFile = fileSystem.root.getDirectory("iMenu", 
					{ create : true, exclusive : false }, 
					function (dirEntry) {
						iMenuDirURL = dirEntry.toURL();
						sap.ui.getCore().setModel(iMenuDirURL, "com.h3.prj.imenu.model.iMenuDirURL");
					},
					function (dirError) {}
				);  
			},
			function (fileSystemError) {}
		);
	},

	start: function() {

		var i18nModel = new sap.ui.model.json.JSONModel();
		var l10nModel = new sap.ui.model.json.JSONModel();
		var appInfoModel = new sap.ui.model.json.JSONModel();
		var desk_en_US_Model = new sap.ui.model.json.JSONModel();
		var desk_zh_TW_Model = new sap.ui.model.json.JSONModel();
		var l10nDeskModel = new sap.ui.model.json.JSONModel();
		var serviceChargeModel = new sap.ui.model.json.JSONModel();
		var menu_en_US_Model = new sap.ui.model.json.JSONModel();
		var menu_zh_TW_Model = new sap.ui.model.json.JSONModel();
		var l10nMenuModel = new sap.ui.model.json.JSONModel();
		var menuItemIdToModifierModel_en_US = new sap.ui.model.json.JSONModel();
		var menuItemIdToModifierModel_zh_TW = new sap.ui.model.json.JSONModel();
		var l10nModifierModel = new sap.ui.model.json.JSONModel();
		var l10nCurrentModifierModel = new sap.ui.model.json.JSONModel();
		var menuItemIdToSetterModel_en_US = new sap.ui.model.json.JSONModel();
		var menuItemIdToSetterModel_zh_TW = new sap.ui.model.json.JSONModel();
		var l10nSetterModel = new sap.ui.model.json.JSONModel();
		var l10nCurrentSetterModel = new sap.ui.model.json.JSONModel();
		var categoryModel = new sap.ui.model.json.JSONModel();
		var menuItemToCategoryModel = new sap.ui.model.json.JSONModel();
		var menuItemIdToNameModel_en_US = new sap.ui.model.json.JSONModel();
		var menuItemIdToNameModel_zh_TW = new sap.ui.model.json.JSONModel();

		sap.ui.getCore().setModel(i18nModel, "com.h3.prj.imenu.model.i18n");
		sap.ui.getCore().setModel(l10nModel, "com.h3.prj.imenu.model.l10n");
		sap.ui.getCore().setModel(appInfoModel, "com.h3.prj.imenu.model.appinfo");
		sap.ui.getCore().setModel(desk_en_US_Model, "com.h3.prj.imenu.model.desk_en_US");
		sap.ui.getCore().setModel(desk_zh_TW_Model, "com.h3.prj.imenu.model.desk_zh_TW");
		sap.ui.getCore().setModel(l10nDeskModel, "com.h3.prj.imenu.model.l10nDesk");
		sap.ui.getCore().setModel(serviceChargeModel, "com.h3.prj.imenu.model.svcCharge");
		sap.ui.getCore().setModel(menu_en_US_Model, "com.h3.prj.imenu.model.menu_en_US");
		sap.ui.getCore().setModel(menu_zh_TW_Model, "com.h3.prj.imenu.model.menu_zh_TW");
		sap.ui.getCore().setModel(l10nMenuModel, "com.h3.prj.imenu.model.l10nMenu");
		sap.ui.getCore().setModel(menuItemIdToModifierModel_en_US, "com.h3.prj.imenu.model.menuItemId_to_Modifier_en_US");
		sap.ui.getCore().setModel(menuItemIdToModifierModel_zh_TW, "com.h3.prj.imenu.model.menuItemId_to_Modifier_zh_TW");
		sap.ui.getCore().setModel(l10nModifierModel, "com.h3.prj.imenu.model.l10nModifier");
		sap.ui.getCore().setModel(l10nCurrentModifierModel, "com.h3.prj.imenu.model.l10nCurrentModifier");
		sap.ui.getCore().setModel(menuItemIdToSetterModel_en_US, "com.h3.prj.imenu.model.menuItemId_to_Setter_en_US");
		sap.ui.getCore().setModel(menuItemIdToSetterModel_zh_TW, "com.h3.prj.imenu.model.menuItemId_to_Setter_zh_TW");
		sap.ui.getCore().setModel(l10nSetterModel, "com.h3.prj.imenu.model.l10nSetter");
		sap.ui.getCore().setModel(l10nCurrentSetterModel, "com.h3.prj.imenu.model.l10nCurrentSetter");
		sap.ui.getCore().setModel(categoryModel, "com.h3.prj.imenu.model.menu_categories");
		sap.ui.getCore().setModel(menuItemToCategoryModel, "com.h3.prj.imenu.model.menuItem_to_Category");
		sap.ui.getCore().setModel(menuItemIdToNameModel_en_US, "com.h3.prj.imenu.model.menuItemId_to_Name_en_US");
		sap.ui.getCore().setModel(menuItemIdToNameModel_zh_TW, "com.h3.prj.imenu.model.menuItemId_to_Name_zh_TW");

		i18nModel.loadData("./model/i18n.json", "", false);
		appInfoModel.loadData("./model/app.json", "", false);

		com.h3.prj.imenu.iMenuInitializer.initModels_i18_app();
		com.h3.prj.imenu.iMenuInitializer.initUI();
		com.h3.prj.imenu.iMenuInitializer.initLocalDir();
	}

};

com.h3.prj.imenu.iMenuInitializer.attachDeviceReady();
