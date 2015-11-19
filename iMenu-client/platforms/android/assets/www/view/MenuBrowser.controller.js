jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.MenuBrowser", {

	menuItemModels: {},
	orderDlg: null,
	menuItemViews: {},

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
	 * displayed, to bind event handlers and do other one-time initialization.
	 * 
	 * @memberOf view.MenuBrowser
	 */
	onInit: function() {
		var trackingModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking");
		this.getView().setModel(trackingModel, "tracking");

		var menuData = this.getOwnerComponent().getModel("l10nMenu").getData();
		var categorySelected = jmespath.search(menuData, "[0]");
		this.updateSelectedCategoryView(categorySelected.cat_id, menuData);

		var categoryFilter = this.getView().byId("categoryFilter");
		categoryFilter.attachEventOnce("updateFinished", function() {
			var items = categoryFilter.getItems();
			categoryFilter.setSelectedItem(items[0]);
		});

		this.permissionCheckDlg = new sap.m.Dialog("permissionCheckDlg", {
			contentHeight: "100%",
			contentWidth: "100%",
			showHeader: false,
			content: sap.ui.xmlview("com.h3.prj.imenu.view.PermissionChecker")
		});

		this.orderDlg = new sap.m.Dialog("orderDlg", {
			contentHeight: "100%",
			contentWidth: "100%",
			showHeader: false,
			content: this.createOrderDlgContent()
		});
		
		this.orderDlg.addStyleClass("allBgColor");
		
		var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		this.orderDlg.setModel(l10n, "l10n");
		this.orderDlg.setModel(trackingModel, "tracking");

		//this.orderDlg.attachAfterOpen(this.afterOrderDlgOpen(this.orderDlg));
		var buttons = this.createOrderDlgButtons(this.orderDlg);
		var orderDlg = this.orderDlg;
		buttons.forEach(function(btn) {
			orderDlg.addButton(btn);
		});

		this.getEventBus().subscribe("com.h3.prj.imenu.Component", "languageChanged", this.onLanguageChanged, this);

	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered (NOT before the first rendering! onInit() is
	 * used for that one!).
	 * 
	 * @memberOf view.MenuBrowser
	 */
// onBeforeRendering: function() {
// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. This
	 * hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.MenuBrowser
	 */
// onAfterRendering: function() {
// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf view.MenuBrowser
	 */
// onExit: function() {
//
// }
	onLanguageChanged: function(channel, event, language) {
		var menuData = this.getOwnerComponent().getModel("l10nMenu").getData();
		var categories = jmespath.search(menuData, "[].{cat_id: cat_id, cat_name: cat_name}");
		this.getOwnerComponent().getModel("categories").setData(categories);

		var categoryFilter = this.getView().byId("categoryFilter");
		categoryFilter.attachEventOnce("updateFinished", function() {
			var items = categoryFilter.getItems();
			for ( var i in items) {
				items[i].data("key", categories[i].cat_id);
			}
		});

		jmespath.search(menuData, "[*].items[]").forEach(function(itemData) {
			sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_item_" + itemData.item_id).setData(itemData);
		});

	},

	onCategorySelect: function(event) {
		var func = this.doCategorySelect;
		var source = event.getSource();
		var timeout = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo").getData().time_out;
		setTimeout(function() {
			func(source);
		}, timeout);
	},

	doCategorySelect: function(source) {
		var cat_id = source.getSelectedItem().data("key");
		var that = com.h3.prj.imenu.util.ControllerFinder.find(source, "com.h3.prj.imenu.view.MenuBrowser");
		var menuData = that.getOwnerComponent().getModel("l10nMenu").getData();
		that.updateSelectedCategoryView(cat_id, menuData);
	},

	updateSelectedCategoryView: function(cat_id, menuData) {
		var categoryDetails = this.getView().byId("categoryDetails");
		var menuId = "category-" + cat_id;
		var menu = categoryDetails.getPage(menuId);
		if (!menu) {
			var categorySelected = jmespath.search(menuData, "[?cat_id=='" + cat_id + "']")[0];
			switch (categorySelected.pic_type) {
				case 1:
					menu = sap.ui.xmlview(menuId, "com.h3.prj.imenu.view.Menu1");
					for ( var i in categorySelected.items) {
						var menu1Item = sap.ui.xmlview("com.h3.prj.imenu.view.Menu1Item");
						var menu1ItemModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_item_" + categorySelected.items[i].item_id);
						menu1Item.setModel(menu1ItemModel, "item");
						menu1Item.data("item_id", categorySelected.items[i].item_id);
						menu1Item.data("item_cat", cat_id);
						menu.byId("menu1Grid").addContent(menu1Item);
					}
					break;
				case 2:
					menu = sap.ui.xmlview(menuId, "com.h3.prj.imenu.view.Menu2");
					for ( var j in categorySelected.items) {
						var menu2Item = sap.ui.xmlview("com.h3.prj.imenu.view.Menu2Item");
						var menu2ItemModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_item_" + categorySelected.items[j].item_id);
						menu2Item.setModel(menu2ItemModel, "item");
						menu2Item.data("item_id", categorySelected.items[j].item_id);
						menu2Item.data("item_cat", cat_id);
						menu.byId("menu2Grid").addContent(menu2Item);
					}
					break;
				case 3:
					menu = sap.ui.xmlview(menuId, "com.h3.prj.imenu.view.Menu3");
					for ( var k in categorySelected.items) {
						var menu3Item = sap.ui.xmlview("com.h3.prj.imenu.view.Menu3Item");
						var menu3ItemModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_item_" + categorySelected.items[k].item_id);
						menu3Item.setModel(menu3ItemModel, "item");
						menu3Item.data("item_id", categorySelected.items[k].item_id);
						menu3Item.data("item_cat", cat_id);
						menu.byId("menu3Carousel").addPage(menu3Item);
					}
					break;
				case 4:
					menu = sap.ui.xmlview(menuId, "com.h3.prj.imenu.view.Menu4");
					for ( var m in categorySelected.items) {
						var menu4Item = sap.ui.xmlview("com.h3.prj.imenu.view.Menu4Item");
						var menu4ItemModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.menu_item_" + categorySelected.items[m].item_id);
						menu4Item.setModel(menu4ItemModel, "item");
						menu4Item.data("item_id", categorySelected.items[m].item_id);
						menu4Item.data("item_cat", cat_id);
						menu.byId("menu4Grid").addContent(menu4Item);
					}
					break;
			}
			categoryDetails.addPage(menu);
		}
		categoryDetails.to(menuId);

	},

	onPendingOrderButtonPressed: function(event) {
		var iconTab = this.orderDlg.getContent()[0].byId("orderIconTab");
		iconTab.setSelectedKey("pendingOrder");
		this.preShowCart();
		this.orderDlg.open();
	},

	createOrderDlgContent: function(orderDlg) {
		var controls = [];
		var cartTableView = sap.ui.xmlview("com.h3.prj.imenu.view.CartTable");
		controls.push(cartTableView);
		return controls;
	},

	createOrderDlgButtons: function(orderDlg) {
		var closeDlgClosure = this.dialogCloser(this.orderDlg);
		var printOrderClosure = this.orderPrinter(this.permissionCheckDlg, this, orderDlg);
		var placeOrderClosure = this.orderPlacer(this.permissionCheckDlg, this, orderDlg);

		var buttons = [];
		var menuBtn = new sap.m.Button({
			icon: "sap-icon://menu2"
		});
		var totalBtn = new sap.m.Button({
			text: "{l10n>/cart/total}",
			type: "Emphasized",
		});
		var totalLabel = new sap.m.Label({
			design: "Bold",
			text: "{path: 'tracking>/current', formatter: 'com.h3.prj.imenu.util.Formatter.formatOverallTotal'}",
			textAlign: "Begin",
			width: "5em"
		});
		var removeAllBtn = new sap.m.Button({
			text: "{l10n>/cart/remove_all}",
			type: "Reject",
			width: "5em",
			press: this.delAllFromCart
		});
//		var discountBtn = new sap.m.Button({
//			text: "{l10n>/cart/discount}",
//			width: "12em"
//		});
		var printBtn = new sap.m.Button({
			text: "{l10n>/cart/print_sheet}",
			width: "5em",
			press: printOrderClosure
		});
		var closeBtn = new sap.m.Button({
			text: "{l10n>/cart/close}",
			width: "5em",
			press: closeDlgClosure
		});
		var orderBtn = new sap.m.Button({
			text: "{l10n>/cart/order}",
			type: "Accept",
			width: "5em",
			press: placeOrderClosure
		});
		buttons.push(menuBtn);
		buttons.push(totalBtn);
		buttons.push(totalLabel);
		buttons.push(removeAllBtn);
//		buttons.push(discountBtn);
		buttons.push(printBtn);
		buttons.push(closeBtn);
		buttons.push(orderBtn);

		return buttons;
	},

	orderPrinter: function(permissionCheckDlg, ctrl, dlg) {
		return function print() {
				ctrl.printOrder();
				dlg.close();
		};
//		return function printOrderClosure() {
//			function print() {
//				ctrl.printOrder();
//				dlg.close();
//			}
//			permissionCheckDlg.closeDeferred = jQuery.Deferred();
//			jQuery.when(permissionCheckDlg.closeDeferred).then(print);
//			permissionCheckDlg.open();
//		};
	},

	orderPlacer: function(permissionCheckDlg, ctrl, dlg) {
		return function place() {
				ctrl.placeOrder();
				ctrl.getRouter().navTo("desk");
				dlg.close();
		};
//		return function placeOrderClosure() {
//			function place() {
//				ctrl.placeOrder();
//				ctrl.getRouter().navTo("desk");
//				dlg.close();
//				
//			}
//			permissionCheckDlg.closeDeferred = jQuery.Deferred();
//			jQuery.when(permissionCheckDlg.closeDeferred).then(place);
//			permissionCheckDlg.open();
//		};
	},

	onSubmittedOrderButtonPressed: function(event) {
		var iconTab = this.orderDlg.getContent()[0].byId("orderIconTab");
		iconTab.setSelectedKey("submittedOrder");
		this.preShowCart();
		this.orderDlg.open();
	},

	afterOrderDlgOpen: function(orderDlg) {
		return function() {
			orderDlg.$().css("background-color", "#F4E5D2");
		};
	}

});
