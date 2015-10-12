jQuery.sap.require("com.h3.prj.imenu.util.IMenuController");

com.h3.prj.imenu.util.IMenuController.extend("com.h3.prj.imenu.view.Settings", {
	
	expectingDownloadCount: 0,
	successResultCount: 0,
	failedResultCount: 0,

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
	 * displayed, to bind event handlers and do other one-time initialization.
	 * 
	 * @memberOf view.Settings
	 */
	onInit: function() {
		var l10n = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n");
		this.getView().setModel(l10n, "l10n");

		var appModel = sap.ui.getCore().getModel("com.h3.prj.imenu.model.appinfo");
		this.getView().setModel(appModel, "app");
/*
		this.permissionCheckDlg = new sap.m.Dialog("permissionCheckSettingsDlg", {
			contentHeight: "100%",
			contentWidth: "100%",
			showHeader: false,
			content: sap.ui.xmlview("com.h3.prj.imenu.view.PermissionChecker")
		});
		*/
	},
	
	dlSuccess : function (entry) {
		thisView = sap.ui.xmlview("com.h3.prj.imenu.view.Settings");
		thisController = thisView.getController();
		successResultCount = successResultCount + 1;
		console.log("DL success: " + entry.toURL());
		thisController.checkResult();
	},
	
	dlFailed : function (error) {
		thisView = sap.ui.xmlview("com.h3.prj.imenu.view.Settings");
		thisController = thisView.getController();
		failedResultCount = failedResultCount + 1;
		console.log("DL failed: " + error.msg);
		thisController.checkResult();
	},
	
	checkResult : function (){
		console.log("s:"+ successResultCount 
				+ ", f:" + failedResultCount 
				+ ", a:" + expectingDownloadCount);
		if( expectingDownloadCount > 0 && (successResultCount + failedResultCount) >= expectingDownloadCount){
			var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().settings.sync_img_msg_finished;
			sap.m.MessageToast.show(msg);
			console.log("Download is done! Total "+ expectingDownloadCount + " files, success count:" + successResultCount + ", failed count:" + failedResultCount +".");
			expectingDownloadCount = 0;
			successResultCount = 0;
			failedResultCount = 0;
			console.log("All downloading is done.");
		}
	},
	
	onDirGood : function(dirEntry){

		thisView = sap.ui.xmlview("com.h3.prj.imenu.view.Settings");
		thisController = thisView.getController();

		var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().settings.sync_img_msg_start;
		sap.m.MessageToast.show(msg);
		
		baseURL = "http://gamiao.gotoip55.com/imgsync/repo1/";
		listFileName = "filelist.txt";
		iMenuDir = dirEntry.toURL();
		console.log("downloading file: " + listFileName);
		fileURL = baseURL + listFileName;
		filePath = iMenuDir + "/" + listFileName;
		//thisController.downloadURL2Local(fileURL,filePath,thisController.dlSuccess,thisController.dlFailed);
		
		jQuery.getJSON( baseURL + listFileName, function(responseData){
			console.log("Enter dir good.");
			if(responseData != null){
				console.log("response good.");
				//responseData = JSON.parse(response);
				console.log(JSON.stringify(responseData));
				if(responseData.filelist != undefined && responseData.filelist != null){
					console.log("Filelist size is not null.");
					console.log("Filelist size is: " + responseData.filelist.length);
					successResultCount = 0;
					failedResultCount = 0;
					expectingDownloadCount = responseData.filelist.length;
					
					responseData.filelist.forEach(function(fileElement) {
						console.log("downloading file: " + fileElement);
						fileURL = baseURL + fileElement;
						filePath = iMenuDir + "/" + fileElement;
						thisController.downloadURL2Local(fileURL,filePath,thisController.dlSuccess,thisController.dlFailed);
					});
				}
			}
		});
	},
	
	downloadURL2Local : function(url, filePath, success, failed){
		uri = encodeURI(url);
		fileTransfer = new FileTransfer();
		fileTransfer.download(url, filePath,success,failed);
	},
	
	onSyncButtonPressed :function(){
		thisview = sap.ui.xmlview("com.h3.prj.imenu.view.Settings");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(fileSystem){	
				newFile = fileSystem.root.getDirectory("iMenu", 
					{ create : true, exclusive : false }, 
					thisview.getController().onDirGood,
					function (dirError) {}
				);  
			},
			function (fileSystemError) {}
		);
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered (NOT before the first rendering! onInit() is
	 * used for that one!).
	 * 
	 * @memberOf view.Settings
	 */
// onBeforeRendering: function() {
//
// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here. This
	 * hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf view.Settings
	 */
// onAfterRendering: function() {
//
// },
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf view.Settings
	 */
// onExit: function() {
//
// }
	onOKButtonPressed: function() {
		var appData = this.getView().getModel("app").getData();
		var appDataOld = this.getView().data("oldValue");
		if(!appDataOld.device_id && !appDataOld.shop_id){
			localStorage.setItem("com.h3.prj.imenu.server_url", appData.server_url);
			localStorage.setItem("com.h3.prj.imenu.device_mac", appData.device_mac);
			com.h3.prj.imenu.iMenuInitializer.initAppInfoModel();
			this.getView().byId("settingsDlg").close();
			return;
		}
		if (appData.server_url === appDataOld.server_url && appData.device_mac === appDataOld.device_mac) {
			this.getView().byId("settingsDlg").close();
			return;
		}
		var tryChangeSettings = this.changeSettings;
		this.permissionCheckDlg.closeDeferred = jQuery.Deferred();
		this.permissionCheckDlg.closeDeferred.check = {};
		jQuery.when(this.permissionCheckDlg.closeDeferred).then(tryChangeSettings(this.getView().byId("settingsDlg"), this.permissionCheckDlg, appDataOld, appData));
		this.permissionCheckDlg.open();
	},

	onCancelButtonPressed: function() {
		this.getView().byId("settingsDlg").close();
		var appData = this.getView().data("oldValue");
		this.getView().getModel("app").setData(appData);
	},
	
	changeSettings: function(dlg, permissionCheckDlg, settingsDataOld, settingsData){
		return function(){
			if (permissionCheckDlg.closeDeferred.check.result) {
				localStorage.setItem("com.h3.prj.imenu.server_url", settingsData.server_url);
				localStorage.setItem("com.h3.prj.imenu.device_mac", settingsData.device_mac);
				com.h3.prj.imenu.iMenuInitializer.initAppInfoModel();
				dlg.close();
			}else{
				settingsData.server_url = settingsDataOld.server_url;
				settingsData.device_mac = settingsDataOld.device_mac;
				settingsData.time_out = settingsDataOld.time_out;
				var msg = sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").getData().settings.not_authorized;
				sap.m.MessageToast.show(msg);
				sap.ui.getCore().getModel("com.h3.prj.imenu.model.l10n").updateBindings();
			}
		};
	}

});
