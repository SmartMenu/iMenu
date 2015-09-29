jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.Menu3Item", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Menu3Item
*/
	onInit: function() {
		var countModel = new sap.ui.model.json.JSONModel({
			"count": 1
		});
		this.getView().setModel(countModel);
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Menu3Item
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Menu3Item
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Menu3Item
*/
//	onExit: function() {
//
//	}

	onLessButtonPressed: function(event) {
		var countData = this.getView().getModel().getData();
		if (countData.count > 1) {
			countData.count = countData.count - 1;
			this.getView().getModel().setData(countData);
		}
	},

	onAddButtonPressed: function(event) {
		var countData = this.getView().getModel().getData();
		countData.count = countData.count + 1;
		this.getView().getModel().setData(countData);
	},

	onAcceptButtonPressed: function(event) {
		var item_id = this.getView().data("item_id");
		var modifierData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10nModifier").getData()[item_id];
		if (modifierData) {
			var selectedModifiers = [];
			var modifierView = sap.ui.xmlview("com.h3.prj.imenu.view.Modifier");
			modifierView.setModel(sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n"), "l10n");
			var modifierPopover = modifierView.byId("modifierPopover");
			modifierPopover.attachAfterClose(function() {
				var item_id = this.getView().data("item_id");
				var item_count = this.getView().getModel().getData().count;
				var item_price = this.getView().getModel("item").getData().price;
				var item_cat_id = this.getView().data("item_cat");
				this.addToCart({
					"item_id": item_id,
					"item_cat_id": item_cat_id,
					"item_count": item_count,
					"item_price": item_price
				}, selectedModifiers);
				modifierView.destroy();
				var data = this.getView().getModel().getData();
				data.count = 1;
				this.getView().getModel().setData(data);
			}, this);
			var modifierGrid = modifierView.byId("modifierGrid");
			modifierData.details.forEach(function(d){
				var toggleButton = new sap.m.ToggleButton({
					text: d.item_name,
					width: "8em",
					press: function(event){
						var button = event.getSource();
						if(button.getPressed()){
							selectedModifiers.push(d);
						}else{
							var pos = jQuery.inArray(d, selectedModifiers);
							if(pos!==-1){
								selectedModifiers.splice(pos, 1);
							}
							
						}
					}
				});
				toggleButton.addStyleClass("menuItemButton");
				modifierGrid.addContent(toggleButton);
			});
			var button = event.getSource();
			modifierPopover.openBy(button);
		} else {
			var item_id = this.getView().data("item_id");
			var item_count = this.getView().getModel().getData().count;
			var item_price = this.getView().getModel("item").getData().price;
			var item_cat_id = this.getView().data("item_cat");
			this.addToCart({
				"item_id": item_id,
				"item_cat_id": item_cat_id,
				"item_count": item_count,
				"item_price": item_price
			});

			var data = this.getView().getModel().getData();
			data.count = 1;
			this.getView().getModel().setData(data);
		}
	}	
});