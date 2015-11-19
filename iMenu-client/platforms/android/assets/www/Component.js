jQuery.sap.declare("com.h3.prj.imenu.Component");
jQuery.sap.require("com.h3.prj.imenu.Router");
jQuery.sap.require("com.h3.prj.imenu.util.Formatter");
jQuery.sap.require("com.h3.prj.imenu.util.ControllerFinder");

sap.ui.core.UIComponent.extend("com.h3.prj.imenu.Component", {
	metadata: {
		name: "com.h3.prj.imenu",
		version: "1.0",
		includes: [],
		dependencies: {
			libs: [
				"sap.m", "sap.ui.layout"
			],
			components: []
		},
		rootView: "com.h3.prj.imenu.view.IMenuApp",
		routing: {
			config: {
				routerClass: com.h3.prj.imenu.Router,
				viewType: "XML",
				viewPath: "com.h3.prj.imenu.view",
				clearTarget: false
			},
			routes: [
				{
					name: "login",
					pattern: "",
					view: "Login",
					targetAggregation: "pages",
					targetControl: "IMenuApp"
				}, {
					name: "desk",
					pattern: "desk",
					view: "Desk",
					targetAggregation: "pages",
					targetControl: "IMenuApp"
				}, {
					name: "menuBrowser",
					pattern: "browse",
					view: "MenuBrowser",
					targetAggregation: "pages",
					targetControl: "IMenuApp",
				}, {
					name: "cartTest",
					pattern: "cartTest",
					view: "CartTest",
					targetAggregation: "pages",
					targetControl: "IMenuApp"
				}
			]
		}
	},

	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var i18nModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.i18n");
		var l10nModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		var appInfoModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		var desk_en_US_Model = sap.ui.getCore().getModel("com.h3.prj.imenu.model.desk_en_US");
		var desk_zh_TW_Model = sap.ui.getCore().getModel("com.h3.prj.imenu.model.desk_zh_TW");
		var l10nDeskModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nDesk");
		var menu_zh_TW = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_zh_TW");
		var menu_en_US = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_en_US");
		var l10nMenuModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nMenu");
		var categoryModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_categories");
		var trackingModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking");

		this.setModel(i18nModel, "i18n");
		this.setModel(l10nModel, "l10n");
		this.setModel(appInfoModel, "app");
		this.setModel(desk_en_US_Model, "desk_en_US");
		this.setModel(desk_zh_TW_Model, "desk_zh_TW");
		this.setModel(l10nDeskModel, "desk");
		this.setModel(menu_zh_TW, "menu_zh_TW");
		this.setModel(menu_en_US, "menu_en_US");
		this.setModel(l10nMenuModel, "l10nMenu");
		this.setModel(categoryModel, "categories");
		this.setModel(trackingModel, "tracking");

		this.getRouter().initialize();

		var eventBus = sap.ui.getCore().getEventBus();
		eventBus.subscribe("com.h3.prj.imenu.view.AppHeader", "languageButtonChanged", this.onLanguageChanged, this);
	},

	onLanguageChanged: function(channel, event, language) {
		this.getEventBus().publish("com.h3.prj.imenu.Component", "languageChanged", language);
	}

});
