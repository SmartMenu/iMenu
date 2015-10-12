jQuery.sap.declare("com.h3.prj.imenu.util.IMenuController");

sap.ui.core.mvc.Controller.extend("com.h3.prj.imenu.util.IMenuController", {

	getEventBus: function() {
		return this.getOwnerComponent().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},

	createTransaction: function(shopId, deviceId) {

	},

	currentDesk: function(deskNo) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData();
		var current = trackingData.current;
		var deskData;
		if (current.desk) {
			if (current.desk === deskNo) {
				return;
			}
			deskData = trackingData.swap[current.desk];
			if (current.orderId) {
				deskData.orderId = current.orderId;
				if (!deskData.orders[deskData.orderId]) {
					deskData.orders[deskData.orderId] = {};
				}
				deskData.orders[deskData.orderId].categories = current.categories;
				deskData.orders[deskData.orderId].cart = current.cart;
				deskData.orders[deskData.orderId].order = current.order;
			}
		}

		deskData = trackingData.swap[deskNo];
		current.desk = deskNo;
		current.deskStatus = deskData.status;
		current.itemId = deskData.itemId;
		if (deskData.orderId) {
			current.orderId = deskData.orderId;
			current.categories = deskData.orders[deskData.orderId].categories;
			current.cart = deskData.orders[deskData.orderId].cart;
			current.order = deskData.orders[deskData.orderId].order;
		} else {
			delete current.orderId;
			current.categories = {};
			current.cart = [];
			current.order = [];
		}
	},

	nextItemId: function() {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData();
		trackingData.current.itemId = trackingData.current.itemId + 1;
		return trackingData.current.itemId;
	},

	oneMoreItem: function(id) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var index = 0;
		for ( var i in trackingData.cart) {
			if (trackingData.cart[i].id === id) {
				index = i;
				break;
			}
		}
		var item = trackingData.cart[index];
		item.item_count = item.item_count + 1;
		trackingData.categories[item.item_cat_id] = trackingData.categories[item.item_cat_id] + 1;
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories").updateBindings(true);
	},

	oneLessItem: function(id) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var index = 0;
		for ( var i in trackingData.cart) {
			if (trackingData.cart[i].id === id) {
				index = i;
				break;
			}
		}
		var item = trackingData.cart[index];
		if (item.item_count > 1) {
			item.item_count = item.item_count - 1;
			trackingData.categories[item.item_cat_id] = trackingData.categories[item.item_cat_id] - 1;
		}

		sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories").updateBindings(true);
	},

	addToCart: function(item, modifiers) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var id = this.nextItemId();
		item.id = id;
		item["modifier-value"] = 0;
		if (!trackingData.cart) {
			trackingData.cart = [];
		}
		var that = this;
		trackingData.cart.push(item);
		if (modifiers) {
			modifiers.forEach(function(m) {
				var id = that.nextItemId();
				m.id = id;
				m.is_modifier = 1;
				m.item_count = item.item_count;
				m.item_cat_id = item.item_cat_id;
				m.item_price = m.price;
				trackingData.cart.push(m);
				item["modifier-value"] = item["modifier-value"] + m.price; 
			});
		}
		if (!trackingData.categories) {
			trackingData.categories = {};
		}
		if (!trackingData.categories[item.item_cat_id]) {
			trackingData.categories[item.item_cat_id] = 0;
		}
		trackingData.categories[item.item_cat_id] = trackingData.categories[item.item_cat_id] + item.item_count;
		this.preShowCart();
	},

	delFromCart: function(id) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var index = 0;
		for ( var i in trackingData.cart) {
			if (trackingData.cart[i].id === id) {
				index = i;
				break;
			}
		}
		var item = trackingData.cart[index];
		trackingData.cart.splice(index, 1);
		while(trackingData.cart[index] && 1===trackingData.cart[index].is_modifier){
			trackingData.cart.splice(index, 1);
		}
		trackingData.categories[item.item_cat_id] = trackingData.categories[item.item_cat_id] - item.item_count;

		sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories").updateBindings(true);
	},

	delAllFromCart: function() {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		if (!trackingData.cart) {
			return;
		}
		trackingData.cart.splice(0, trackingData.cart.length);
		for ( var cat in trackingData.categories) {
			trackingData.categories[cat] = 0;
		}
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories").updateBindings(true);
	},

	placeOrder: function() {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		if (!trackingData.cart) {
			return;
		}
		var l10nData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData();
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		var orderData;
		var cmd;
		if (trackingData.orderId) {
			orderData = this.appendOrderData();
			cmd = "/addToOrder";
		} else {
			orderData = this.newOrderData();
			cmd = "/makeNewOrder";
		}
		if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
			jQuery.getJSON(appData.server_url + cmd + "?mac=" + appData.device_mac + "&&callback=?", {
				data: orderData
			}, function(json) {
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					return;
				} else {
					trackingData.orderId = json.tran_no;
					sap.m.MessageToast.show(l10nData.status_msg.order_placed_OK);
				}
			});
		} else {
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}

		if (!trackingData.order) {
			trackingData.order = [];
		}
		trackingData.cart.forEach(function(item) {
			trackingData.order.push(item);
		});
		trackingData.cart.splice(0, trackingData.cart.length);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
	},

	preShowCart: function() {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var menuData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nMenu").getData();
		var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData();
		var menuItemsData = jmespath.search(menuData, "[].items[]");
		var cart = trackingData.cart;
		var item_cat_nm = null;
		var item_nm = null;
		if (cart) {
			cart.forEach(function(item) {
				if (!item.is_modifier) {
					item_nm = item;
					var menuItem = jmespath.search(menuItemsData, "[?item_id=='" + item.item_id + "']");
					item.item_name = menuItem[0].item_name;
					item.svc_chargeable = menuItem[0].svc_chargeable;
					item_cat_nm = jmespath.search(menuData, "[?cat_id=='" + item.item_cat_id + "']")[0].cat_name;
					item.item_cat = item_cat_nm;
					item.sub_total = item.item_price * item.item_count;
				}else{
					item.item_cat = item_cat_nm;
					item.item_name = jmespath.search(modifierData[item_nm.item_id].details, "[?item_id=='" + item.item_id + "']")[0].item_name; 
					item.sub_total = item.item_price * item.item_count;
				}
			});
		}
		var order = trackingData.order;
		if (order) {
			order.forEach(function(item) {
				if (!item.is_modifier) {
					item_nm = item;
					var menuItem = jmespath.search(menuItemsData, "[?item_id=='" + item.item_id + "']");
					item.item_name = menuItem[0].item_name;
					item.svc_chargeable = menuItem[0].svc_chargeable;
					item_cat_nm = jmespath.search(menuData, "[?cat_id=='" + item.item_cat_id + "']")[0].cat_name;
					item.item_cat = item_cat_nm;
					item.sub_total = item.item_price * item.item_count;
				}else{
					item.item_cat = item_cat_nm;
					item.item_name = jmespath.search(modifierData[item_nm.item_id].details, "[?item_id=='" + item.item_id + "']")[0].item_name; 
					item.sub_total = item.item_price * item.item_count;
				}
			});
		}
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").updateBindings(true);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories").updateBindings(true);
	},

	dialogCloser: function(dlg) {
		return function closeDlgClosure() {
			dlg.close();
		};
	},

	dialogOpener: function(dlg) {
		return function openDlgClosure() {
			dlg.open();
		};
	},

	newOrderData: function() {
		var appData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo").getData();
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData();
		var currentData = trackingData.current;
		var svcChargeData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.svcCharge").getData();
		var menuItemIdToNameData_en_US = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Name_en_US").getData();
		var menuItemIdToNameData_zh_TW = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Name_zh_TW").getData();
		var orderData = {};
		orderData.order = {};
		orderData.order["shop-id"] = appData.shop_id;
		orderData.order["pos-id"] = appData.device_id;
		orderData.order["table-id"] = currentData.desk;
		orderData.order["service-charge"] = svcChargeData[currentData.desk];
		orderData.order["service-charge-amount"] = com.h3.prj.imenu.util.Formatter.formatSvcCharge(currentData.cart);
		orderData.order["tax-amount"] = 0;
		orderData.order["discount-amount"] = 0;
		orderData.order["subtotal-amount"] = com.h3.prj.imenu.util.Formatter.formatSubTotal(currentData.cart);
		orderData.order["total-amount"] = com.h3.prj.imenu.util.Formatter.formatTotal(currentData.cart);
		orderData.order["user-id"] = trackingData.user_id;

		orderData.details = [];
		var seq = 1;
		var pre_seq = seq;
		currentData.cart.forEach(function(item) {
			var detail = {};
			detail["item-id"] = item.item_id;
			detail.desc = item.desc ? item.desc : menuItemIdToNameData_en_US[item.item_id];
			detail.desc2 = item.desc2 ? item.desc2 : menuItemIdToNameData_zh_TW[item.item_id];
			detail.seq = seq;
			detail.qty = item.item_count;
			detail.price = item.item_price;
			if (svcChargeData[currentData.desk]) {
				detail["service-charge"] = svcChargeData[currentData.desk];
				if (item.svc_chargeable === 1 || 1===item.is_modifier) {
					detail["service-charge-able"] = 1;
					detail["service-charge-amount"] = com.h3.prj.imenu.util.Formatter.formatItemSvcCharge(item, svcChargeData[currentData.desk]);
				} else {
					detail["service-charge-able"] = 0;
					detail["service-charge-amount"] = 0;
				}
			}
			detail["total-amount"] = com.h3.prj.imenu.util.Formatter.formatItemSubTotal(item);
			detail["pay-amount"] = com.h3.prj.imenu.util.Formatter.formatItemPayAmount(item, svcChargeData[currentData.desk]);
			detail.unit = "份";
			detail["take-away"] = 0;
			if(1===item.is_modifier){
				detail["cat-id"] = "";
				detail["modifier-value"] = 0;
				detail["is-modifier"] = 1;
				detail["link-row"] = pre_seq;
				detail.subtype = 2;
				detail["discount-able"] = 1;
			}else{
				detail["cat-id"] = item.cat_id;
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = 0;
				detail["link-row"] = 0;
				detail.subtype = 0;
				pre_seq = seq;
			}
			orderData.details.push(detail);
			seq++;
		});
		return JSON.stringify(orderData);
	},

	appendOrderData: function() {
		var appData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo").getData();
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData();
		var currentData = trackingData.current;
		var svcChargeData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.svcCharge").getData();
		var menuItemIdToNameData_en_US = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Name_en_US").getData();
		var menuItemIdToNameData_zh_TW = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menuItemId_to_Name_zh_TW").getData();
		var orderData = {};
		orderData.order = {};
		orderData.order["shop-id"] = appData.shop_id;
		orderData.order["pos-id"] = appData.device_id;
		orderData.order["table-id"] = currentData.desk;
		orderData.order["order-no"] = currentData.orderId;
		orderData.order["service-charge"] = svcChargeData[currentData.desk];
		orderData.order["service-charge-amount"] = com.h3.prj.imenu.util.Formatter.formatSvcCharge(currentData.cart);
		orderData.order["tax-amount"] = 0;
		orderData.order["discount-amount"] = 0;
		orderData.order["subtotal-amount"] = com.h3.prj.imenu.util.Formatter.formatSubTotal(currentData.cart);
		orderData.order["total-amount"] = com.h3.prj.imenu.util.Formatter.formatTotal(currentData.cart);
		orderData.order["user-id"] = trackingData.user_id;

		orderData.details = [];
		var seq = 1;
		var pre_seq = seq;
		currentData.cart.forEach(function(item) {
			var detail = {};
			detail["item-id"] = item.item_id;
			detail.desc = item.desc ? item.desc : menuItemIdToNameData_en_US[item.item_id];
			detail.desc2 = item.desc2 ? item.desc2 : menuItemIdToNameData_zh_TW[item.item_id];
			detail.seq = seq;
			detail.qty = item.item_count;
			detail.price = item.item_price;
			if (svcChargeData[currentData.desk]) {
				detail["service-charge"] = svcChargeData[currentData.desk];
				if (item.svc_chargeable === 1 || 1===item.is_modifier) {
					detail["service-charge-able"] = 1;
					detail["service-charge-amount"] = com.h3.prj.imenu.util.Formatter.formatItemSvcCharge(item, svcChargeData[currentData.desk]);
				} else {
					detail["service-charge-able"] = 0;
					detail["service-charge-amount"] = 0;
				}
			}
			detail["total-amount"] = com.h3.prj.imenu.util.Formatter.formatItemSubTotal(item);
			detail["pay-amount"] = com.h3.prj.imenu.util.Formatter.formatItemPayAmount(item, svcChargeData[currentData.desk]);
			detail.unit = "份";
			detail["take-away"] = 0;
			if(1===item.is_modifier){
				detail["cat-id"] = "";
				detail["modifier-value"] = 0;
				detail["is-modifier"] = 1;
				detail["link-row"] = pre_seq;
				detail.subtype = 2;
				detail["discount-able"] = 1;
			}else{
				detail["cat-id"] = item.cat_id;
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = 0;
				detail["link-row"] = 0;
				detail.subtype = 0;
				pre_seq = seq;
			}
			orderData.details.push(detail);
			seq++;
		});
		return JSON.stringify(orderData);
	},

	printOrder: function() {
		var appData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo").getData();
		var l10nData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData();
		var currentData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		if (currentData.orderId) {
			if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {

				jQuery.getJSON(appData.server_url + "/printOrder?mac=" + appData.device_mac + "&&shopid=" + appData.shop_id + "&&posid=" + appData.device_id + "&&orderno=" + currentData.orderId + "&&callback=?", function(json) {
					if (json.status == 1) {
						sap.m.MessageToast.show(json.msg);
						return;
					} else {
						sap.m.MessageToast.show(l10nData.status_msg.order_printed_OK);
					}
				});
			} else {
				sap.m.MessageToast.show(l10nData.settings.wrong_settings);
			}
		} else {
			sap.m.MessageToast.show(l10nData.status_msg.order_not_exist);
		}
	}

});
