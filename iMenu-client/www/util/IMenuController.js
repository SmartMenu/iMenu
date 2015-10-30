jQuery.sap.declare("com.h3.prj.imenu.util.IMenuController");

sap.ui.core.mvc.Controller.extend("com.h3.prj.imenu.util.IMenuController", {

	modifierDlg: null,
	modifierView: null,

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
		if(!trackingData.current.itemId){
			trackingData.current.itemId = 1;
		}
		var idtxt = this.genIdtxt(trackingData.current.itemId);
		trackingData.current.itemId = trackingData.current.itemId + 1;
		return idtxt;
	},
	
	genIdtxt: function(id){
		var idtxt = id;
		if(id===1000000000 || !id){
			id=1;
			idtxt=1;
		}
		if(id<10){
			idtxt = "000000000" + id;
		}else if(id<100){
			idtxt = "00000000" + id;
		}else if(id<1000){
			idtxt = "0000000" + id;
		}else if(id<10000){
			idtxt = "000000" + id;
		}else if(id<100000){
			idtxt = "00000" + id;
		}else if(id<1000000){
			idtxt = "0000" + id;
		}else if(id<10000000){
			idtxt = "000" + id;
		}else if(id<100000000){
			idtxt = "00" + id;
		}else{
			idtxt = "0" + id;
		}
		return idtxt;
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

		item.id = item.item_cat_id + "_" + id;
		item["modifier-value"] = 0;
		if (!trackingData.cart) {
			trackingData.cart = [];
		}
		var that = this;
		trackingData.cart.push(item);
		if (modifiers) {
			modifiers.forEach(function(m) {
				var id = that.nextItemId();
				m.id = item.item_cat_id + "_" + id;
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
		while (trackingData.cart[index] && 1 === trackingData.cart[index].is_modifier) {
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
			jQuery.getJSON(appData.server_url + "/action" + cmd + "?mac=" + appData.device_mac + "&&callback=?", {
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
					item.discountable = menuItem[0].discountable;
					item.svc_chargeable = menuItem[0].svc_chargeable;
					item_cat_nm = jmespath.search(menuData, "[?cat_id=='" + item.item_cat_id + "']")[0].cat_name;
					item.item_cat = item_cat_nm;
					item.sub_total = item.item_price * item.item_count;
				} else {
					item.item_cat = item_cat_nm;
					item.item_name = jmespath.search(modifierData[item_nm.item_id], "[*].details[] | [?item_id=='" + item.item_id + "']")[0].item_name;
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
					item.discountable = menuItem[0].discountable;
					item.svc_chargeable = menuItem[0].svc_chargeable;
					item_cat_nm = jmespath.search(menuData, "[?cat_id=='" + item.item_cat_id + "']")[0].cat_name;
					item.item_cat = item_cat_nm;
					item.sub_total = item.item_price * item.item_count;
				} else {
					item.item_cat = item_cat_nm;
					item.item_name = jmespath.search(modifierData[item_nm.item_id], "[*].details[] | [?item_id=='" + item.item_id + "']")[0].item_name;
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
		var pre_disc = 0;
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
				if (item.svc_chargeable === 1 || 1 === item.is_modifier) {
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
			if (1 === item.is_modifier) {
				detail["cat-id"] = "";
				detail["modifier-value"] = 0;
				detail["is-modifier"] = 1;
				detail["link-row"] = pre_seq;
				detail.subtype = 2;
				detail["discount-able"] = pre_disc;
			} else {
				detail["cat-id"] = item.cat_id;
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = 0;
				detail["link-row"] = 0;
				detail.subtype = 0;
				detail["discount-able"] = item.discountable;
				pre_seq = seq;
				pre_disc = item.discountable;
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
		var seq = Math.max.apply(null, trackingData.current.order.map(function(o) {
			return o.seq;
		})) + 1;
		var pre_seq = seq;
		var pre_disc = 0;
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
				if (item.svc_chargeable === 1 || 1 === item.is_modifier) {
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
			if (1 === item.is_modifier) {
				detail["cat-id"] = "";
				detail["modifier-value"] = 0;
				detail["is-modifier"] = 1;
				detail["link-row"] = pre_seq;
				detail.subtype = 2;
				detail["discount-able"] = pre_disc;
			} else {
				detail["cat-id"] = item.cat_id;
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = 0;
				detail["link-row"] = 0;
				detail.subtype = 0;
				detail["discount-able"] = item.discountable;
				pre_seq = seq;
				pre_disc = item.discountable;
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

				jQuery.getJSON(appData.server_url + "/action" + "/printOrder?mac=" + appData.device_mac + "&&shopid=" + appData.shop_id + "&&posid=" + appData.device_id + "&&orderno=" + currentData.orderId + "&&callback=?", function(json) {
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
	},

	prepareModifierDlg: function(modifierData) {
		var modifierView = sap.ui.xmlview("com.h3.prj.imenu.view.Modifier");
		modifierView.setModel(sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n"), "l10n");
		modifierView.setModel(new sap.ui.model.json.JSONModel(modifierData), "modifiers");
		var selectedModifiers = [];
		var modifierIconTab = modifierView.byId("modifierIconTab");
		modifierData.forEach(function(modifierGroup) {
			var iconTabFilter = new sap.m.IconTabFilter({
				text: modifierGroup.modifier_name
			});
			var modifierGrid = new sap.ui.layout.Grid({
				defaultSpan: "L3 M3 S3"
			});
			iconTabFilter.addContent(modifierGrid);
			modifierGroup.details.forEach(function(d) {
				var toggleButton = new sap.m.ToggleButton({
					text: d.item_name,
					width: "20em",
					press: function(event) {
						var button = event.getSource();
						if (button.getPressed()) {
							selectedModifiers.push(d);
						} else {
							var pos = jQuery.inArray(d, selectedModifiers);
							if (pos !== -1) {
								selectedModifiers.splice(pos, 1);
							}
						}
					}
				});
				toggleButton.addStyleClass("menuItemButton");
				modifierGrid.addContent(toggleButton);
			});
			modifierIconTab.addItem(iconTabFilter);
		});
		this.createModifierDlg(modifierView, selectedModifiers).open();
	},

	createModifierDlg: function(modifierView, selectedModifiers) {
		var doAdd = this.doAddToCart;
		var that = this;
		if (!com.h3.prj.imenu.util.IMenuController.modifierDlg) {
			var modifierDlg = new sap.m.Dialog("modifierDlg", {
				contentHeight: "100%",
				contentWidth: "100%",
				showHeader: false,
				content: [
					modifierView
				]
			});
			var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
			modifierDlg.setModel(l10n, "l10n");
			modifierDlg.addButton(new sap.m.Button({
				text: "{l10n>/ok}",
				width: "8em",
				press: function() {
					modifierDlg.close();
					doAdd(that, selectedModifiers);
				}
			}));
			com.h3.prj.imenu.util.IMenuController.modifierDlg = modifierDlg;
		} else {
			var dlg = com.h3.prj.imenu.util.IMenuController.modifierDlg;
			dlg.removeAllButtons();
			dlg.removeAllContent();
			dlg.addContent(modifierView);
			var button = new sap.m.Button({
				text: "{l10n>/ok}",
				width: "8em",
				press: function() {
					dlg.close();
					doAdd(that, selectedModifiers);
				}
			});
			dlg.addButton(button);
			dlg.setInitialFocus(button);
		}
		return com.h3.prj.imenu.util.IMenuController.modifierDlg;
	},

	doAddToCart: function(that, selectedModifiers) {
		var view = that.getView();
		var item_id = view.data("item_id");
		var item_count = view.getModel().getData().count;
		var item_price = view.getModel("item").getData().price;
		var cat_id = view.getModel("item").getData().cat_id;
		var item_cat_id = view.data("item_cat");
		that.addToCart({
			"cat_id": cat_id,
			"item_id": item_id,
			"item_cat_id": item_cat_id,
			"item_count": item_count,
			"item_price": item_price
		}, selectedModifiers);

		var data = view.getModel().getData();
		data.count = 1;
		view.getModel().setData(data);
	}

});
