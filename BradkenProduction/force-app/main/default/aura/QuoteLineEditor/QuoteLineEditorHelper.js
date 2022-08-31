/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 08-31-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   08-31-2020   TQDev   Initial Version
**/
({
    doRedirect:function(component, event, helper){
        var workspaceAPI = component.find("workspace");
        
        workspaceAPI.isConsoleNavigation().then(function(isConsole) {
            if(isConsole){
                workspaceAPI.getFocusedTabInfo().then(function(response) {
                    workspaceAPI.openTab({
                        pageReference: {
                            "type": "standard__component",
                            "attributes": {
                                "componentName": "c__QuoteLineEditor"    
                            },    
                            "state": {
                                "c__recordId": component.get('v.recordId'),
                                "c__sourceTabId": response.tabId
                            }
                        },
                        focus: true
                    });
                })
            }
            else{
                //not in console -> assumed that the quick action is called from lex.
                var navService = component.find("navService");
                navService.navigate({
                    "type": "standard__component",
                    "attributes": {
                        "componentName": "c__QuoteLineEditor"    
                    },    
                    "state": {
                        "c__recordId": component.get('v.recordId')
                    }
                    
                });
            }
        }); 
    },
    getQuoteDetails: function(component, event, helper){
        var action = component.get("c.getQuoteDetails");
        action.setParams({quoteId: component.get("v.recordId")});
        action.setCallback(this, function(response) {
            var state = response.getState();
			var workspaceAPI = component.find("workspace");
            workspaceAPI.isConsoleNavigation().then(function(isConsole) {
                if(isConsole){
                    workspaceAPI.getFocusedTabInfo().then(function(response) {
                        workspaceAPI.setTabLabel({
                            tabId: response.tabId,
                            label: "Quote Line Editor"
                        });
                    });
                }
            });
            if (state === "SUCCESS") {
                var quote = response.getReturnValue();
				component.set('v.showProductSearch',$A.get("$Label.c.QLE_Editable_Status").includes(quote.Status));
                component.set("v.quote",quote);
            }
        });
        $A.enqueueAction(action);  
    },
	getQuoteLineEditorConfig:function(component, event, helper){
        var action = component.get("c.getQuoteLineEditorConfig");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
				var quoteLineEditorConfig = response.getReturnValue();
                component.set("v.quoteLineEditorConfig",quoteLineEditorConfig);
                helper.getQuoteLineFieldDescribe(component, event, helper);
            }
        });
        $A.enqueueAction(action); 
    },
    getQuoteLineFieldDescribe:function(component, event, helper){
        var action = component.get("c.getQuoteLineFieldDescribe");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var quoteLineFieldDescribe = JSON.parse(response.getReturnValue());
                component.set("v.quoteLineFieldDescribe",quoteLineFieldDescribe);
                var quoteLineEditorConfig = component.get("v.quoteLineEditorConfig");
                var requiredFields = [],fieldOptions = [],selectedFields = [];
                quoteLineEditorConfig.forEach(function(f){
                    f["fd"] = quoteLineFieldDescribe.filter(function(fd){return fd.name == f.FieldAPI__c})[0];
                    if(f.Display__c != 'Hidden'){
                        fieldOptions.push({label:f.ColumName__c,value:f.FieldAPI__c});
                        if(f.Display__c == 'Required' ){
                            requiredFields.push(f.FieldAPI__c);
                        } 
                        if(f.DefaultChecked__c){
                            selectedFields.push(f.FieldAPI__c);
                        }
                    }
            	});
                component.set("v.fieldOptions",fieldOptions);
                component.set("v.selectedFields",selectedFields);
                component.set("v.requiredFields",requiredFields);
            }
        });
        $A.enqueueAction(action); 
    },
	sortObject : function compareValues(key, order) {
        return function(a, b){
            if(!a.hasOwnProperty(key) || 
               !b.hasOwnProperty(key)) {
                return 0; 
            }
            
            const varA = (typeof a[key] === 'string') ? 
                a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ? 
                b[key].toUpperCase() : b[key];
            
            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order == 'desc') ? 
                (comparison * -1) : comparison
            );
        }
    },
    closeTab:function(component, event, helper){
        var workspaceAPI = component.find("workspace");
        workspaceAPI.isConsoleNavigation().then(function(isConsole) {
            if(isConsole){
                workspaceAPI.getFocusedTabInfo().then(function(response) {
                    //workspaceAPI.refreshTab({tabId: response.parentTabId ,includeAllSubtabs: true});
                    workspaceAPI.refreshTab({tabId: component.get("v.pageReference").state.c__sourceTabId ,includeAllSubtabs: true});
                    workspaceAPI.closeTab({tabId: response.tabId});
                })
            }else{
                var navService = component.find("navService");
                navService.navigate({
                    "type": "standard__recordPage",
                    "attributes": {
                        "recordId": component.get('v.recordId'),
                        "objectApiName": "Opportunity",
                        "actionName": "view"
                    }
                });
            }
        });
    }
})