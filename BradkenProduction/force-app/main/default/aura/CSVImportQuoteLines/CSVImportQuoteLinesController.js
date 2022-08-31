({
    doInit : function(component, event, helper) {
        var fMap = component.get("v.fieldMappings");
        if(!fMap){
			helper.getFieldMappings(component,event,helper);
        }
	},
	scriptsLoaded : function(component, event, helper) {
		component.set("v.scriptsLoaded",true);
	},
    handleFileUpload: function(component, event, helper) {
		helper.parseFile(component,event,helper);
	},
    handleImportRecords: function(component, event, helper) {
        event.getSource().set("v.disabled",true);
        helper.saveRecords(component, event, helper);
	},
    handleDownload:function(component,event,helper){
        helper.downloadCSV(component,event,helper);  
    },
    enableShowSaveResult : function(component, event, helper) {
        component.set("v.showSaveResult",false);
        component.set("v.headers",null);
    }
})