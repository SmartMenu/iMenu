jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.SetterItem", {

	onInit: function() {
		var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		this.getView().setModel(l10n, "l10n");
	},

	onLessButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		if (itemData.count > 1) {
			itemData.count = itemData.count - 1;
			this.getView().getModel("item").setData(itemData);
			this.updateSelectedSetterItems(itemData, selectedSetterItems);
		}
	},

	onAddButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		itemData.count = itemData.count + 1;
		this.getView().getModel("item").setData(itemData);
		this.updateSelectedSetterItems(itemData, selectedSetterItems);
	},
	
	onModifierButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		this.performMenuItemAccept(this,itemData);
	},

	onSelectChange: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		itemData.item_selected = event.getSource().getSelected();
		console.log("select state" + event.getSource().getSelected());
		this.getView().getModel("item").setData(itemData);
		this.updateSelectedSetterItems(itemData, selectedSetterItems);
	}

});
