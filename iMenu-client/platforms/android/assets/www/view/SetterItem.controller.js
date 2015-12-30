jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.SetterItem", {
	
	that: null,

	onInit: function() {
		var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		this.getView().setModel(l10n, "l10n");
	},

	onLessButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		var selectedModifierItems = this.getView().data("selectedModifierItems");
		var selectedSubModifierItems = this.getView().data("selectedSubModifierItems");
		if (itemData.count > 1) {
			itemData.count = itemData.count - 1;
			this.getView().getModel("item").setData(itemData);
			this.updateSelectedItems(itemData, selectedSetterItems, selectedModifierItems, selectedSubModifierItems);
		}
	},

	onAddButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		var selectedModifierItems = this.getView().data("selectedModifierItems");
		var selectedSubModifierItems = this.getView().data("selectedSubModifierItems");
		itemData.count = itemData.count + 1;
		this.getView().getModel("item").setData(itemData);
		this.updateSelectedItems(itemData, selectedSetterItems, selectedModifierItems, selectedSubModifierItems);
	},
	
	onModifierButtonPressed: function(event) {
		that = this;
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		var selectedModifierItems = this.getView().data("selectedModifierItems");
		var selectedSubModifierItems = this.getView().data("selectedSubModifierItems");
		this.performMenuItemAccept(this,itemData, this.updateItemBindingCallBack);
	},
	
	updateItemBindingCallBack: function(itemData, selectedSubModifierItems) {
		console.log("-> Entering updateItemBindingCallBack");
		if (that.getView() == null) {
			console.log("thisView is null.");
		} else {
			console.log("thisView not null.");
			var setterItemStr = JSON.stringify(itemData);
			console.log(setterItemStr);
			that.getView().getModel("item").setData(itemData);
			that.getView().getModel("item").refresh(true);
			that.getView().data("selectedSubModifierItems")[itemData.item_id] = selectedSubModifierItems;
		}
	},

	onSelectChange: function(event) {
		var itemData = this.getView().getModel("item").getData();
		var selectedSetterItems = this.getView().data("selectedSetterItems");
		var selectedModifierItems = this.getView().data("selectedModifierItems");
		var selectedSubModifierItems = this.getView().data("selectedSubModifierItems");
		itemData.item_selected = event.getSource().getSelected();
		console.log("select state" + event.getSource().getSelected());
		this.getView().getModel("item").setData(itemData);
		this.updateSelectedItems(itemData, selectedSetterItems, selectedModifierItems, selectedSubModifierItems);
	}

});
