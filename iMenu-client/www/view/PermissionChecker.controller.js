jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.PermissionChecker", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
	 * displayed, to bind event handlers and do other one-time initialization.
	 * 
	 * @memberOf view.PermissionChecker
	 */
	onInit: function() {
		var l10nModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		this.getView().setModel(l10nModel, "l10n");

		var usernamePanel = this.getView().byId("usernamePanel");
		var passwordPanel = this.getView().byId("passwordPanel");

		usernamePanel.addStyleClass("loginInputActive");
		passwordPanel.addStyleClass("loginInputInactive");

		this.getView().byId("usernameInput").setValue("");
		this.getView().byId("passwordInput").setValue("");

		currentInput = 1;
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered (NOT before the first rendering! onInit() is
	 * used for that one!).
	 * 
	 * @memberOf view.PermissionChecker
	 */
// onBeforeRendering: function() {
//
// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. This
	 * hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.PermissionChecker
	 */
// onAfterRendering: function() {
//
// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf view.PermissionChecker
	 */
// onExit: function() {
//
// }
	onResetButtonPressed: function() {
		var usernamePanel = this.getView().byId("usernamePanel");
		var passwordPanel = this.getView().byId("passwordPanel");

		this.getView().byId("usernameInput").setValue("");
		this.getView().byId("passwordInput").setValue("");

		usernamePanel.removeStyleClass("loginInputInactive");
		usernamePanel.removeStyleClass("loginInputActive");
		usernamePanel.addStyleClass("loginInputActive");

		passwordPanel.removeStyleClass("loginInputActive");
		passwordPanel.removeStyleClass("loginInputInactive");
		passwordPanel.addStyleClass("loginInputInactive");

		currentInput = 1;
	},

	onOKButtonPressed: function() {
		var usernamePanel = this.getView().byId("usernamePanel");
		var passwordPanel = this.getView().byId("passwordPanel");

		var username = this.getView().byId("usernameInput").getValue();
		var password = this.getView().byId("passwordInput").getValue();

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
				} else {
					var msg = this.getOwnerComponent().getModel("l10n").getData().login.emptyId;
					sap.m.MessageToast.show(msg);
				}
				break;
			case 2:
				passwordPanel.removeStyleClass("loginInputActive");
				passwordPanel.removeStyleClass("loginInputInactive");
				passwordPanel.addStyleClass("loginInputInactive");

				this.login(username, password, this.getView().getParent().closeDeferred);
				break;
		}
	},
	
	onCancelButtonPressed: function(){
		this.getView().getParent().close();
		this.onResetButtonPressed();
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
		}
		var preValue = input.getValue();
		input.setValue(preValue.substring(0, preValue.length - 1));
	},

	login: function(user, pass, deferred) {
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var appData = appInfoModel.getData();
		var that = this;
		if (appData.device_mac && appData.server_url) {
			jQuery.getJSON(appData.server_url + "/loginByUserPwd?mac=" + appData.device_mac + "&&shopid=" + appData.shop_id + "&&userid=" + user + "&&password=" + pass + "&&callback=?", function(json) {
				if (json.status == 1) {
					sap.m.MessageToast.show(json.msg);
					if(deferred.check){
						deferred.check.result = false;
					}
					return;
				} else {
					if(deferred.check){
						deferred.check.result = true;
					}
					that.getView().getParent().close();
					that.onResetButtonPressed();
					deferred.resolve();
				}
			});
		} else {
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().settings.wrong_settings;
			sap.m.MessageToast.show(msg);
		}
	},

});
