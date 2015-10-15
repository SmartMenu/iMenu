/*jshint multistr: true */
jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.Login", {

	currentInput: 0,
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
	 * displayed, to bind event handlers and do other one-time initialization.
	 * 
	 * @memberOf view.Login
	 */
	onInit: function() {
		var usernamePanel = this.getView().byId("usernamePanel");
		var passwordPanel = this.getView().byId("passwordPanel");
		var deskPanel = this.getView().byId("deskPanel");

		usernamePanel.addStyleClass("loginInputActive");
		passwordPanel.addStyleClass("loginInputInactive");
		deskPanel.addStyleClass("loginInputInactive");

		this.getView().byId("usernameInput").setValue("");
		this.getView().byId("passwordInput").setValue("");
		this.getView().byId("deskInput").setValue("");
		
		currentInput = 1;
		
		this.loginDeferred = jQuery.Deferred();
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered (NOT before the first rendering! onInit() is
	 * used for that one!).
	 * 
	 * @memberOf view.Login
	 */
	onBeforeRendering: function() {

	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. This
	 * hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.Login
	 */
// onAfterRendering: function() {
//
// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf view.Login
	 */
// onExit: function() {
//
// }
	onResetButtonPressed: function() {
		var usernamePanel = this.getView().byId("usernamePanel");
		var passwordPanel = this.getView().byId("passwordPanel");
		var deskPanel = this.getView().byId("deskPanel");
		this.getView().byId("usernameInput").setValue("");
		this.getView().byId("passwordInput").setValue("");
		this.getView().byId("deskInput").setValue("");

		usernamePanel.removeStyleClass("loginInputInactive");
		usernamePanel.removeStyleClass("loginInputActive");
		usernamePanel.addStyleClass("loginInputActive");

		passwordPanel.removeStyleClass("loginInputActive");
		passwordPanel.removeStyleClass("loginInputInactive");
		passwordPanel.addStyleClass("loginInputInactive");

		deskPanel.removeStyleClass("loginInputActive");
		deskPanel.removeStyleClass("loginInputInactive");
		deskPanel.addStyleClass("loginInputInactive");

		currentInput = 1;
	},

	onOKButtonPressed: function() {
		var usernamePanel = this.getView().byId("usernamePanel");
		var passwordPanel = this.getView().byId("passwordPanel");
		var deskPanel = this.getView().byId("deskPanel");

		var username = this.getView().byId("usernameInput").getValue();
		var password = this.getView().byId("passwordInput").getValue();
		var desk = this.getView().byId("deskInput").getValue();
		
		switch (currentInput) {
			case 1:
				if (username) {
					usernamePanel.removeStyleClass("loginInputInactive");
					usernamePanel.removeStyleClass("loginInputActive");
					usernamePanel.addStyleClass("loginInputInactive");

					passwordPanel.removeStyleClass("loginInputActive");
					passwordPanel.removeStyleClass("loginInputInactive");
					passwordPanel.addStyleClass("loginInputActive");
					currentInput = 2;
				}else{
					var msg = this.getOwnerComponent().getModel("l10n").getData().login.emptyId;
					sap.m.MessageToast.show(msg);
				}
				break;
			case 2:
				passwordPanel.removeStyleClass("loginInputActive");
				passwordPanel.removeStyleClass("loginInputInactive");
				passwordPanel.addStyleClass("loginInputInactive");

				deskPanel.removeStyleClass("loginInputActive");
				deskPanel.removeStyleClass("loginInputInactive");
				deskPanel.addStyleClass("loginInputActive");

				currentInput = 3;
				break;
			case 3:
				var deferred = jQuery.Deferred();
				jQuery.when(this.deferred).then(jQuery.proxy(this.postLogin(desk), this));
				this.login(username, password, desk, deferred);
				break;
		}
	},

	onInputButtonPressed: function(oEvent) {
		var value = oEvent.getSource().getText();
		var input = null;
		switch (currentInput) {
			case 1:
				input = this.getView().byId("usernameInput");
				break;
			case 2:
				input = this.getView().byId("passwordInput");
				break;
			case 3:
				input = this.getView().byId("deskInput");
				break;
		}
		var preValue = input.getValue();
		input.setValue(preValue + value);
	},

	onDeleteButtonPressed: function(oEvent) {
		var input = null;
		switch (currentInput) {
			case 1:
				input = this.getView().byId("usernameInput");
				break;
			case 2:
				input = this.getView().byId("passwordInput");
				break;
			case 3:
				input = this.getView().byId("deskInput");
				break;
		}
		var preValue = input.getValue();
		input.setValue(preValue.substring(0, preValue.length - 1));
	},
	
	login: function(user, pass, desk, deferred){
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		var that = this;
		if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
			jQuery.getJSON(appData.server_url + "/loginByUserPwd?mac=" + appData.device_mac + 
			               "&&shopid=" + appData.shop_id + 
			               "&&userid=" + user +
			               "&&password=" + pass + 
			               "&&callback=?", function(json) {
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					return;
				} else {
					var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData();
					trackingData.user_id = user;
					
					if (desk) {
						that.currentDesk(desk);
						var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
						var appData = appInfoModel.getData();
						if (appData.device_mac && appData.server_url && appData.device_id && appData.shop_id) {
							jQuery.getJSON(appData.server_url + "/getOrder?mac=" + appData.device_mac + 
							               "&&shopid=" + appData.shop_id + 
							               "&&posid=" + appData.device_id +
							               "&&tableid=" + desk + 
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
									                    item_price: price,\
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
											delete swapData[desk].orders[currentData.orderId];
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
									that.onResetButtonPressed();
								}
							});
						}else{
							var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
							sap.m.MessageToast.show(msg);
						}
					} else {
						that.getOwnerComponent().getRouter().navTo("desk");
					}

				}
			});
		}else{
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	},
	
	postLogin: function(desk){
		
		
	}
});
