jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.Setter", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf imenu_client.Modifier
*/
//	onInit: function() {
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf imenu_client.Modifier
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf imenu_client.Modifier
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf imenu_client.Modifier
*/
//	onExit: function() {
//
//	}
	onInit: function() {
		var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		this.getView().setModel(l10n, "l10n");

		var trackingModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking");
		this.getView().setModel(trackingModel, "tracking");
	},
	
	groupHeader: function(group) {
		return new sap.m.GroupHeaderListItem({
			title: group.key,
			upperCase: false
		});
	},
	
	onItemLessButtonPressed: function(event) {
		var btn = event.getSource();
		var id = btn.data("tracking_id");
		this.oneLessItem(id);
	},
	
	onItemMoreButtonPressed: function(event) {
		var btn = event.getSource();
		var id = btn.data("tracking_id");
		this.oneMoreItem(id);
	}

});