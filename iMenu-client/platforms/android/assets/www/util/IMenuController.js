jQuery.sap.declare("com.h3.prj.imenu.util.IMenuController");

sap.ui.core.mvc.Controller.extend("com.h3.prj.imenu.util.IMenuController", {

	selectionDlg: null,
	selectionView: null,
	
	selectorDlg: null,
	
	subSelectionDlg: null,
	subSelectionView: null,
	
	tableInfo: null,

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

		var deskInfoData = com.h3.prj.imenu.util.IMenuController.deskInfo;
		var deskInfoStr = JSON.stringify(com.h3.prj.imenu.util.IMenuController.deskInfo);
		console.log(deskInfoStr);
		console.log(deskNo);
		if(deskInfoData[deskNo]){
			console.log(JSON.stringify(deskInfoData[deskNo]));
			current.custCount = deskInfoData[deskNo].open_chairs;
		}

		deskData = trackingData.swap[deskNo];
		current.desk = deskNo;
		current.deskStatus = deskData.status;
		if(!current.custCount){
			current.custCount = 0;
		}
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
				item.parent_type = 2;
				m.id = id;
				m.is_modifier = 1;
				m.item_count = item.item_count;
				m.item_cat_id = item.item_cat_id;
				m.cat_id = item.item_cat_id;
				m["discount-able"] = 1;
				m["tax-able"] = 1;
				m["level-no"] = 1;
				var sub_price = m.price;
				if (sub_price == null) {
					sub_price = 0;
				}
				m.item_price = sub_price;
				m["modifier-value"] = sub_price * m.item_count;
				m.subtype = 2;
				item["modifier-value"] = item["modifier-value"] + m["modifier-value"];
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

	addToCartSetter: function(item, setters, modifiers, selectedSubModifierItems) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current;
		var id = this.nextItemId();
		item.id = id;
		item["modifier-value"] = 0;
		if (!trackingData.cart) {
			trackingData.cart = [];
		}
		var parent_disc_able = item.disc_able;
		var parent_tax_able = null;
		var parent_count = item.item_count;
		if (parent_count == null) {
			parent_count = 1;
		}

		item.parent_type = 4;
		var that = this;
		trackingData.cart.push(item);
		if (modifiers) {
			modifiers.forEach(function(m) {
				var id = that.nextItemId();
				m.id = id;
				m.is_modifier = 1;
				m.item_count = item.item_count;
				m.item_cat_id = item.item_cat_id;
				m.cat_id = item.item_cat_id;
				m["discount-able"] = 1;
				m["tax-able"] = 1;
				m["level-no"] = 1;
				var sub_price = m.price;
				if (sub_price == null) {
					sub_price = 0;
				}
				m.item_price = sub_price;
				m["modifier-value"] = sub_price * m.item_count;
				m.subtype = 2;
				item["modifier-value"] = item["modifier-value"] + m["modifier-value"];
				trackingData.cart.push(m);
			});
		}
		if (setters) {
			setters.forEach(function(m) {
				var id = that.nextItemId();
				m.id = id;
				m.is_modifier = 0;
				m.parent_count = parent_count;
				m.item_count = m.count * parent_count;
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
				m.subtype = 4;
				
				var subM_total = 0;
				var subM_all = [];
				if (selectedSubModifierItems && selectedSubModifierItems[m.item_id]){
					console.log("this item have sub modifiers");
					var subModifiers = selectedSubModifierItems[m.item_id];
					if ( subModifiers.length && subModifiers.length >0 ){
						console.log("sub modifier size is: " + subModifiers.length);
						subModifiers.forEach(function(subM) {
							var subM_id = that.nextItemId();
							subM.id = subM_id;
							subM.is_modifier = 1;
							subM.is_sub_modifier = true;
							subM.item_count = item.item_count;
							subM.item_cat_id = item.item_cat_id;
							subM.cat_id = item.item_cat_id;
							subM["discount-able"] = 1;
							subM["tax-able"] = 1;
							subM["level-no"] = 2;
							var subM_price = subM.price;
							if (subM_price == null) {
								subM_price = 0;
							}
							subM.item_price = subM_price;
							subM["modifier-value"] = subM_price;
							subM.subtype = 2;
							subM.parent_cart_id = id;
							subM_total = subM_total + subM["modifier-value"];
							subM_all.push(subM);
							var subMStr = JSON.stringify(subM);
							console.log(subMStr);
						});
					}
				}

				m["modifier-value"] = (sub_price + subM_total) * m.item_count;
				trackingData.cart.push(m);
				var setterItemStr = JSON.stringify(m);
				console.log(setterItemStr);
				
				subM_all.forEach(function(subM) {
					trackingData.cart.push(subM);
				});
				
				item["modifier-value"] = item["modifier-value"] + m["modifier-value"];
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
			jQuery.post(appData.server_url + "/action" + cmd + "?mac=" + appData.device_mac + "&&callback=?", {
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

					if (modifierItems != null && modifierItems[0] != null){
						item.item_name = modifierItems[0].item_name;
					} else if (setterItems != null && setterItems[0] != null){
						item.item_name = setterItems[0].item_name;
					}
					item.sub_total = item.item_price * item.item_count;
				}

			});
		}
		var order = trackingData.order;
		if (order) {
			console.log("order size is: " + order.length);
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
					if (modifierItems != null && modifierItems[0] != null) {
						item.item_name = modifierItems[0].item_name;
					} else if (setterItems != null && setterItems[0] != null) {
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
		orderData.order["cover"] = currentData.custCount;
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
			var itemString = JSON.stringify(item);
			console.log("item-before: "  + itemString);
			if (2 == item.subtype || 4 == item.subtype) {
				detail["cat-id"] = item.cat_id;
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = item.is_modifier;
				if (2 == item.subtype && item.is_sub_modifier ) {
					detail["link-row"] = last_setter_item_seq;
				} else {
					detail["link-row"] = pre_seq;
				}
				if (4 == item.subtype) {
					last_setter_item_seq = seq;
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
				detail["discount-able"] = item.disc_able;
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
		orderData.order["cover"] = currentData.custCount;
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
		var last_setter_item_seq = null;
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
			var itemString = JSON.stringify(item);
			console.log("item-before: "  + itemString);
			if (2 == item.subtype || 4 == item.subtype) {
				detail["cat-id"] = item.cat_id;
				detail["modifier-value"] = item["modifier-value"];
				detail["is-modifier"] = item.is_modifier;
				if (2 == item.subtype && item.is_sub_modifier ) {
					detail["link-row"] = last_setter_item_seq;
				} else {
					detail["link-row"] = pre_seq;
				}
				if (4 == item.subtype) {
					last_setter_item_seq = seq;
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
				detail["discount-able"] = item.disc_able;
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
	
	performMenuItemAccept: function(menuItemController, itemData, updateUICallBack){
		var itemString = JSON.stringify(itemData);
		console.log("->performMenuItemAccept: " + itemString);
		
		var view = menuItemController.getView();
		var item_id = view.data("item_id");
		if (!item_id){
			item_id = itemData.item_id;
		}
		var item_name = itemData.item_name;
		var is_sub_modifier = itemData.item_has_modifier;
		var dialogName = "";
		var label_setter = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().label_setter;
		var label_modifier = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().label_modifier;
		var label_group_prefix = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().modifier_group_prefix;
		
		if(item_id){
			var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[item_id];
			var setterData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter").getData()[item_id];
			if ( is_sub_modifier && modifierData) {
				dialogName = label_group_prefix + itemData.parent_dialog_name + "->" + item_name;
				this.prepareSetterDlg(itemData, null, modifierData, dialogName, true, item_id, updateUICallBack);
			} else if (setterData) {
				dialogName = label_setter + item_name;
				this.prepareSetterDlg(itemData, setterData, modifierData, dialogName);
			} else if (modifierData) {
				dialogName = label_modifier + item_name;
				this.prepareModifierDlg(itemData, modifierData, dialogName);
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

	prepareSetterDlg: function(itemData, setterData, modifierData, dialogName, isSubItem, parent_id, updateUICallBack) {
		var setterView = sap.ui.xmlview("com.h3.prj.imenu.view.Setter");
		setterView.setModel(sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n"), "l10n");
		
		var setterScrollContainer = setterView.byId("setterContainer");
		var setterContainer = new sap.ui.layout.Grid({
			defaultSpan: "L12 M12 S12"
		});
		setterScrollContainer.addContent(setterContainer);
		var selectedSetterItems = [];
		var selectedModifierItems = [];
		var selectedSubModifierItems = {};

		if (modifierData) {
			modifierData.forEach(function(modifierGroupData) {
				var item_required = false;
				var item_selected = false;
				var item_change_size = false;
				modifierGroupData.labelMsg = com.h3.prj.imenu.util.Formatter.modifierGroupLabel(modifierGroupData);
				var modifierGroup = sap.ui.xmlview("com.h3.prj.imenu.view.SetterGroup");
				var modifierGroupModel = new sap.ui.model.json.JSONModel(modifierGroupData);
				modifierGroup.setModel(modifierGroupModel,"group");
				setterContainer.addContent(modifierGroup);
				
				if ( modifierGroupData.details ) {
					modifierGroupData.details.forEach(function(modifierItemData) {

						var modifierItemStr = JSON.stringify(modifierItemData);
						console.log(modifierItemStr);
						modifierItemData.count = 1;
						modifierItemData.item_required = item_required;
						modifierItemData.item_selected = item_selected;
						modifierItemData.item_change_size = item_change_size;
						modifierItemData.item_has_modifier = false;
						var itemViewID = "";
						if (isSubItem) {
							modifierItemData.isSubItem = true;
							modifierItemData.parent_id = parent_id;
							itemViewID = "setteritem_sub_m_" + modifierGroupData.modifier_id + "_" + modifierItemData.item_id;
						}
						if (modifierItemData.price == null) {
							modifierItemData.price = 0;
							itemViewID = "setteritem_m_" + modifierGroupData.modifier_id + "_" + modifierItemData.item_id;
						}
						modifierItemData.itemViewID = itemViewID;
						var modifierItem = sap.ui.xmlview("com.h3.prj.imenu.view.SetterItem");
						modifierItem.id = itemViewID;
						var modifierItemModel = new sap.ui.model.json.JSONModel(modifierItemData);
						modifierItem.setModel(modifierItemModel,"item");
						modifierItem.data("selectedSetterItems", selectedSetterItems);
						modifierItem.data("selectedModifierItems", selectedModifierItems);
						modifierItem.data("selectedSubModifierItems", selectedSubModifierItems);
						setterContainer.addContent(modifierItem);
					});
				}
			});
		}
		
		if (setterData) {
			setterData.forEach(function(setterGroupData) {
				var item_required = false;
				var item_selected = false;
				var item_change_size = true;
				var select_all = setterGroupData.select_all;
				if(select_all == 1){
					item_required = true;
					item_selected = true;
					item_change_size = false;
				}
				setterGroupData.labelMsg = com.h3.prj.imenu.util.Formatter.setterGroupLabel(setterGroupData);
				var setterGroup = sap.ui.xmlview("com.h3.prj.imenu.view.SetterGroup");
				var setterGroupModel = new sap.ui.model.json.JSONModel(setterGroupData);
				setterGroup.setModel(setterGroupModel,"group");
				setterContainer.addContent(setterGroup);
				setterGroupData.details.forEach(function(setterItemData) {

					var setterItemStr = JSON.stringify(setterItemData);
					console.log(setterItemStr);
					
					var item_has_modifier = false;
					var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[setterItemData.item_id];
					
					if (modifierData) {
						item_has_modifier = true;
						setterItemData.parent_dialog_name = dialogName;
					}
					
					setterItemData.count = 1;
					setterItemData.item_required = item_required;
					setterItemData.item_selected = item_selected;
					setterItemData.item_change_size = item_change_size;
					setterItemData.item_has_modifier = item_has_modifier;
					if(setterItemData.price == null) {
						setterItemData.price = 0;
					}
					var itemViewID = "";
					itemViewID = "setteritem_s_" + setterGroupData.lookup_id + "_" + setterGroupData.item_id;
					setterItemData.itemViewID = itemViewID;
					var setterItem = sap.ui.xmlview("com.h3.prj.imenu.view.SetterItem");
					setterItem.id = itemViewID;
					var setterItemModel = new sap.ui.model.json.JSONModel(setterItemData);
					setterItem.setModel(setterItemModel,"item");
					if (setterItemData.item_required == true) {
						selectedSetterItems.push(setterItemData);
					}
					setterItem.data("selectedSetterItems", selectedSetterItems);
					setterItem.data("selectedModifierItems", selectedModifierItems);
					setterItem.data("selectedSubModifierItems", selectedSubModifierItems);
					setterContainer.addContent(setterItem);
				});
			});
			
		}
		this.createSelectionDlg(itemData, dialogName, setterView, selectedSetterItems, selectedModifierItems, selectedSubModifierItems, isSubItem, updateUICallBack).open();
	},
	
	updateSelectedItems: function(itemData, selectedSetterItems, selectedModifierItems, selectedSubModifierItems){

		if (itemData == null) {
			return;
		}
		var itemType = itemData.subtype;
		var isSubItem = itemData.isSubItem;
		
		if (itemType == 4) {
			console.log("-> Enter updateSelectedSetterItems");
			this.updateSelectedSetterItems(itemData,selectedSetterItems);
		} else if (itemType == 2 && !isSubItem) {
			console.log("-> Enter updateSelectedModifierItems");
			this.updateSelectedModifierItems(itemData,selectedModifierItems);
		} else if (itemType == 2 && isSubItem) {
			console.log("-> Enter updateSelectedSubModifierItems");
			this.updateSelectedSubModifierItems(itemData,selectedSubModifierItems);
		}
		
	},
	
	updateSelectedSubModifierItems: function(itemData, selectedSubModifierItems) {
		
		var currentItemID = itemData.item_id;
		var currentItemCount = itemData.count;
		var isCurrentSelected = itemData.item_selected;
		var parentID = itemData.parent_id;
		if (currentItemID == null || currentItemID == ""){
			return;
		}
		if (currentItemCount == null || currentItemCount < 1){
			return;
		}
		if (isCurrentSelected == null){
			return;
		}
		if (parentID == null){
			return;
		}
		
		console.log("-> itemData is valid");
		
		var currentItemSelectedList = selectedSubModifierItems[parentID];
		
		if (currentItemSelectedList == null) {
			console.log("-> currentItemSelectedList is inValid, create one.");
			currentItemSelectedList = [];
			selectedSubModifierItems[parentID] = currentItemSelectedList;
		}
		
		console.log("-> currentItemSelectedList is valid, and size is: " + currentItemSelectedList.length);

		var existingSelectedItem = null;
		var existingSelectedItemIndex = null;
			
		for ( var i in currentItemSelectedList) {
			if (currentItemSelectedList[i].item_id === currentItemID) {
				existingSelectedItem = currentItemSelectedList[i];
				existingSelectedItemIndex = i;
				break;
			}
		}
			
		if (existingSelectedItem == null && !isCurrentSelected) {
			console.log("-> Do nothing");
		}
			
		if (existingSelectedItem == null && isCurrentSelected) {
			console.log("-> Add it");
			currentItemSelectedList.push(itemData);
		}
			
		if (existingSelectedItem != null && !isCurrentSelected) {
			console.log("-> Remove it");
			currentItemSelectedList.splice(existingSelectedItemIndex, 1);
		}
			
		if (existingSelectedItem != null && isCurrentSelected) {
			console.log("-> Update it");
			currentItemSelectedList = itemData;
		}
		
	},
	
	updateSelectedModifierItems: function(itemData, selectedModifierItems) {
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
		
		console.log("-> itemData is valid and selectedModifierItems size is: " + selectedModifierItems.length);

		var existingSelectedItem = null;
		var existingSelectedItemIndex = null;
			
		for ( var i in selectedModifierItems) {
			if (selectedModifierItems[i].item_id === currentItemID) {
				existingSelectedItem = selectedModifierItems[i];
				existingSelectedItemIndex = i;
				break;
			}
		}
			
		if (existingSelectedItem == null && !isCurrentSelected) {
			console.log("-> Do nothing");
		}
			
		if (existingSelectedItem == null && isCurrentSelected) {
			console.log("-> Add it");
			selectedModifierItems.push(itemData);
		}
			
		if (existingSelectedItem != null && !isCurrentSelected) {
			console.log("-> Remove it");
			selectedModifierItems.splice(existingSelectedItemIndex, 1);
		}
			
		if (existingSelectedItem != null && isCurrentSelected) {
			console.log("-> Update it");
			selectedModifierItems = itemData;
		}
	},
	
	updateSelectedSetterItems: function(itemData, selectedSetterItems) {
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
	
	prepareModifierDlg: function(itemData, modifierData, dialogName) {
		var selectionView = sap.ui.xmlview("com.h3.prj.imenu.view.Modifier");
		selectionView.setModel(sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n"), "l10n");
		selectionView.setModel(new sap.ui.model.json.JSONModel(modifierData), "modifiers");
		var selectedModifiers = [];
		var modifierIconTab = selectionView.byId("modifierIconTab");
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
		this.createSelectionDlg(itemData, dialogName, selectionView, selectedModifiers).open();
	},

	createSelectionDlg: function(itemData, dialogName, innerView, selectedSetterItems, selectedModifierItems, selectedSubModifierItems, isSubItem, updateUICallBack) {
		
		var addToChart = this.doAddToCart;
		var addToSelectedSubModifierItems = this.doAddToSelectedSubModifierItems;
		var cleanSelectedSubModifierItems = this.cleanSelectedSubModifierItems;
		var that = this;
		var dlg;
		if (isSubItem) {
			if (!com.h3.prj.imenu.util.IMenuController.subSelectionDlg) {
				dlg = new sap.m.Dialog("subSelectionDlg", {
					contentHeight: "100%",
					contentWidth: "100%",
					showHeader: false,
					content: [
						innerView
					]
				});
				var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
				dlg.setModel(l10n, "l10n");
				com.h3.prj.imenu.util.IMenuController.subSelectionDlg = dlg;
			} else {
				dlg = com.h3.prj.imenu.util.IMenuController.subSelectionDlg;
				dlg.removeAllButtons();
				dlg.removeAllContent();
				dlg.addContent(innerView);
			}
		} else {
			if (!com.h3.prj.imenu.util.IMenuController.selectionDlg) {
				dlg = new sap.m.Dialog("selectionDlg", {
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
		}
		var nameLabel = new sap.m.Label({
			design: "Bold",
			text: dialogName,
			textAlign: "Begin",
			width: "18em"
		});
		var spacer = new sap.m.ToolbarSpacer();
		
		var buttonWidth = "6em";

		var closeButton = null;
		if (isSubItem) {
			closeButton = new sap.m.Button({
				text: "{l10n>/cart/close}",
				width: buttonWidth,
				type: "Reject",
				press: function() {
					cleanSelectedSubModifierItems(itemData, that, selectedSubModifierItems);
					dlg.close();
				}
			});
		} else {
			closeButton = new sap.m.Button({
				text: "{l10n>/cart/close}",
				width: buttonWidth,
				type: "Reject",
				press: function() {
					dlg.close();
				}
			});
		}
		var okButton = null;
		
		if (isSubItem) {
			okButton = new sap.m.Button({
				text: "{l10n>/ok}",
				width: buttonWidth,
				type: "Accept",
				press: function() {
					var result = addToSelectedSubModifierItems(itemData, that, selectedSubModifierItems, updateUICallBack);
					if (result) {
						dlg.close();
					}
				}
			});
		} else {
			okButton = new sap.m.Button({
				text: "{l10n>/ok}",
				width: buttonWidth,
				type: "Accept",
				press: function() {
					var result = addToChart(that, itemData, selectedSetterItems, selectedModifierItems, selectedSubModifierItems);
					if (result) {
						dlg.close();
					}
				}
			});
		}
		
		dlg.addButton(nameLabel);
		dlg.addButton(spacer);
		dlg.addButton(closeButton);
		dlg.addButton(okButton);
		dlg.setInitialFocus(okButton);
		return dlg;
	},
	
	cleanSelectedSubModifierItems: function(itemData, that, allSubModifierItems) {
		console.log("-> Enter cleanSelectedSubModifierItems");

		var item_id = itemData.item_id;
		
		if (item_id == null || allSubModifierItems == null) {
			return;
		}
		console.log("-> input paramter is valid");
		
		if ( allSubModifierItems[item_id] ) {
			allSubModifierItems[item_id] = null;
		}
	},
	
	doAddToSelectedSubModifierItems: function(itemData, that, allSubModifierItems, updateUICallBack) {
		console.log("-> Enter doAddToSelectedSubModifierItems");

		var item_id = itemData.item_id;
		
		if (item_id == null || allSubModifierItems == null) {
			return false;
		}
		console.log("-> input paramter is valid");
		
		var selectedSubModifierItems = allSubModifierItems[item_id];
		
		if ( selectedSubModifierItems == null) {
			return false;
		}
		console.log("-> selectedSubModifierItems is valid");

		var errorModifierGroupNames = [];
		var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[item_id];
		
		if (selectedSubModifierItems && modifierData) {
			modifierData.forEach(function(modifierGroupData) {
				console.log("-> checking modifierGroupData: " + modifierGroupData.modifier_id);
				var min_count = modifierGroupData.min_count;
				var max_count = modifierGroupData.max_count;
				var group_name = modifierGroupData.modifier_name;
				if ( max_count && max_count > 0 ) {
					console.log("limitation is: " + min_count + "-" + max_count);
					var group_counting = 0;
					modifierGroupData.details.forEach(function(modifierItemData) {
						var modifier_item_id = modifierItemData.item_id;
						console.log("-> checking modifier_item_id: " + modifier_item_id);
						var selectedItems = jmespath.search(selectedSubModifierItems, "[?item_id=='" + modifier_item_id + "']");
						console.log("-> selectedItems size is: " + selectedItems.length);
						if(selectedItems != null && selectedItems.length > 0) {
							var modifier_item_count = selectedItems[0].count;
							if (modifier_item_count != null) {
								console.log("-> setter_item_count is: " + modifier_item_count);
								group_counting = group_counting + modifier_item_count;
							}
						}
					});

					if(group_counting < min_count || group_counting > max_count) {
						errorModifierGroupNames.push(group_name);
					}
				} else {
					console.log("no limitation ");
				}
			});
		}
		
		if(errorModifierGroupNames.length > 0){
			var modifierGroupError = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().modifier_group_error;
			modifierGroupError += errorModifierGroupNames[0];
			for (var i = 1, len = errorModifierGroupNames.length; i < len; i += 1) {
				modifierGroupError += ", " + errorModifierGroupNames[i];
			}
			sap.m.MessageToast.show(modifierGroupError);
			return false;
		}

		var has_sub_modifier_selected = false;
		if (selectedSubModifierItems && selectedSubModifierItems.length > 0) {
			has_sub_modifier_selected = true;
		}
		
		var sub_modifier_selected_string = "";
		
		selectedSubModifierItems.forEach(function(subItem) {
			var subItemName = subItem.item_name;
			if (sub_modifier_selected_string == "") {
				sub_modifier_selected_string = subItemName;
			} else {
				sub_modifier_selected_string += ", " + subItemName;
			}
		});
		
		itemData.has_sub_modifier_selected = has_sub_modifier_selected;
		itemData.sub_modifier_selected_string = sub_modifier_selected_string;
		
		updateUICallBack(itemData, selectedSubModifierItems);
		
		return true;
	},

	doAddToCart: function(that, itemData, subSelections, selectedModifierItems, selectedSubModifierItems) {
		
		//If the item contains parent modifier, subSelection is a modifier list
		//If the item contains parent setter, subSelections, selectedModifierItems, selectedSubModifierItems contain different items
		
		var view = that.getView();
		var item_id = view.data("item_id");
		var item_cat_id = view.data("item_cat");
		var itemData = view.getModel("item").getData();
		var item_count = view.getModel().getData().count;
		var item_price = itemData.price;
		var cat_id = itemData.cat_id;
		var subtype = itemData.subtype;
		var disc_able = itemData.disc_able;
		
		var setterData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nSetter").getData()[item_id];
		if (setterData) {
			console.log("-> This is a setter");
			
			var errorSetterGroupNames = [];
			var errorModifierGroupNames = [];
			
			var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[item_id];
			
			if (selectedModifierItems && modifierData) {
				modifierData.forEach(function(modifierGroupData) {
					console.log("-> checking modifierGroupData: " + modifierGroupData.modifier_id);
					var min_count = modifierGroupData.min_count;
					var max_count = modifierGroupData.max_count;
					var group_name = modifierGroupData.modifier_name;
					if ( max_count && max_count > 0 ) {
						console.log("limitation is: " + min_count + "-" + max_count);
						var group_counting = 0;
						modifierGroupData.details.forEach(function(modifierItemData) {
							var modifier_item_id = modifierItemData.item_id;
							console.log("-> checking modifier_item_id: " + modifier_item_id);
							var selectedItems = jmespath.search(selectedModifierItems, "[?item_id=='" + modifier_item_id + "']");
							console.log("-> selectedItems size is: " + selectedItems.length);
							if(selectedItems != null && selectedItems.length > 0) {
								var modifier_item_count = selectedItems[0].count;
								if (modifier_item_count != null) {
									console.log("-> setter_item_count is: " + modifier_item_count);
									group_counting = group_counting + modifier_item_count;
								}
							}
						});

						if(group_counting < min_count || group_counting > max_count) {
							errorModifierGroupNames.push(group_name);
						}
					} else {
						console.log("no limitation ");
					}
				});
			}
			
			setterData.forEach(function(setterGroupData) {
				var select_all = setterGroupData.select_all;
				var min_count = setterGroupData.min_count;
				var group_name = setterGroupData.lookup_name;
				if(select_all != 1){
					console.log("-> checking setterGroupData: " + setterGroupData.lookup_id);
					var group_counting = 0;
					setterGroupData.details.forEach(function(setterItemData) {
						var setter_item_id = setterItemData.item_id;
						console.log("-> checking setter_item_id: " + setter_item_id);
						var selectedItems = jmespath.search(subSelections, "[?item_id=='" +  setter_item_id + "']");
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
			
			if(errorModifierGroupNames.length > 0){
				var modifierGroupError = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().modifier_group_error;
				modifierGroupError += errorModifierGroupNames[0];
				for (var i = 1, len = errorModifierGroupNames.length; i < len; i += 1) {
					modifierGroupError += ", " + errorModifierGroupNames[i];
				}
				sap.m.MessageToast.show(modifierGroupError);
				return false;
			}
			
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
				"item_price": item_price,
				"disc_able": disc_able
			}, subSelections, selectedModifierItems, selectedSubModifierItems);
		} else {
			console.log("-> This is a modifier");
			that.addToCart({
				"cat_id": cat_id,
				"item_id": item_id,
				"item_cat_id": item_cat_id,
				"item_count": item_count,
				"subtype": subtype,
				"item_price": item_price,
				"disc_able": disc_able
			}, subSelections);
		}

		var data = view.getModel().getData();
		data.count = 1;
		view.getModel().setData(data);
		return true;
	}

});
