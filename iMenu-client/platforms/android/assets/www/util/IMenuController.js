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
				m["discount-able"] = 1;
				m["tax-able"] = 1;
				var sub_price = m.price;
				if (sub_price == null) {
					sub_price = 0;
				}
				m.item_price = sub_price;
				m["modifier-value"] = sub_price;
				m.subtype = 2;
				item["modifier-value"] = item["modifier-value"] + sub_price;
				trackingData.cart.push(m);
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

	addToCartSetter: function(item, setters) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var id = this.nextItemId();
		item.id = id;
		item["modifier-value"] = 0;
		if (!trackingData.cart) {
			trackingData.cart = [];
		}
		var parent_disc_able = item.disc_able;
		var parent_tax_able = null;
		var that = this;
		trackingData.cart.push(item);
		if (setters) {
			setters.forEach(function(m) {
				var id = that.nextItemId();
				m.id = id;
				m.is_modifier = 0;
				m.item_count = item.item_count;
				m.item_cat_id = item.item_cat_id;
				m["level-no"] = 1;
				if (parent_disc_able != null) {
					m["discount-able"] = parent_disc_able;
				}
				if (parent_tax_able != null) {
					m["tax-able"] = parent_tax_able;
				}
				var sub_price = m.price;
				if (sub_price == null) {
					sub_price = 0;
				}
				m.item_price = sub_price;
				m["modifier-value"] = sub_price;
				m.subtype = 4;
				trackingData.cart.push(m);
				item["modifier-value"] = item["modifier-value"] + sub_price;
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
		while (trackingData.cart[index] && ( 2 == trackingData.cart[index].subtype || 4 == trackingData.cart[index].subtype) ) {
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
		var setterData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter").getData();
		var menuItemsData = jmespath.search(menuData, "[].items[]");
		var cart = trackingData.cart;
		var item_cat_nm = null;
		var item_nm = null;
		if (cart) {
			console.log("cart size is: " + cart.length);
			cart.forEach(function(item) {
				if (2 != item.subtype && 4 != item.subtype) {
					item_nm = item;
					var menuItem = jmespath.search(menuItemsData, "[?item_id=='" + item.item_id + "']");
					item.item_name = menuItem[0].item_name;
					item.svc_chargeable = menuItem[0].svc_chargeable;
					item_cat_nm = jmespath.search(menuData, "[?cat_id=='" + item.item_cat_id + "']")[0].cat_name;
					item.item_cat = item_cat_nm;
					item.sub_total = item.item_price * item.item_count;
				} else {
					item.item_cat = item_cat_nm;
					var modifierItems = jmespath.search(modifierData[item_nm.item_id], "[*].details[] | [?item_id=='" + item.item_id + "']");
					var setterItems = jmespath.search(setterData[item_nm.item_id], "[*].details[] | [?item_id=='" + item.item_id + "']");
					if (modifierItems != null){
						item.item_name = modifierItems[0].item_name;
					} else if (setterItems != null){
						item.item_name = setterItems[0].item_name;
					}
					item.sub_total = item.item_price * item.item_count;
				}
			});
		}
		var order = trackingData.order;
		if (order) {
			order.forEach(function(item) {
				if (2 != item.subtype && 4 != item.subtype) {
					item_nm = item;
					var menuItem = jmespath.search(menuItemsData, "[?item_id=='" + item.item_id + "']");
					item.item_name = menuItem[0].item_name;
					item.svc_chargeable = menuItem[0].svc_chargeable;
					item_cat_nm = jmespath.search(menuData, "[?cat_id=='" + item.item_cat_id + "']")[0].cat_name;
					item.item_cat = item_cat_nm;
					item.sub_total = item.item_price * item.item_count;
				} else {
					item.item_cat = item_cat_nm;
					var modifierItems = jmespath.search(modifierData[item_nm.item_id], "[*].details[] | [?item_id=='" + item.item_id + "']");
					var setterItems = jmespath.search(setterData[item_nm.item_id], "[*].details[] | [?item_id=='" + item.item_id + "']");
					if (modifierItems != null) {
						item.item_name = modifierItems[0].item_name;
					} else if (setterItems != null) {
						item.item_name = setterItems[0].item_name;
					}
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
				if (item.svc_chargeable === 1 || 2 == item.subtype || 4 == item.subtype) {
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
			console.log("item: "  + detail.desc 
					+ ", subtype: " + item.subtype 
					+ ", is_modifier: " + item.is_modifier 
					+ ", price: " + item.price
					+ ", modifier-value: " + item["modifier-value"]);
			if (2 == item.subtype || 4 == item.subtype) {
				detail["cat-id"] = "";
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = item.is_modifier;
				detail["link-row"] = pre_seq;
				detail.subtype = item.subtype;
				if (item["discount-able"] != null) {
					detail["discount-able"] = item["discount-able"];
				}
				if (item["tax-able"] != null) {
					detail["tax-able"] = item["tax-able"];
				}
				if (item["level-no"] != null) {
					detail["level-no"] = item["level-no"];
				}
			} else {
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
		var orderString = JSON.stringify(orderData);
		console.log(orderString);
		return orderString;
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
				if (item.svc_chargeable === 1 || 2 == item.subtype || 4 == item.subtype) {
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
			console.log("item: "  + detail.desc 
					+ ", subtype: " + item.subtype 
					+ ", is_modifier: " + item.is_modifier 
					+ ", price: " + item.price
					+ ", modifier-value: " + item["modifier-value"]);
			if (2 == item.subtype || 4 == item.subtype) {
				detail["cat-id"] = "";
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = item.is_modifier;
				detail["link-row"] = pre_seq;
				if (item["level-no"] != null) {
					detail["level-no"] = item["level-no"];
				}
				detail.subtype = item.subtype;
				if (item["discount-able"] != null) {
					detail["discount-able"] = item["discount-able"];
				}
				if (item["tax-able"] != null) {
					detail["tax-able"] = item["tax-able"];
				}
				if (item["level-no"] != null) {
					detail["level-no"] = item["level-no"];
				}
			} else {
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
		var orderString = JSON.stringify(orderData);
		console.log(orderString);
		return orderString;
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
	
	performMenuItemAccept: function(menuItemController, itemData){
		var view = menuItemController.getView();
		var item_id = view.data("item_id");
		var item_name = itemData.item_name;
		var dialogName = "";
		var label_setter = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().label_setter;
		var label_modifier = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().label_modifier;
		
		if(item_id){
			var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[item_id];
			var setterData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter").getData()[item_id];
			if (modifierData) {
				dialogName = label_modifier + item_name;
				this.prepareModifierDlg(modifierData, dialogName);
			} else if (setterData) {
				dialogName = label_setter + item_name;
				this.prepareSetterDlg(setterData, dialogName);
			} else {
				this.doAddToCart(menuItemController);
			}
		}
	},
	
	getItemType: function(item){
		var itemType = 0;
		var itemId = item.id;
		var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[itemId];
		var setterData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter").getData()[itemId];
		if (modifierData) {
			itemType = 10;
		} else if (setterData) {
			itemType = 20;
		}
		return itemType;
	},

	prepareSetterDlg: function(setterData, dialogName) {
		var setterView = sap.ui.xmlview("com.h3.prj.imenu.view.Setter");
		setterView.setModel(sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n"), "l10n");
		var setterContainer = setterView.byId("setterContainer");
		var selectedSetterItems = [];
		setterData.forEach(function(setterGroupData) {
			var item_required = false;
			var item_selected = false;
			var select_all = setterGroupData.select_all;
			if(select_all == 1){
				item_required = true;
				item_selected = true;
			}
			setterGroupData.labelMsg = com.h3.prj.imenu.util.Formatter.setterGroupLabel(setterGroupData);
			var setterGroup = sap.ui.xmlview("com.h3.prj.imenu.view.SetterGroup");
			var setterGroupModel = new sap.ui.model.json.JSONModel(setterGroupData);
			setterGroup.setModel(setterGroupModel,"group");
			setterContainer.addContent(setterGroup);
			setterGroupData.details.forEach(function(setterItemData) {
				setterItemData.count = 1;
				setterItemData.item_required = item_required;
				setterItemData.item_selected = item_selected;
				if(setterItemData.price = null) {
					setterItemData.price = 0;
				}
				var setterItem = sap.ui.xmlview("com.h3.prj.imenu.view.SetterItem");
				var setterItemModel = new sap.ui.model.json.JSONModel(setterItemData);
				setterItem.setModel(setterItemModel,"item");
				if (setterItemData.item_required == true) {
					selectedSetterItems.push(setterItemData);
				}
				setterItem.data("selectedSetterItems", selectedSetterItems);
				setterContainer.addContent(setterItem);
			});
		});
		this.createSelectionDlg(dialogName, setterView, selectedSetterItems).open();
	},
	
	updateSelectedSetterItems: function(itemData, selectedSetterItems) {
		console.log("-> Enter updateSelectedSetterItems");
		
		if (itemData == null || selectedSetterItems == null) {
			return;
		}
		
		var currentItemID = itemData.item_id;
		var currentItemCount = itemData.count;
		var isCurrentSelected = itemData.item_selected;
		if (currentItemID == null || currentItemID == ""){
			return;
		}
		if (currentItemCount == null || currentItemCount < 1){
			return;
		}
		if (isCurrentSelected == null){
			return;
		}
		
		console.log("-> itemData is valid and selectedSetterItems size is: " + selectedSetterItems.length);

		var existingSelectedItem = null;
		var existingSelectedItemIndex = null;
			
		for ( var i in selectedSetterItems) {
			if (selectedSetterItems[i].item_id === currentItemID) {
				existingSelectedItem = selectedSetterItems[i];
				existingSelectedItemIndex = i;
				break;
			}
		}
			
		if (existingSelectedItem == null && !isCurrentSelected) {
			console.log("-> Do nothing");
		}
			
		if (existingSelectedItem == null && isCurrentSelected) {
			console.log("-> Add it");
			selectedSetterItems.push(itemData);
		}
			
		if (existingSelectedItem != null && !isCurrentSelected) {
			console.log("-> Remove it");
			selectedSetterItems.splice(existingSelectedItemIndex, 1);
		}
			
		if (existingSelectedItem != null && isCurrentSelected) {
			console.log("-> Update it");
			existingSelectedItem = itemData;
		}
	},
	
	prepareModifierDlg: function(modifierData, dialogName) {
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
					width: "100%",
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
		this.createSelectionDlg(dialogName, modifierView, selectedModifiers).open();
	},

	createSelectionDlg: function(dialogName, innerView, selections) {
		var doAdd = this.doAddToCart;
		var that = this;
		var dlg;
		if (!com.h3.prj.imenu.util.IMenuController.selectionDlg) {
			dlg = new sap.m.Dialog("modifierDlg", {
				contentHeight: "100%",
				contentWidth: "100%",
				showHeader: false,
				content: [
					innerView
				]
			});
			var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
			dlg.setModel(l10n, "l10n");
			com.h3.prj.imenu.util.IMenuController.selectionDlg = dlg;
		} else {
			dlg = com.h3.prj.imenu.util.IMenuController.selectionDlg;
			dlg.removeAllButtons();
			dlg.removeAllContent();
			dlg.addContent(innerView);
		}
		var nameLabel = new sap.m.Label({
			design: "Bold",
			text: dialogName,
			textAlign: "Begin",
			width: "18em"
		});
		var spacer = new sap.m.ToolbarSpacer();
		
		var buttonWidth = "6em";

		var closeButton = new sap.m.Button({
			text: "{l10n>/cart/close}",
			width: buttonWidth,
			type: "Reject",
			press: function() {
				dlg.close();
			}
		});
		var okButton = new sap.m.Button({
			text: "{l10n>/ok}",
			width: buttonWidth,
			type: "Accept",
			press: function() {
				var result = doAdd(that, selections);
				if (result) {
					dlg.close();
				}
			}
		});
		dlg.addButton(nameLabel);
		dlg.addButton(spacer);
		dlg.addButton(closeButton);
		dlg.addButton(okButton);
		dlg.setInitialFocus(okButton);
		return com.h3.prj.imenu.util.IMenuController.selectionDlg;
	},

	doAddToCart: function(that, subSelections) {
		var view = that.getView();
		var item_id = view.data("item_id");
		var item_cat_id = view.data("item_cat");
		var itemData = view.getModel("item").getData();
		var item_count = view.getModel().getData().count;
		var item_price = itemData.price;
		var cat_id = itemData.cat_id;
		var subtype = 0;
		
		var setterData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter").getData()[item_id];
		if (setterData) {
			console.log("-> This is a setter");
			var errorSetterGroupNames = [];
			setterData.forEach(function(setterGroupData) {
				var select_all = setterGroupData.select_all;
				var min_count = setterGroupData.min_count;
				var group_name = setterGroupData.lookup_name;
				if(select_all != 1){
					console.log("-> checking setterGroupData: " + setterGroupData.item_id);
					var group_counting = 0;
					setterGroupData.details.forEach(function(setterItemData) {
						var setter_item_id = setterItemData.item_id;
						console.log("-> checking setter_item_id: " + setter_item_id);
						var selectedItems = jmespath.search(subSelections, "[?item_id=='" + setter_item_id + "']");
						console.log("-> selectedItems size is: " + selectedItems.length);
						if(selectedItems != null && selectedItems.length > 0) {
							var setter_item_count = selectedItems[0].count;
							if (setter_item_count != null) {
								console.log("-> setter_item_count is: " + setter_item_count);
								group_counting = group_counting + setter_item_count;
							}
						}
					});

					if(group_counting != min_count) {
						errorSetterGroupNames.push(group_name);
					}
				}
			});
			
			if(errorSetterGroupNames.length > 0){
				var setterGroupError = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().setter_group_error;
				setterGroupError += errorSetterGroupNames[0];
				for (var i = 1, len = errorSetterGroupNames.length; i < len; i += 1) {
					setterGroupError += ", " + errorSetterGroupNames[i];
				}
				sap.m.MessageToast.show(setterGroupError);
				return false;
			}
			
			that.addToCartSetter({
				"cat_id": cat_id,
				"item_id": item_id,
				"item_cat_id": item_cat_id,
				"item_count": item_count,
				"subtype": subtype,
				"item_price": item_price
			}, subSelections);
		} else {
			console.log("-> This is a modifier");
			that.addToCart({
				"cat_id": cat_id,
				"item_id": item_id,
				"item_cat_id": item_cat_id,
				"item_count": item_count,
				"subtype": subtype,
				"item_price": item_price
			}, subSelections);
		}

		var data = view.getModel().getData();
		data.count = 1;
		view.getModel().setData(data);
		return true;
	}

});
