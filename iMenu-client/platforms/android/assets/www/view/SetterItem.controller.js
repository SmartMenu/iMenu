jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.SetterItem", {

	onInit: function() {
	},

	onLessButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		if (itemData.count > 1) {
			itemData.count = itemData.count - 1;
			this.getView().getModel("item").setData(itemData);
		}
	},

	onAddButtonPressed: function(event) {
		var itemData = this.getView().getModel("item").getData();
		itemData.count = itemData.count + 1;
		this.getView().getModel("item").setData(itemData);
	},

	onSelectChange: function(event) {
		var itemData = this.getView().getModel("item").getData();
		itemData.item_selected = event.getSource().getSelected();
		console.log("select state" + event.getSource().getSelected());
		this.getView().getModel("item").setData(itemData);
	}

});
