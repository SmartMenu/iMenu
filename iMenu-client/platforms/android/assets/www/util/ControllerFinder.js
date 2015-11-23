jQuery.sap.declare("com.h3.prj.imenu.util.ControllerFinder");

com.h3.prj.imenu.util.ControllerFinder = {

	find: function(control, controllerName) {
		if (control._controllerName && control._controllerName === controllerName) {
			return control.getController();
		} else {
			return control.getParent() ? 
				com.h3.prj.imenu.util.ControllerFinder.find(control.getParent(), controllerName) : null;
		}
	}
};
