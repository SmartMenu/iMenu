jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.AppHeader", {
	
	settingsDlg: null,

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
	 * displayed, to bind event handlers and do other one-time initialization.
	 * 
	 * @memberOf view.AppHeader
	 */
	onInit: function() {

	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered (NOT before the first rendering! onInit() is
	 * used for that one!).
	 * 
	 * @memberOf view.AppHeader
	 */
	onBeforeRendering: function() {

	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. This
	 * hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.AppHeader
	 */
	onAfterRendering: function() {
	},
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf view.AppHeader
	 */
// onExit: function() {
//
// }
	onLanguageButtonSelect: function(oEvent) {
		var language = oEvent.getParameters().button.getText();
		localStorage.setItem("com.h3.prj.imenu.language", language);
		var eventBus = sap.ui.getCore().getEventBus();
		var l10nData = null;
		var l10nDeskData = null;
		var l10nMenuData = null;
		switch (language) {
			case "繁":
				l10nData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.i18n").getData().zh_TW;
				l10nDeskData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.desk_zh_TW").getData();
				l10nMenuData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_zh_TW").getData();
				break;
			case "EN":
				l10nData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.i18n").getData().en_US;
				l10nDeskData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.desk_en_US").getData();
				l10nMenuData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_en_US").getData();
				break;
		}
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").setData(l10nData);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nDesk").setData(l10nDeskData);
		sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nMenu").setData(l10nMenuData);
		com.h3.prj.imenu.util.Formatter.setL10nData(l10nData);
		eventBus.publish("com.h3.prj.imenu.view.AppHeader", "languageButtonChanged", language);
	},

	onSettingsButtonPressed: function(event) {
		var appData = jQuery.extend({},sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo").getData());
		if(!this.settingsDlg){
			this.settingsDlg = sap.ui.xmlview("com.h3.prj.imenu.view.Settings");
			this.settingsDlg.byId("settingsDlg").open();
		}else{
			this.settingsDlg.byId("settingsDlg").open();
		}
		this.settingsDlg.data("oldValue", appData);
	}

});
