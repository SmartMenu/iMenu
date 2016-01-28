/*jshint multistr: true */
jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.Desk", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
	 * displayed, to bind event handlers and do other one-time initialization.
	 * 
	 * @memberOf view.Desk
	 */
	onInit: function() {
		this.initFloorFilter();
		this.initFloorDesk();
		this.getEventBus().subscribe("com.h3.prj.imenu.Component", "languageChanged", this.onLanguageChanged, this);
	},

	initFloorFilter: function() {
		var floorData = this.floorData();
		var floorModel = new sap.ui.model.json.JSONModel();
		floorModel.setData(floorData);
		this.getOwnerComponent().setModel(floorModel, "floors");
		var floorFilter = this.getView().byId("floorFilter");
		floorFilter.attachEventOnce("updateFinished", function(){
			var items = floorFilter.getItems();
			if(items != null){
				floorFilter.setSelectedItem(items[0]);
			}
		});
	},

	initFloorDesk: function() {
		var deskData = this.getOwnerComponent().getModel("desk").getData();
		var deskPress = this.onDeskPress;
		var grid = this.getView().byId("deskGrid");
		deskData.forEach(function(d) {
			var styleClass = null;
			switch (d.status) {
				case 0:
					styleClass = "deskStatus0";
					break;
				case 1:
					styleClass = "deskStatus1";
					break;
				case 2:
					styleClass = "deskStatus2";
					break;
			}
			var desk = new sap.m.ObjectListItem({
				type: "Active",
				number: d.max_chairs,
				title: d.id,
				press: deskPress
			});
			desk.addStyleClass(styleClass);
			grid.addContent(desk);
		});

	},
	
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered (NOT before the first rendering! onInit() is
	 * used for that one!).
	 * 
	 * @memberOf view.Desk
	 */
// onBeforeRendering: function() {
//
// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. This
	 * hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.Desk
	 */
//	onAfterRendering: function() {
//	},
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf view.Desk
	 */
