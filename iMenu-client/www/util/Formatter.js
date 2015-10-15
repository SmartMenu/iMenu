jQuery.sap.declare("com.h3.prj.imenu.util.Formatter");

com.h3.prj.imenu.util.Formatter = {

	l10nData: null,
	deskFloorModel: null,

	setL10nData: function(data) {
		this.l10nData = data;
	},

	formatFloor: function(floor) {
		return this.l10nData.sector + " " + floor;
	},
	
	formatImg: function(img) {
		return "img/" + img;
	},
	
	/*
	formatImg: function(img) {
		iMenuDirURL = sap.ui.getCore().getModel("com.h3.prj.imenu.model.iMenuDirURL");
		return iMenuDirURL + "/" + img;
	},
	*/
	
	appendColon: function(text) {
		switch(localStorage.getItem("com.h3.prj.imenu.language")){
			case "繁":
				return text + "：";
			case "EN":
				return text + "：";
		}
	},
	
	formatItemSubTotal: function(item){
		return (item.item_price * item.item_count).toFixed(2);
	},
	
	formatItemSvcCharge: function(item, charge){
		var sum = Number(com.h3.prj.imenu.util.Formatter.formatItemSubTotal(item));
		if(sum===0){
			return 0;
		}
		var amount = 0;
		switch(charge.type){
			case 0:
				amount = sum * charge.value / 100.0;
				break;
			case 1:
				amount = charge.value;
				break;
		}
		return amount.toFixed(2);
	},

	formatItemPayAmount: function(item, charge){
		var sum1 = Number(com.h3.prj.imenu.util.Formatter.formatItemSubTotal(item));
		var sum2 = Number(com.h3.prj.imenu.util.Formatter.formatItemSvcCharge(item, charge));
		return (sum1 + sum2).toFixed(2);
	},

	formatSubTotal: function(list){
		var sum = 0;
		list.forEach(function(item){
			sum = sum + item.item_price * item.item_count;
		});
		return sum.toFixed(2);
	},
	
	formatSvcCharge: function(list){
		var svcChargeData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.svcCharge").getData();
		var desk = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData().current.desk;
		var charge = svcChargeData[desk];
		
		var sum = Number(com.h3.prj.imenu.util.Formatter.formatSubTotal(list.filter(function(item){
			return item.svc_chargeable === 1;
		})));
		if(sum===0){
			return 0;
		}
		var amount = 0;
		switch(charge.type){
			case 0:
				amount = sum * charge.value / 100.0;
				break;
			case 1:
				amount = charge.value;
				break;
		}
		return amount.toFixed(2);
	},
	
	formatTotal: function(list){
		var sum1 = Number(com.h3.prj.imenu.util.Formatter.formatSubTotal(list));
		var sum2 = Number(com.h3.prj.imenu.util.Formatter.formatSvcCharge(list));
		return (sum1 + sum2).toFixed(2);
	},
	
	formatOverallTotal: function(current){
		var sum1 = Number(com.h3.prj.imenu.util.Formatter.formatTotal(current.cart));
		var sum2 = Number(com.h3.prj.imenu.util.Formatter.formatTotal(current.order));
		return (sum1 + sum2).toFixed(2);
	},

	formatSelectedItemsPerCategory: function(cat_id) {
		var trackingData = sap.ui.getCore().getModel("com.h3.prj.imenu.model.tracking").getData();
		var number = trackingData.current.categories[cat_id];
		if(!number || number===0){
			return "";
		}else{
			return number;
		}
	}

};