// onExit: function() {
//
// }
	onLanguageChanged: function(channel, event, language){
		var floorData = this.floorData();
		this.getOwnerComponent().getModel("floors").setData(floorData);
	},
	
	onFloorFilterSelect: function(event){
		var func = this.doFloorFilterSelect;
		var source = event.getSource();
		var timeout = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo").getData().time_out;
		setTimeout(function(){func(source);}, timeout);
	},

	doFloorFilterSelect: function(source) {
		var floor = source.getSelectedItem().data("key");
		var that = com.h3.prj.imenu.util.ControllerFinder.find(source, "com.h3.prj.imenu.view.Desk");

		var deskData = that.getOwnerComponent().getModel("desk").getData();
		var allText = that.getOwnerComponent().getModel("l10n").getData().all;
		var displayAll = false;
		var selector = null;
		if (floor === allText) {
			displayAll = true;
		} else {
			selector = "[?floor==`" + floor + "`]";
		}
		var grid = that.getView().byId("deskGrid");
		grid.removeAllContent();
		var desksAtFloor = null;
		if (displayAll === true) {
			desksAtFloor = deskData;
		} else {
			desksAtFloor = jmespath.search(deskData, selector);
		}
		desksAtFloor.forEach(function(d) {
			var styleClass = null;
			switch (d.status) {
				case 0:
					styleClass = "deskStatus0";
					break;
				case 1:
					styleClass = "deskStatus1";
					break;
				case 2:
					styleClass = "deskStatus2";
					break;
			}
			var desk = new sap.m.ObjectListItem({
				type: "Active",
				number: d.max_chairs,
				title: d.id,
				press: that.onDeskPress

			});
			desk.addStyleClass(styleClass);
			grid.addContent(desk);
		});
	},

	onDeskPress: function(event) {
		var source = event.getSource();
		var deskNo = source.getTitle();
		var that = com.h3.prj.imenu.util.ControllerFinder.find(source, "com.h3.prj.imenu.view.Desk");
		that.currentDesk(deskNo);
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
			jQuery.getJSON(appData.server_url + "/action" + "/getOrder?mac=" + appData.device_mac + 
			               "&&shopid=" + appData.shop_id + 
			               "&&posid=" + appData.device_id +
			               "&&tableid=" + deskNo + 
			               "&&callback=?", function(json) {
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					return;
				} else {
					var orderData = jmespath.search(json,'data.{\
					                order_no: "order-no", \
					                order: details[].{\
					                    id: seq,\
					                    seq: seq,\
					                	item_id: "item-id", \
					                    item_count: qty,\
					                	item_price: price, \
							subtype: "subtype", \
					                    is_modifier: "is-modifier"\
					                	}\
					                }');
					var currentData = null;
					if(orderData.order_no){
						var menuItemToCategoryData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItem_to_Category").getData();
						orderData.order.forEach(function(o){
							o.item_cat_id = menuItemToCategoryData[o.item_id]; 
						});
						currentData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
						currentData.orderId = orderData.order_no;
						currentData.order = orderData.order.slice();
						currentData.categories = {};
						orderData.order.forEach(function(o){
							if(!currentData.categories[o.item_cat_id]){
								currentData.categories[o.item_cat_id] = 0;
							}
							currentData.categories[o.item_cat_id] = currentData.categories[o.item_cat_id] + 1;
						});
					}else{
						currentData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
						var swapData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().swap;
						if(currentData.orderId){
							delete swapData[deskNo].orders[currentData.orderId];
						}
						delete currentData.orderId;
						currentData.order = [];
						currentData.categories = {};
						currentData.cart = [];
					}
					that.preShowCart();
					sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
					sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories").updateBindings(true);
					that.getRouter().navTo("menuBrowser");
				}
			});
		}else{
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	},
	
	floorData: function() {
		var deskData = this.getOwnerComponent().getModel("desk").getData();
		var selector = "[].floor";
		var floors = this.uniq(jmespath.search(deskData, selector)).sort();
		var allText = this.getOwnerComponent().getModel("l10n").getData().all;

		floors.splice(0, 0, allText);
		var floorData = [];
		for (var i in floors) {
			floorData.push({
				"floorTxt": com.h3.prj.imenu.util.Formatter.formatFloor(floors[i]),
				"floor": floors[i]
			});
		}
		return floorData;
	},

	uniq: function(a) {
		var seen = {};
		return a.filter(function(item) {
			return seen.hasOwnProperty(item) ? false : (seen[item] = true);
		});
	},
	
	onDeskRefreshButtonPressed: function(event){
		var that = com.h3.prj.imenu.util.ControllerFinder.find(event.getSource(), "com.h3.prj.imenu.view.Desk");
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
					var deskData = jmespath.search(json, 
					                 'data[].{\
						                 id: tableId,\
						                 status: status\
					                 }');
					var deskStatus = {};
					deskData.forEach(function(desk){
						deskStatus[desk.id] = desk.status;
					});
					deskData = that.getOwnerComponent().getModel("desk").getData();
					deskData.forEach(function(desk){
						desk.status = deskStatus[desk.id];
					});
					var desks = that.getView().byId("deskGrid").getContent();
					desks.forEach(function(desk){
						switch(deskStatus[desk.getTitle()]){
							case 0:
								desk.removeStyleClass("deskStatus1");
								desk.removeStyleClass("deskStatus2");
								desk.addStyleClass("deskStatus0");
								break;
							case 1:
								desk.removeStyleClass("deskStatus0");
								desk.removeStyleClass("deskStatus2");
								desk.addStyleClass("deskStatus1");
								break;
							case 2:
								desk.removeStyleClass("deskStatus0");
								desk.removeStyleClass("deskStatus1");
								desk.addStyleClass("deskStatus2");
								break;
						}
					});
				}
			});
		}else{
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	}

});
